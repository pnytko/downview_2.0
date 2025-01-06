import { APP_STATE, ToolActions } from '../core/app-state.js';
import { findVectorLayer } from './file-drop.js';

// Stan pomiarów w domknięciu
let measureTooltipElement;
let measureTooltip;
let draw;
let sketch;

// Inicjalizacja warstwy pomiarowej
export function initMeasurements(map) {
    // Użyj tej samej warstwy wektorowej co dla importowanych plików
    const vectorLayer = findVectorLayer(map);
    if (!vectorLayer) {
        console.error('Nie znaleziono warstwy wektorowej');
        return null;
    }
    return vectorLayer;
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
    ToolActions.activateTool('measurement');
    
    const vectorLayer = findVectorLayer(map);
    if (!vectorLayer) {
        console.error('Nie znaleziono warstwy wektorowej');
        return;
    }
    
    const drawType = type === 'LineString' ? 'LineString' : 'Polygon';
    draw = new ol.interaction.Draw({
        source: vectorLayer.getSource(),
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
    const vectorLayer = findVectorLayer(map);
    if (vectorLayer) {
        vectorLayer.getSource().clear();
    }
    
    // Dezaktywuj narzędzie
    ToolActions.deactivateAllTools();
}

// Ustawia widoczność pomiarów
export function setMeasurementsVisible(visible) {
    const vectorLayer = findVectorLayer(map);
    if (vectorLayer) {
        vectorLayer.setVisible(visible);
    }
    
    // Pokaż/ukryj tooltips
    const tooltips = document.getElementsByClassName('ol-tooltip');
    for (let tooltip of tooltips) {
        tooltip.style.display = visible ? 'block' : 'none';
    }
}
