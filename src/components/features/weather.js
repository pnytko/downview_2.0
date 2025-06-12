/**
 * @file weather.js
 * @description Komponent pogodowy do wyświetlania informacji o pogodzie na mapie
 */

import { APP_STATE, StateActions } from '../../core/state/app-state.js';
import { fetchWeatherDataWithRetry, formatWeatherData, generateWeatherHTML } from '../../services/weather/weather-service.js';
import { displayWrapperWeather, closeWrapperWeather } from '../ui/modals/weather-modal.js';

/**
 * Przełącza narzędzie pogodowe
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function toggleWeather(map) {
    console.log('=== toggleWeather START ===');
    console.log('toggleWeather called with map:', map);
    console.log('APP_STATE:', APP_STATE);
    console.log('StateActions:', StateActions);
    
    if (!map) {
        console.error('Map is undefined or null in toggleWeather');
        console.trace('Call stack for toggleWeather');
        return;
    }
    
    try {
        console.log('Map type:', typeof map);
        console.log('Map methods:', Object.keys(map).filter(key => typeof map[key] === 'function'));
        
        const mapElement = map.getTargetElement();
        console.log('mapElement:', mapElement);
        
        if (!mapElement) {
            console.error('Map target element is undefined or null');
            return;
        }
        
        const mapCanvas = mapElement.querySelector('canvas');
        console.log('mapCanvas:', mapCanvas);
        
        if (!mapCanvas) {
            console.error('Canvas element not found in map');
            return;
        }
        
        // Sprawdź stan narzędzia
        console.log('Current APP_STATE.tools.weather:', APP_STATE.tools.weather);
        
        // Jeśli narzędzie jest już aktywne, wyłącz je
        if (APP_STATE.tools.weather.active) {
            console.log('Weather tool is active, deactivating');
            deactivateWeatherTool(map, mapCanvas);
            return;
        }

        // Aktywuj narzędzie
        console.log('Activating weather tool');
        StateActions.tools.activate('weather');
        console.log('After activation, APP_STATE.tools.weather:', APP_STATE.tools.weather);
        activateWeatherTool(map, mapCanvas);
        console.log('After activateWeatherTool, APP_STATE.tools.weather:', APP_STATE.tools.weather);
    } catch (error) {
        console.error('Error in toggleWeather function:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
    }
    console.log('=== toggleWeather END ===');
}

/**
 * Aktywuje narzędzie pogodowe
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {HTMLCanvasElement} mapCanvas - Element canvas mapy
 */
function activateWeatherTool(map, mapCanvas) {
    console.log('=== activateWeatherTool START ===');
    console.log('Activating weather tool with map:', map);
    console.log('mapCanvas:', mapCanvas);
    
    mapCanvas.style.cursor = 'crosshair';
    console.log('Cursor changed to crosshair');
    
    // Funkcja obsługująca kliknięcie w mapę
    APP_STATE.tools.weather.clickListener = async function(evt) {
        console.log('Map clicked at coordinate:', evt.coordinate);
        try {
            const coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            console.log('Transformed coordinates:', coords);
            
            // Wyświetl informację o ładowaniu
            displayWrapperWeather('<div class="weather-info">Pobieranie danych pogodowych...</div>');
            console.log('Loading message displayed');
            
            // Pobierz dane pogodowe
            console.log('Fetching weather data for coordinates:', coords);
            const weatherData = await fetchWeatherDataWithRetry(coords);
            console.log('Weather data received:', weatherData);
            
            if (weatherData) {
                // Formatuj dane pogodowe
                const formattedData = formatWeatherData(weatherData);
                console.log('Formatted weather data:', formattedData);
                
                // Generuj HTML z danymi pogodowymi
                const weatherHTML = generateWeatherHTML(formattedData);
                console.log('Weather HTML generated');
                
                // Wyświetl dane pogodowe
                displayWrapperWeather(weatherHTML, coords);
                console.log('Weather data displayed');
            }
        } catch (error) {
            console.error('Błąd podczas pobierania danych pogodowych:', error);
            console.error('Error details:', error.message);
            console.error('Error stack:', error.stack);
            displayWrapperWeather('<div class="weather-error">Nie udało się pobrać danych pogodowych</div>');
            console.log('Error message displayed');
        } finally {
            // Dezaktywuj narzędzie
            console.log('Deactivating weather tool after click');
            deactivateWeatherTool(map, mapCanvas);
        }
    };
    
    console.log('Adding click listener to map');
    map.on('click', APP_STATE.tools.weather.clickListener);
    console.log('Click listener added to map');
    console.log('APP_STATE.tools.weather after activation:', APP_STATE.tools.weather);
    console.log('=== activateWeatherTool END ===');
}

/**
 * Dezaktywuje narzędzie pogodowe
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {HTMLCanvasElement} mapCanvas - Element canvas mapy
 */
function deactivateWeatherTool(map, mapCanvas) {
    console.log('=== deactivateWeatherTool START ===');
    console.log('Deactivating weather tool with map:', map);
    console.log('mapCanvas:', mapCanvas);
    
    console.log('Calling StateActions.tools.deactivateAll()');
    StateActions.tools.deactivateAll();
    console.log('APP_STATE.tools after deactivateAll:', APP_STATE.tools);
    
    console.log('Resetting cursor to default');
    mapCanvas.style.cursor = 'default';
    
    console.log('Checking for click listener');
    if (APP_STATE.tools.weather.clickListener) {
        console.log('Removing click listener from map');
        map.un('click', APP_STATE.tools.weather.clickListener);
        console.log('Setting clickListener to null');
        APP_STATE.tools.weather.clickListener = null;
    } else {
        console.log('No click listener found');
    }
    
    console.log('APP_STATE.tools.weather after deactivation:', APP_STATE.tools.weather);
    console.log('=== deactivateWeatherTool END ===');
}

/**
 * Zamyka okno pogodowe
 */
export function closeWeather() {
    closeWrapperWeather();
}

/**
 * Inicjalizuje komponent pogodowy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initWeather(map) {
    console.log('initWeather called with map:', map);
    
    // Dodaj obsługę przycisku zamykania okna pogodowego
    const closeButton = document.querySelector('#wrapper-weather .btn-close');
    console.log('closeButton:', closeButton);
    if (closeButton) {
        console.log('Adding click event listener to close button');
        closeButton.addEventListener('click', closeWeather);
    } else {
        console.warn('Close button not found for weather modal');
    }
    
    // Zapisz mapę w zmiennej globalnej, aby była dostępna dla funkcji toggleWeatherTool
    window.weatherMap = map;
    console.log('Map saved to window.weatherMap:', window.weatherMap);
}