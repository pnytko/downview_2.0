import { APP_STATE } from '../core/config.js';
import { markerSource, createMarkerStyle } from './layers.js';
import { displayWrapperMarker } from '../ui/modal.js';

// Funkcje pobierania wysokości
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

async function getElevation(lat, lon, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetchWithTimeout(
                `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
                5000
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Otrzymano nieprawidłowy format odpowiedzi");
            }
            const data = await response.json();
            return data.results[0].elevation;
        } catch (error) {
            if (i === retries - 1) throw error; // Rzuć błąd tylko przy ostatniej próbie
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Zwiększający się czas oczekiwania
        }
    }
}

/**
 * Formatuje współrzędne markera z wysokością
 * @param {number} lon - Długość geograficzna
 * @param {number} lat - Szerokość geograficzna
 * @param {number|string} elevation - Wysokość lub informacja o błędzie
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
    
    // Pokaż modal z początkowymi danymi
    displayWrapperMarker(formatMarkerCoordinates(lonLat[0], lonLat[1], 'pobieranie...'));
    
    try {
        const elevation = await getElevation(lonLat[1], lonLat[0]);
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
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    
    // Jeśli narzędzie jest już aktywne, wyłącz je
    if (APP_STATE.marker.active) {
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
            displayMarkerInfo(feature);
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
    APP_STATE.marker.active = false;
    mapCanvas.style.cursor = 'default';
    if (APP_STATE.markerClickListener) {
        map.un('click', APP_STATE.markerClickListener);
        APP_STATE.markerClickListener = null;
    }
}

function activateMarkerTool(map, mapCanvas) {
    APP_STATE.marker.active = true;
    mapCanvas.style.cursor = 'crosshair';
    
    // Funkcja obsługująca kliknięcie w mapę
    APP_STATE.markerClickListener = function(evt) {
        const coordinates = evt.coordinate;
        const feature = new ol.Feature({
            geometry: new ol.geom.Point(coordinates)
        });
        
        feature.setStyle(createMarkerStyle(APP_STATE.markerCounter++));
        markerSource.addFeature(feature);
        
        // Wyświetl modal z informacjami o znaczniku
        const coords4326 = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
        displayMarkerInfo(feature);
        
        // Dezaktywuj narzędzie po dodaniu znacznika
        deactivateMarkerTool(map, mapCanvas);
    };
    
    map.on('click', APP_STATE.markerClickListener);
}
