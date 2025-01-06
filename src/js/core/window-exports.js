import { APP_STATE } from './config.js';
import { displayWrapperAbout, closeWrapperAbout, closeWrapperTrails, displayWrapperMarker, closeWrapperMarker, CloseWrapperWeather } from '../ui/modal.js';
import { addMarker, deleteMarker } from '../features/markers.js';
import { toggleWeather } from '../features/weather.js';
import { toggleLayer, toggleVectorLayers, toggleAllTrails, toggleTrail } from '../features/layers-controls.js';
import { toggleFullScreen } from '../utils/fullscreen.js';
import { getUserLocation } from '../utils/geolocation.js';
import { rotateMap } from '../features/directions.js';
import { measureLength, measureArea, clearMeasurements } from '../features/measurements.js';
import { osmLayer, ortoLayer, demLayer, parcelLayer, kayakLayer, campLayer, bikeLayer } from '../features/layers.js';

/**
 * Eksportuje wszystkie potrzebne funkcje do obiektu window
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initializeWindowExports(map) {
    Object.assign(window, {
        // Funkcje okien modalnych
        DisplayWrapperAbout: displayWrapperAbout,
        CloseWrapperAbout: closeWrapperAbout,
        CloseWrapperTrails: closeWrapperTrails,
        DisplayWrapperMarker: displayWrapperMarker,
        CloseWrapperMarker: closeWrapperMarker,
        CloseWrapperWeather: CloseWrapperWeather,

        // Funkcje znaczników
        AddMarker: () => addMarker(map),
        DeleteMarker: deleteMarker,

        // Funkcje warstw
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

        // Funkcje kierunków
        rotateMap: (direction) => rotateMap(map, direction),

        // Inne funkcje
        FullScreen: toggleFullScreen,
        GetUserLocation: () => getUserLocation(map),

        // Funkcje pomiarów
        MeasureLength: () => {
            APP_STATE.measurementActive = true;
            measureLength(map);
        },
        MeasureArea: () => {
            APP_STATE.measurementActive = true;
            measureArea(map);
        },
        ClearMeasure: () => {
            APP_STATE.measurementActive = false;
            clearMeasurements(map);
        }
    });
}
