/**
 * @file main.js
 * @description Główny plik aplikacji DownView 2.0
 */

// Import inicjalizacji mapy
import { initializeMap } from './components/map/map-init.js';

// Import inicjalizacji komponentów
import { initMeasurements } from './components/features/measurements.js';
import { initMarkerHandlers } from './components/features/markers.js';
import { initTrailControls } from './components/map/layers-controls.js';
import { initFileDropHandler } from './components/features/file-drop.js';
import { initWeather } from './components/features/weather.js';

// Import inicjalizacji UI
import { initModals } from './components/ui/modals/modal-base.js';
import { initMarkerModal } from './components/ui/modals/marker-modal.js';
import { initWeatherModal } from './components/ui/modals/weather-modal.js';
import { initTrailsModal } from './components/ui/modals/trails-modal.js';
import { initAboutModal } from './components/ui/modals/about-modal.js';
import { initControls } from './components/ui/controls.js';

// Import narzędzi pomocniczych
import { initFullscreenButton } from './utils/helpers/fullscreen.js';

// Import eksportu funkcji do window
import { initializeWindowExports } from './core/window-exports.js';

/**
 * Inicjalizacja aplikacji
 */
async function initializeApp() {
    try {
        console.log('Inicjalizacja aplikacji DownView 2.0...');
        
        // Inicjalizacja mapy
        const map = initializeMap();
        window.map = map; // Zapisz mapę w globalnym obiekcie window
        
        // Inicjalizacja komponentów
        initMeasurements(map);
        initMarkerHandlers(map);
        initTrailControls();
        initFileDropHandler(map);
        initWeather(map);
        
        // Inicjalizacja UI
        initModals();
        initMarkerModal(map);
        initWeatherModal();
        initTrailsModal();
        initAboutModal();
        initControls(map);
        
        // Inicjalizacja narzędzi pomocniczych
        initFullscreenButton();
        
        // Eksport funkcji do window
        initializeWindowExports(map);
        
        console.log('Aplikacja DownView 2.0 została zainicjalizowana pomyślnie.');
    } catch (error) {
        console.error('Błąd podczas inicjalizacji aplikacji:', error);
        alert('Błąd podczas inicjalizacji mapy. Odśwież stronę lub skontaktuj się z administratorem.');
    }
}

// Inicjalizacja aplikacji po załadowaniu dokumentu
document.addEventListener('DOMContentLoaded', initializeApp);

// Obsługa błędów globalnych
window.addEventListener('error', (event) => {
    console.error('Globalny błąd:', event.error);
});

// Obsługa odrzuconych obietnic
window.addEventListener('unhandledrejection', (event) => {
    console.error('Nieobsłużone odrzucenie obietnicy:', event.reason);
});