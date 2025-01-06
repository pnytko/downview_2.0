// Konfiguracja mapy
export const MAP_CONFIG = {
    // Ograniczenia zoomu
    minZoom: 3,
    maxZoom: 25,
    startZoom: 18,
    
    // Współrzędne startowe
    startCoords: [20.9884, 50.01225]
};

// Konfiguracja Z-Index dla warstw
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

// Stan globalny aplikacji
export const APP_STATE = {
    // Stan licznika markerów
    markerCounter: 1,
    
    // Flagi stanu narzędzi
    marker: {
        active: false,
        // Add other marker-related states here if needed
    },
    weather: {
        active: false,
        // Add other weather-related states here if needed
    },
    measurementActive: false,
    
    // Referencja do listenera kliknięć
    clickListener: null
};

// Konfiguracja stylów
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

// Konfiguracja kontrolek mapy
export const CONTROLS_CONFIG = {
    rotation: {
        angle: 0.2,        // Kąt obrotu w radianach
        animationMs: 500   // Czas animacji w milisekundach
    }
};
