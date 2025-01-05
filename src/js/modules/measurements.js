// Zmienne globalne dla pomiarów
let measureTooltipElement;
let measureTooltip;
let draw;
let sketch;

// Funkcja pomiaru długości
export function measureLength(map) {
    if (draw) {
        map.removeInteraction(draw);
        draw = null;
    }
    addInteraction('LineString', map);
}

// Funkcja pomiaru powierzchni
export function measureArea(map) {
    if (draw) {
        map.removeInteraction(draw);
        draw = null;
    }
    addInteraction('Polygon', map);
}

// Funkcja czyszcząca pomiary
export function clearMeasure(map) {
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
    if (window.measureSource) {
        window.measureSource.clear();
    }
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

// Dodawanie interakcji pomiarowej
function addInteraction(type, map) {
    createMeasureTooltip(map);
    
    draw = new ol.interaction.Draw({
        source: window.measureSource,
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
        map.removeInteraction(draw);
        draw = null;
    });
}

// Formatowanie długości
function formatLength(line) {
    const length = ol.sphere.getLength(line);
    let output;
    if (length > 100) {
        output = (Math.round(length / 1000 * 100) / 100) + ' km';
    } else {
        output = (Math.round(length * 100) / 100) + ' m';
    }
    return output;
}

// Formatowanie powierzchni
function formatArea(polygon) {
    const area = ol.sphere.getArea(polygon);
    let output;
    if (area >= 1000000) {  // 1 km² = 1,000,000 m²
        output = (Math.round(area / 1000000 * 100) / 100) + ' km²';
    } else if (area >= 10000) {  // 1 ha = 10,000 m²
        output = (Math.round(area / 10000 * 100) / 100) + ' ha';
    } else {
        output = (Math.round(area * 100) / 100) + ' m²';
    }
    return output;
}
