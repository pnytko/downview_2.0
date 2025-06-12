/**
 * @file markers.js
 * @description Obsługa znaczników na mapie
 */

import { APP_STATE, StateActions } from '../../core/state/app-state.js';
import { displayWrapperMarker } from '../ui/modals/marker-modal.js';
import { fetchElevation } from '../../services/api/elevation-service.js';

/**
 * Formatuje współrzędne markera z wysokością
 * @param {number} lon - Długość geograficzna
 * @param {number} lat - Szerokość geograficzna
 * @param {number|string} elevation - Wysokość lub komunikat
 * @returns {string} Sformatowany tekst z współrzędnymi
 */
function formatMarkerCoordinates(lon, lat, elevation) {
    return `Długość: ${lon.toFixed(6)}°\nSzerokość: ${lat.toFixed(6)}°\nWysokość: ${
        typeof elevation === 'number' ? `${elevation.toFixed(1)} m n.p.m.` : elevation
    }`;
}

/**
 * Wyświetla informacje o markerze wraz z wysokością
 * @param {ol.Feature} feature - Feature markera
 */
export async function displayMarkerInfo(feature) {
    const coordinates = feature.getGeometry().getCoordinates();
    const lonLat = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    
    // Zapisz aktualny marker w stanie aplikacji
    APP_STATE.tools.marker.currentFeature = feature;
    
    // Wyświetl okno modalne z informacją o markerze
    displayWrapperMarker(formatMarkerCoordinates(lonLat[0], lonLat[1], 'pobieranie...'));
    
    try {
        // Pobierz wysokość dla współrzędnych
        const elevation = await fetchElevation(lonLat[1], lonLat[0]);
        
        // Zaktualizuj informacje o markerze
        displayWrapperMarker(formatMarkerCoordinates(lonLat[0], lonLat[1], elevation));
    } catch (error) {
        console.error('Błąd podczas pobierania wysokości:', error);
        displayWrapperMarker(formatMarkerCoordinates(lonLat[0], lonLat[1], 'niedostępna'));
    }
}

/**
 * Dodaje nowy znacznik na mapę
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function addMarker(map) {
    // Znajdź warstwę markerów
    let markerLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('title') === 'Znaczniki') {
            markerLayer = layer;
        }
    });
    
    if (!markerLayer) {
        console.error('Nie znaleziono warstwy markerów');
        return;
    }
    
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    
    // Aktywuj narzędzie markera
    StateActions.tools.activate('marker');
    
    // Upewnij się, że warstwa markerów jest widoczna
    markerLayer.setVisible(true);
    StateActions.layers.setVectorVisibility(true);
    
    // Zmień kursor
    mapCanvas.style.cursor = 'crosshair';
    
    // Funkcja obsługująca kliknięcie na mapę
    APP_STATE.tools.marker.clickListener = async function(evt) {
        try {
            const coordinates = evt.coordinate;
            const coordinates4326 = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
            
            // Dodaj marker na mapę
            const feature = addMarkerAtCoordinates(coordinates, markerLayer);
            
            // Wyświetl informacje o markerze
            await displayMarkerInfo(feature);
            
            // Przywróć domyślny kursor
            mapCanvas.style.cursor = '';
            
            // Dezaktywuj narzędzie
            deactivateMarkerTool(map);
        } catch (error) {
            console.error('Błąd podczas dodawania markera:', error);
            alert('Wystąpił błąd podczas dodawania markera');
            mapCanvas.style.cursor = '';
            deactivateMarkerTool(map);
        }
    };
    
    // Dodaj nasłuchiwanie na kliknięcie
    map.on('click', APP_STATE.tools.marker.clickListener);
}

/**
 * Dezaktywuje narzędzie dodawania znaczników
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function deactivateMarkerTool(map) {
    if (APP_STATE.tools.marker.clickListener) {
        map.un('click', APP_STATE.tools.marker.clickListener);
        APP_STATE.tools.marker.clickListener = null;
    }
    
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    if (mapCanvas) {
        mapCanvas.style.cursor = '';
    }
    
    StateActions.tools.deactivateAll();
}

/**
 * Dodaje znacznik w określonych współrzędnych
 * @param {ol.Coordinate} coordinates - Współrzędne w układzie EPSG:3857
 * @param {ol.layer.Vector} markerLayer - Warstwa markerów
 * @returns {ol.Feature} Dodany feature markera
 */
export function addMarkerAtCoordinates(coordinates, markerLayer) {
    // Stwórz feature markera
    const feature = new ol.Feature({
        geometry: new ol.geom.Point(coordinates),
        number: APP_STATE.tools.marker.counter++,
        type: 'marker'  // Dodajemy typ aby odróżnić od pomiarów
    });
    
    // Ustaw styl markera
    const markerStyle = new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: './src/assets/images/marker.png'
        }),
        text: new ol.style.Text({
            font: 'bold 12px Inter',
            text: `PUNKT ${feature.get('number')}`,
            offsetY: 25,
            offsetX: 0,
            textAlign: 'center',
            fill: new ol.style.Fill({
                color: '#000000'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 3
            })
        })
    });
    
    feature.setStyle(markerStyle);
    
    // Dodaj marker do warstwy
    markerLayer.getSource().addFeature(feature);
    
    return feature;
}

/**
 * Usuwa znacznik z mapy na podstawie współrzędnych
 * @param {ol.Coordinate} coordinates - Współrzędne markera
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function deleteMarker(coordinates, map) {
    // Znajdź warstwę markerów
    let markerLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('title') === 'Znaczniki') {
            markerLayer = layer;
        }
    });
    
    if (!markerLayer) {
        console.error('Nie znaleziono warstwy markerów');
        return;
    }
    
    const source = markerLayer.getSource();
    const features = source.getFeatures();
    
    // Znajdź i usuń marker o podanych współrzędnych
    for (let feature of features) {
        const geometry = feature.getGeometry();
        if (geometry.getCoordinates()[0] === coordinates[0] && 
            geometry.getCoordinates()[1] === coordinates[1]) {
            source.removeFeature(feature);
            break;
        }
    }
    
    // Zamknij okno modalne markera
    const markerModal = document.getElementById('wrapper-marker');
    if (markerModal) {
        markerModal.style.display = 'none';
    }
    
    // Wyczyść referencję do aktualnego markera
    APP_STATE.tools.marker.currentFeature = null;
}

/**
 * Inicjalizuje obsługę znaczników na mapie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initMarkerHandlers(map) {
    // Obsługa kliknięcia na marker
    map.on('click', function(evt) {
        // Jeśli aktywne jest narzędzie pomiarów, nie obsługuj kliknięcia na marker
        if (APP_STATE.tools.measurement.active) return;
        
        // Sprawdź, czy kliknięto na feature
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        
        // Jeśli kliknięto na marker, wyświetl informacje o nim
        if (feature && feature.get('type') === 'marker') {
            displayMarkerInfo(feature);
        }
    });
    
    // Zmiana kursora nad markerem
    map.on('pointermove', function(evt) {
        const pixel = map.getEventPixel(evt.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);
        const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });
        
        // Zmień kursor na pointer nad markerem
        if (hit && feature && feature.get('type') === 'marker') {
            map.getTargetElement().style.cursor = 'pointer';
        } else if (!APP_STATE.tools.marker.active && !APP_STATE.tools.measurement.active) {
            map.getTargetElement().style.cursor = '';
        }
    });
}