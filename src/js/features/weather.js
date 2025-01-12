import { displayWrapperWeather, closeWrapperWeather } from '../ui/modal.js';
import { APP_STATE, StateActions } from '../core/app-state.js';

// Konfiguracja API pogodowego
const WEATHER_CONFIG = {
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    params: {
        hourly: 'temperature_2m,precipitation,cloudcover,windspeed_10m',
        timezone: 'auto'
    }
};

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
 */
function activateWeatherTool(map, mapCanvas) {
    mapCanvas.style.cursor = 'crosshair';
    
    // Funkcja obsługująca kliknięcie w mapę
    APP_STATE.tools.weather.clickListener = async function(evt) {
        const coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        const weatherData = await getWeatherData(coords);
        if (weatherData) {
            displayWeatherInfo(weatherData, coords);
        }
        deactivateWeatherTool(map, mapCanvas);
    };
    
    map.on('click', APP_STATE.tools.weather.clickListener);
}

/**
 * Dezaktywuje narzędzie pogodowe
 */
function deactivateWeatherTool(map, mapCanvas) {
    StateActions.tools.deactivateAll();
    mapCanvas.style.cursor = 'default';
    
    if (APP_STATE.tools.weather.clickListener) {
        map.un('click', APP_STATE.tools.weather.clickListener);
        APP_STATE.tools.weather.clickListener = null;
    }
}

// Pobiera dane pogodowe dla podanych współrzędnych
async function getWeatherData(coords) {
    try {
        const [lon, lat] = coords;
        const params = new URLSearchParams(WEATHER_CONFIG.params);
        const url = `${WEATHER_CONFIG.apiUrl}?latitude=${lat}&longitude=${lon}&${params}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Błąd podczas pobierania danych pogodowych: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.hourly || !data.hourly.temperature_2m) {
            throw new Error('Nieprawidłowa struktura danych pogodowych');
        }

        return data;
    } catch (error) {
        alert('Nie udało się pobrać danych pogodowych');
        return null;
    }
}

// Wyświetla informacje o pogodzie
function displayWeatherInfo(data, coords) {
    try {
        const currentHour = new Date().getHours();
        
        // Pobierz dane dla aktualnej godziny
        const temperature = Math.round(data.hourly.temperature_2m[currentHour]);
        const precipitation = Math.round(data.hourly.precipitation[currentHour] * 10) / 10;
        const cloudcover = Math.round(data.hourly.cloudcover[currentHour]);
        const windspeed = Math.round(data.hourly.windspeed_10m[currentHour]);
        
        // Przygotuj HTML z danymi
        const content = `
            <div class="weather-info">
                <div class="weather-row">
                    <i class="fas ${getTemperatureIcon(temperature)}"></i>
                    <span class="weather-label">Temperatura:</span>
                    <span class="weather-value">${temperature}°C</span>
                </div>
                <div class="weather-row">
                    <i class="fas ${getPrecipitationIcon(precipitation)}"></i>
                    <span class="weather-label">Opady:</span>
                    <span class="weather-value">${precipitation} mm</span>
                </div>
                <div class="weather-row">
                    <i class="fas ${getCloudIcon(cloudcover)}"></i>
                    <span class="weather-label">Zachmurzenie:</span>
                    <span class="weather-value">${cloudcover}%</span>
                </div>
                <div class="weather-row">
                    <i class="fas fa-wind"></i>
                    <span class="weather-label">Wiatr:</span>
                    <span class="weather-value">${windspeed} km/h</span>
                </div>
            </div>
        `;

        displayWrapperWeather(content, coords);
    } catch (error) {
        displayWrapperWeather('<div class="weather-error">Błąd podczas wyświetlania danych pogodowych</div>', coords);
    }
}

// Zwraca ikonę dla temperatury
function getTemperatureIcon(temp) {
    if (temp < 10) return 'fa-thermometer-empty';
    if (temp > 25) return 'fa-thermometer-full';
    return 'fa-thermometer-half';
}

// Zwraca ikonę dla opadów
function getPrecipitationIcon(precip) {
    return precip > 0 ? 'fa-cloud-rain' : 'fa-umbrella';
}

// Zwraca ikonę dla zachmurzenia
function getCloudIcon(cover) {
    if (cover < 25) return 'fa-sun';
    if (cover < 50) return 'fa-cloud-sun';
    if (cover < 75) return 'fa-cloud-sun';
    return 'fa-cloud';
}

// Zwraca ikonę dla wiatru
function getWindIcon(wind) {
    return 'fa-wind';
}
