/**
 * @file map-config.js
 * @description Konfiguracja mapy i jej parametrów
 */

/**
 * Konfiguracja mapy
 * @type {Object}
 */
export const MAP_CONFIG = {
    // Ograniczenia zoomu
    minZoom: 3,
    maxZoom: 25,
    startZoom: 18,
    
    // Współrzędne startowe
    startCoords: [20.9884, 50.01225],
    
    // Zoom dla lokalizacji użytkownika
    userLocationZoom: 18,
    
    // Konfiguracja animacji
    animation: {
        duration: 1000
    }
};

/**
 * Konfiguracja warstw
 * @type {Object}
 */
export const LAYERS_CONFIG = {
    // Konfiguracja warstw WMS
    wms: {
        orto: {
            url: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution",
            layers: "Raster",
            version: "1.3.0"
        },
        dem: {
            url: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WMS/ShadedRelief",
            layers: "Raster",
            version: "1.1.1"
        },
        parcel: {
            url: "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow/WMS",
            layers: "dzialki,numery_dzialek",
            version: "1.3.0"
        },
        trails: {
            url: "https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer",
            version: "1.1.1"
        }
    },
    
    // Konfiguracja stylów
    styles: {
        marker: {
            radius: 8,
            fill: '#3388ff',
            stroke: {
                color: '#fff',
                width: 2
            }
        },
        measurement: {
            line: {
                color: '#ff0000',
                width: 2,
                lineDash: [10, 10]
            },
            fill: {
                color: 'rgba(255, 0, 0, 0.2)'
            }
        }
    }
};

/**
 * Konfiguracja API pogodowego
 * @type {Object}
 */
export const WEATHER_CONFIG = {
    apiUrl: 'https://api.open-meteo.com/v1/forecast',
    params: {
        hourly: 'temperature_2m,precipitation,cloudcover,windspeed_10m',
        timezone: 'auto'
    },
    timeout: 5000,
    retries: 3
};

/**
 * Konfiguracja obsługi plików
 * @type {Object}
 */
export const FILE_CONFIG = {
    supportedFormats: ['gpx', 'kml', 'kmz'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    vectorLayerName: 'measure',
    maxZoom: 18,
    padding: [50, 50, 50, 50]
};