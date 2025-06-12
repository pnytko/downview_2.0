/**
 * @file map-init.js
 * @description Inicjalizacja mapy i jej komponentów
 */

import { MAP_CONFIG } from '../../core/config/map-config.js';
import { createLayers } from './layers.js';

/**
 * Inicjalizuje mapę OpenLayers
 * @returns {ol.Map} Instancja mapy OpenLayers
 */
export function initializeMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
        throw new Error('Element mapy nie został znaleziony');
    }

    // Pobierz wszystkie warstwy
    const allLayers = createLayers();

    // Sortowanie warstw według zIndex
    allLayers.sort((a, b) => a.getZIndex() - b.getZIndex());

    // Tworzenie instancji mapy
    const map = new ol.Map({
        target: 'map',
        layers: allLayers,
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

    // Dodaj obsługę zdarzeń mapy
    setupMapEvents(map);

    return map;
}

/**
 * Konfiguruje zdarzenia mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function setupMapEvents(map) {
    // Obsługa zmiany rozmiaru okna
    window.addEventListener('resize', () => {
        map.updateSize();
    });

    // Obsługa zmiany widoku mapy
    map.getView().on('change:resolution', () => {
        // Aktualizacja widoczności etykiet w zależności od poziomu przybliżenia
        const zoom = map.getView().getZoom();
        updateLabelsVisibility(map, zoom);
    });
}

/**
 * Aktualizuje widoczność etykiet w zależności od poziomu przybliżenia
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {number} zoom - Aktualny poziom przybliżenia
 */
function updateLabelsVisibility(map, zoom) {
    // Przykładowa implementacja - można dostosować do potrzeb
    const showLabels = zoom >= 15;
    
    // Aktualizacja stylów warstw z etykietami
    map.getLayers().forEach(layer => {
        if (layer.get('hasLabels')) {
            const style = layer.getStyle();
            if (typeof style === 'function') {
                // Odświeżenie stylu wymusza przerysowanie
                layer.changed();
            }
        }
    });
}