// Konfiguracja mapy
export const MAP_CONFIG = {
    // Ograniczenia zoomu
    minZoom: 3,
    maxZoom: 25,
    startZoom: 18,
    
    // Współrzędne startowe
    startCoords: [20.9884, 50.01225]
};

import { osmLayer, ortoLayer, demLayer, parcelLayer, trailLayers, markerLayer, kayakLayer, campLayer, bikeLayer } from '../features/layers.js';

export function initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        throw new Error('Element mapy nie został znaleziony');
    }

    // Pobierz wszystkie warstwy szlaków (żółty, zielony, niebieski, czerwony, czarny)
    const allTrailLayers = Object.values(trailLayers);

    return new ol.Map({
        target: 'map',
        // Warstwy ułożone zgodnie z LAYER_ZINDEX
        layers: [
            osmLayer,          // OSM: 0
            ortoLayer,         // ORTO: 1
            parcelLayer,       // PARCELS: 2
            demLayer,          // DEM: 3
            ...allTrailLayers, // TRAILS: 4
            markerLayer,       // MARKERS: 5
            kayakLayer,        // KAYAK: 6
            campLayer,         // CAMP: 7
            bikeLayer          // BIKE: 8
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(MAP_CONFIG.startCoords),
            zoom: MAP_CONFIG.startZoom,
            minZoom: MAP_CONFIG.minZoom,
            maxZoom: MAP_CONFIG.maxZoom
        }),
        controls: [],  // Kontrolki dodane osobno
        interactions: ol.interaction.defaults({
            doubleClickZoom: false  // Wyłączone ze względu na inne narzędzia
        })
    });
}
