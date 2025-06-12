/**
 * @file measurements.js
 * @description Obsługa pomiarów odległości i powierzchni na mapie
 */

import { APP_STATE, StateActions } from '../../core/state/app-state.js';
import { formatLength, formatArea } from '../../utils/formatters/format-utils.js';

/**
 * Tworzy tooltip dla pomiarów
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @private
 */
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

/**
 * Dodaje interakcję pomiarową
 * @param {string} type - Typ pomiaru ('LineString' dla długości, 'Polygon' dla powierzchni)
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @private
 */
function addInteraction(type, map) {
    // Aktywuj narzędzie pomiarów
    StateActions.tools.activate('measurement');
    
    // Znajdź warstwę wektorową
    let vectorLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('title') === 'Znaczniki') {
            vectorLayer = layer;
        }
    });
    
    if (!vectorLayer) {
        console.error('Nie znaleziono warstwy wektorowej');
        return;
    }
    
    // Upewnij się, że warstwa wektorowa jest widoczna
    vectorLayer.setVisible(true);
    StateActions.layers.setVectorVisibility(true);
    
    const drawType = type === 'LineString' ? 'LineString' : 'Polygon';
    const state = APP_STATE.tools.measurement;
    const drawing = state.drawing;
    
    // Stwórz interakcję rysowania
    drawing.draw = new ol.interaction.Draw({
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

    map.addInteraction(drawing.draw);
    createMeasureTooltip(map);

    // Obsługa rozpoczęcia rysowania
    drawing.draw.on('drawstart', function(evt) {
        // Ustaw flagę, że pomiar jest aktywny
        state.active = true;
        
        // Ustaw sketch
        drawing.sketch = evt.feature;
        drawing.sketch.set('type', 'measurement');

        // Współrzędne tooltipa
        let tooltipCoord = evt.coordinate;

        // Obsługa zmiany geometrii
        drawing.listener = drawing.sketch.getGeometry().on('change', function(evt) {
            const geom = evt.target;
            let output;
            
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(ol.sphere.getArea(geom));
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(ol.sphere.getLength(geom));
                tooltipCoord = geom.getLastCoordinate();
            }
            
            drawing.tooltipElement.innerHTML = output;
            drawing.tooltip.setPosition(tooltipCoord);
        });
    });

    // Obsługa zakończenia rysowania
    drawing.draw.on('drawend', function() {
        // Pobierz ostatnie współrzędne i wartość pomiaru
        const geom = drawing.sketch.getGeometry();
        let output, tooltipCoord;
        
        if (geom instanceof ol.geom.Polygon) {
            output = formatArea(ol.sphere.getArea(geom));
            tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
            output = formatLength(ol.sphere.getLength(geom));
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

/**
 * Rozpoczyna pomiar długości
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
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

/**
 * Rozpoczyna pomiar powierzchni
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
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

/**
 * Czyści pomiary
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
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
    
    // Znajdź warstwę wektorową
    let vectorLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('title') === 'Znaczniki') {
            vectorLayer = layer;
        }
    });
    
    if (vectorLayer) {
        // Usuń pomiary z warstwy
        const features = vectorLayer.getSource().getFeatures();
        
        features.forEach(feature => {
            // Usuń tylko features pomiarów, nie usuwaj markerów
            if (feature.get('type') === 'measurement') {
                vectorLayer.getSource().removeFeature(feature);
            }
        });
    }
    
    // Dezaktywuj narzędzie
    StateActions.tools.deactivateAll();
}

/**
 * Dezaktywuje narzędzie pomiarów
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
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

/**
 * Ustawia widoczność pomiarów
 * @param {boolean} visible - Czy pomiary mają być widoczne
 */
export function setMeasurementsVisible(visible) {
    // Pokaż/ukryj tooltips
    APP_STATE.tools.measurement.overlays.forEach(overlay => {
        const element = overlay.getElement();
        if (element) {
            element.style.display = visible ? '' : 'none';
        }
    });
}

/**
 * Inicjalizacja modułu pomiarów
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initMeasurements(map) {
    // Inicjalizuj przyciski pomiarów
    const lengthButton = document.querySelector('.tool-button[title="Pomiar odległości"]');
    const areaButton = document.querySelector('.tool-button[title="Pomiar powierzchni"]');
    const clearButton = document.querySelector('.tool-button[title="Wyczyść pomiary"]');
    
    if (lengthButton) {
        lengthButton.addEventListener('click', () => measureLength(map));
    }
    
    if (areaButton) {
        areaButton.addEventListener('click', () => measureArea(map));
    }
    
    if (clearButton) {
        clearButton.addEventListener('click', () => clearMeasurements(map));
    }
    
    // Obsługa klawisza Escape do anulowania pomiaru
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && APP_STATE.tools.measurement.active) {
            deactivateMeasurementTool(map);
        }
    });
}