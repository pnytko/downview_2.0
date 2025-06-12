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
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    
    // Jeśli narzędzie jest już aktywne, wyłącz je
    if (APP_STATE.tools.weather.active) {
        deactivateWeatherTool(map, mapCanvas);
        return;
    }

    // Aktywuj narzędzie
    StateActions.tools.activate('weather');
    activateWeatherTool(map, mapCanvas);
}

/**
 * Aktywuje narzędzie pogodowe
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {HTMLCanvasElement} mapCanvas - Element canvas mapy
 */
function activateWeatherTool(map, mapCanvas) {
    mapCanvas.style.cursor = 'crosshair';
    
    // Funkcja obsługująca kliknięcie w mapę
    APP_STATE.tools.weather.clickListener = async function(evt) {
        try {
            const coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            
            // Wyświetl informację o ładowaniu
            displayWrapperWeather('<div class="weather-info">Pobieranie danych pogodowych...</div>');
            
            // Pobierz dane pogodowe
            const weatherData = await fetchWeatherDataWithRetry(coords);
            
            if (weatherData) {
                // Formatuj dane pogodowe
                const formattedData = formatWeatherData(weatherData);
                
                // Generuj HTML z danymi pogodowymi
                const weatherHTML = generateWeatherHTML(formattedData);
                
                // Wyświetl dane pogodowe
                displayWrapperWeather(weatherHTML, coords);
            }
        } catch (error) {
            console.error('Błąd podczas pobierania danych pogodowych:', error);
            displayWrapperWeather('<div class="weather-error">Nie udało się pobrać danych pogodowych</div>');
        } finally {
            // Dezaktywuj narzędzie
            deactivateWeatherTool(map, mapCanvas);
        }
    };
    
    map.on('click', APP_STATE.tools.weather.clickListener);
}

/**
 * Dezaktywuje narzędzie pogodowe
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {HTMLCanvasElement} mapCanvas - Element canvas mapy
 */
function deactivateWeatherTool(map, mapCanvas) {
    StateActions.tools.deactivateAll();
    mapCanvas.style.cursor = 'default';
    
    if (APP_STATE.tools.weather.clickListener) {
        map.un('click', APP_STATE.tools.weather.clickListener);
        APP_STATE.tools.weather.clickListener = null;
    }
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
    // Dodaj obsługę przycisku zamykania okna pogodowego
    const closeButton = document.querySelector('#wrapper-weather .btn-close');
    if (closeButton) {
        closeButton.addEventListener('click', closeWeather);
    }
    
    // Dodaj obsługę przycisku pogody
    const weatherButton = document.querySelector('.tool-button[title="Pogoda"]');
    if (weatherButton) {
        weatherButton.addEventListener('click', () => toggleWeather(map));
    }
}