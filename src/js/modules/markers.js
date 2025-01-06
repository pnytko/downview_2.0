import { APP_STATE } from './config.js';
import { markerSource, createMarkerStyle } from './layers.js';
import { displayWrapperMarker } from './modal.js';

/**
 * Dodaje nowy znacznik na mapę
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function addMarker(map) {
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    
    // Jeśli narzędzie jest już aktywne, wyłącz je
    if (APP_STATE.markerActive) {
        deactivateMarkerTool(map, mapCanvas);
        return;
    }

    // Aktywuj narzędzie
    activateMarkerTool(map, mapCanvas);
}

/**
 * Usuwa znacznik z mapy na podstawie współrzędnych
 */
export function deleteMarker() {
    const modal = document.getElementById('wrapper-marker');
    const coordinatesElement = document.getElementById('marker-coordinates');
    
    if (!coordinatesElement || !coordinatesElement.textContent) {
        console.error('Nie można znaleźć elementu z współrzędnymi lub jest pusty');
        return;
    }

    try {
        // Wyciągnij liczby ze stringa w formacie "Długość: X°\nSzerokość: Y°\nWysokość: Z m n.p.m."
        const matches = coordinatesElement.textContent.match(/Długość:\s*(-?\d+\.\d+).*Szerokość:\s*(-?\d+\.\d+)/s);
        if (!matches) {
            console.error('Nie można sparsować współrzędnych z tekstu:', coordinatesElement.textContent);
            return;
        }

        const [, lon, lat] = matches;
        
        const features = markerSource.getFeatures();
        features.forEach(feature => {
            const coords = ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
            if (Math.abs(coords[0] - parseFloat(lon)) < 0.000001 && Math.abs(coords[1] - parseFloat(lat)) < 0.000001) {
                markerSource.removeFeature(feature);
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania znacznika:', error);
    } finally {
        if (modal) {
            modal.style.display = 'none';
        }
    }
}

/**
 * Inicjalizuje obsługę znaczników na mapie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initMarkerHandlers(map) {
    // Obsługa kliknięcia na znacznik
    map.on('click', function(evt) {
        // Jeśli aktywny jest pomiar, nie wyświetlaj informacji o markerze
        if (APP_STATE.measurementActive) return;
        
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        
        if (feature && feature.getGeometry().getType() === 'Point') {
            displayWrapperMarker(feature);
        }
    });

    // Zmiana kursora po najechaniu na marker
    map.on('pointermove', function(evt) {
        const pixel = map.getEventPixel(evt.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);
        const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });
        
        if (hit && feature && feature.getGeometry().getType() === 'Point') {
            map.getTargetElement().style.cursor = 'pointer';
        } else {
            map.getTargetElement().style.cursor = '';
        }
    });
}

// Funkcje pomocnicze

function deactivateMarkerTool(map, mapCanvas) {
    APP_STATE.markerActive = false;
    if (mapCanvas) {
        mapCanvas.style.cursor = '';
    }
    if (APP_STATE.clickListener) {
        map.un('click', APP_STATE.clickListener);
        APP_STATE.clickListener = null;
    }
    const button = document.querySelector('button[onclick="AddMarker()"]');
    if (button) {
        button.classList.remove('active');
    }
}

function activateMarkerTool(map, mapCanvas) {
    APP_STATE.markerActive = true;
    if (mapCanvas) {
        mapCanvas.style.cursor = 'crosshair';
    }
    const button = document.querySelector('button[onclick="AddMarker()"]');
    if (button) {
        button.classList.add('active');
    }

    // Dodaj listener kliknięcia
    APP_STATE.clickListener = function(evt) {
        const marker = new ol.Feature({
            geometry: new ol.geom.Point(evt.coordinate)
        });
        
        // Ustaw styl z numerem dla nowego znacznika
        marker.setStyle(createMarkerStyle(APP_STATE.markerCounter));
        APP_STATE.markerCounter++;

        markerSource.addFeature(marker);
        
        // Wyłącz narzędzie po dodaniu znacznika
        deactivateMarkerTool(map, mapCanvas);
    };
    
    map.on('click', APP_STATE.clickListener);
}
