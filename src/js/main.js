// Import inicjalizacji mapy
import { initializeMap } from './core/map-init.js';

// Import inicjalizacji komponentów
import { initMeasurements } from './features/measurements.js';
import { initControls } from './ui/control.js';
import { initModals } from './ui/modal.js';
import { initMarkerHandlers } from './features/markers.js';
import { initTrailControls } from './features/layers-controls.js';
import { initFileDropHandler } from './features/file-drop.js';

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
        initModals();
        initMarkerHandlers(map);
        initTrailControls();
        initFileDropHandler(map);

        // Eksport funkcji do window
        initializeWindowExports(map);
    } catch (error) {
        alert('Błąd podczas inicjalizacji mapy. Odśwież stronę lub skontaktuj się z administratorem.');
    }
});
