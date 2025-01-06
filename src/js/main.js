// Import inicjalizacji mapy
import { initializeMap } from './core/map-init.js';

// Import inicjalizacji komponentów
import { initMeasurements } from './features/measurements.js';
import { initControls } from './ui/control.js';
import { initDirections } from './features/directions.js';
import { initModals } from './ui/modal.js';
import { initMarkerHandlers } from './features/markers.js';
import { initTrailControls } from './features/layers-controls.js';

// Import eksportu funkcji do window
import { initializeWindowExports } from './core/window-exports.js';

// Zmienna mapy
let map;

// Inicjalizacja aplikacji
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Inicjalizacja mapy
        map = initializeMap();

        // Inicjalizacja komponentów
        initMeasurements(map);
        initControls(map);
        initDirections(map);
        initModals();
        initMarkerHandlers(map);
        initTrailControls();

        // Eksport funkcji do window
        initializeWindowExports(map);
    } catch (error) {
        console.error('Błąd podczas inicjalizacji mapy:', error);
    }
});
