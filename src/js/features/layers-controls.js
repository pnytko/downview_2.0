import { trailLayers, markerLayer } from './layers.js';
import { displayWrapperTrails, closeWrapperTrails } from '../ui/modal.js';
import { setMeasurementsVisible } from './measurements.js';
import { APP_STATE } from '../core/app-state.js';

// Przełącza widoczność pojedynczej warstwy
export function toggleLayer(layer, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
        layer.setVisible(checkbox.checked);
    }
}

// Przełącza widoczność pojedynczego szlaku
export function toggleTrail(color) {
    const layer = trailLayers[color];
    if (layer) {
        const isVisible = layer.getVisible();
        layer.setVisible(!isVisible);
        
        if (!isVisible) {
            APP_STATE.layers.activeTrails.add(color);
        } else {
            APP_STATE.layers.activeTrails.delete(color);
        }
    }
}

// Przełącza widoczność wszystkich warstw wektorowych
export function toggleVectorLayers(map) {
    const checkbox = document.getElementById('wektory');
    if (!checkbox) return;

    const isVisible = checkbox.checked;
    
    // Przełącz widoczność warstwy znaczników
    markerLayer.setVisible(isVisible);
    
    // Przełącz widoczność warstw szlaków
    Object.values(trailLayers).forEach(layer => {
        layer.setVisible(isVisible);
    });

    // Przełącz widoczność pomiarów
    setMeasurementsVisible(isVisible);

    // Zamknij okno szlaków
    closeWrapperTrails();
}

// Przełącza widoczność wszystkich szlaków
export function toggleAllTrails() {
    // Pobierz checkbox szlaków
    const checkbox = document.getElementById('szlaki');
    if (!checkbox) return;

    const isVisible = checkbox.checked;
    
    // Otwórz/zamknij okno szlaków
    if (isVisible) {
        displayWrapperTrails();
        // Po otwarciu okna ustaw stan wszystkich checkboxów w modalu
        const modalCheckboxes = document.querySelectorAll('#wrapper-trails input[type="checkbox"]');
        modalCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
    } else {
        closeWrapperTrails();
    }
    
    // Zmień stan widoczności wszystkich szlaków
    APP_STATE.layers.allTrailsVisible = isVisible;
    
    // Zaktualizuj widoczność warstw
    Object.entries(trailLayers).forEach(([color, layer]) => {
        layer.setVisible(isVisible);
        if (isVisible) {
            APP_STATE.layers.activeTrails.add(color);
        } else {
            APP_STATE.layers.activeTrails.delete(color);
        }
    });
}

// Inicjalizuje obsługę przełączania pojedynczych szlaków
export function initTrailControls() {
    // Dodaj obsługę zdarzeń do checkboxów szlaków
    document.querySelectorAll('.trail-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => toggleTrail(checkbox.value));
    });
}
