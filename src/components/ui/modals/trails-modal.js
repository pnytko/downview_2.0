/**
 * @file trails-modal.js
 * @description Obsługa okna modalnego dla szlaków turystycznych
 */

import { showModal, hideModal } from './modal-base.js';
import { APP_STATE } from '../../../core/state/app-state.js';
import { toggleTrail } from '../../map/layers-controls.js';

// ID okna modalnego szlaków
const TRAILS_MODAL_ID = 'wrapper-trails';

/**
 * Wyświetla okno modalne z opcjami szlaków
 */
export function displayWrapperTrails() {
    // Wyświetl okno modalne
    showModal(TRAILS_MODAL_ID);
    
    // Aktualizuj stan checkboxów na podstawie stanu aplikacji
    updateTrailCheckboxes();
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.trails = true;
    }
}

/**
 * Aktualizuje stan checkboxów szlaków na podstawie stanu aplikacji
 */
function updateTrailCheckboxes() {
    const activeTrails = APP_STATE.layers.trails.activeTrails;
    
    // Aktualizuj checkboxy szlaków
    document.querySelectorAll('#wrapper-trails input[type="checkbox"]').forEach(checkbox => {
        const trailColor = checkbox.id.replace('trail-', '');
        checkbox.checked = activeTrails.has(trailColor);
    });
}

/**
 * Zamyka okno modalne szlaków
 */
export function closeWrapperTrails() {
    hideModal(TRAILS_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.trails = false;
    }
}

/**
 * Inicjalizuje okno modalne szlaków
 */
export function initTrailsModal() {
    // Pobierz przycisk zamykania okna modalnego
    const closeButton = document.querySelector('#wrapper-trails .btn-close');
    if (closeButton) {
        // Dodaj obsługę kliknięcia przycisku zamykania
        closeButton.addEventListener('click', closeWrapperTrails);
    }
    
    // Dodaj obsługę checkboxów szlaków
    document.querySelectorAll('#wrapper-trails input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const trailColor = checkbox.id.replace('trail-', '');
            toggleTrail(trailColor);
        });
    });
}

/**
 * Aktualizuje widoczność szlaków na podstawie stanu aplikacji
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function updateTrailsVisibility(map) {
    const activeTrails = APP_STATE.layers.trails.activeTrails;
    const isVisible = APP_STATE.layers.trails.visible;
    
    // Znajdź warstwy szlaków
    map.getLayers().forEach(layer => {
        const title = layer.get('title');
        if (title && title.startsWith('Szlak ')) {
            const color = title.split(' ')[1].toLowerCase();
            
            // Ustaw widoczność warstwy
            layer.setVisible(isVisible && activeTrails.has(color));
        }
    });
    
    // Aktualizuj checkboxy szlaków
    updateTrailCheckboxes();
}

/**
 * Dodaje szlak do aktywnych szlaków
 * @param {string} color - Kolor szlaku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function addTrail(color, map) {
    // Dodaj szlak do aktywnych szlaków
    StateActions.layers.addTrail(color);
    
    // Aktualizuj widoczność szlaków
    updateTrailsVisibility(map);
    
    // Aktualizuj checkbox szlaku
    const checkbox = document.getElementById(`trail-${color}`);
    if (checkbox) {
        checkbox.checked = true;
    }
}

/**
 * Usuwa szlak z aktywnych szlaków
 * @param {string} color - Kolor szlaku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function removeTrail(color, map) {
    // Usuń szlak z aktywnych szlaków
    StateActions.layers.removeTrail(color);
    
    // Aktualizuj widoczność szlaków
    updateTrailsVisibility(map);
    
    // Aktualizuj checkbox szlaku
    const checkbox = document.getElementById(`trail-${color}`);
    if (checkbox) {
        checkbox.checked = false;
    }
}