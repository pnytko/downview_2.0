import { displayWrapperAbout, closeWrapperAbout, closeWrapperTrails, displayWrapperMarker, closeWrapperMarker, closeWrapperWeather } from '../ui/modal.js';
import { addMarker, deleteMarker } from '../features/markers.js';
import { toggleWeather } from '../features/weather.js';
import { toggleLayer, toggleVectorLayers, toggleAllTrails, toggleTrail } from '../features/layers-controls.js';
import { toggleFullScreen } from '../utils/fullscreen.js';
import { getUserLocation } from '../utils/geolocation.js';
import { rotateMap } from '../features/directions.js';
import { measureLength, measureArea, clearMeasurements, deactivateMeasurementTool } from '../features/measurements.js';
import { osmLayer, ortoLayer, demLayer, parcelLayer, kayakLayer, campLayer, bikeLayer } from '../features/layers.js';
import { APP_STATE } from './app-state.js';

//Eksportuje funkcje do obiektu window dla użycia w HTML

export function initializeWindowExports(map) {
    Object.assign(window, {
        // Okna modalne
        displayWrapperAbout,
        closeWrapperAbout,
        closeWrapperTrails,
        displayWrapperMarker,
        closeWrapperMarker,
        closeWrapperWeather,

        // Znaczniki
        addMarker: () => addMarker(map),
        deleteMarker: () => {
            const feature = APP_STATE.tools.marker.currentFeature;
            const coordinates = feature.getGeometry().getCoordinates();
            deleteMarker(coordinates);
        },

        // Warstwy
        toggleWeather: () => toggleWeather(map),
        toggleOsm: () => toggleLayer(osmLayer, 'osm'),
        toggleVectors: () => toggleVectorLayers(map),
        toggleParcels: () => toggleLayer(parcelLayer, 'dzialki'),
        toggleOrtho: () => toggleLayer(ortoLayer, 'ortoHD'),
        toggleDem: () => toggleLayer(demLayer, 'dem'),
        toggleCamp: () => toggleLayer(campLayer, 'camp'),
        toggleKayak: () => toggleLayer(kayakLayer, 'kayak'),
        toggleBike: () => toggleLayer(bikeLayer, 'bike'),
        toggleTrails: toggleAllTrails,
        toggleTrail,

        // Kierunki
        rotateMap: (direction) => rotateMap(map, direction),

        // Narzędzia
        toggleFullScreen: toggleFullScreen,
        getUserLocation: () => getUserLocation(map),

        // Pomiary
        measureLength: () => measureLength(map),
        measureArea: () => measureArea(map),
        clearMeasurements: () => clearMeasurements(map)
    });
}
