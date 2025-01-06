import { APP_STATE } from './config.js';
import { WEATHER_CONFIG } from './config.js';
import { displayWrapperWeather, closeWrapperWeather } from './modal.js';

/**
 * Pobiera dane pogodowe dla określonych współrzędnych
 * @param {Array} coordinates - Współrzędne [lon, lat]
 * @returns {Promise} - Obiekt z danymi pogodowymi
 */
async function getWeatherData(coordinates) {
    const [lon, lat] = coordinates;
    const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        hourly: WEATHER_CONFIG.params.hourly.join(','),
        timezone: WEATHER_CONFIG.params.timezone
    });
    
    const url = `${WEATHER_CONFIG.apiUrl}?${params.toString()}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Błąd podczas pobierania danych pogodowych:', error);
        return null;
    }
}

/**
 * Aktualizuje informacje o pogodzie w interfejsie
 * @param {Object} weatherData - Dane pogodowe
 */
function updateWeatherInfo(weatherData) {
    const weatherInfo = document.getElementById('weather-info');
    
    if (weatherData && weatherData.hourly) {
        // Pobierz aktualne dane (pierwszy element z tablicy)
        const currentTemp = weatherData.hourly.temperature_2m[0];
        const currentPrecip = weatherData.hourly.precipitation[0];
        const currentCloud = weatherData.hourly.cloudcover[0];
        const currentWind = weatherData.hourly.windspeed_10m[0];
        
        // Wybierz odpowiednią ikonę dla temperatury
        let tempIcon = `<i class="fas ${WEATHER_CONFIG.icons.temperature.normal}"></i>`;
        if (currentTemp <= 0) tempIcon = `<i class="fas ${WEATHER_CONFIG.icons.temperature.cold}"></i>`;
        else if (currentTemp >= 25) tempIcon = `<i class="fas ${WEATHER_CONFIG.icons.temperature.hot}"></i>`;

        // Wybierz ikonę dla opadów
        let precipIcon = `<i class="fas ${WEATHER_CONFIG.icons.precipitation.rain}"></i>`;
        if (currentPrecip === 0) precipIcon = `<i class="fas ${WEATHER_CONFIG.icons.precipitation.none}"></i>`;

        // Wybierz ikonę dla zachmurzenia
        let cloudIcon = `<i class="fas ${WEATHER_CONFIG.icons.cloudcover.mostlyCloudy}"></i>`;
        if (currentCloud < 25) cloudIcon = `<i class="fas ${WEATHER_CONFIG.icons.cloudcover.clear}"></i>`;
        else if (currentCloud < 50) cloudIcon = `<i class="fas ${WEATHER_CONFIG.icons.cloudcover.fewClouds}"></i>`;
        else if (currentCloud < 75) cloudIcon = `<i class="fas ${WEATHER_CONFIG.icons.cloudcover.partlyCloudy}"></i>`;

        // Ikona dla wiatru
        const windIcon = `<i class="fas ${WEATHER_CONFIG.icons.wind}"></i>`;
        
        weatherInfo.innerHTML = `
            <div class="weather-row">
                <div class="weather-label">
                    ${tempIcon} <strong>Temperatura:</strong>
                </div>
                <div class="weather-value">${currentTemp}°C</div>
            </div>
            <div class="weather-row">
                <div class="weather-label">
                    ${precipIcon} <strong>Opady:</strong>
                </div>
                <div class="weather-value">${currentPrecip} mm</div>
            </div>
            <div class="weather-row">
                <div class="weather-label">
                    ${cloudIcon} <strong>Zachmurzenie:</strong>
                </div>
                <div class="weather-value">${currentCloud}%</div>
            </div>
            <div class="weather-row">
                <div class="weather-label">
                    ${windIcon} <strong>Wiatr:</strong>
                </div>
                <div class="weather-value">${currentWind} km/h</div>
            </div>
        `;
    } else {
        weatherInfo.innerHTML = `<p><i class="fas ${WEATHER_CONFIG.icons.error}"></i> Nie udało się pobrać danych pogodowych.</p>`;
    }
}

/**
 * Obsługuje kliknięcie na mapę dla funkcji pogody
 * @param {Event} evt - Zdarzenie kliknięcia
 */
async function handleWeatherClick(evt) {
    if (!APP_STATE.weatherActive) return;
    
    const coordinates = evt.coordinate;
    const lonLat = displayWrapperWeather(coordinates);
    
    // Pobierz i wyświetl dane pogodowe
    const weatherData = await getWeatherData(lonLat);
    updateWeatherInfo(weatherData);
    
    // Wyłącz narzędzie po użyciu
    deactivateWeatherTool(evt.map);
}

/**
 * Wyłącza narzędzie pogody
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function deactivateWeatherTool(map) {
    APP_STATE.weatherActive = false;
    const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
    if (button) {
        button.classList.remove('active');
    }
    const mapCanvas = map?.getTargetElement()?.querySelector('canvas');
    if (mapCanvas) {
        mapCanvas.style.cursor = '';
    }
}

/**
 * Przełącza narzędzie pogody
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function toggleWeather(map) {
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    
    if (APP_STATE.weatherActive) {
        // Wyłącz narzędzie
        deactivateWeatherTool(map);
        map.un('click', handleWeatherClick);
        closeWrapperWeather();
        if (mapCanvas) {
            mapCanvas.style.cursor = '';
        }
    } else {
        // Włącz narzędzie
        APP_STATE.weatherActive = true;
        const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
        if (button) {
            button.classList.add('active');
        }
        if (mapCanvas) {
            mapCanvas.style.cursor = 'crosshair';
        }
        map.on('click', handleWeatherClick);
    }
}
