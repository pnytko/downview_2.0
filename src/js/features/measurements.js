import { APP_STATE, ToolActions } from '../core/app-state.js';
import { markerLayer } from './layers.js';

// Tworzenie tooltipa dla pomiarów
function createMeasureTooltip(map) {
    if (APP_STATE.measurement.tooltipElement) {
        APP_STATE.measurement.tooltipElement.parentNode.removeChild(APP_STATE.measurement.tooltipElement);
    }
    APP_STATE.measurement.tooltipElement = document.createElement('div');
    APP_STATE.measurement.tooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    APP_STATE.measurement.tooltip = new ol.Overlay({
        element: APP_STATE.measurement.tooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center',
        stopEvent: false,
        insertFirst: false
    });
    map.addOverlay(APP_STATE.measurement.tooltip);
    APP_STATE.measurement.overlays.push(APP_STATE.measurement.tooltip);
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
    console.log('Dodawanie interakcji pomiarowej:', type);
    
    // Aktywuj narzędzie pomiarów
    ToolActions.activateTool('measurement');
    
    const drawType = type === 'LineString' ? 'LineString' : 'Polygon';
    APP_STATE.measurement.draw = new ol.interaction.Draw({
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

    map.addInteraction(APP_STATE.measurement.draw);
    createMeasureTooltip(map);

    APP_STATE.measurement.draw.on('drawstart', function(evt) {
        console.log('Rozpoczęto rysowanie pomiaru');
        
        // Ustaw flagę, że pomiar jest aktywny
        APP_STATE.measurement.active = true;
        
        // Ustaw sketch
        APP_STATE.measurement.sketch = evt.feature;
        APP_STATE.measurement.sketch.set('type', 'measurement');

        /** @type {ol.Coordinate|undefined} */
        let tooltipCoord = evt.coordinate;

        APP_STATE.measurement.listener = APP_STATE.measurement.sketch.getGeometry().on('change', function(evt) {
            const geom = evt.target;
            let output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            APP_STATE.measurement.tooltipElement.innerHTML = output;
            APP_STATE.measurement.tooltip.setPosition(tooltipCoord);
        });
    });

    APP_STATE.measurement.draw.on('drawend', function() {
        console.log('Zakończono rysowanie pomiaru');
        
        // Pobierz ostatnie współrzędne i wartość pomiaru
        const geom = APP_STATE.measurement.sketch.getGeometry();
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
        APP_STATE.measurement.overlays.push(tooltip);
        tooltip.setPosition(tooltipCoord);
        
        // Ustaw styl dla zakończonego pomiaru
        APP_STATE.measurement.sketch.setStyle(new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 0, 0, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff0000',
                width: 2
            })
        }));
        
        // Wyłącz flagę aktywnego pomiaru
        APP_STATE.measurement.active = false;
        
        // Usuń tymczasowy tooltip
        if (APP_STATE.measurement.tooltipElement) {
            APP_STATE.measurement.tooltipElement.parentNode.removeChild(APP_STATE.measurement.tooltipElement);
        }
        APP_STATE.measurement.tooltipElement = null;
        APP_STATE.measurement.tooltip = null;
        
        // Usuń listener
        ol.Observable.unByKey(APP_STATE.measurement.listener);
        
        // Usuń interakcję rysowania
        map.removeInteraction(APP_STATE.measurement.draw);
        APP_STATE.measurement.draw = null;
        
        console.log('Pomiar został dodany do warstwy:', markerLayer.getSource().getFeatures().length);
    });
}

// Publiczne API
export function measureLength(map) {
    console.log('Rozpoczynanie pomiaru długości');
    if (!APP_STATE.measurement.active) {
        if (APP_STATE.measurement.draw) {
            map.removeInteraction(APP_STATE.measurement.draw);
            APP_STATE.measurement.draw = null;
        }
        addInteraction('LineString', map);
    }
}

export function measureArea(map) {
    console.log('Rozpoczynanie pomiaru powierzchni');
    if (!APP_STATE.measurement.active) {
        if (APP_STATE.measurement.draw) {
            map.removeInteraction(APP_STATE.measurement.draw);
            APP_STATE.measurement.draw = null;
        }
        addInteraction('Polygon', map);
    }
}

// Czyści pomiary
export function clearMeasurements(map) {
    console.log('Czyszczenie pomiarów');
    
    // Usuń interakcję rysowania
    if (APP_STATE.measurement.draw) {
        map.removeInteraction(APP_STATE.measurement.draw);
        APP_STATE.measurement.draw = null;
    }
    
    // Usuń tooltip
    if (APP_STATE.measurement.tooltipElement) {
        const elem = APP_STATE.measurement.tooltipElement;
        elem.parentNode.removeChild(elem);
        APP_STATE.measurement.tooltipElement = null;
    }
    
    // Usuń overlaye
    APP_STATE.measurement.overlays.forEach(overlay => {
        map.removeOverlay(overlay);
    });
    APP_STATE.measurement.overlays = [];
    
    // Usuń pomiary z warstwy
    const features = markerLayer.getSource().getFeatures();
    console.log('Liczba features przed czyszczeniem:', features.length);
    
    features.forEach(feature => {
        // Usuń tylko features pomiarów, nie usuwaj markerów
        if (feature.get('type') === 'measurement') {
            markerLayer.getSource().removeFeature(feature);
        }
    });
    
    console.log('Liczba features po czyszczeniu:', markerLayer.getSource().getFeatures().length);
    
    // Dezaktywuj narzędzie
    ToolActions.deactivateAllTools();
}

// Ustawia widoczność pomiarów
export function setMeasurementsVisible(visible) {
    console.log('Ustawianie widoczności pomiarów:', visible);
    if (markerLayer) {
        markerLayer.setVisible(visible);
    }
    
    // Pokaż/ukryj tooltips
    APP_STATE.measurement.overlays.forEach(overlay => {
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
