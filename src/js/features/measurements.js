import { APP_STATE, StateActions } from '../core/app-state.js';
import { markerLayer } from './layers.js';

// Tworzenie tooltipa dla pomiarów
function createMeasureTooltip(map) {
    const state = APP_STATE.tools.measurement;
    const drawing = state.drawing;
    
    if (drawing.tooltipElement) {
        drawing.tooltipElement.parentNode.removeChild(drawing.tooltipElement);
    }
    drawing.tooltipElement = document.createElement('div');
    drawing.tooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    drawing.tooltip = new ol.Overlay({
        element: drawing.tooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        stopEvent: false,
        insertFirst: false
    });
    map.addOverlay(drawing.tooltip);
    state.overlays.push(drawing.tooltip);
}

// Formatowanie długości
function formatLength(line) {
    const length = ol.sphere.getLength(line);
    if (length > 100) {
        return Math.round((length / 1000) * 100) / 100 + ' km';
    }
    return Math.round(length * 100) / 100 + ' m';
}

// Formatowanie powierzchni
function formatArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    if (area >= 1000000) {
        return Math.round((area / 1000000) * 100) / 100 + ' km²';
    } else if (area >= 10000) {
        return Math.round((area / 10000) * 100) / 100 + ' ha';
    }
    return Math.round(area * 100) / 100 + ' m²';
}

// Dodawanie interakcji pomiarowej
function addInteraction(type, map) {
    // Aktywuj narzędzie pomiarów
    StateActions.tools.activate('measurement');
    
    // Upewnij się, że warstwa wektorowa jest widoczna
    markerLayer.setVisible(true);
    StateActions.layers.setVectorVisibility(true);
    
    const drawType = type === 'LineString' ? 'LineString' : 'Polygon';
    const state = APP_STATE.tools.measurement;
    const drawing = state.drawing;
    
    drawing.draw = new ol.interaction.Draw({
        source: markerLayer.getSource(),
        type: drawType,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                lineDash: [10, 10],
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 5,
                stroke: new ol.style.Stroke({
                    color: '#ff0000'
                }),
                fill: new ol.style.Fill({
                    color: '#ff0000'
                })
            })
        })
    });

    map.addInteraction(drawing.draw);
    createMeasureTooltip(map);

    drawing.draw.on('drawstart', function(evt) {
        // Ustaw flagę, że pomiar jest aktywny
        state.active = true;
        
        // Ustaw sketch
        drawing.sketch = evt.feature;
        drawing.sketch.set('type', 'measurement');

        /** @type {ol.Coordinate|undefined} */
        let tooltipCoord = evt.coordinate;

        drawing.listener = drawing.sketch.getGeometry().on('change', function(evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            drawing.tooltipElement.innerHTML = output;
            drawing.tooltip.setPosition(tooltipCoord);
        });
    });

    drawing.draw.on('drawend', function() {
        // Pobierz ostatnie współrzędne i wartość pomiaru
        const geom = drawing.sketch.getGeometry();
        let output, tooltipCoord;
        
        if (geom instanceof ol.geom.Polygon) {
            output = formatArea(geom);
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(geom);
            tooltipCoord = geom.getLastCoordinate();
        }
        
        // Stwórz stały tooltip dla pomiaru
        const tooltipElement = document.createElement('div');
        tooltipElement.className = 'ol-tooltip ol-tooltip-static';
        tooltipElement.innerHTML = output;
        
        const tooltip = new ol.Overlay({
            element: tooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center',
            stopEvent: false,
            insertFirst: false
        });
        
        map.addOverlay(tooltip);
        state.overlays.push(tooltip);
        tooltip.setPosition(tooltipCoord);
        
        // Ustaw styl dla zakończonego pomiaru
        drawing.sketch.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
            })
        }));
        
        // Wyłącz flagę aktywnego pomiaru
        state.active = false;
        
        // Usuń tymczasowy tooltip
        if (drawing.tooltipElement) {
            drawing.tooltipElement.parentNode.removeChild(drawing.tooltipElement);
        }
        drawing.tooltipElement = null;
        drawing.tooltip = null;
        
        // Usuń listener
        ol.Observable.unByKey(drawing.listener);
        
        // Usuń interakcję rysowania
        map.removeInteraction(drawing.draw);
        drawing.draw = null;
    });
}

// Publiczne API
export function measureLength(map) {
    if (!APP_STATE.tools.measurement.active) {
        const state = APP_STATE.tools.measurement;
        const drawing = state.drawing;
        if (drawing.draw) {
            map.removeInteraction(drawing.draw);
            drawing.draw = null;
        }
        addInteraction('LineString', map);
    }
}

export function measureArea(map) {
    if (!APP_STATE.tools.measurement.active) {
        const state = APP_STATE.tools.measurement;
        const drawing = state.drawing;
        if (drawing.draw) {
            map.removeInteraction(drawing.draw);
            drawing.draw = null;
        }
        addInteraction('Polygon', map);
    }
}

// Czyści pomiary
export function clearMeasurements(map) {
    const state = APP_STATE.tools.measurement;
    const drawing = state.drawing;
    
    // Usuń interakcję rysowania
    if (drawing.draw) {
        map.removeInteraction(drawing.draw);
        drawing.draw = null;
    }
    
    // Usuń tooltip
    if (drawing.tooltipElement) {
        const elem = drawing.tooltipElement;
        elem.parentNode.removeChild(elem);
        drawing.tooltipElement = null;
    }
    
    // Usuń overlaye
    state.overlays.forEach(overlay => {
        map.removeOverlay(overlay);
    });
    state.overlays = [];
    
    // Usuń pomiary z warstwy
    const features = markerLayer.getSource().getFeatures();
    
    features.forEach(feature => {
        // Usuń tylko features pomiarów, nie usuwaj markerów
        if (feature.get('type') === 'measurement') {
            markerLayer.getSource().removeFeature(feature);
        }
    });
    
    // Dezaktywuj narzędzie
    StateActions.tools.deactivateAll();
}

// Dezaktywuje narzędzie pomiarów
export function deactivateMeasurementTool(map) {
    const state = APP_STATE.tools.measurement;
    const drawing = state.drawing;
    
    // Usuń interakcję rysowania
    if (drawing.draw) {
        map.removeInteraction(drawing.draw);
        drawing.draw = null;
    }
    
    // Usuń tooltip
    if (drawing.tooltipElement) {
        drawing.tooltipElement.parentNode.removeChild(drawing.tooltipElement);
        drawing.tooltipElement = null;
        drawing.tooltip = null;
    }
    
    // Dezaktywuj narzędzie
    state.active = false;
}

// Ustawia widoczność pomiarów
export function setMeasurementsVisible(visible) {
    if (markerLayer) {
        markerLayer.setVisible(visible);
    }
    
    // Pokaż/ukryj tooltips
    APP_STATE.tools.measurement.overlays.forEach(overlay => {
        const element = overlay.getElement();
        if (element) {
            element.style.display = visible ? '' : 'none';
        }
    });
}

// Inicjalizacja warstwy pomiarowej
export function initMeasurements(map) {
    // Użyj tej samej warstwy co dla markerów
    return markerLayer;
}
