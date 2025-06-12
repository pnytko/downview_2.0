/**
 * @file weather-service.js
 * @description Serwis do pobierania danych pogodowych
 */

import { WEATHER_CONFIG } from '../../core/config/map-config.js';

/**
 * Pobiera dane pogodowe dla podanych współrzędnych geograficznych
 * @param {Array<number>} coords - Współrzędne [lon, lat]
 * @returns {Promise<Object>} Dane pogodowe
 * @throws {Error} Błąd w przypadku problemów z API
 */
export async function fetchWeatherData(coords) {
    try {
        const [lon, lat] = coords;
        const params = new URLSearchParams(WEATHER_CONFIG.params);
        const url = `${WEATHER_CONFIG.apiUrl}?latitude=${lat}&longitude=${lon}&${params}`;
        
        console.log('Weather API URL:', url);
        console.log('Weather config:', WEATHER_CONFIG);
        
        const response = await fetch(url, {
            signal: AbortSignal.timeout(WEATHER_CONFIG.timeout)
        });
        
        console.log('Weather API response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Weather API error response:', errorText);
            throw new Error(`Błąd podczas pobierania danych pogodowych: ${response.status}`);
        }

        const data = await response.json();
        console.log('Weather API response data structure:', Object.keys(data));
        
        if (!data.hourly || !data.hourly.temperature_2m) {
            console.error('Invalid weather data structure:', data);
            throw new Error('Nieprawidłowa struktura danych pogodowych');
        }

        return data;
    } catch (error) {
        console.error('Błąd podczas pobierania danych pogodowych:', error);
        throw error;
    }
}

/**
 * Pobiera dane pogodowe z obsługą ponownych prób
 * @param {Array<number>} coords - Współrzędne [lon, lat]
 * @param {number} retries - Liczba prób w przypadku błędu
 * @returns {Promise<Object>} Dane pogodowe
 */
export async function fetchWeatherDataWithRetry(coords, retries = WEATHER_CONFIG.retries) {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            return await fetchWeatherData(coords);
        } catch (error) {
            console.warn(`Próba ${i+1}/${retries} pobrania danych pogodowych nie powiodła się:`, error);
            lastError = error;
            
            if (i < retries - 1) {
                // Poczekaj przed kolejną próbą (zwiększając czas oczekiwania)
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    throw lastError || new Error('Nie udało się pobrać danych pogodowych');
}

/**
 * Formatuje dane pogodowe do wyświetlenia
 * @param {Object} data - Dane pogodowe z API
 * @returns {Object} Sformatowane dane pogodowe
 */
export function formatWeatherData(data) {
    const currentHour = new Date().getHours();
    
    // Pobierz dane dla aktualnej godziny
    const temperature = Math.round(data.hourly.temperature_2m[currentHour]);
    const precipitation = Math.round(data.hourly.precipitation[currentHour] * 10) / 10;
    const cloudcover = Math.round(data.hourly.cloudcover[currentHour]);
    const windspeed = Math.round(data.hourly.windspeed_10m[currentHour]);
    
    return {
        temperature,
        precipitation,
        cloudcover,
        windspeed,
        icons: {
            temperature: getTemperatureIcon(temperature),
            precipitation: getPrecipitationIcon(precipitation),
            cloudcover: getCloudIcon(cloudcover),
            wind: 'fa-wind'
        }
    };
}

/**
 * Zwraca ikonę dla temperatury
 * @param {number} temp - Temperatura w stopniach Celsjusza
 * @returns {string} Klasa ikony Font Awesome
 */
function getTemperatureIcon(temp) {
    if (temp < 10) return 'fa-thermometer-empty';
    if (temp > 25) return 'fa-thermometer-full';
    return 'fa-thermometer-half';
}

/**
 * Zwraca ikonę dla opadów
 * @param {number} precip - Opady w mm
 * @returns {string} Klasa ikony Font Awesome
 */
function getPrecipitationIcon(precip) {
    return precip > 0 ? 'fa-cloud-rain' : 'fa-umbrella';
}

/**
 * Zwraca ikonę dla zachmurzenia
 * @param {number} cover - Zachmurzenie w procentach
 * @returns {string} Klasa ikony Font Awesome
 */
function getCloudIcon(cover) {
    if (cover < 25) return 'fa-sun';
    if (cover < 50) return 'fa-cloud-sun';
    if (cover < 75) return 'fa-cloud-sun';
    return 'fa-cloud';
}

/**
 * Generuje HTML z danymi pogodowymi
 * @param {Object} weatherData - Sformatowane dane pogodowe
 * @returns {string} HTML z danymi pogodowymi
 */
export function generateWeatherHTML(weatherData) {
    return `
        <div class="weather-info">
            <div class="weather-row">
                <i class="fas ${weatherData.icons.temperature}"></i>
                <span class="weather-label">Temperatura:</span>
                <span class="weather-value">${weatherData.temperature}°C</span>
            </div>
            <div class="weather-row">
                <i class="fas ${weatherData.icons.precipitation}"></i>
                <span class="weather-label">Opady:</span>
                <span class="weather-value">${weatherData.precipitation} mm</span>
            </div>
            <div class="weather-row">
                <i class="fas ${weatherData.icons.cloudcover}"></i>
                <span class="weather-label">Zachmurzenie:</span>
                <span class="weather-value">${weatherData.cloudcover}%</span>
            </div>
            <div class="weather-row">
                <i class="fas ${weatherData.icons.wind}"></i>
                <span class="weather-label">Wiatr:</span>
                <span class="weather-value">${weatherData.windspeed} km/h</span>
            </div>
        </div>
    `;
}