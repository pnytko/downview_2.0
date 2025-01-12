// Import funkcji UI
import { displayWrapperAbout, closeWrapperAbout, closeWrapperTrails, displayWrapperMarker, closeWrapperMarker, closeWrapperWeather } from '../ui/modal.js';
import { toggleFullScreen } from '../utils/fullscreen.js';

// Import narzędzi
import { addMarker, deleteMarker } from '../features/markers.js';
import { toggleWeather } from '../features/weather.js';
import { measureLength, measureArea, clearMeasurements } from '../features/measurements.js';
import { getUserLocation } from '../utils/geolocation.js';

// Import funkcji warstw
import { toggleLayer, toggleVectorLayers, toggleAllTrails, toggleTrail } from '../features/layers-controls.js';
import { osmLayer, ortoLayer, demLayer, parcelLayer, kayakLayer, campLayer, bikeLayer } from '../features/layers.js';
import { rotateMap } from '../features/directions.js';

// Import stanu aplikacji
import { APP_STATE } from './app-state.js';

export const initializeWindowExports = (map) => {
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
                deleteMarker(coordinates);
            }
        },
        toggleWeather: () => toggleWeather(map),
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
        toggleTrails: () => toggleAllTrails(),
        toggleTrail: (id) => toggleTrail(id),

        // Kierunki
        rotateMap: (direction) => rotateMap(map, direction)
    });
};
