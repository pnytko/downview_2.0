/**
 * @file directions.js
 * @description Obsługa kierunków i rotacji mapy
 */

/**
 * Konfiguracja rotacji mapy
 * @type {Object}
 */
const ROTATION_CONFIG = {
    animationMs: 500   // Czas animacji w milisekundach
};

/**
 * Obraca mapę w określonym kierunku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} direction - Kierunek (N, NE, E, SE, S, SW, W, NW)
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
            console.warn(`Nieznany kierunek: ${direction}`);
            return;
    }
    
    view.animate({
        rotation: rotation,
        duration: ROTATION_CONFIG.animationMs
    });
}

/**
 * Obraca mapę o określony kąt
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {number} angle - Kąt w radianach
 */
export function rotateMapByAngle(map, angle) {
    const view = map.getView();
    const currentRotation = view.getRotation();
    
    view.animate({
        rotation: currentRotation + angle,
        duration: ROTATION_CONFIG.animationMs
    });
}

/**
 * Resetuje rotację mapy do północy
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function resetRotation(map) {
    const view = map.getView();
    
    view.animate({
        rotation: 0,
        duration: ROTATION_CONFIG.animationMs
    });
}

/**
 * Inicjalizuje kontrolki kierunków
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initDirectionControls(map) {
    // Obsługa przycisków kierunków
    document.querySelectorAll('.nav-button').forEach(button => {
        const direction = button.textContent;
        button.addEventListener('click', () => rotateMap(map, direction));
    });
    
    // Obsługa klawiatury
    document.addEventListener('keydown', (event) => {
        // Obsługa kierunków tylko gdy nie jest aktywne pole tekstowe
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (event.key) {
            case 'ArrowUp':
                rotateMap(map, 'N');
                break;
            case 'ArrowRight':
                rotateMap(map, 'E');
                break;
            case 'ArrowDown':
                rotateMap(map, 'S');
                break;
            case 'ArrowLeft':
                rotateMap(map, 'W');
                break;
            case 'Home':
                resetRotation(map);
                break;
        }
    });
    
    // Dodaj obsługę gestów dotykowych dla urządzeń mobilnych
    let touchStartX = 0;
    let touchStartY = 0;
    
    map.getTargetElement().addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
            touchStartX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            touchStartY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
        }
    });
    
    map.getTargetElement().addEventListener('touchmove', (event) => {
        if (event.touches.length === 2) {
            const touchX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
            const touchY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
            
            const deltaX = touchX - touchStartX;
            const deltaY = touchY - touchStartY;
            
            // Oblicz kąt obrotu na podstawie przesunięcia
            const angle = Math.atan2(deltaY, deltaX);
            
            // Obróć mapę
            rotateMapByAngle(map, angle / 10);
            
            // Aktualizuj pozycję startową
            touchStartX = touchX;
            touchStartY = touchY;
        }
    });
}