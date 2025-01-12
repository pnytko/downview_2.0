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
    BIKE: 8
};

// Stan aplikacji
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

// Akcje do modyfikacji stanu aplikacji
export const StateActions = {
    tools: {
        activate: (tool) => {
            // Dezaktywuj wszystkie narzędzia
            StateActions.tools.deactivateAll();
            // Aktywuj wybrane narzędzie
            APP_STATE.tools[tool].active = true;
        },
        deactivateAll: () => {
            Object.keys(APP_STATE.tools).forEach(tool => {
                APP_STATE.tools[tool].active = false;
            });
        }
    },
    ui: {
        toggleModal: (modal, visible) => {
            modal.style.display = visible ? 'block' : 'none';
        }
    },
    layers: {
        setLayerVisibility: (layer, visible) => {
            APP_STATE.layers[layer].visible = visible;
        },
        setVectorVisibility: (visible) => {
            APP_STATE.layers.vector = { visible };
        },
        setTrailsVisibility: (visible) => {
            APP_STATE.layers.trails.visible = visible;
        },
        addTrail: (trailId) => {
            APP_STATE.layers.trails.activeTrails.add(trailId);
        },
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
