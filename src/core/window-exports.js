/**
 * @file window-exports.js
 * @description Eksport funkcji do globalnego obiektu window
 */

// Import funkcji UI
import { displayWrapperAbout, closeWrapperAbout } from '../components/ui/modals/about-modal.js';
import { displayWrapperTrails, closeWrapperTrails } from '../components/ui/modals/trails-modal.js';
import { displayWrapperMarker, closeWrapperMarker } from '../components/ui/modals/marker-modal.js';
import { displayWrapperWeather, closeWrapperWeather } from '../components/ui/modals/weather-modal.js';
import { toggleFullScreen } from '../utils/helpers/fullscreen.js';

// Import narzędzi
import { addMarker, deleteMarker } from '../components/features/markers.js';
import { toggleWeather } from '../components/features/weather.js';
import { measureLength, measureArea, clearMeasurements } from '../components/features/measurements.js';
import { getUserLocation } from '../services/geolocation/geolocation-service.js';

// Import funkcji warstw
import { toggleLayer, toggleVectorLayers, toggleAllTrails, toggleTrail } from '../components/map/layers-controls.js';
import { createOsmLayer, createOrtoLayer, createDemLayer, createParcelLayer, createKayakLayer, createCampLayer, createBikeLayer } from '../components/map/layers.js';
import { rotateMap } from '../components/features/directions.js';

// Import stanu aplikacji
import { APP_STATE } from './state/app-state.js';

/**
 * Inicjalizuje eksport funkcji do globalnego obiektu window
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initializeWindowExports(map) {
    console.log('Initializing window exports with map:', map);
    
    if (!map) {
        console.error('Map is undefined or null in initializeWindowExports');
        return;
    }
    
    try {
        // Sprawdź, czy mapa ma metodę getLayers
        if (typeof map.getLayers !== 'function') {
            console.error('map.getLayers is not a function. Map object:', map);
            return;
        }
        
        // Log all available layers
        console.log('Available layers:');
        map.getLayers().forEach((layer, index) => {
            console.log(`Layer ${index}:`, layer.get('title'));
        });
    } catch (error) {
        console.error('Error logging layers:', error);
    }
    
    // Zapisz referencje do warstw
    const osmLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'OSM');
    const ortoLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'OrthoHD');
    const demLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'DEM');
    const parcelLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'Działki');
    const kayakLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'Trasy kajakowe');
    const campLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'Miejsca biwakowe');
    const bikeLayer = map.getLayers().getArray().find(layer => layer.get('title') === 'Trasy rowerowe');
    
    console.log('Found layers:', {
        osmLayer,
        ortoLayer,
        demLayer,
        parcelLayer,
        kayakLayer,
        campLayer,
        bikeLayer
    });
    
    // Eksportuj funkcje do globalnego obiektu window
    Object.assign(window, {
        // Funkcje UI
        displayWrapperAbout,
        closeWrapperAbout,
        closeWrapperTrails,
        displayWrapperMarker,
        closeWrapperMarker,
        closeWrapperWeather,
        toggleFullScreen: () => toggleFullScreen(),
        
        // Narzędzia
        addMarker: () => addMarker(map),
        deleteMarker: () => {
            const feature = APP_STATE.tools.marker.currentFeature;
            if (feature) {
                const coordinates = feature.getGeometry().getCoordinates();
                deleteMarker(coordinates, map);
            }
        },
        toggleWeatherTool: () => {
            console.log('toggleWeatherTool called from window function');
            
            // Użyj mapy zapisanej w zmiennej globalnej
            const weatherMap = window.weatherMap || map;
            console.log('Using map:', weatherMap);
            
            // Wywołaj funkcję toggleWeather
            try {
                console.log('Calling toggleWeather with map');
                toggleWeather(weatherMap);
            } catch (error) {
                console.error('Error calling toggleWeather from window function:', error);
                console.error('Error details:', error.message, error.stack);
            }
        },
        measureLength: () => measureLength(map),
        measureArea: () => measureArea(map),
        clearMeasurements: () => clearMeasurements(map),
        getUserLocation: () => getUserLocation(map),
        
        // Warstwy mapy
        toggleOsm: () => toggleLayer(osmLayer, 'osm'),
        toggleVectors: () => toggleVectorLayers(map),
        toggleParcels: () => toggleLayer(parcelLayer, 'dzialki'),
        toggleOrtho: () => toggleLayer(ortoLayer, 'ortoHD'),
        toggleDem: () => toggleLayer(demLayer, 'dem'),
        toggleCamp: () => toggleLayer(campLayer, 'camp'),
        toggleKayak: () => toggleLayer(kayakLayer, 'kayak'),
        toggleBike: () => toggleLayer(bikeLayer, 'bike'),
        toggleTrails: () => {
            console.log('toggleTrails called from window function');
            toggleAllTrails();
        },
        toggleTrail: (id) => {
            console.log(`toggleTrail called from window function with id: ${id}`);
            toggleTrail(id);
        },
        
        // Kierunki
        rotateMap: (direction) => rotateMap(map, direction),
        
        // Funkcja przełączania menu mobilnego
        toggleMenu: () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.toggle('active');
            }
        }
    });
    
    console.log('Funkcje zostały wyeksportowane do globalnego obiektu window.');
}