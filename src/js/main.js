// Import modułu pomiarów - funkcje do mierzenia odległości i powierzchni na mapie
import { initMeasurements, measureLength, measureArea, clearMeasurements } from './modules/measurements.js';

// Import modułu kontrolek - inicjalizacja i obsługa kontrolek mapy
import { initControls } from './modules/control.js';

// Import modułu kierunków - funkcje do obracania mapy
import { initDirections, rotateMap, resetRotation } from './modules/directions.js';

// Import konfiguracji - stałe i ustawienia dla mapy i pogody
import { MAP_CONFIG, APP_STATE } from './modules/config.js';

// Import warstw mapy - definicje wszystkich warstw
import { osmLayer, ortoLayer, demLayer, parcelLayer, trailLayers, markerLayer, markerSource, createMarkerStyle, kayakLayer, campLayer, bikeLayer } from './modules/layers.js';

// Import obsługi okien modalnych - funkcje do wyświetlania/ukrywania i zarządzania oknami
import { displayWrapperAbout, closeWrapperAbout, closeWrapperTrails, displayWrapperMarker, closeWrapperMarker, CloseWrapperWeather, initModals } from './modules/modal.js';

// Import modułu znaczników - funkcje do dodawania i usuwania znaczników
import { addMarker, deleteMarker, initMarkerHandlers } from './modules/markers.js';

// Import modułu pogody
import { toggleWeather } from './modules/weather.js';

// Import modułu geolokalizacji
import { getUserLocation } from './modules/geolocation.js';

// Import modułu pełnego ekranu
import { toggleFullScreen } from './modules/fullscreen.js';

// Import kontroli warstw
import { toggleLayer, toggleTrail, toggleVectorLayers, toggleAllTrails, initTrailControls } from './modules/layers-controls.js';

// Zmienna mapy
let map;

// Eksport funkcji do window dla dostępu z HTML
Object.assign(window, {
    DisplayWrapperAbout: displayWrapperAbout,
    CloseWrapperAbout: closeWrapperAbout,
    CloseWrapperTrails: closeWrapperTrails,
    DisplayWrapperMarker: displayWrapperMarker,
    CloseWrapperMarker: closeWrapperMarker,
    CloseWrapperWeather: CloseWrapperWeather,
    AddMarker: () => addMarker(map),
    DeleteMarker: deleteMarker,
    ToggleLayersWMS_Weather: () => toggleWeather(map),
    ToggleLayersWMS_Osm: () => toggleLayer(osmLayer, 'osm'),
    ToggleLayersWMS_Wektory: () => toggleVectorLayers(map),
    ToggleLayersWMS_Dzialki: () => toggleLayer(parcelLayer, 'dzialki'),
    ToggleLayersWMS_OrtoHD: () => toggleLayer(ortoLayer, 'ortoHD'),
    ToggleLayersWMS_DEM: () => toggleLayer(demLayer, 'dem'),
    ToggleLayersWMS_Camp: () => toggleLayer(campLayer, 'camp'),
    ToggleLayersWMS_Kayak: () => toggleLayer(kayakLayer, 'kayak'),
    ToggleLayersWMS_Bike: () => toggleLayer(bikeLayer, 'bike'),
    ToggleLayersWMS_Szlaki: toggleAllTrails,
    toggleTrail: toggleTrail,
    rotateMap: (direction) => rotateMap(map, direction),
    resetRotation: () => resetRotation(map),
    FullScreen: toggleFullScreen,
    GetUserLocation: () => getUserLocation(map)
}); // Eksport funkcji do window dla dostępu z HTML

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
        }); // Inicjalizacja mapy

        // Inicjalizacja komponentów
        initMeasurements(map);
        initControls(map);
        initDirections(map);
        initModals();
        initMarkerHandlers(map);
        initTrailControls(); // Inicjalizacja komponentów

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
        }; // Funkcje globalne dla pomiarów

    } catch (error) {
        console.error('Błąd podczas inicjalizacji mapy:', error);
    }
}); 
