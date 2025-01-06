import { CONTROLS_CONFIG } from '../core/config.js';

/**
 * Przybliża widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomIn(map) {
    const view = map.getView();
    const zoom = view.getZoom();
    view.animate({
        zoom: zoom + 1,
        duration: CONTROLS_CONFIG.zoom.animationMs
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
        duration: CONTROLS_CONFIG.zoom.animationMs
    });
}

/**
 * Przełącza widoczność menu mobilnego
 */
export function toggleMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menuToggle');
    if (sidebar && menuButton) {
        sidebar.classList.toggle('active');
        menuButton.classList.toggle('hidden');
    }
}

/**
 * Zamyka menu mobilne
 */
export function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menuToggle');
    if (sidebar && menuButton) {
        sidebar.classList.remove('active');
        menuButton.classList.remove('hidden');
    }
}

/**
 * Inicjalizuje kontrolki mapy i podpina je do window
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initControls(map) {
    // Podpięcie funkcji do window dla dostępu z HTML
    Object.assign(window, {
        zoomIn: () => zoomIn(map),
        zoomOut: () => zoomOut(map),
        toggleMenu: toggleMenu,
        closeMenu: closeMenu
    });

    // Zamykanie menu po kliknięciu mapy
    const mapElement = map.getTargetElement();
    if (mapElement) {
        mapElement.addEventListener('click', closeMenu);
    }
}
