import { displayWrapperAbout, closeWrapperAbout, closeWrapperTrails, displayWrapperMarker, closeWrapperMarker, CloseWrapperWeather } from '../ui/modal.js';
import { addMarker, deleteMarker } from '../features/markers.js';
import { toggleWeather } from '../features/weather.js';
import { toggleLayer, toggleVectorLayers, toggleAllTrails, toggleTrail } from '../features/layers-controls.js';
import { toggleFullScreen } from '../utils/fullscreen.js';
import { getUserLocation } from '../utils/geolocation.js';
import { rotateMap } from '../features/directions.js';
import { measureLength, measureArea, clearMeasurements, deactivateMeasurementTool } from '../features/measurements.js';
import { osmLayer, ortoLayer, demLayer, parcelLayer, kayakLayer, campLayer, bikeLayer } from '../features/layers.js';
import { APP_STATE } from './app-state.js';

/**
 * Eksportuje funkcje do obiektu window dla użycia w HTML
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initializeWindowExports(map) {
    Object.assign(window, {
        // Okna modalne
        DisplayWrapperAbout: displayWrapperAbout,
        CloseWrapperAbout: closeWrapperAbout,
        CloseWrapperTrails: closeWrapperTrails,
        DisplayWrapperMarker: displayWrapperMarker,
        CloseWrapperMarker: closeWrapperMarker,
        CloseWrapperWeather: CloseWrapperWeather,

        // Znaczniki
        AddMarker: () => addMarker(map),
        DeleteMarker: () => {
            const feature = APP_STATE.tools.marker.currentFeature;
            const coordinates = feature.getGeometry().getCoordinates();
            deleteMarker(coordinates);
        },

        // Warstwy
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

        // Kierunki
        rotateMap: (direction) => rotateMap(map, direction),

        // Narzędzia
        FullScreen: toggleFullScreen,
        GetUserLocation: () => getUserLocation(map),

        // Pomiary
        MeasureLength: () => measureLength(map),
        MeasureArea: () => measureArea(map),
        ClearMeasurements: () => clearMeasurements(map)
    });
}
