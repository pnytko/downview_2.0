// Import funkcji pomiarów
import { initMeasurements, measureLength, measureArea, clearMeasurements } from './modules/measurements.js';
import { initControls } from './modules/control.js';
import { MAP_CONFIG, LAYER_ZINDEX, STYLES, WEATHER_CONFIG } from './modules/config.js';
import {
    osmLayer,
    ortoLayer,
    demLayer,
    parcelLayer,
    trailLayers,
    markerLayer,
    markerSource,
    markerStyle,
    createMarkerStyle,
    kayakLayer,
    campLayer,
    bikeLayer
} from './modules/layers.js';
import {
    makeDraggable,
    displayWrapperAbout,
    closeWrapperAbout,
    closeWrapperTrails,
    displayWrapperMarker,
    closeWrapperMarker,
    displayWrapperWeather,
    closeWrapperWeather,
    initModals
} from './modules/modal.js';

// Zmienne globalne
let map;
let markerCounter = 1;
let markerActive = false;
let weatherActive = false;
let measurementActive = false;  // Dodana zmienna dla stanu pomiaru
let clickListener = null;

// ========== OBSŁUGA OKIEN MODALNYCH ==========
window.DisplayWrapperAbout = displayWrapperAbout;
window.CloseWrapperAbout = closeWrapperAbout;
window.CloseWrapperTrails = closeWrapperTrails;
window.DisplayWrapperMarker = displayWrapperMarker;
window.CloseWrapperMarker = closeWrapperMarker;
window.CloseWrapperWeather = closeWrapperWeather;

// Map Initialization
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Dodanie logo
        const logoOverlay = document.createElement('div');
        logoOverlay.className = 'logo-overlay';
        const logoImg = document.createElement('img');
        logoImg.src = './src/assets/images/logo.png';
        logoImg.alt = 'Logo';
        logoOverlay.appendChild(logoImg);
        document.querySelector('.grid-container').appendChild(logoOverlay);

        map = new ol.Map({
            target: 'map',
            layers: [
                osmLayer,
                ortoLayer,
                demLayer,
                parcelLayer,
                ...Object.values(trailLayers),
                markerLayer,
                kayakLayer,
                campLayer,
                bikeLayer
            ],
            view: new ol.View({
                center: ol.proj.fromLonLat(MAP_CONFIG.startCoords),
                zoom: MAP_CONFIG.startZoom,
                minZoom: MAP_CONFIG.minZoom,
                maxZoom: MAP_CONFIG.maxZoom
            }),
            controls: [],
            interactions: ol.interaction.defaults({doubleClickZoom: false})
        });

        // Inicjalizacja kontrolek i pomiarów
        initControls(map);
        initMeasurements(map);
        initModals();

        // Funkcje globalne dla pomiarów
        window.MeasureLength = () => {
            measurementActive = true;
            measureLength(map);
        };
        window.MeasureArea = () => {
            measurementActive = true;
            measureArea(map);
        };
        window.ClearMeasure = () => {
            measurementActive = false;
            clearMeasurements(map);
        };

        // ========== PRZEŁĄCZANIE WARSTW ==========
        window.ToggleLayersWMS_Wektory = function() {
            const checkbox = document.getElementById('vector');
            const isChecked = checkbox.checked;
            
            // Przełącz widoczność warstw wektorowych
            markerLayer.setVisible(isChecked);
            const measureLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'measure');
            if (measureLayer) {
                measureLayer.setVisible(isChecked);
            }
            
            // Obsługa tooltipów
            const tooltips = document.getElementsByClassName('ol-tooltip');
            for (let tooltip of tooltips) {
                tooltip.style.display = isChecked ? 'block' : 'none';
            }
        };

        // Mapowanie nazw warstw do obiektów warstw
        window.ToggleLayersWMS_Osm = function() {
            toggleLayer(osmLayer, 'osm');
        };
        window.ToggleLayersWMS_Dzialki = function() {
            toggleLayer(parcelLayer, 'dzialki');
        };
        window.ToggleLayersWMS_OrtoHD = function() {
            toggleLayer(ortoLayer, 'ortoHD');
        };
        window.ToggleLayersWMS_DEM = function() {
            toggleLayer(demLayer, 'dem');
        };
        window.ToggleLayersWMS_Camp = function() {
            toggleLayer(campLayer, 'camp');
        };
        window.ToggleLayersWMS_Kayak = function() {
            toggleLayer(kayakLayer, 'kayak');
        };
        window.ToggleLayersWMS_Bike = function() {
            toggleLayer(bikeLayer, 'bike');
        };

        // Specjalna obsługa dla szlaków
        window.ToggleLayersWMS_Szlaki = function() {
            const checkbox = document.getElementById('szlaki');
            if (checkbox.checked) {
                document.getElementById('wrapper-trails').style.display = 'block';
                // Włącz wszystkie szlaki
                ['red', 'blue', 'green', 'yellow', 'black'].forEach(color => {
                    if (trailLayers[color]) {
                        trailLayers[color].setVisible(true);
                        document.getElementById(`trail-${color}`).checked = true;
                    }
                });
            } else {
                closeWrapperTrails();
            }
        };

        // Uproszczona obsługa pojedynczych szlaków
        window.toggleTrail = toggleTrail;
        ['Yellow', 'Green', 'Blue', 'Red', 'Black'].forEach(color => {
            window[`ToggleLayersWMS_Szlaki_${color}`] = function() {
                toggleTrail(color.toLowerCase());
            };
        });

        // ========== PEŁNY EKRAN ==========
        window.FullScreen = function() {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                elem.requestFullscreen().catch(err => {
                    alert(`Błąd podczas przechodzenia w tryb pełnoekranowy: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        };

        // ========== OBSŁUGA ZNACZNIKÓW ==========
        window.AddMarker = function() {
            const mapCanvas = map.getTargetElement().querySelector('canvas');
            
            // Jeśli narzędzie jest już aktywne, wyłącz je
            if (markerActive) {
                markerActive = false;
                if (mapCanvas) {
                    mapCanvas.style.cursor = '';
                }
                if (clickListener) {
                    map.un('click', clickListener);
                    clickListener = null;
                }
                const button = document.querySelector('button[onclick="AddMarker()"]');
                if (button) {
                    button.classList.remove('active');
                }
                return;
            }

            // Wyłącz inne narzędzia
            if (weatherActive) {
                const weatherButton = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
                if (weatherButton) {
                    weatherButton.classList.remove('active');
                }
                map.un('click', handleWeatherClick);
                closeWrapperWeather();
                weatherActive = false;
            }

            // Aktywuj narzędzie
            markerActive = true;
            if (mapCanvas) {
                mapCanvas.style.cursor = 'crosshair';
            }
            const button = document.querySelector('button[onclick="AddMarker()"]');
            if (button) {
                button.classList.add('active');
            }

            // Dodaj listener kliknięcia
            clickListener = function(evt) {
                const marker = new ol.Feature({
                    geometry: new ol.geom.Point(evt.coordinate)
                });
                
                // Ustaw styl z numerem dla nowego znacznika
                marker.setStyle(createMarkerStyle(markerCounter));
                markerCounter++;

                markerSource.addFeature(marker);
                
                // Wyłącz narzędzie po dodaniu znacznika
                markerActive = false;
                if (mapCanvas) {
                    mapCanvas.style.cursor = '';
                }
                map.un('click', clickListener);
                clickListener = null;
                const button = document.querySelector('button[onclick="AddMarker()"]');
                if (button) {
                    button.classList.remove('active');
                }
            };
            
            map.on('click', clickListener);
        };

        window.DeleteMarker = function() {
            const modal = document.getElementById('wrapper-marker');
            const coordinates = document.getElementById('marker-coordinates').textContent;
            const [lon, lat] = coordinates.match(/-?\d+\.\d+/g).map(Number);
            
            const features = markerSource.getFeatures();
            features.forEach(feature => {
                const coords = ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
                if (Math.abs(coords[0] - lon) < 0.000001 && Math.abs(coords[1] - lat) < 0.000001) {
                    markerSource.removeFeature(feature);
                }
            });
            
            modal.style.display = 'none';
        };

        // Obsługa kliknięcia na znacznik
        map.on('click', function(evt) {
            // Jeśli aktywny jest pomiar, nie wyświetlaj informacji o markerze
            if (measurementActive) return;
            
            const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
                return feature;
            });
            
            if (feature && feature.getGeometry().getType() === 'Point') {
                displayWrapperMarker(feature);
            }
        });

        // Zmiana kursora po najechaniu na marker
        map.on('pointermove', function(evt) {
            const pixel = map.getEventPixel(evt.originalEvent);
            const hit = map.hasFeatureAtPixel(pixel);
            const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
                return feature;
            });
            
            if (hit && feature && feature.getGeometry().getType() === 'Point') {
                map.getTargetElement().style.cursor = 'pointer';
            } else {
                map.getTargetElement().style.cursor = '';
            }
        });

        // ========== OBSŁUGA POGODY ==========
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

        // Funkcja obsługująca kliknięcie na mapę dla pogody
        async function handleWeatherClick(evt) {
            if (!weatherActive) return;
            
            const coordinates = evt.coordinate;
            const lonLat = displayWrapperWeather(coordinates);
            
            // Pobierz i wyświetl dane pogodowe
            const weatherData = await getWeatherData(lonLat);
            const weatherInfo = document.getElementById('weather-info');
            
            if (weatherData && weatherData.hourly) {
                // Pobierz aktualne dane (pierwszy element z tablicy)
                const currentTemp = weatherData.hourly.temperature_2m[0];
                const currentPrecip = weatherData.hourly.precipitation[0];
                const currentCloud = weatherData.hourly.cloudcover[0];
                const currentWind = weatherData.hourly.windspeed_10m[0];
                
                // Wybierz odpowiednie emoji dla temperatury
                let tempEmoji = '<span class="weather-emoji">🌡️</span>';
                if (currentTemp <= 0) tempEmoji = '<span class="weather-emoji">❄️</span>';
                else if (currentTemp >= 25) tempEmoji = '<span class="weather-emoji">🌞</span>';

                // Wybierz emoji dla opadów
                let precipEmoji = '<span class="weather-emoji">☔</span>';
                if (currentPrecip === 0) precipEmoji = '<span class="weather-emoji">🌂</span>';

                // Wybierz emoji dla zachmurzenia
                let cloudEmoji = '<span class="weather-emoji">☁️</span>';
                if (currentCloud < 25) cloudEmoji = '<span class="weather-emoji">☀️</span>';
                else if (currentCloud < 50) cloudEmoji = '<span class="weather-emoji">🌤️</span>';
                else if (currentCloud < 75) cloudEmoji = '<span class="weather-emoji">⛅</span>';

                // Emoji dla wiatru
                const windEmoji = '<span class="weather-emoji">💨</span>';
                
                weatherInfo.innerHTML = `
                    <p>${tempEmoji} <strong>Temperatura:</strong> ${currentTemp}°C</p>
                    <p>${precipEmoji} <strong>Opady:</strong> ${currentPrecip} mm</p>
                    <p>${cloudEmoji} <strong>Zachmurzenie:</strong> ${currentCloud}%</p>
                    <p>${windEmoji} <strong>Prędkość wiatru:</strong> ${currentWind} km/h</p>
                `;
            } else {
                weatherInfo.innerHTML = '<p><span class="weather-emoji">❌</span> Nie udało się pobrać danych pogodowych.</p>';
            }

            // Wyłącz narzędzie po użyciu
            weatherActive = false;
            const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
            if (button) {
                button.classList.remove('active');
            }
            map.getTargetElement().style.cursor = '';
        }

        // Funkcja przełączająca narzędzie pogody
        window.ToggleLayersWMS_Weather = function() {
            const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
            
            if (weatherActive) {
                weatherActive = false;
                map.getTargetElement().style.cursor = '';
                button.classList.remove('active');
                map.un('click', handleWeatherClick);
                closeWrapperWeather();
            } else {
                // Wyłącz inne narzędzia
                if (markerActive) {
                    const markerButton = document.querySelector('button[onclick="AddMarker()"]');
                    if (markerButton) {
                        markerButton.classList.remove('active');
                    }
                    if (clickListener) {
                        map.un('click', clickListener);
                        clickListener = null;
                    }
                    markerActive = false;
                }
                
                weatherActive = true;
                map.getTargetElement().style.cursor = 'crosshair';
                button.classList.add('active');
                map.on('click', handleWeatherClick);
            }
        };

        // ========== GEOLOKALIZACJA ==========
        window.GetUserLocation = function() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    // Sukces
                    function(position) {
                        const coords = ol.proj.fromLonLat([
                            position.coords.longitude,
                            position.coords.latitude
                        ]);
                        
                        // Usuń poprzedni marker lokalizacji, jeśli istnieje
                        const features = markerSource.getFeatures();
                        features.forEach(feature => {
                            if (feature.get('type') === 'location') {
                                markerSource.removeFeature(feature);
                            }
                        });
                        
                        // Dodaj nowy marker lokalizacji
                        const locationFeature = new ol.Feature({
                            geometry: new ol.geom.Point(coords),
                            type: 'location'
                        });
                        
                        locationFeature.setStyle(
                            new ol.style.Style({
                                image: new ol.style.Circle({
                                    radius: 6,
                                    fill: new ol.style.Fill({
                                        color: '#3399CC'
                                    }),
                                    stroke: new ol.style.Stroke({
                                        color: '#fff',
                                        width: 2
                                    })
                                })
                            })
                        );
                        
                        markerSource.addFeature(locationFeature);
                        
                        // Przesuń mapę do lokalizacji użytkownika
                        map.getView().animate({
                            center: coords,
                            zoom: 15
                        });
                    },
                    // Błąd
                    function() {
                        alert('Nie udało się uzyskać Twojej lokalizacji');
                    }
                );
            } else {
                alert('Twoja przeglądarka nie obsługuje geolokalizacji');
            }
        };

    } catch (error) {
        console.error('Błąd podczas inicjalizacji mapy:', error);
    }
});

// Funkcja do przełączania warstw
function toggleLayer(layer, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        layer.setVisible(checkbox.checked);
    }
}

// Funkcja do przełączania pojedynczego szlaku
function toggleTrail(color) {
    const checkbox = document.getElementById(`trail-${color}`);
    if (checkbox && trailLayers[color]) {
        trailLayers[color].setVisible(checkbox.checked);
    }
}
