import { markerLayer, createMarkerStyle } from './layers.js';
import { displayWrapperMarker } from '../ui/modal.js';
import { APP_STATE, StateActions } from '../core/app-state.js';

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
    
    // Zapisz aktualny feature
    APP_STATE.tools.marker.currentFeature = feature;
    
    // Pokaż modal z początkowymi danymi
    StateActions.ui.toggleModal('marker', true);
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
    
    // Aktywuj narzędzie znaczników
    StateActions.tools.activate('marker');
    
    // Upewnij się, że warstwa wektorowa jest widoczna
    markerLayer.setVisible(true);
    StateActions.layers.setVectorVisibility(true);
    
    // Zmień kursor na krzyżyk
    mapCanvas.style.cursor = 'crosshair';
    
    // Dodaj obsługę kliknięcia w mapę
    APP_STATE.tools.marker.clickListener = function(evt) {
        const coordinates = evt.coordinate;
        const coordinates4326 = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
        
        try {
            const elevation = getElevation(coordinates4326[1], coordinates4326[0]);
            const formattedText = formatMarkerCoordinates(coordinates4326[0], coordinates4326[1], elevation);
            
            const feature = addMarkerAtCoordinates(coordinates);
            displayMarkerInfo(feature);
            
            // Przywróć domyślny kursor i dezaktywuj narzędzie
            mapCanvas.style.cursor = '';
            deactivateMarkerTool(map);
        } catch (error) {
            alert('Nie udało się pobrać wysokości dla tego punktu');
            
            // Przywróć domyślny kursor w przypadku błędu
            mapCanvas.style.cursor = '';
        }
    };
    
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
    
    // Przywróć domyślny kursor
    const mapCanvas = map.getTargetElement().querySelector('canvas');
    if (mapCanvas) {
        mapCanvas.style.cursor = '';
    }
    
    // Dezaktywuj narzędzie
    StateActions.tools.deactivateAll();
}

// Dodaje znacznik w określonych współrzędnych
export function addMarkerAtCoordinates(coordinates) {
    const feature = new ol.Feature({
        geometry: new ol.geom.Point(coordinates),
        number: APP_STATE.tools.marker.counter++,
        type: 'marker'  // Dodajemy typ aby odróżnić od pomiarów
    });
    
    feature.setStyle(createMarkerStyle(feature.get('number')));
    markerLayer.getSource().addFeature(feature);
    
    return feature;
}

/**
 * Usuwa znacznik z mapy na podstawie współrzędnych
 * @param {ol.Coordinate} coordinates - Współrzędne punktu
 */
export function deleteMarker(coordinates) {
    const source = markerLayer.getSource();
    const features = source.getFeatures();
    
    for (let feature of features) {
        const geometry = feature.getGeometry();
        if (geometry.getCoordinates()[0] === coordinates[0] && 
            geometry.getCoordinates()[1] === coordinates[1]) {
            source.removeFeature(feature);
            break;
        }
    }
    
    // Zamknij modal
    StateActions.ui.toggleModal('marker', false);
}

/**
 * Inicjalizuje obsługę znaczników na mapie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initMarkerHandlers(map) {
    // Obsługa kliknięcia na znacznik
    map.on('click', function(evt) {
        // Jeśli aktywny jest pomiar, nie wyświetlaj informacji o markerze
        if (APP_STATE.tools.measurement.active) return;
        
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });
        
        if (feature && feature.get('type') === 'marker') {
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
        
        if (hit && feature && feature.get('type') === 'marker') {
            map.getTargetElement().style.cursor = 'pointer';
        } else if (!APP_STATE.tools.marker.active && !APP_STATE.tools.measurement.active) {
            map.getTargetElement().style.cursor = '';
        }
    });
}
