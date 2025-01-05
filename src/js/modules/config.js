/**
 * Konfiguracja mapy
 */
export const MAP_CONFIG = {
    // Ograniczenia zoomu
    minZoom: 3,
    maxZoom: 25,
    startZoom: 18,
    
    // Współrzędne startowe
    startCoords: [20.9884, 50.01225]
};

/**
 * Konfiguracja Z-Index dla warstw
 */
export const LAYER_ZINDEX = {
    OSM: 1,        // OpenStreetMap
    ORTO: 2,       // Ortofotomapa
    DEM: 3,        // Model terenu
    PARCELS: 4,    // Działki
    TRAILS: 5,     // Szlaki
    VECTOR: 6,     // Warstwy wektorowe
    MARKERS: 7,    // Markery
    MEASURE: 8,    // Pomiary
    WEATHER: 15    // Warstwa pogodowa
};

/**
 * Konfiguracja stylów
 */
export const STYLES = {
    measure: {
        line: {
            color: '#ff0000',
            width: 2,
            lineDash: [10, 10]
        },
        fill: {
            color: 'rgba(255, 0, 0, 0.2)'
        },
        point: {
            radius: 5,
            color: '#ff0000'
        }
    },
    marker: {
        radius: 8,
        color: '#3399CC',
        stroke: {
            color: '#fff',
            width: 2
        }
    }
};

/**
 * Konfiguracja API pogodowego
 */
export const WEATHER_CONFIG = {
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    params: {
        hourly: ['temperature_2m', 'precipitation', 'cloudcover', 'windspeed_10m'],
        timezone: 'Europe/Warsaw'
    }
};

/**
 * Konfiguracja kontrolek mapy
 */
export const CONTROLS_CONFIG = {
    rotation: {
        angle: 0.2,        // Kąt obrotu w radianach
        animationMs: 500   // Czas animacji w milisekundach
    }
};
