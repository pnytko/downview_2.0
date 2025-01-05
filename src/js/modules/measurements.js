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
        zIndex: 8,
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
    if (length > 100) {
        return (Math.round(length / 1000 * 100) / 100) + ' km';
    }
    return (Math.round(length * 100) / 100) + ' m';
}

// Formatowanie powierzchni
function formatArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    if (area >= 1000000) {
        return (Math.round(area / 1000000 * 100) / 100) + ' km²';
    } else if (area >= 10000) {
        return (Math.round(area / 10000 * 100) / 100) + ' ha';
    }
    return (Math.round(area * 100) / 100) + ' m²';
}

// Dodawanie interakcji pomiarowej
function addInteraction(type, map) {
    createMeasureTooltip(map);
    
    draw = new ol.interaction.Draw({
        source: measureSource,
        type: type,
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

    let listener;
    draw.on('drawstart', (evt) => {
        sketch = evt.feature;
        let tooltipCoord = evt.coordinate;

        listener = sketch.getGeometry().on('change', (evt) => {
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

    draw.on('drawend', () => {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
        measureTooltip.setOffset([0, -7]);
        sketch = null;
        measureTooltipElement = null;
        createMeasureTooltip(map);
        ol.Observable.unByKey(listener);
        map.removeInteraction(draw);
        draw = null;
    });
}

// Publiczne API
export function measureLength(map) {
    if (draw) {
        map.removeInteraction(draw);
        draw = null;
    }
    addInteraction('LineString', map);
}

export function measureArea(map) {
    if (draw) {
        map.removeInteraction(draw);
        draw = null;
    }
    addInteraction('Polygon', map);
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
    
    // Resetuj zmienne tooltipów
    measureTooltipElement = null;
    measureTooltip = null;
    
    // Wyczyść źródło wektora
    if (measureSource) {
        measureSource.clear();
    }
}

export function setMeasurementsVisible(visible) {
    if (measureVector) {
        measureVector.setVisible(visible);
        
        // Obsługa tooltipów
        const tooltips = document.getElementsByClassName('ol-tooltip');
        for (let tooltip of tooltips) {
            tooltip.style.display = visible ? 'block' : 'none';
        }
    }
}
