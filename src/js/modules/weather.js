// Konfiguracja API pogodowego
const WEATHER_CONFIG = {
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    params: {
        hourly: 'temperature_2m,precipitation,cloudcover,windspeed_10m',
        timezone: 'Europe/Warsaw'
    }
};

// Konfiguracja ikon dla różnych warunków pogodowych
const WEATHER_ICONS = {
    // Ikony temperatury
    temperature: {
        cold: 'fa-thermometer-empty',
        normal: 'fa-thermometer-half',
        hot: 'fa-thermometer-full'
    },
    // Ikony opadów
    precipitation: {
        none: 'fa-umbrella',
        rain: 'fa-cloud-rain'
    },
    // Ikony zachmurzenia
    cloudcover: {
        clear: 'fa-sun',
        fewClouds: 'fa-cloud-sun',
        partlyCloudy: 'fa-cloud-sun',
        mostlyCloudy: 'fa-cloud'
    },
    // Ikona wiatru
    wind: 'fa-wind',
    // Ikona błędu
    error: 'fa-exclamation-circle'
};

import { APP_STATE } from './config.js';
import { displayWrapperWeather, CloseWrapperWeather } from './modal.js';

// Przełącza narzędzie pogodowe
export function toggleWeather(map) {
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    
    // Jeśli narzędzie jest już aktywne, wyłącz je
    if (APP_STATE.weatherActive) {
        deactivateWeatherTool(map, mapCanvas);
        return;
    }

    // Aktywuj narzędzie
    activateWeatherTool(map, mapCanvas);
}

// Aktywuje narzędzie pogodowe
function activateWeatherTool(map, mapCanvas) {
    APP_STATE.weatherActive = true;
    if (mapCanvas) {
        mapCanvas.style.cursor = 'crosshair';
    }

    // Dodaj listener kliknięcia
    APP_STATE.clickListener = async function(evt) {
        const coords = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
        await getWeatherData(coords);
        deactivateWeatherTool(map, mapCanvas);
    };

    map.on('click', APP_STATE.clickListener);
}

// Dezaktywuje narzędzie pogodowe
function deactivateWeatherTool(map, mapCanvas) {
    APP_STATE.weatherActive = false;
    if (mapCanvas) {
        mapCanvas.style.cursor = 'default';
    }
    if (APP_STATE.clickListener) {
        map.un('click', APP_STATE.clickListener);
        APP_STATE.clickListener = null;
    }
}

// Pobiera dane pogodowe dla podanych współrzędnych
async function getWeatherData(coords) {
    try {
        const [lon, lat] = coords;
        const params = new URLSearchParams(WEATHER_CONFIG.params);
        const url = `${WEATHER_CONFIG.apiUrl}?latitude=${lat}&longitude=${lon}&${params}`;
        
        console.log('Pobieranie pogody z URL:', url);
        
        const response = await fetch(url);
        console.log('Status odpowiedzi:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Odpowiedź API:', errorText);
            throw new Error(`Błąd podczas pobierania danych pogodowych: ${response.status}`);
        }

        const data = await response.json();
        console.log('Otrzymane dane:', data);
        
        if (!data.hourly || !data.hourly.temperature_2m) {
            console.error('Nieprawidłowa struktura danych:', data);
            throw new Error('Nieprawidłowa struktura danych pogodowych');
        }

        displayWeatherInfo(data, coords);
    } catch (error) {
        console.error('Szczegóły błędu:', error);
        alert('Nie udało się pobrać danych pogodowych');
    }
}

// Wyświetla informacje o pogodzie
function displayWeatherInfo(data, coords) {
    try {
        console.log('Wyświetlanie pogody dla godziny:', new Date().getHours());
        const currentHour = new Date().getHours();
        
        // Pobierz dane dla aktualnej godziny
        const temperature = data.hourly.temperature_2m[currentHour];
        const precipitation = data.hourly.precipitation[currentHour];
        const cloudcover = data.hourly.cloudcover[currentHour];
        const windspeed = data.hourly.windspeed_10m[currentHour];
        
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
                    <i class="fas ${WEATHER_ICONS.wind}"></i>
                    <span class="weather-label">Wiatr:</span>
                    <span class="weather-value">${windspeed} km/h</span>
                </div>
            </div>
        `;

        console.log('Przygotowany content:', content);
        displayWrapperWeather(content, coords);
    } catch (error) {
        console.error('Błąd podczas wyświetlania pogody:', error);
        displayWrapperWeather('<div class="weather-error">Błąd podczas wyświetlania danych pogodowych</div>', coords);
    }
}

// Zwraca ikonę dla temperatury
function getTemperatureIcon(temp) {
    if (temp < 10) return WEATHER_ICONS.temperature.cold;
    if (temp > 25) return WEATHER_ICONS.temperature.hot;
    return WEATHER_ICONS.temperature.normal;
}

// Zwraca ikonę dla opadów
function getPrecipitationIcon(precip) {
    return precip > 0 ? WEATHER_ICONS.precipitation.rain : WEATHER_ICONS.precipitation.none;
}

// Zwraca ikonę dla zachmurzenia
function getCloudIcon(cover) {
    if (cover < 25) return WEATHER_ICONS.cloudcover.clear;
    if (cover < 50) return WEATHER_ICONS.cloudcover.fewClouds;
    if (cover < 75) return WEATHER_ICONS.cloudcover.partlyCloudy;
    return WEATHER_ICONS.cloudcover.mostlyCloudy;
}
