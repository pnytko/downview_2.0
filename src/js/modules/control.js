// Stałe dla rotacji
const ROTATION_ANGLE = 0.2;

/**
 * Obraca mapę w określonym kierunku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} direction - Kierunek obrotu ('left' lub 'right')
 */
export function rotateMap(map, direction) {
    const view = map.getView();
    const currentRotation = view.getRotation();
    const newRotation = direction === 'left' 
        ? currentRotation + ROTATION_ANGLE 
        : currentRotation - ROTATION_ANGLE;
    
    view.setRotation(newRotation);
}

/**
 * Przybliża widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomIn(map) {
    const view = map.getView();
    const currentZoom = view.getZoom();
    view.setZoom(currentZoom + 1);
}

/**
 * Oddala widok mapy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function zoomOut(map) {
    const view = map.getView();
    const currentZoom = view.getZoom();
    view.setZoom(currentZoom - 1);
}

/**
 * Resetuje rotację mapy do 0
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function resetRotation(map) {
    const view = map.getView();
    view.setRotation(0);
}

/**
 * Inicjalizuje kontrolki mapy i podpina je do window
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initControls(map) {
    // Podpięcie funkcji do window dla dostępu z HTML
    window.rotateLeft = () => rotateMap(map, 'left');
    window.rotateRight = () => rotateMap(map, 'right');
    window.zoomIn = () => zoomIn(map);
    window.zoomOut = () => zoomOut(map);
    window.resetRotation = () => resetRotation(map);
}
