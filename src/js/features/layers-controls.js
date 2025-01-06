import { trailLayers, markerLayer, TRAILS_STATE } from './layers.js';
import { closeWrapperTrails } from '../ui/modal.js';
import { setMeasurementsVisible } from './measurements.js';

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
            TRAILS_STATE.activeTrails.add(color);
        } else {
            TRAILS_STATE.activeTrails.delete(color);
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
    // Zmień stan widoczności wszystkich szlaków
    TRAILS_STATE.allTrailsVisible = !TRAILS_STATE.allTrailsVisible;
    
    // Pobierz wszystkie checkboxy szlaków
    const trailCheckboxes = document.querySelectorAll('.trail-checkbox');
    
    // Ustaw stan wszystkich checkboxów
    trailCheckboxes.forEach(checkbox => {
        checkbox.checked = TRAILS_STATE.allTrailsVisible;
    });
    
    // Zaktualizuj widoczność warstw
    Object.entries(trailLayers).forEach(([color, layer]) => {
        layer.setVisible(TRAILS_STATE.allTrailsVisible);
        if (TRAILS_STATE.allTrailsVisible) {
            TRAILS_STATE.activeTrails.add(color);
        } else {
            TRAILS_STATE.activeTrails.delete(color);
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
