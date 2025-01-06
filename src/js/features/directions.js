import { CONTROLS_CONFIG } from '../core/config.js';

/**
 * Obraca mapę w określonym kierunku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} direction - Kierunek obrotu ('N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW')
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
        default:
            return;
    }
    
    view.animate({
        rotation: rotation,
        duration: CONTROLS_CONFIG.rotation.animationMs
    });
}

/**
 * Resetuje rotację mapy do 0 (północ)
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
 * Inicjalizuje kontrolki kierunków i podpina je do window
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initDirections(map) {
    // Podpięcie funkcji do window dla dostępu z HTML
    Object.assign(window, {
        rotateMap: (direction) => rotateMap(map, direction),
        resetRotation: () => resetRotation(map)
    });
}
