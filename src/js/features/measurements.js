import { APP_STATE, ToolActions, LAYER_ZINDEX } from '../core/app-state.js';

// Stan pomiarów w domknięciu
let measureTooltipElement;
let measureTooltip;
let draw;
let sketch;
let measureSource;
let measureVector;

// Inicjalizacja warstwy pomiarowej
export function initMeasurements(map) {
    measureSource = new ol.source.Vector();
    measureVector = new ol.layer.Vector({
        source: measureSource,
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
        }),
        zIndex: LAYER_ZINDEX.MEASUREMENTS,
        name: 'measure'
    });
    map.addLayer(measureVector);
    return measureVector;
}

// Tworzenie tooltipa dla pomiarów
function createMeasureTooltip(map) {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        stopEvent: false,
        insertFirst: false
    });
    map.addOverlay(measureTooltip);
}

// Formatowanie długości
function formatLength(line) {
    const length = ol.sphere.getLength(line);
    let output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' km';
    } else {
        output = Math.round(length * 100) / 100 + ' m';
    }
    return output;
}

// Formatowanie powierzchni
function formatArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    let output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
    } else {
        output = Math.round(area * 100) / 100 + ' m\xB2';
    }
    return output;
}

// Dodawanie interakcji pomiarowej
function addInteraction(type, map) {
    // Aktywuj narzędzie pomiarów
    ToolActions.activateTool('measurement');
    
    const drawType = type === 'LineString' ? 'LineString' : 'Polygon';
    draw = new ol.interaction.Draw({
        source: measureSource,
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
    map.addInteraction(draw);
    createMeasureTooltip(map);

    let listener;
    draw.on('drawstart', function(evt) {
        sketch = evt.feature;
        let tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', function(evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });

    draw.on('drawend', function() {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip(map);
        ol.Observable.unByKey(listener);
        
        // Dezaktywuj narzędzie po zakończeniu pomiaru
        ToolActions.deactivateAllTools();
        map.removeInteraction(draw);
        draw = null;
    });
}

// Publiczne API
export function measureLength(map) {
    if (!APP_STATE.measurement.active) {
        if (draw) {
            map.removeInteraction(draw);
            draw = null;
        }
        addInteraction('LineString', map);
    }
}

export function measureArea(map) {
    if (!APP_STATE.measurement.active) {
        if (draw) {
            map.removeInteraction(draw);
            draw = null;
        }
        addInteraction('Polygon', map);
    }
}

export function clearMeasurements(map) {
    if (draw) {
        map.removeInteraction(draw);
        draw = null;
    }
    
    // Usuń wszystkie tooltips
    let elements = document.getElementsByClassName('ol-tooltip');
    while (elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
    
    // Wyczyść źródło
    if (measureSource) {
        measureSource.clear();
    }
    
    // Dezaktywuj narzędzie
    ToolActions.deactivateAllTools();
}

// Ustawia widoczność pomiarów
export function setMeasurementsVisible(visible) {
    if (measureVector) {
        measureVector.setVisible(visible);
    }
    
    // Pokaż/ukryj tooltips
    const tooltips = document.getElementsByClassName('ol-tooltip');
    for (let tooltip of tooltips) {
        tooltip.style.display = visible ? 'block' : 'none';
    }
}
