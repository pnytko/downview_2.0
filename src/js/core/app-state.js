// Konfiguracja warstw
export const LAYER_ZINDEX = {
    OSM: 0,
    ORTO: 1,
    DEM: 2,
    PARCELS: 3,
    TRAILS: 4,
    MARKERS: 5,
    MEASUREMENTS: 6,
    KAYAK: 7,
    CAMP: 8,
    BIKE: 9
};

// Stan aplikacji
export const APP_STATE = {
    // Aktywne narzędzie
    activeTool: null,

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
        vector: {
            visible: false
        },

        // Stan szlaków
        allTrailsVisible: false,
        activeTrails: new Set(),
        trails: {
            red: { visible: false },
            blue: { visible: false },
            green: { visible: false },
            yellow: { visible: false },
            black: { visible: false }
        }
    },
    
    // Stan narzędzi
    tools: {
        // Stan narzędzia znaczników
        marker: {
            active: false,
            counter: 1,
            clickListener: null,
            currentFeature: null  // Aktualnie wybrany marker
        },
        
        // Stan narzędzia pomiarów
        measurement: {
            active: false,
            drawing: {
                source: null,
                vector: null,
                draw: null,
                sketch: null,
                listener: null,
                tooltipElement: null,
                tooltip: null
            },
            overlays: []  // Lista overlayów do usunięcia
        },

        // Stan narzędzia pogody
        weather: {
            active: false,
            clickListener: null
        }
    },
    
    // Stan interfejsu
    ui: {
        modals: {
            trails: { visible: false },
            marker: { visible: false },
            weather: { visible: false }
        },
        tooltips: {
            visible: true
        }
    }
};

// Akcje do zarządzania stanem aplikacji
export const StateActions = {
    // Akcje dla narzędzi
    tools: {
        activate: (toolName) => {
            // Dezaktywuj wszystkie narzędzia
            StateActions.tools.deactivateAll();
            
            // Aktywuj wybrane narzędzie
            if (APP_STATE.tools[toolName]) {
                APP_STATE.tools[toolName].active = true;
            }
        },
        
        deactivateAll: () => {
            // Dezaktywuj wszystkie narzędzia
            Object.keys(APP_STATE.tools).forEach(toolName => {
                if (APP_STATE.tools[toolName]) {
                    APP_STATE.tools[toolName].active = false;
                }
            });
        }
    },

    // Akcje dla warstw
    layers: {
        toggleLayer: (layerName, visible) => {
            if (APP_STATE.layers[layerName]) {
                APP_STATE.layers[layerName].visible = visible;
            }
        },

        toggleTrail: (trailColor, visible) => {
            if (APP_STATE.layers.trails[trailColor]) {
                APP_STATE.layers.trails[trailColor].visible = visible;
                if (visible) {
                    APP_STATE.layers.activeTrails.add(trailColor);
                } else {
                    APP_STATE.layers.activeTrails.delete(trailColor);
                }
            }
        },

        setVectorVisibility: (visible) => {
            APP_STATE.layers.vector.visible = visible;
        },

        setAllTrailsVisibility: (visible) => {
            APP_STATE.layers.allTrailsVisible = visible;
        }
    },

    // Akcje dla UI
    ui: {
        toggleModal: (modalName, visible) => {
            if (APP_STATE.ui.modals[modalName]) {
                APP_STATE.ui.modals[modalName].visible = visible;
            }
        }
    }
};

// Eksportuj też poprzednią nazwę dla kompatybilności wstecznej
export const ToolActions = StateActions.tools;
