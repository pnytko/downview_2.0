import { APP_STATE } from '../core/config.js';
import { trailLayers, markerLayer } from './layers.js';
import { closeWrapperTrails } from '../ui/modal.js';

// Przełącza widoczność pojedynczej warstwy
export function toggleLayer(layer, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        layer.setVisible(checkbox.checked);
    }
}

// Przełącza widoczność pojedynczego szlaku
export function toggleTrail(color) {
    const checkbox = document.getElementById(`trail-${color}`);
    if (trailLayers[color]) {
        trailLayers[color].setVisible(checkbox.checked);
    }
}

// Przełącza widoczność wszystkich warstw wektorowych
export function toggleVectorLayers(map) {
    const checkbox = document.getElementById('vector');
    const isChecked = checkbox.checked;
    
    // Przełącz widoczność warstw wektorowych
    markerLayer.setVisible(isChecked);
    const measureLayer = map.getLayers().getArray().find(layer => layer.get('name') === 'measure');
    if (measureLayer) {
        measureLayer.setVisible(isChecked);
    }
    
    // Obsługa tooltipów
    const tooltips = document.getElementsByClassName('ol-tooltip');
    for (let tooltip of tooltips) {
        tooltip.style.display = isChecked ? 'block' : 'none';
    }
}

// Przełącza widoczność wszystkich szlaków
export function toggleAllTrails() {
    const checkbox = document.getElementById('szlaki');
    const isChecked = checkbox.checked;
    
    if (isChecked) {
        document.getElementById('wrapper-trails').style.display = 'block';
    } else {
        closeWrapperTrails();
    }

    // Przełącz wszystkie szlaki zgodnie ze stanem głównego checkboxa
    ['red', 'blue', 'green', 'yellow', 'black'].forEach(color => {
        if (trailLayers[color]) {
            trailLayers[color].setVisible(isChecked);
            document.getElementById(`trail-${color}`).checked = isChecked;
        }
    });
}

// Inicjalizuje obsługę przełączania pojedynczych szlaków
export function initTrailControls() {
    ['Yellow', 'Green', 'Blue', 'Red', 'Black'].forEach(color => {
        window[`ToggleLayersWMS_Szlaki_${color}`] = () => toggleTrail(color.toLowerCase());
    });
}
