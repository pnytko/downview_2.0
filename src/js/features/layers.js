import { APP_STATE, LAYER_ZINDEX } from '../core/app-state.js';

// ========== PODSTAWOWE WARSTWY ==========

// WARSTWA OSM
export const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    title: "OSM",
    visible: APP_STATE.layers.osm.visible,
    zIndex: LAYER_ZINDEX.OSM,
});

// WARSTWA ORTO
export const ortoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution",
        params: {
            TILED: true,
            VERSION: "1.3.0",
            REQUEST: "GetMap",
            LAYERS: "Raster"
        },
        transition: 0,
        projection: "EPSG:4326"
    }),
    visible: APP_STATE.layers.orto.visible,
    title: "OrthoHD",
    zIndex: LAYER_ZINDEX.ORTO
});

// WARSTWA DEM
export const demLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WMS/ShadedRelief",
        params: {
            FORMAT: "image/png",
            TILED: true,
            VERSION: "1.1.1",
            REQUEST: "GetMap",
            LAYERS: "Raster",
            BUFFER: 0,
            WIDTH: 256,
            HEIGHT: 256
        },
        tileGrid: new ol.tilegrid.TileGrid({
            extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10],
            resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395],
            tileSize: [256, 256]
        }),
        cacheSize: 256,
        transition: 0
    }),
    visible: APP_STATE.layers.dem.visible,
    title: "DEM",
    zIndex: LAYER_ZINDEX.DEM,
});

// WARSTWA DZIAŁEK
export const parcelLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow/WMS",
        params: {
            FORMAT: "image/png",
            TILED: true,
            VERSION: "1.3.0",
            SERVICE: "WMS",
            REQUEST: "GetMap",
            LAYERS: "dzialki,numery_dzialek",
            TRANSPARENT: true,
            BUFFER: 0,
            WIDTH: 256,
            HEIGHT: 256
        },
        tileGrid: new ol.tilegrid.TileGrid({
            extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10],
            resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395],
            tileSize: [256, 256]
        }),
        cacheSize: 256,
        transition: 0
    }),
    visible: APP_STATE.layers.parcel.visible,
    title: "Działki",
    zIndex: LAYER_ZINDEX.PARCELS,
});

// ========== WARSTWY SZLAKÓW ==========

// Funkcja do tworzenia warstwy szlaków
export const createTrailLayer = (layerId) => {
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: "https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer",
            params: {
                FORMAT: "image/png",
                TRANSPARENT: true,
                VERSION: "1.1.1",
                LAYERS: layerId,
            },
            transition: 0
        }),
        visible: false,
        opacity: 0.8,
        zIndex: LAYER_ZINDEX.TRAILS,
    });
};

// Warstwy WMS dla szlaków
export const trailLayers = {
    yellow: createTrailLayer("11"),   // szlak pieszy żółty
    green: createTrailLayer("12"),    // szlak pieszy zielony
    blue: createTrailLayer("13"),     // szlak pieszy niebieski
    red: createTrailLayer("14"),      // szlak pieszy czerwony
    black: createTrailLayer("15"),    // szlak pieszy czarny
};

// ========== WARSTWA MARKERÓW ==========

// Funkcja do tworzenia stylu znacznika z numerem
export const createMarkerStyle = (number) => {
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: './src/assets/images/marker.png'
        }),
        text: new ol.style.Text({
            font: 'bold 12px Inter',
            text: `PUNKT ${number}`,
            offsetY: 25,  // Przesunięcie w dół
            offsetX: 0,   // Wycentrowanie w osi X
            textAlign: 'center',
            fill: new ol.style.Fill({
                color: '#000000'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 3
            })
        })
    });
};

// Warstwa znaczników
export const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: createMarkerStyle(1),  // Domyślny styl dla pierwszego znacznika
    visible: APP_STATE.layers.vector.visible,
    title: 'Znaczniki',
    zIndex: LAYER_ZINDEX.MARKERS
});

// ========== WARSTWY DODATKOWE ==========

// Warstwa tras kajakowych
export const kayakLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer',
        params: {
            'LAYERS': '4',  // Trasy kajakowe
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.1.1',
            'SRS': 'EPSG:3857'
        },
        transition: 0
    }),
    opacity: 0.8,
    visible: APP_STATE.layers.kayak.visible,
    title: 'Trasy kajakowe',
    zIndex: LAYER_ZINDEX.KAYAK
});

// Warstwa miejsc biwakowych
export const campLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer',
        params: {
            'LAYERS': '0',  // Miejsca biwakowe
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.1.1',
            'SRS': 'EPSG:3857'
        },
        transition: 0
    }),
    opacity: 0.5,
    visible: APP_STATE.layers.camp.visible,
    title: 'Miejsca biwakowe',
    zIndex: LAYER_ZINDEX.CAMP
});

// Warstwa tras rowerowych
export const bikeLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer',
        params: {
            'LAYERS': '8',  // Trasy rowerowe
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.1.1',
            'SRS': 'EPSG:3857'
        },
        transition: 0
    }),
    opacity: 0.8,
    visible: APP_STATE.layers.bike.visible,
    title: 'Trasy rowerowe',
    zIndex: LAYER_ZINDEX.BIKE
});
