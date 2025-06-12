/**
 * @file controls.js
 * @description Kontrolki interfejsu użytkownika
 */

/**
 * Konfiguracja kontrolek
 * @type {Object}
 */
const CONTROLS_CONFIG = {
    zoom: {
        animationMs: 300   // Czas animacji przybliżania/oddalania w milisekundach
    },
    rotation: {
        animationMs: 500   // Czas animacji obrotu w milisekundach
    }
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
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

/**
 * Zamyka menu mobilne
 */
export function closeMenu() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('active');
    }
}

/**
 * Obraca mapę w określonym kierunku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} direction - Kierunek (N, NE, E, SE, S, SW, W, NW)
 */
export function rotateMapTo(map, direction) {
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
        default:
            return;
    }
    
    view.animate({
        rotation: rotation,
        duration: CONTROLS_CONFIG.rotation.animationMs
    });
}

/**
 * Inicjalizuje kontrolki mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
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
    
    // Obsługa przycisków kierunków
    document.querySelectorAll('.nav-button').forEach(button => {
        button.addEventListener('click', () => {
            const direction = button.textContent;
            rotateMapTo(map, direction);
        });
    });
    
    // Obsługa kliknięcia poza menu na urządzeniach mobilnych
    document.addEventListener('click', (event) => {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menuToggle');
        
        if (sidebar && sidebar.classList.contains('active') && 
            !sidebar.contains(event.target) && 
            menuButton && !menuButton.contains(event.target)) {
            closeMenu();
        }
    });
    
    // Obsługa zmiany rozmiaru okna
    window.addEventListener('resize', () => {
        // Aktualizuj rozmiar mapy
        map.updateSize();
        
        // Zamknij menu mobilne na małych ekranach
        if (window.innerWidth <= 768) {
            closeMenu();
        }
    });
}