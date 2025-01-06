import { CONTROLS_CONFIG } from './config.js';

/**
 * Obraca mapę w określonym kierunku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} direction - Kierunek obrotu ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'left', 'right')
 */
export function rotateMap(map, direction) {
    const view = map.getView();
    let rotation = 0;

    switch (direction) {
        case 'N':
            rotation = 0;
            break;
        case 'NE':
            rotation = -Math.PI / 4;
            break;
        case 'E':
            rotation = -Math.PI / 2;
            break;
        case 'SE':
            rotation = -3 * Math.PI / 4;
            break;
        case 'S':
            rotation = Math.PI;
            break;
        case 'SW':
            rotation = 3 * Math.PI / 4;
            break;
        case 'W':
            rotation = Math.PI / 2;
            break;
        case 'NW':
            rotation = Math.PI / 4;
            break;
        case 'left':
            rotation = view.getRotation() + CONTROLS_CONFIG.rotation.angle;
            break;
        case 'right':
            rotation = view.getRotation() - CONTROLS_CONFIG.rotation.angle;
            break;
        default:
            return;
    }
    
    view.animate({
        rotation: rotation,
        duration: CONTROLS_CONFIG.rotation.animationMs
    });
}

/**
 * Przybliża widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomIn(map) {
    const view = map.getView();
    const currentZoom = view.getZoom();
    view.animate({
        zoom: currentZoom + 1,
        duration: CONTROLS_CONFIG.rotation.animationMs
    });
}

/**
 * Oddala widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomOut(map) {
    const view = map.getView();
    const currentZoom = view.getZoom();
    view.animate({
        zoom: currentZoom - 1,
        duration: CONTROLS_CONFIG.rotation.animationMs
    });
}

/**
 * Resetuje rotację mapy do 0
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function resetRotation(map) {
    const view = map.getView();
    view.animate({
        rotation: 0,
        duration: CONTROLS_CONFIG.rotation.animationMs
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
        rotateMap: (direction) => rotateMap(map, direction),
        resetRotation: () => resetRotation(map),
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
