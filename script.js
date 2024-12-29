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
  maxZoom: 21,
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
  HISTORICAL: 4,
  PARCELS: 5,
  STREETS: 6,
  TRAILS: 7,
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
    zIndex: LAYER_ZINDEX.STREETS,
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
    return new ol.style.Style({
        image: new ol.style.Icon({
            scale: 0.15,
            src: "./img/cave.png",
        }),
        text: new ol.style.Text({
            font: "40px Roboto",
            text: feature.get("NAZWA"),
            placement: "line",
            scale: 0.5,
            offsetY: 30,
            fill: new ol.style.Fill({
                color: "#000",
            }),
        }),
    });
};

const caveLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        url: "json_data/caves.geojson",
        format: new ol.format.GeoJSON(),
    }),
    style: caveStyle,
    zIndex: LAYER_ZINDEX.MARKERS
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
const markerSource = new ol.source.Vector();
const markerLayer = new ol.layer.Vector({
    source: markerSource,
    style: new ol.style.Style({
        image: new ol.style.Icon({
            anchor: [0.5, 1],
            src: 'img/marker.png'
        })
    }),
    zIndex: LAYER_ZINDEX.MARKERS
});

// Funkcja do przełączania warstwy OSM
function ToogleLayersWMS_Osm() {
    const osmLayer = map.getLayers().item(0);
    osmLayer.setVisible(!osmLayer.getVisible());
}

// Funkcja do przełączania warstwy tras kajakowych
function ToggleLayersWMS_Kayak() {
    const checkbox = document.getElementById('kayak-checkbox');
    kayakLayer.setVisible(checkbox.checked);
}

// Funkcja do przełączania warstwy tras rowerowych
function ToggleLayersWMS_Bike() {
    const checkbox = document.getElementById('bike-checkbox');
    bikeLayer.setVisible(checkbox.checked);
}

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('active');
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

window.DisplayWrapperTrails = function() {
    document.getElementById('wrapper-trails').style.display = 'block';
}

window.HideWrapperTrails = function() {
    document.getElementById('wrapper-trails').style.display = 'none';
}

window.DisplayWrapperCustomize = function() {
    const modal = document.getElementById('wrapper-customize');
    modal.style.display = 'block';
}

window.HideWrapperCustomize = function() {
    const modal = document.getElementById('wrapper-customize');
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

// Dodanie obsługi checkboxa dla szlaków
document.addEventListener('DOMContentLoaded', () => {
    const trailsCheckbox = document.getElementById('toggleTrails');
    if (trailsCheckbox) {
        trailsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                DisplayWrapperTrails();
            }
        });
    }
});

// Funkcja dodawania znaczników
function AddMarker() {
    // Zmień kursor
    const mapElement = document.getElementById('map');
    mapElement.classList.add('cursor-crosshair');
    
    // Dodaj komunikat
    const message = document.createElement('div');
    message.className = 'marker-mode-message';
    message.textContent = 'Kliknij na mapie, aby dodać znacznik';
    document.body.appendChild(message);
    
    // Funkcja aktualizująca pozycję komunikatu
    const updateTooltipPosition = (e) => {
        const offset = 15; // Odstęp od kursora w pikselach
        message.style.left = (e.clientX + offset) + 'px';
        message.style.top = (e.clientY + offset) + 'px';
    };
    
    // Nasłuchuj ruchu myszy
    document.addEventListener('mousemove', updateTooltipPosition);
    
    // Pobierz współrzędne kliknięcia z mapy
    const clickHandler = function(event) {
        // Usuń klasę kursora i komunikat
        mapElement.classList.remove('cursor-crosshair');
        message.remove();
        document.removeEventListener('mousemove', updateTooltipPosition);
        
        const coordinates = event.coordinate;
        const lonLat = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
        
        // Stwórz nowy znacznik
        const marker = new ol.Feature({
            geometry: new ol.geom.Point(coordinates),
            name: 'Znacznik'
        });
        
        // Dodaj znacznik do źródła
        markerSource.addFeature(marker);
        
        // Wyświetl współrzędne w konsoli (opcjonalnie)
        console.log('Dodano znacznik na współrzędnych:', lonLat);
    };
    
    map.once('click', clickHandler);
    
    // Dodaj obsługę klawisza Escape
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            mapElement.classList.remove('cursor-crosshair');
            message.remove();
            document.removeEventListener('mousemove', updateTooltipPosition);
            map.un('click', clickHandler);
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

// Upewnij się, że funkcja jest dostępna globalnie
window.AddMarker = AddMarker;

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

    // Dodanie warstw szlaków do mapy
    for (const color in trailLayers) {
        map.addLayer(trailLayers[color]);
    }

    // ========== ZMIENNE GLOBALNE ==========
    let draw; // current draw interaction
    let sketch; // currently drawn feature
    let measureTooltipElement;
    let measureTooltip;

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
        parcelLayer.setVisible(document.getElementById('dzialki-wms').checked);
    }

    window.ToggleLayersWMS_OrtoHD = function() {
        ortoLayer.setVisible(document.getElementById('ortoHD-wms').checked);
    }

    window.ToogleLayersWMS_DEM = function() {
        demLayer.setVisible(document.getElementById('dem').checked);
    }

    window.ToogleLayersWMS_Wektory = function() {
        const checkbox = document.getElementById('vector-wms');
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
        
        if (isChecked) {
            DisplayWrapperTrails(); // Wyświetl okno modalne z wyborem szlaków
        } else {
            HideWrapperTrails(); // Ukryj okno modalne
            // Wyłącz wszystkie szlaki
            Object.values(trailLayers).forEach(layer => layer.setVisible(false));
        }
        
        // Zaznaczanie wszystkich checkboxów szlaków
        document.getElementById('trail-red').checked = isChecked;
        document.getElementById('trail-blue').checked = isChecked;
        document.getElementById('trail-green').checked = isChecked;
        document.getElementById('trail-yellow').checked = isChecked;
        document.getElementById('trail-black').checked = isChecked;
        
        // Aktualizacja widoczności warstw
        Object.values(trailLayers).forEach(layer => layer.setVisible(isChecked));
    }

    window.toggleTrail = function(color) {
        const checkbox = document.getElementById(`trail-${color}`);
        const layer = trailLayers[color];
        if (layer) {
            layer.setVisible(checkbox.checked);
            console.log(`Przełączono szlak ${color}, widoczność:`, checkbox.checked);
        }
    }

    window.ToogleLayersWMS_Szlaki_Yellow = function() {
      trailLayers.yellow.setVisible(document.getElementById('trail-yellow').checked);
    }

    window.ToogleLayersWMS_Szlaki_Green = function() {
      trailLayers.green.setVisible(document.getElementById('trail-green').checked);
    }

    window.ToogleLayersWMS_Szlaki_Blue = function() {
      trailLayers.blue.setVisible(document.getElementById('trail-blue').checked);
    }

    window.ToogleLayersWMS_Szlaki_Red = function() {
      trailLayers.red.setVisible(document.getElementById('trail-red').checked);
    }

    window.ToogleLayersWMS_Szlaki_Black = function() {
      trailLayers.black.setVisible(document.getElementById('trail-black').checked);
    }

    window.ToogleLayersWMS_Jaskinie = function() {
        const checkbox = document.getElementById('cave-checkbox');
        caveLayer.setVisible(checkbox.checked);
    }

    window.ToggleLayersWMS_Camp = function() {
        console.log('Przełączanie warstwy miejsc biwakowych');
        const checkbox = document.getElementById('camp-checkbox');
        if (checkbox) {
            console.log('Stan checkboxa:', checkbox.checked);
            campLayer.setVisible(checkbox.checked);
        }
    }

    window.ToggleLayersWMS_Kayak = function() {
        const checkbox = document.getElementById('kayak-checkbox');
        kayakLayer.setVisible(checkbox.checked);
    }

    window.ToggleLayersWMS_Bike = function() {
        const checkbox = document.getElementById('bike-checkbox');
        bikeLayer.setVisible(checkbox.checked);
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
  } catch (error) {
    console.error('Błąd podczas inicjalizacji mapy:', error);
  }
});