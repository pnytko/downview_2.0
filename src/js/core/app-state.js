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
            counter: 0  // Inicjalizujemy licznik od 0
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
        
        // Warstwy wektorowe
        vector: { visible: false },
        
        // Stan szlaków
        trails: {
            visible: false,
            active: []
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
            if (APP_STATE.tools[tool]) {
                APP_STATE.tools[tool].active = true;
            }
        },
        deactivateAll: () => {
            Object.keys(APP_STATE.tools).forEach(tool => {
                if (APP_STATE.tools[tool]) {
                    APP_STATE.tools[tool].active = false;
                }
            });
        }
    },
    ui: {
        toggleModal: (modal, visible) => {
            APP_STATE.ui.modals[modal] = visible;
        }
    },
    layers: {
        setLayerVisibility: (layer, visible) => {
            if (APP_STATE.layers[layer]) {
                APP_STATE.layers[layer].visible = visible;
            }
        },
        setVectorVisibility: (visible) => {
            APP_STATE.layers.vector.visible = visible;
        },
        setTrailsVisibility: (visible) => {
            APP_STATE.layers.trails.visible = visible;
        },
        addTrail: (trailId) => {
            if (!APP_STATE.layers.trails.active.includes(trailId)) {
                APP_STATE.layers.trails.active.push(trailId);
            }
        },
        removeTrail: (trailId) => {
            const index = APP_STATE.layers.trails.active.indexOf(trailId);
            if (index > -1) {
                APP_STATE.layers.trails.active.splice(index, 1);
            }
        }
    }
};

// Eksportuj też poprzednią nazwę dla kompatybilności wstecznej
export const ToolActions = StateActions.tools;
