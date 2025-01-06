import { MAP_CONFIG } from './config.js';
import { osmLayer, ortoLayer, demLayer, parcelLayer, trailLayers, markerLayer, kayakLayer, campLayer, bikeLayer } from '../features/layers.js';

/**
 * Inicjalizuje mapę OpenLayers
 * @returns {ol.Map} Instancja mapy OpenLayers
 */
export function initializeMap() {
    return new ol.Map({
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
}
