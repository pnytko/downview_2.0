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
        // Stan warstw bazowych
        osm: { visible: true },
        orto: { visible: false },
        dem: { visible: false },
        parcel: { visible: false },
        
        // Stan warstw dodatkowych
        kayak: { visible: false },
        camp: { visible: false },
        bike: { visible: false },
        
        // Stan warstw wektorowych
        vector: { visible: true },
        
        // Stan szlaków
        activeTrails: new Set(),
        allTrailsVisible: true
    },
    
    // Stan narzędzia znaczników
    marker: {
        active: false,
        counter: 1,
        clickListener: null
    },
    
    // Stan narzędzia pomiarów
    measurement: {
        active: false,
        tooltipElement: null,
        tooltip: null,
        draw: null,
        sketch: null,
        listener: null,
        overlays: []  // Lista overlayów do usunięcia
    },
    
    // Stan narzędzia pogody
    weather: {
        active: false,
        clickListener: null
    }
};

// Akcje dla narzędzi
export const ToolActions = {
    // Dezaktywuje wszystkie narzędzia
    deactivateAllTools() {
        APP_STATE.marker.active = false;
        APP_STATE.measurement.active = false;
        APP_STATE.weather.active = false;
        APP_STATE.activeTool = null;
    },

    // Aktywuje wybrane narzędzie
    activateTool(toolName) {
        // Najpierw dezaktywuj wszystkie narzędzia
        this.deactivateAllTools();
        
        // Aktywuj wybrane narzędzie
        switch (toolName) {
            case 'marker':
                APP_STATE.marker.active = true;
                break;
            case 'measurement':
                APP_STATE.measurement.active = true;
                break;
            case 'weather':
                APP_STATE.weather.active = true;
                break;
        }
        
        APP_STATE.activeTool = toolName;
    }
};
