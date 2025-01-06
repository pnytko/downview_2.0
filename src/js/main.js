// Import modułu pomiarów - funkcje do mierzenia odległości i powierzchni na mapie
import { initMeasurements, measureLength, measureArea, clearMeasurements } from './modules/measurements.js';

// Import modułu kontrolek - inicjalizacja i obsługa kontrolek mapy
import { initControls } from './modules/control.js';

// Import konfiguracji - stałe i ustawienia dla mapy i pogody
import { MAP_CONFIG, APP_STATE } from './modules/config.js';

// Import warstw mapy - definicje wszystkich warstw (OSM, ortofoto, szlaki, itp.)
import {
    osmLayer,
    ortoLayer,
    demLayer,
    parcelLayer,
    trailLayers,
    markerLayer,
    markerSource,
    createMarkerStyle,
    kayakLayer,
    campLayer,
    bikeLayer
} from './modules/layers.js';

// Import obsługi okien modalnych - funkcje do wyświetlania/ukrywania i zarządzania oknami
import {
    displayWrapperAbout,
    closeWrapperAbout,
    closeWrapperTrails,
    displayWrapperMarker,
    closeWrapperMarker,
    closeWrapperWeather,
    initModals
} from './modules/modal.js';

// Import modułu znaczników - funkcje do dodawania i usuwania znaczników
import { addMarker, deleteMarker, initMarkerHandlers } from './modules/markers.js';

// Import modułu pogody
import { toggleWeather } from './modules/weather.js';

// Import modułu geolokalizacji
import { getUserLocation } from './modules/geolocation.js';

// Zmienna mapy
let map;

// Eksport funkcji do window dla dostępu z HTML
Object.assign(window, {
    DisplayWrapperAbout: displayWrapperAbout,
    CloseWrapperAbout: closeWrapperAbout,
    CloseWrapperTrails: closeWrapperTrails,
    DisplayWrapperMarker: displayWrapperMarker,
    CloseWrapperMarker: closeWrapperMarker,
    CloseWrapperWeather: closeWrapperWeather,
    AddMarker: () => addMarker(map),
    DeleteMarker: deleteMarker,
    ToggleLayersWMS_Weather: () => toggleWeather(map),
    GetUserLocation: () => getUserLocation(map)
});

// Inicjalizacja mapy
document.addEventListener('DOMContentLoaded', async function() {
    try {
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

        // Inicjalizacja komponentów
        initMeasurements(map);
        initControls(map);
        initModals();
        initMarkerHandlers(map);

        // Funkcje globalne dla pomiarów
        window.MeasureLength = () => {
            APP_STATE.measurementActive = true;
            measureLength(map);
        };
        window.MeasureArea = () => {
            APP_STATE.measurementActive = true;
            measureArea(map);
        };
        window.ClearMeasure = () => {
            APP_STATE.measurementActive = false;
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

        // ========== OBSŁUGA WARSTW ==========

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
