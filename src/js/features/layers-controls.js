import { trailLayers, markerLayer, osmLayer, ortoLayer, demLayer, parcelLayer } from './layers.js';
import { displayWrapperTrails, closeWrapperTrails } from '../ui/modal.js';
import { setMeasurementsVisible } from './measurements.js';
import { APP_STATE, StateActions } from '../core/app-state.js';

// Przełącza widoczność warstwy
export function toggleLayer(layer, layerName) {
    const checkbox = document.getElementById(layerName);
    if (checkbox && layer) {
        console.log(`Toggling layer ${layerName} to ${checkbox.checked}`);
        layer.setVisible(checkbox.checked);
    }
}

// Przełącza widoczność warstw wektorowych
export function toggleVectorLayers(map) {
    const checkbox = document.getElementById('vector');
    if (!checkbox) return;
    const isVisible = checkbox.checked;
    console.log(`Toggling vector layers to ${isVisible}`);
    markerLayer.setVisible(isVisible);
    setMeasurementsVisible(isVisible);
}

// Przełącza widoczność wszystkich szlaków
export function toggleAllTrails() {
    const checkbox = document.getElementById('szlaki');
    if (!checkbox) return;
    const isVisible = checkbox.checked;
    console.log(`Toggling all trails to ${isVisible}`);
    if (isVisible) {
        displayWrapperTrails();
        const modalCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
        console.log(`Found ${modalCheckboxes.length} trail checkboxes`);
        modalCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
            const trailColor = checkbox.id.replace('trail-', '');
            console.log(`Setting ${trailColor} trail to visible`);
            if (trailLayers[trailColor]) {
                trailLayers[trailColor].setVisible(true);
            } else {
                console.warn(`Trail layer ${trailColor} not found in:`, Object.keys(trailLayers));
            }
        });
    } else {
        const modalCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
        modalCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
            const trailColor = checkbox.id.replace('trail-', '');
            console.log(`Setting ${trailColor} trail to hidden`);
            if (trailLayers[trailColor]) {
                trailLayers[trailColor].setVisible(false);
            } else {
                console.warn(`Trail layer ${trailColor} not found in:`, Object.keys(trailLayers));
            }
        });
        closeWrapperTrails();
    }
}

// Przełącza widoczność pojedynczego szlaku
export function toggleTrail(color) {
    const trailId = `trail-${color}`;
    const checkbox = document.getElementById(trailId);
    
    if (checkbox && trailLayers[color]) {
        trailLayers[color].setVisible(checkbox.checked);
        const allTrailCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
        const mainCheckbox = document.getElementById('szlaki');
        const allChecked = Array.from(allTrailCheckboxes).every(cb => cb.checked);
        if (mainCheckbox) {
            mainCheckbox.checked = allChecked;
        }
    } else {
        console.warn(`Trail ${color} checkbox or layer not found!`);
        console.log('Checkbox exists:', !!checkbox);
        console.log('Layer exists:', !!trailLayers[color]);
    }
}

// Inicjalizuje obsługę przełączania pojedynczych szlaków
export function initTrailControls() {
    document.querySelectorAll('.trail-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => toggleTrail(checkbox.value));
    });
}
