/**
 * @file marker-modal.js
 * @description Obsługa okna modalnego dla znaczników
 */

import { showModal, hideModal } from './modal-base.js';
import { APP_STATE } from '../../../core/state/app-state.js';

// ID okna modalnego markera
const MARKER_MODAL_ID = 'wrapper-marker';

/**
 * Wyświetla okno modalne ze szczegółami markera
 * @param {string} formattedText - Sformatowany tekst z informacjami o markerze
 */
export function displayWrapperMarker(formattedText) {
    // Pobierz element okna modalnego
    const modal = document.getElementById(MARKER_MODAL_ID);
    if (!modal) {
        console.error('Nie znaleziono elementu okna modalnego markera');
        return;
    }
    
    // Aktualizuj zawartość okna modalnego
    const coordinatesElement = document.getElementById('marker-coordinates');
    if (coordinatesElement) {
        coordinatesElement.innerText = formattedText;
    }
    
    // Wyświetl okno modalne
    showModal(MARKER_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.marker = true;
    }
}

/**
 * Zamyka okno modalne markera
 */
export function closeWrapperMarker() {
    hideModal(MARKER_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.marker = false;
    }
    
    // Wyczyść referencję do aktualnego markera
    APP_STATE.tools.marker.currentFeature = null;
}

/**
 * Inicjalizuje okno modalne markera
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initMarkerModal(map) {
    // Pobierz przycisk usuwania markera
    const deleteButton = document.querySelector('#wrapper-marker .delete-marker-btn');
    if (deleteButton) {
        // Dodaj obsługę kliknięcia przycisku usuwania
        deleteButton.addEventListener('click', () => {
            const feature = APP_STATE.tools.marker.currentFeature;
            if (feature) {
                const coordinates = feature.getGeometry().getCoordinates();
                
                // Znajdź warstwę markerów
                let markerLayer;
                map.getLayers().forEach(layer => {
                    if (layer.get('title') === 'Znaczniki') {
                        markerLayer = layer;
                    }
                });
                
                if (markerLayer) {
                    // Usuń marker z warstwy
                    markerLayer.getSource().removeFeature(feature);
                }
                
                // Zamknij okno modalne
                closeWrapperMarker();
            }
        });
    }
    
    // Pobierz przycisk zamykania okna modalnego
    const closeButton = document.querySelector('#wrapper-marker .btn-close');
    if (closeButton) {
        // Dodaj obsługę kliknięcia przycisku zamykania
        closeButton.addEventListener('click', closeWrapperMarker);
    }
}