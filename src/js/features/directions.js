// Konfiguracja rotacji mapy
const ROTATION_CONFIG = {
    animationMs: 500   // Czas animacji w milisekundach
};

// Obraca mapę w określonym kierunku (N, NE, E, SE, S, SW, W, NW)
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
        duration: ROTATION_CONFIG.animationMs
    });
}
