/**
 * @file layers-controls.js
 * @description Kontrolki do zarządzania warstwami mapy
 */

import { APP_STATE, StateActions } from '../../core/state/app-state.js';
import { displayWrapperTrails, closeWrapperTrails } from '../ui/modals/trails-modal.js';
import { setMeasurementsVisible } from '../features/measurements.js';

/**
 * Przełącza widoczność warstwy
 * @param {ol.layer.Layer} layer - Warstwa do przełączenia
 * @param {string} layerName - Nazwa warstwy
 */
export function toggleLayer(layer, layerName) {
    const checkbox = document.getElementById(layerName);
    if (checkbox && layer) {
        console.log(`Toggling layer ${layerName} to ${checkbox.checked}`);
        layer.setVisible(checkbox.checked);
        
        // Aktualizuj stan aplikacji
        if (layerName in APP_STATE.layers) {
            StateActions.layers.setLayerVisibility(layerName, checkbox.checked);
        }
    }
}

/**
 * Przełącza widoczność warstw wektorowych
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function toggleVectorLayers(map) {
    const checkbox = document.getElementById('vector');
    if (!checkbox) return;
    
    const isVisible = checkbox.checked;
    console.log(`Toggling vector layers to ${isVisible}`);
    
    // Znajdź warstwę markerów
    let markerLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('title') === 'Znaczniki') {
            markerLayer = layer;
        }
    });
    
    if (markerLayer) {
        markerLayer.setVisible(isVisible);
    }
    
    // Aktualizuj widoczność pomiarów
    setMeasurementsVisible(isVisible);
    
    // Aktualizuj stan aplikacji
    StateActions.layers.setVectorVisibility(isVisible);
}

/**
 * Przełącza widoczność wszystkich szlaków
 */
export function toggleAllTrails() {
    const checkbox = document.getElementById('szlaki');
    if (!checkbox) {
        console.error('Trails checkbox not found!');
        return;
    }
    
    const isVisible = checkbox.checked;
    console.log(`Toggling all trails to ${isVisible}`);
    
    if (isVisible) {
        displayWrapperTrails();
        const modalCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
        console.log(`Found ${modalCheckboxes.length} trail checkboxes`);
        
        if (modalCheckboxes.length === 0) {
            console.error('No trail checkboxes found in the modal!');
        }
        
        modalCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            const trailColor = checkbox.id.replace('trail-', '');
            console.log(`Setting ${trailColor} trail to visible`);
            toggleTrail(trailColor);
        });
    } else {
        const modalCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
        
        modalCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const trailColor = checkbox.id.replace('trail-', '');
            console.log(`Setting ${trailColor} trail to hidden`);
            toggleTrail(trailColor);
        });
        
        closeWrapperTrails();
    }
    
    // Aktualizuj stan aplikacji
    StateActions.layers.setTrailsVisibility(isVisible);
    console.log('Updated trails visibility in APP_STATE:', APP_STATE.layers.trails);
}

/**
 * Przełącza widoczność pojedynczego szlaku
 * @param {string} color - Kolor szlaku (red, blue, green, yellow, black)
 */
export function toggleTrail(color) {
    const trailId = `trail-${color}`;
    const checkbox = document.getElementById(trailId);
    
    if (checkbox) {
        const isVisible = checkbox.checked;
        console.log(`Toggling trail ${color} to ${isVisible}`);
        
        // Znajdź warstwę szlaku w mapie
        const map = window.map; // Zakładamy, że mapa jest dostępna globalnie
        if (map) {
            let found = false;
            map.getLayers().forEach(layer => {
                console.log(`Checking layer:`, layer.get('title'));
                if (layer.get('title') === `Szlak ${color}`) {
                    console.log(`Found layer for trail ${color}, setting visible:`, isVisible);
                    layer.setVisible(isVisible);
                    found = true;
                }
            });
            
            if (!found) {
                console.error(`No layer found with title "Szlak ${color}"`);
                // Let's try to find the layer by other means
                console.log('Available layers:');
                map.getLayers().forEach((layer, index) => {
                    console.log(`Layer ${index}:`, layer.get('title'));
                });
            }
        } else {
            console.error('Map not available in window.map!');
        }
        
        // Aktualizuj stan aplikacji
        if (isVisible) {
            StateActions.layers.addTrail(color);
        } else {
            StateActions.layers.removeTrail(color);
        }
        
        // Aktualizuj główny checkbox szlaków
        updateMainTrailCheckbox();
    } else {
        console.warn(`Trail ${color} checkbox not found!`);
    }
}

/**
 * Aktualizuje stan głównego checkboxa szlaków na podstawie stanu pojedynczych szlaków
 */
function updateMainTrailCheckbox() {
    const allTrailCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
    const mainCheckbox = document.getElementById('szlaki');
    
    if (mainCheckbox && allTrailCheckboxes.length > 0) {
        const allChecked = Array.from(allTrailCheckboxes).every(cb => cb.checked);
        const anyChecked = Array.from(allTrailCheckboxes).some(cb => cb.checked);
        
        mainCheckbox.checked = anyChecked;
        
        // Aktualizuj stan aplikacji
        StateActions.layers.setTrailsVisibility(anyChecked);
    }
}

/**
 * Inicjalizuje obsługę przełączania pojedynczych szlaków
 */
export function initTrailControls() {
    // Podepnij zdarzenia do checkboxów szlaków
    document.querySelectorAll('#wrapper-trails input[type="checkbox"]').forEach(checkbox => {
        const trailColor = checkbox.id.replace('trail-', '');
        checkbox.addEventListener('change', () => toggleTrail(trailColor));
    });
    
    // Podepnij zdarzenie do głównego checkboxa szlaków
    const mainCheckbox = document.getElementById('szlaki');
    if (mainCheckbox) {
        mainCheckbox.addEventListener('change', toggleAllTrails);
    }
}