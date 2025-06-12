/**
 * @file app-state.js
 * @description Centralny stan aplikacji i akcje do jego modyfikacji
 */

// Z-index dla warstw
export const LAYER_ZINDEX = {
    OSM: 0,
    ORTO: 1,
    DEM: 2,
    VECTOR: 3,
    PARCEL: 4,
    TRAILS: 5,
    KAYAK: 6,
    CAMP: 7,
    BIKE: 8,
    MARKERS: 9
};

/**
 * Stan aplikacji
 * @type {Object}
 */
export const APP_STATE = {
    // Stan narzędzi
    tools: {
        marker: {
            active: false,
            currentFeature: null,
            clickListener: null,
            counter: 0
        },
        measurement: {
            active: false,
            drawing: {
                source: null,
                draw: null,
                sketch: null,
                listener: null,
                tooltipElement: null,
                tooltip: null
            },
            overlays: []
        },
        weather: {
            active: false,
            clickListener: null
        }
    },
    
    // Stan warstw
    layers: {
        // Warstwy bazowe
        osm: { visible: true },
        orto: { visible: false },
        dem: { visible: false },
        parcel: { visible: false },
        kayak: { visible: false },
        camp: { visible: false },
        bike: { visible: false },
        vector: { visible: true }, // Warstwa wektorowa (znaczniki)
        
        // Szlaki
        trails: {
            visible: false,
            activeTrails: new Set()
        }
    },
    
    // Stan UI
    ui: {
        modals: {
            about: false,
            marker: false,
            trails: false,
            weather: false
        },
        tooltips: {
            visible: true
        }
    }
};

/**
 * Akcje do modyfikacji stanu aplikacji
 * @type {Object}
 */
export const StateActions = {
    tools: {
        /**
         * Aktywuje wybrane narzędzie
         * @param {string} tool - Nazwa narzędzia do aktywacji
         */
        activate: (tool) => {
            // Dezaktywuj wszystkie narzędzia
            StateActions.tools.deactivateAll();
            // Aktywuj wybrane narzędzie
            APP_STATE.tools[tool].active = true;
        },
        
        /**
         * Dezaktywuje wszystkie narzędzia
         */
        deactivateAll: () => {
            Object.keys(APP_STATE.tools).forEach(tool => {
                APP_STATE.tools[tool].active = false;
            });
        }
    },
    ui: {
        /**
         * Przełącza widoczność okna modalnego
         * @param {HTMLElement} modal - Element okna modalnego
         * @param {boolean} visible - Czy okno ma być widoczne
         */
        toggleModal: (modal, visible) => {
            modal.style.display = visible ? 'block' : 'none';
        }
    },
    layers: {
        /**
         * Ustawia widoczność warstwy
         * @param {string} layer - Nazwa warstwy
         * @param {boolean} visible - Czy warstwa ma być widoczna
         */
        setLayerVisibility: (layer, visible) => {
            APP_STATE.layers[layer].visible = visible;
        },
        
        /**
         * Ustawia widoczność warstwy wektorowej
         * @param {boolean} visible - Czy warstwa ma być widoczna
         */
        setVectorVisibility: (visible) => {
            APP_STATE.layers.vector = { visible };
        },
        
        /**
         * Ustawia widoczność warstwy szlaków
         * @param {boolean} visible - Czy warstwa ma być widoczna
         */
        setTrailsVisibility: (visible) => {
            APP_STATE.layers.trails.visible = visible;
        },
        
        /**
         * Dodaje szlak do aktywnych szlaków
         * @param {string} trailId - Identyfikator szlaku
         */
        addTrail: (trailId) => {
            APP_STATE.layers.trails.activeTrails.add(trailId);
        },
        
        /**
         * Usuwa szlak z aktywnych szlaków
         * @param {string} trailId - Identyfikator szlaku
         */
        removeTrail: (trailId) => {
            APP_STATE.layers.trails.activeTrails.delete(trailId);
            if (APP_STATE.layers.trails.activeTrails.size === 0) {
                StateActions.layers.setTrailsVisibility(false);
            }
        }
    }
};

// Eksportuj też poprzednią nazwę dla kompatybilności wstecznej
export const ToolActions = StateActions.tools;