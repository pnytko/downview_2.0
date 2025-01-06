// Konfiguracja kontrolek
const ZOOM_CONFIG = {
    animationMs: 300   // Czas animacji przybliżania/oddalania w milisekundach
};

/**
 * Przybliża widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomIn(map) {
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({
        zoom: zoom + 1,
        duration: ZOOM_CONFIG.animationMs
    });
}

/**
 * Oddala widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomOut(map) {
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({
        zoom: zoom - 1,
        duration: ZOOM_CONFIG.animationMs
    });
}

// Przełącza widoczność menu mobilnego
export function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

// Zamyka menu mobilne
export function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

// Inicjalizuje kontrolki mapy i podpina je do window
// @param {ol.Map} map - Instancja mapy OpenLayers
export function initControls(map) {
    // Obsługa przycisków zoom
    const zoomInButton = document.getElementById('zoom-in');
    const zoomOutButton = document.getElementById('zoom-out');

    if (zoomInButton) {
        zoomInButton.addEventListener('click', () => zoomIn(map));
    }
    if (zoomOutButton) {
        zoomOutButton.addEventListener('click', () => zoomOut(map));
    }

    // Obsługa menu mobilnego
    const menuButton = document.getElementById('menuToggle');
    if (menuButton) {
        menuButton.addEventListener('click', toggleMenu);
    }
}
