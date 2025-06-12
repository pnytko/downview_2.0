/**
 * @file layers.js
 * @description Definicje warstw mapy
 */

import { APP_STATE, LAYER_ZINDEX } from '../../core/state/app-state.js';
import { LAYERS_CONFIG } from '../../core/config/map-config.js';

/**
 * Tworzy i zwraca wszystkie warstwy mapy
 * @returns {Array<ol.layer.Layer>} Tablica warstw mapy
 */
export function createLayers() {
    return [
        createOsmLayer(),
        createOrtoLayer(),
        createDemLayer(),
        createParcelLayer(),
        ...Object.values(createTrailLayers()),
        createMarkerLayer(),
        createKayakLayer(),
        createCampLayer(),
        createBikeLayer()
    ];
}

/**
 * Tworzy warstwę OpenStreetMap
 * @returns {ol.layer.Tile} Warstwa OSM
 */
export function createOsmLayer() {
    return new ol.layer.Tile({
        source: new ol.source.OSM(),
        title: "OSM",
        visible: APP_STATE.layers.osm.visible,
        zIndex: LAYER_ZINDEX.OSM,
    });
}

/**
 * Tworzy warstwę ortofotomapy
 * @returns {ol.layer.Tile} Warstwa ortofotomapy
 */
export function createOrtoLayer() {
    const config = LAYERS_CONFIG.wms.orto;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                TILED: true,
                VERSION: config.version,
                REQUEST: "GetMap",
                LAYERS: config.layers
            },
            transition: 0
        }),
        visible: APP_STATE.layers.orto.visible,
        title: "OrthoHD",
        zIndex: LAYER_ZINDEX.ORTO
    });
}

/**
 * Tworzy warstwę modelu terenu
 * @returns {ol.layer.Tile} Warstwa DEM
 */
export function createDemLayer() {
    const config = LAYERS_CONFIG.wms.dem;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                FORMAT: "image/png",
                TILED: true,
                VERSION: config.version,
                REQUEST: "GetMap",
                LAYERS: config.layers,
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
}

/**
 * Tworzy warstwę działek
 * @returns {ol.layer.Tile} Warstwa działek
 */
export function createParcelLayer() {
    const config = LAYERS_CONFIG.wms.parcel;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                FORMAT: "image/png",
                TILED: true,
                VERSION: config.version,
                SERVICE: "WMS",
                REQUEST: "GetMap",
                LAYERS: config.layers,
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
        zIndex: LAYER_ZINDEX.PARCEL,
        opacity: 1,
    });
}

/**
 * Tworzy warstwę szlaku
 * @param {string} layerId - Identyfikator warstwy szlaku
 * @returns {ol.layer.Tile} Warstwa szlaku
 */
export function createTrailLayer(layerId) {
    const config = LAYERS_CONFIG.wms.trails;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                LAYERS: layerId,
                FORMAT: "image/png",
                TRANSPARENT: true,
                VERSION: config.version,
            },
            transition: 0
        }),
        visible: false,
        opacity: 0.8,
        zIndex: LAYER_ZINDEX.TRAILS
    });
}

/**
 * Tworzy warstwy szlaków
 * @returns {Object} Obiekt zawierający warstwy szlaków
 */
export function createTrailLayers() {
    return {
        yellow: createTrailLayer("11"),   // szlak pieszy żółty
        green: createTrailLayer("12"),    // szlak pieszy zielony
        blue: createTrailLayer("13"),     // szlak pieszy niebieski
        red: createTrailLayer("14"),      // szlak pieszy czerwony
        black: createTrailLayer("15"),    // szlak pieszy czarny
    };
}

/**
 * Tworzy styl znacznika z numerem
 * @param {number} number - Numer znacznika
 * @returns {ol.style.Style} Styl znacznika
 */
export function createMarkerStyle(number) {
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: './src/assets/images/marker.png'
        }),
        text: new ol.style.Text({
            font: 'bold 12px Inter',
            text: `PUNKT ${number}`,
            offsetY: 25,
            offsetX: 0,
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
}

/**
 * Tworzy warstwę znaczników
 * @returns {ol.layer.Vector} Warstwa znaczników
 */
export function createMarkerLayer() {
    return new ol.layer.Vector({
        source: new ol.source.Vector(),
        style: createMarkerStyle(1),  // Domyślny styl dla pierwszego znacznika
        visible: APP_STATE.layers.vector.visible,
        title: 'Znaczniki',
        zIndex: LAYER_ZINDEX.MARKERS
    });
}

/**
 * Tworzy warstwę tras kajakowych
 * @returns {ol.layer.Tile} Warstwa tras kajakowych
 */
export function createKayakLayer() {
    const config = LAYERS_CONFIG.wms.trails;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                'LAYERS': '4',
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
                'VERSION': config.version,
                'SRS': 'EPSG:3857'
            },
            transition: 0
        }),
        opacity: 0.8,
        visible: APP_STATE.layers.kayak.visible,
        title: 'Trasy kajakowe',
        zIndex: LAYER_ZINDEX.KAYAK
    });
}

/**
 * Tworzy warstwę miejsc biwakowych
 * @returns {ol.layer.Tile} Warstwa miejsc biwakowych
 */
export function createCampLayer() {
    const config = LAYERS_CONFIG.wms.trails;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                'LAYERS': '0',
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
                'VERSION': config.version,
                'SRS': 'EPSG:3857'
            },
            transition: 0
        }),
        opacity: 0.5,
        visible: APP_STATE.layers.camp.visible,
        title: 'Miejsca biwakowe',
        zIndex: LAYER_ZINDEX.CAMP
    });
}

/**
 * Tworzy warstwę tras rowerowych
 * @returns {ol.layer.Tile} Warstwa tras rowerowych
 */
export function createBikeLayer() {
    const config = LAYERS_CONFIG.wms.trails;
    return new ol.layer.Tile({
        source: new ol.source.TileWMS({
            url: config.url,
            params: {
                'LAYERS': '8',
                'FORMAT': 'image/png',
                'TRANSPARENT': true,
                'VERSION': config.version,
                'SRS': 'EPSG:3857'
            },
            transition: 0
        }),
        opacity: 0.8,
        visible: APP_STATE.layers.bike.visible,
        title: 'Trasy rowerowe',
        zIndex: LAYER_ZINDEX.BIKE
    });
}