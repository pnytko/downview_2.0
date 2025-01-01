// Globalna funkcja rotacji
function rotateMap(direction) {
    if (!map) {
        console.error('Map not initialized');
        return;
    }

    console.log('Rotating to direction:', direction); // Debug log

    let rotation = 0;
    switch (direction) {
        case 'N':
            rotation = 0;
            break;
        case 'NE':
            rotation = Math.PI / 4;
            break;
        case 'E':
            rotation = Math.PI / 2;
            break;
        case 'SE':
            rotation = 3 * Math.PI / 4;
            break;
        case 'S':
            rotation = Math.PI;
            break;
        case 'SW':
            rotation = 5 * Math.PI / 4;
            break;
        case 'W':
            rotation = 3 * Math.PI / 2;
            break;
        case 'NW':
            rotation = 7 * Math.PI / 4;
            break;
        default:
            console.error('Invalid direction:', direction);
            return;
    }

    console.log('Applying rotation:', rotation); // Debug log
    
    const view = map.getView();
    view.animate({
        rotation: rotation,
        duration: 500
    });
}

// Upewniamy się, że funkcja jest globalna
window.rotateMap = rotateMap;

// Constants
const CONFIG = {
  minZoom: 3,
  maxZoom: 25,
  startZoom: 18,
  startCoords: [20.9884, 50.01225],
  directions: {
    N: 0,         // 0 stopni
    NE: 0.785,    // 45 stopni
    E: 1.57,      // 90 stopni
    SE: 2.355,    // 135 stopni
    S: 3.14,      // 180 stopni
    SW: 3.925,    // 225 stopni
    W: 4.71,      // 270 stopni
    NW: 5.495     // 315 stopni
  }
};

// Layer Z-Index Configuration
const LAYER_ZINDEX = {
  OSM: 1,
  ORTO: 2,
  DEM: 3,
  PARCELS: 5,
  TRAILS: 6,
  VECTOR: 8,
  MARKERS: 9,
  MEASURE: 10
};

// Base Layers
const osmLayer = new ol.layer.Tile({
  source: new ol.source.OSM(),
  title: "OSM",
  visible: true,
  zIndex: LAYER_ZINDEX.OSM,
});

// Funkcja do tworzenia warstwy szlaków
const createTrailLayer = (layerId) => {
  return new ol.layer.Tile({
    source: new ol.source.TileWMS({
      url: "https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer",
      params: {
        FORMAT: "image/png",
        TRANSPARENT: true,
        VERSION: "1.1.1",
        LAYERS: layerId,
      },
      transition: 0
    }),
    visible: false,
    opacity: 0.8,
    zIndex: LAYER_ZINDEX.TRAILS,
  });
};

// Warstwy WMS dla szlaków
const trailLayers = {
    yellow: createTrailLayer("11"),   // szlak pieszy żółty
    green: createTrailLayer("12"),    // szlak pieszy zielony
    blue: createTrailLayer("13"),     // szlak pieszy niebieski
    red: createTrailLayer("14"),      // szlak pieszy czerwony
    black: createTrailLayer("15"),    // szlak pieszy czarny
};

// Warstwy WMS dla działek
const parcelLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow/WMS",
        params: {
            FORMAT: "image/png",
            TILED: true,
            VERSION: "1.3.0",
            SERVICE: "WMS",
            REQUEST: "GetMap",
            LAYERS: "dzialki,numery_dzialek",
            TRANSPARENT: true,
            BUFFER: 0,
            WIDTH: 256,
            HEIGHT: 256
        },
        tileGrid: new ol.tilegrid.TileGrid({
            extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10],
            resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395],
            tileSize: [256, 256]
        }),
        cacheSize: 256,
        transition: 0
    }),
    visible: false,
    title: "Działki",
    zIndex: LAYER_ZINDEX.PARCELS,
});

// Warstwa ortofotomapy
const ortoLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/ORTO/WMS/HighResolution",
        params: {
            TILED: true,
            VERSION: "1.3.0",
            REQUEST: "GetMap",
            LAYERS: "Raster",
            FORMAT: "image/jpeg",
            BUFFER: 0,
            WIDTH: 256,
            HEIGHT: 256
        },
        tileGrid: new ol.tilegrid.TileGrid({
            extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10],
            resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395],
            tileSize: [256, 256]
        }),
        cacheSize: 256,
        transition: 0
    }),
    visible: false,
    title: "Ortofotomapa",
    zIndex: LAYER_ZINDEX.ORTO,
});

const demLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: "https://mapy.geoportal.gov.pl/wss/service/PZGIK/NMT/GRID1/WMS/ShadedRelief",
    params: {
      FORMAT: "image/png",
      TILED: true,
      VERSION: "1.1.1",
      REQUEST: "GetMap",
      LAYERS: "Raster",
      BUFFER: 0,
      WIDTH: 256,
      HEIGHT: 256
    },
    tileGrid: new ol.tilegrid.TileGrid({
      extent: [-20026376.39, -20048966.10, 20026376.39, 20048966.10],
      resolutions: [156543.03392804097, 78271.51696402048, 39135.75848201024, 19567.87924100512, 9783.93962050256, 4891.96981025128, 2445.98490512564, 1222.99245256282, 611.49622628141, 305.748113140705, 152.8740565703525, 76.43702828517625, 38.21851414258813, 19.109257071294063, 9.554628535647032, 4.777314267823516, 2.388657133911758, 1.194328566955879, 0.5971642834779395],
      tileSize: [256, 256]
    }),
    cacheSize: 256,
    transition: 0
  }),
  visible: false,
  title: "DEM",
  zIndex: LAYER_ZINDEX.DEM,
});

const parcelLayer2 = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: "https://integracja.gugik.gov.pl/cgi-bin/KrajowaIntegracjaEwidencjiGruntow",
    params: {
      FORMAT: "image/png",
      TILED: true,
      VERSION: "1.3.0",
      REQUEST: "GetMap",
      LAYERS: "dzialki,numery_dzialek",
    },
    transition: 0,
    projection: "EPSG:2180",
  }),
  visible: false,
  title: "Parcels",
  zIndex: LAYER_ZINDEX.PARCELS,
});

const streetLayer = new ol.layer.Tile({
  source: new ol.source.TileWMS({
    url: "https://wms.epodgik.pl/cgi-bin/KrajowaIntegracjaPunktowAdresowych",
    params: {
      FORMAT: "image/png",
      TILED: true,
      VERSION: "1.3.0",
      LAYERS: "emuia-ulice",
    },
    transition: 0,
    projection: "EPSG:4326",
  }),
  visible: false,
  title: "Streets",
  zIndex: LAYER_ZINDEX.STREETS,
});

// Warstwa tras kajakowych
const kayakLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer',
        params: {
            'LAYERS': '4',  // Trasy kajakowe
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.1.1',
            'SRS': 'EPSG:3857'
        },
        transition: 0
    }),
    opacity: 0.8,
    visible: false,
    title: 'Trasy kajakowe',
    zIndex: LAYER_ZINDEX.VECTOR
});

// Warstwa jaskiń
const caveStyle = (feature) => {
    // Sprawdź czy to klaster
    const features = feature.get('features');
    const size = features ? features.length : 1;
    
    if (size > 1) {
        // Styl dla klastra
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 15,
                fill: new ol.style.Fill({
                    color: '#3399CC'
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 2
                })
            }),
            text: new ol.style.Text({
                text: size.toString(),
                fill: new ol.style.Fill({
                    color: '#fff'
                }),
                font: '12px sans-serif'
            })
        });
    } else {
        // Styl dla pojedynczej jaskini
        const actualFeature = features ? features[0] : feature;
        return new ol.style.Style({
            image: new ol.style.Icon({
                scale: 0.15,
                src: "./img/cave.png",
            }),
            text: new ol.style.Text({
                font: "14px Inter",
                text: actualFeature.get("NAZWA"),
                offsetY: 20,
                fill: new ol.style.Fill({
                    color: "#000",
                }),
                stroke: new ol.style.Stroke({
                    color: '#fff',
                    width: 3
                })
            }),
        });
    }
};

const caveSource = new ol.source.Vector({
    url: "json_data/caves.geojson",
    format: new ol.format.GeoJSON(),
});

const clusterSource = new ol.source.Cluster({
    distance: 15,  // Zmniejszona odległość klastrowania
    source: caveSource,
    minDistance: 10  // Minimalna odległość między klastrami
});

const caveLayer = new ol.layer.Vector({
    source: clusterSource,
    style: caveStyle,
    zIndex: LAYER_ZINDEX.MARKERS,
    visible: false
});

caveLayer.setZIndex(10);

// Warstwa BDL (Bank Danych o Lasach)
const bdlLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL/MapServer/WMSServer',
        params: {
            'LAYERS': '0',  // Numer warstwy - możesz zmienić w zależności od potrzeb
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.3.0'
        },
        transition: 0
    }),
    visible: false,
    title: 'Lasy BDL',
    zIndex: LAYER_ZINDEX.VECTOR
});

// Warstwa miejsc biwakowych
const campLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer',
        params: {
            'LAYERS': '0',  // Miejsca biwakowe
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.1.1',
            'SRS': 'EPSG:3857'
        },
        transition: 0
    }),
    opacity: 0.5,
    visible: false,
    title: 'Miejsca biwakowe',
    zIndex: LAYER_ZINDEX.VECTOR
});

// Warstwa tras rowerowych
const bikeLayer = new ol.layer.Tile({
    source: new ol.source.TileWMS({
        url: 'https://mapserver.bdl.lasy.gov.pl/ArcGIS/services/WMS_BDL_Mapa_turystyczna/MapServer/WMSServer',
        params: {
            'LAYERS': '8',  // Trasy rowerowe
            'FORMAT': 'image/png',
            'TRANSPARENT': true,
            'VERSION': '1.1.1',
            'SRS': 'EPSG:3857'
        },
        transition: 0
    }),
    opacity: 0.8,
    visible: false,
    title: 'Trasy rowerowe',
    zIndex: LAYER_ZINDEX.VECTOR
});

// Warstwa dla pomiarów
const measureSource = new ol.source.Vector();
const measureVector = new ol.layer.Vector({
    source: measureSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 0, 0, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ff0000',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ff0000'
            })
        })
    }),
    zIndex: LAYER_ZINDEX.MEASURE
});

// Warstwa dla znaczników
let markerCounter = 0;
const markerSource = new ol.source.Vector();
const markerStyle = new ol.style.Style({
    image: new ol.style.Icon({
        anchor: [0.5, 1],
        src: 'img/marker.png'
    }),
    text: new ol.style.Text({
        font: 'bold 12px Inter',
        text: '',  // Tekst będzie ustawiony dla każdego znacznika osobno
        offsetY: 25,  // Przesunięcie w dół
        offsetX: 0,   // Wycentrowanie w osi X
        textAlign: 'center',
        fill: new ol.style.Fill({
            color: '#000000'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffffff',
            width: 3
        })
    })
});
const markerLayer = new ol.layer.Vector({
    source: markerSource,
    style: markerStyle,
    zIndex: LAYER_ZINDEX.MARKERS
});

// Funkcja do tworzenia stylu znacznika z numerem
function createMarkerStyle(number) {
    return new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'img/marker.png'
        }),
        text: new ol.style.Text({
            font: 'bold 12px Inter',
            text: `PUNKT ${number}`,
            offsetY: 25,  // Przesunięcie w dół
            offsetX: 0,   // Wycentrowanie w osi X
            textAlign: 'center',
            fill: new ol.style.Fill({
                color: '#000000'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffffff',
                width: 3
            })
        })
    });
}

// Funkcja do przełączania warstw
function toggleLayer(layer, checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    layer.setVisible(checkbox.checked);
}

// Funkcja do przełączania pojedynczego szlaku
function toggleTrail(color) {
    const checkbox = document.getElementById(`trail-${color}`);
    if (trailLayers[color]) {
        trailLayers[color].setVisible(checkbox.checked);
    }
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });

        // Zamykanie menu po kliknięciu poza nim
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });
    }
});

// ========== OBSŁUGA OKIEN MODALNYCH ==========
window.DisplayWrapperAbout = function() {
    const modal = document.getElementById('wrapper-about');
    modal.style.display = 'block';
}

window.CloseWrapperAbout = function() {
    const modal = document.getElementById('wrapper-about');
    modal.style.display = 'none';
}

// Funkcja do obsługi przeciągania okien modalnych
function makeDraggable(modal) {
    const header = modal.querySelector('.modal-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function dragStart(e) {
        if (e.target.closest('.modal-header') && !e.target.closest('.btn-close')) {
            isDragging = true;
            
            const transform = window.getComputedStyle(modal).transform;
            const matrix = new DOMMatrix(transform);
            xOffset = matrix.m41;
            yOffset = matrix.m42;
            
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
            
            modal.style.cursor = 'grabbing';
            header.style.cursor = 'grabbing';
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, modal);
        }
    }

    function dragEnd(e) {
        if (isDragging) {
            isDragging = false;
            modal.style.cursor = '';
            header.style.cursor = 'move';
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate(${xPos}px, ${yPos}px)`;
    }

    modal.addEventListener('mousedown', dragStart, false);
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', dragEnd, false);
}

// Inicjalizacja przeciągania dla wszystkich okien modalnych
document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => makeDraggable(modal));
});

// Map Initialization
let map;

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Dodanie logo
    const logoOverlay = document.createElement('div');
    logoOverlay.className = 'logo-overlay';
    const logoImg = document.createElement('img');
    logoImg.src = 'img/logo.png';
    logoImg.alt = 'Logo';
    logoOverlay.appendChild(logoImg);
    document.querySelector('.grid-container').appendChild(logoOverlay);

    // Inicjalizacja mapy
    map = new ol.Map({
        target: 'map',
        pixelRatio: 1,
        layers: [
            osmLayer,
            ortoLayer,
            demLayer,
            parcelLayer,
            measureVector,
            markerLayer,
            caveLayer,
            bdlLayer,
            campLayer,
            kayakLayer,
            bikeLayer,
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(CONFIG.startCoords),
            zoom: CONFIG.startZoom,
            minZoom: CONFIG.minZoom,
            maxZoom: CONFIG.maxZoom,
        }),
        controls: [],  // Remove all default controls
        interactions: ol.interaction.defaults({
            doubleClickZoom: false
        }).extend([
            new ol.interaction.DragRotateAndZoom()
        ])
    });

    // Zmiana kursora przy najechaniu na punkt
    map.on('pointermove', function(e) {
        const pixel = map.getEventPixel(e.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);
        map.getTargetElement().style.cursor = hit ? 'pointer' : '';
    });

    // Dodanie warstw szlaków do mapy
    for (const color in trailLayers) {
        map.addLayer(trailLayers[color]);
    }

    // ========== ZMIENNE GLOBALNE ==========
    let draw; // current draw interaction
    let sketch; // currently drawn feature
    let measureTooltipElement;
    let measureTooltip;
    let clickListener = null; // listener for marker placement
    let selectedMarker = null; // selected marker reference

    // ========== FUNKCJE POMIAROWE ==========
    function MeasureLength() {
        if (draw) {
            map.removeInteraction(draw);
        }
        addInteraction('LineString');
    }

    function MeasureArea() {
        if (draw) {
            map.removeInteraction(draw);
        }
        addInteraction('Polygon');
    }

    function ClearMeasure() {
        if (draw) {
            map.removeInteraction(draw);
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
        measureSource.clear();
    }

    function createMeasureTooltip() {
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

    function addInteraction(type) {
        // Zawsze twórz nowy tooltip przed rozpoczęciem rysowania
        createMeasureTooltip();
        
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
            // Przygotuj nowy tooltip dla następnego pomiaru
            measureTooltipElement = null;
            createMeasureTooltip();
            ol.Observable.unByKey(listener);
            map.removeInteraction(draw);
        });
    }

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

    // Dodajemy funkcje do globalnego obiektu window
    window.MeasureLength = MeasureLength;
    window.MeasureArea = MeasureArea;
    window.ClearMeasure = ClearMeasure;

    // ========== PRZEŁĄCZANIE WARSTW ==========
    window.ToggleLayersWMS_Dzialki = function() {
        toggleLayer(parcelLayer, 'dzialki');
    }

    window.ToggleLayersWMS_OrtoHD = function() {
        toggleLayer(ortoLayer, 'ortoHD');
    }

    window.ToogleLayersWMS_DEM = function() {
        toggleLayer(demLayer, 'dem');
    }

    window.ToogleLayersWMS_Wektory = function() {
        const checkbox = document.getElementById('vector');
        const isVisible = checkbox.checked;
        
        // Przełącz widoczność warstw wektorowych
        markerLayer.setVisible(isVisible);
        measureVector.setVisible(isVisible);
        
        // Obsługa tooltipów
        const tooltips = document.getElementsByClassName('ol-tooltip');
        for (let tooltip of tooltips) {
            tooltip.style.display = isVisible ? 'block' : 'none';
        }
    }

    window.ToogleLayersWMS_Szlaki = function() {
        const checkbox = document.getElementById('szlaki');
        const isChecked = checkbox.checked;
        const modal = document.getElementById('wrapper-trails');
        
        if (isChecked) {
            // Wyświetl okno modalne z wyborem szlaków
            modal.style.display = 'block';
            // Domyślnie włącz wszystkie szlaki
            Object.values(trailLayers).forEach(layer => layer.setVisible(true));
            // Zaznacz wszystkie checkboxy
            document.getElementById('trail-red').checked = true;
            document.getElementById('trail-blue').checked = true;
            document.getElementById('trail-green').checked = true;
            document.getElementById('trail-yellow').checked = true;
            document.getElementById('trail-black').checked = true;
        } else {
            // Ukryj okno modalne
            modal.style.display = 'none';
            // Wyłącz wszystkie szlaki
            Object.values(trailLayers).forEach(layer => layer.setVisible(false));
            // Odznacz wszystkie checkboxy
            document.getElementById('trail-red').checked = false;
            document.getElementById('trail-blue').checked = false;
            document.getElementById('trail-green').checked = false;
            document.getElementById('trail-yellow').checked = false;
            document.getElementById('trail-black').checked = false;
        }
    }

    window.CloseWrapperTrails = function() {
        const modal = document.getElementById('wrapper-trails');
        modal.style.display = 'none';
        // Odznacz główny checkbox szlaków
        document.getElementById('szlaki').checked = false;
        // Wyłącz wszystkie szlaki
        Object.values(trailLayers).forEach(layer => layer.setVisible(false));
        // Odznacz wszystkie checkboxy
        document.getElementById('trail-red').checked = false;
        document.getElementById('trail-blue').checked = false;
        document.getElementById('trail-green').checked = false;
        document.getElementById('trail-yellow').checked = false;
        document.getElementById('trail-black').checked = false;
    }

    window.toggleTrail = toggleTrail;

    window.ToogleLayersWMS_Szlaki_Yellow = function() {
      toggleTrail('yellow');
    }

    window.ToogleLayersWMS_Szlaki_Green = function() {
      toggleTrail('green');
    }

    window.ToogleLayersWMS_Szlaki_Blue = function() {
      toggleTrail('blue');
    }

    window.ToogleLayersWMS_Szlaki_Red = function() {
      toggleTrail('red');
    }

    window.ToogleLayersWMS_Szlaki_Black = function() {
      toggleTrail('black');
    }

    window.ToogleLayersWMS_Jaskinie = function() {
        toggleLayer(caveLayer, 'cave');
    }

    window.ToggleLayersWMS_Camp = function() {
        toggleLayer(campLayer, 'camp');
    }

    window.ToggleLayersWMS_Kayak = function() {
        toggleLayer(kayakLayer, 'kayak');
    }

    window.ToggleLayersWMS_Bike = function() {
        toggleLayer(bikeLayer, 'bike');
    }

    // Kontrolki kierunkowe
    const directionControls = document.createElement('div');

    directionControls.className = 'direction-controls';

    directionControls.innerHTML = `
        <button type="button" class="direction-button" onclick="rotateMap('N')">N</button>
        <button type="button" class="direction-button" onclick="rotateMap('NE')">NE</button>
        <button type="button" class="direction-button" onclick="rotateMap('E')">E</button>
        <button type="button" class="direction-button" onclick="rotateMap('SE')">SE</button>
        <button type="button" class="direction-button" onclick="rotateMap('S')">S</button>
        <button type="button" class="direction-button" onclick="rotateMap('SW')">SW</button>
        <button type="button" class="direction-button" onclick="rotateMap('W')">W</button>
        <button type="button" class="direction-button" onclick="rotateMap('NW')">NW</button>
    `;

    const mapContainer = document.querySelector('.map-container');
    mapContainer.appendChild(directionControls);

    // ========== PEŁNY EKRAN ==========
    function FullScreen() {
        const element = document.documentElement;

        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {
            // Wejście w tryb pełnoekranowy
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            // Wyjście z trybu pełnoekranowego
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    // Upewniamy się, że funkcja jest dostępna globalnie
    window.FullScreen = FullScreen;

    console.log('Mapa została zainicjalizowana pomyślnie');

    // Funkcje obsługi znaczników
    async function DisplayWrapperMarker(marker) {
        selectedMarker = marker;
        const coordinates = ol.proj.transform(marker.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326');
        
        // Display initial coordinates
        document.getElementById('marker-coordinates').innerHTML = 
            `<div>Szerokość: ${coordinates[1].toFixed(6)}°</div>
             <div>Długość: ${coordinates[0].toFixed(6)}°</div>
             <div>Wysokość: Ładowanie...</div>`;
        document.getElementById('wrapper-marker').style.display = 'block';

        // Fetch elevation data
        try {
            const response = await fetch('https://api.open-elevation.com/api/v1/lookup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    locations: [
                        {
                            latitude: coordinates[1],
                            longitude: coordinates[0]
                        }
                    ]
                })
            });

            const data = await response.json();
            const elevation = data.results[0].elevation;

            // Update the display with elevation data
            document.getElementById('marker-coordinates').innerHTML = 
                `<div>Szerokość: ${coordinates[1].toFixed(6)}°</div>
                 <div>Długość: ${coordinates[0].toFixed(6)}°</div>
                 <div>Wysokość: ${elevation.toFixed(2)} m n.p.m.</div>`;
        } catch (error) {
            console.error('Błąd podczas pobierania wysokości:', error);
            document.getElementById('marker-coordinates').innerHTML = 
                `<div>Szerokość: ${coordinates[1].toFixed(6)}°</div>
                 <div>Długość: ${coordinates[0].toFixed(6)}°</div>
                 <div>Wysokość: Błąd pobierania danych</div>`;
        }
    }

    function CloseWrapperMarker() {
        document.getElementById('wrapper-marker').style.display = 'none';
        selectedMarker = null;
    }

    function DeleteMarker() {
        if (selectedMarker) {
            markerSource.removeFeature(selectedMarker);
            CloseWrapperMarker();
        }
    }

    // Dodanie funkcji do globalnego obiektu window
    window.CloseWrapperMarker = CloseWrapperMarker;
    window.DeleteMarker = DeleteMarker;

    // Inicjalizacja przeciągania dla okna znacznika
    const markerModal = document.getElementById('wrapper-marker');
    const markerHeader = markerModal.querySelector('.modal-header');
    
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;

    markerHeader.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        const rect = markerModal.getBoundingClientRect();
        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;

        if (e.target === markerHeader) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            const newX = e.clientX - initialX;
            const newY = e.clientY - initialY;

            markerModal.style.left = `${newX}px`;
            markerModal.style.top = `${newY}px`;
            markerModal.style.margin = '0';
        }
    }

    function dragEnd(e) {
        isDragging = false;
    }

    // Obsługa kliknięcia na znacznik
    map.on('click', function(evt) {
        const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
            return feature;
        });

        if (feature && markerSource.getFeatures().includes(feature)) {
            DisplayWrapperMarker(feature);
        }
    });

    // Upewnij się, że funkcja jest dostępna globalnie
    window.AddMarker = function() {
        map.getTargetElement().style.cursor = 'crosshair';
        
        if (clickListener) {
            map.un('click', clickListener);
        }

        clickListener = function(evt) {
            const marker = new ol.Feature({
                geometry: new ol.geom.Point(evt.coordinate)
            });
            
            // Ustaw styl z numerem dla nowego znacznika
            marker.setStyle(createMarkerStyle(markerCounter));
            markerCounter++;

            markerSource.addFeature(marker);
            map.getTargetElement().style.cursor = 'default';
            map.un('click', clickListener);
            clickListener = null;
        };

        map.on('click', clickListener);
    }

    // Set willReadFrequently for the map's canvas
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(() => {
        const mapCanvas = map.getTargetElement().querySelector('canvas');
        if (mapCanvas) {
          const newCanvas = document.createElement('canvas');
          newCanvas.width = mapCanvas.width;
          newCanvas.height = mapCanvas.height;
          const ctx = newCanvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(mapCanvas, 0, 0);
          mapCanvas.parentNode.replaceChild(newCanvas, mapCanvas);
        }
      });
    });

    // Funkcja geolokalizacji
    function GetUserLocation() {
        if (!navigator.geolocation) {
            alert('Geolokalizacja nie jest wspierana przez twoją przeglądarkę');
            return;
        }

        // Pobranie przycisku i zmiana ikony na animację ładowania
        const button = document.querySelector('button[onclick="GetUserLocation()"]');
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        const resetIcon = () => {
            button.innerHTML = '<i class="fas fa-location-arrow"></i>';
        };

        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Konwersja współrzędnych do formatu OpenLayers
                const coords = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]);
                
                // Animowane przejście do lokalizacji użytkownika
                map.getView().animate({
                    center: coords,
                    zoom: 18,
                    duration: 1000
                });

                // Dodanie znacznika lokalizacji użytkownika
                const locationFeature = new ol.Feature({
                    geometry: new ol.geom.Point(ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]))
                });

                // Styl dla znacznika lokalizacji
                const locationStyle = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 8,
                        fill: new ol.style.Fill({
                            color: '#4285F4'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#fff',
                            width: 2
                        })
                    })
                });

                locationFeature.setStyle(locationStyle);

                // Usunięcie poprzedniego znacznika lokalizacji, jeśli istnieje
                const locationSource = map.getLayers().getArray().find(layer => 
                    layer.get('name') === 'userLocation'
                );
                if (locationSource) {
                    map.removeLayer(locationSource);
                }

                // Utworzenie nowej warstwy dla znacznika lokalizacji
                const locationLayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [locationFeature]
                    }),
                    name: 'userLocation',
                    zIndex: LAYER_ZINDEX.MARKERS + 1
                });

                map.addLayer(locationLayer);

                // Przywrócenie ikony lokalizacji na przycisku po krótkim opóźnieniu
                setTimeout(resetIcon, 100);
            },
            function(error) {
                // Obsługa błędów
                let message = 'Wystąpił błąd podczas pobierania lokalizacji: ';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message += 'Brak uprawnień do geolokalizacji.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message += 'Informacja o lokalizacji jest niedostępna.';
                        break;
                    case error.TIMEOUT:
                        message += 'Przekroczono czas oczekiwania na lokalizację.';
                        break;
                    default:
                        message += 'Nieznany błąd.';
                        break;
                }
                alert(message);
                // Przywrócenie ikony lokalizacji na przycisku po krótkim opóźnieniu
                setTimeout(resetIcon, 100);
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }

    // Upewniamy się, że funkcja jest dostępna globalnie
    window.GetUserLocation = GetUserLocation;

  } catch (error) {
    console.error('Błąd podczas inicjalizacji mapy:', error);
  }
});