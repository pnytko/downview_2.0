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

    // Wszystkie warstwy w jednej tablicy
    const allLayers = [
        osmLayer,
        ortoLayer,
        demLayer,
        parcelLayer,
        ...allTrailLayers,
        markerLayer,
        kayakLayer,
        campLayer,
        bikeLayer
    ];

    // Sortowanie warstw według zIndex
    allLayers.sort((a, b) => a.getZIndex() - b.getZIndex());

    return new ol.Map({
        target: 'map',
        layers: allLayers,  // Użycie posortowanych warstw
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
