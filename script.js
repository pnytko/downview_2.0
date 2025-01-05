// Import funkcji pomiarowych
import { measureLength, measureArea, clearMeasure } from './src/measurements.js';

// Globalna funkcja rotacji
function rotateMap(direction) {
    if (!map) {
        return;
    }

    let rotation = 0;
    switch (direction) {
        case 'N':
            rotation = 0;
            break;
        case 'NE':
            rotation = -Math.PI / 4;
            break;
        case 'E':
            rotation = -Math.PI / 2;
            break;
        case 'SE':
            rotation = -3 * Math.PI / 4;
            break;
        case 'S':
            rotation = Math.PI;
            break;
        case 'SW':
            rotation = 3 * Math.PI / 4;
            break;
        case 'W':
            rotation = Math.PI / 2;
            break;
        case 'NW':
            rotation = Math.PI / 4;
            break;
        default:
            return;
    }
    
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
  startCoords: [20.9884, 50.01225]
};

// Layer Z-Index Configuration
const LAYER_ZINDEX = {
  OSM: 1,
  ORTO: 2,
  DEM: 3,
  PARCELS: 4,
  TRAILS: 5,
  VECTOR: 6,
  MARKERS: 7,
  MEASURE: 8,
  WEATHER: 15
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
  zIndex: LAYER_ZINDEX.DEM
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
const createCaveLayer = () => {
    const caveStyle = (feature) => {
        const features = feature.get('features');
        if (!features) {
            return new ol.style.Style({
                image: new ol.style.Icon({ scale: 0.15, src: "./img/cave.png" }),
                text: new ol.style.Text({
                    text: feature.get("NAZWA"),
                    font: "14px Inter",
                    offsetY: 20,
                    fill: new ol.style.Fill({ color: "#000" }),
                    stroke: new ol.style.Stroke({ color: '#fff', width: 3 })
                })
            });
        }
        
        // Przy dużym przybliżeniu pokazujemy pojedyncze jaskinie
        if (map && map.getView().getResolution() < 10) {
            const feature = features[0];
            return new ol.style.Style({
                image: new ol.style.Icon({ scale: 0.15, src: "./img/cave.png" }),
                text: new ol.style.Text({
                    text: feature.get("NAZWA"),
                    font: "14px Inter",
                    offsetY: 20,
                    fill: new ol.style.Fill({ color: "#000" }),
                    stroke: new ol.style.Stroke({ color: '#fff', width: 3 })
                })
            });
        }
        
        // Styl dla klastra przy oddaleniu
        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: 12,
                fill: new ol.style.Fill({ color: '#3399CC' }),
                stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
            }),
            text: new ol.style.Text({
                text: features.length.toString(),
                fill: new ol.style.Fill({ color: '#fff' }),
                font: '12px sans-serif'
            })
        });
    };

    const caveSource = new ol.source.Vector({
        url: "layers_data/caves.geojson",
        format: new ol.format.GeoJSON()
    });

    const clusterSource = new ol.source.Cluster({
        source: caveSource,
        distance: 40,
        geometryFunction: function(feature) {
            if (map && map.getView().getResolution() < 10) {
                return feature.getGeometry();  // Zwracamy geometrię zamiast null
            }
            return feature.getGeometry();
        }
    });

    const layer = new ol.layer.Vector({
        source: clusterSource,
        style: caveStyle,
        zIndex: LAYER_ZINDEX.MARKERS,
        visible: false
    });

    return layer;
};

const caveLayer = createCaveLayer();

// Dodajemy funkcję do window
window.ToggleLayersWMS_Cave = function() {
    toggleLayer(caveLayer, 'cave');
};

// Po inicjalizacji mapy dodajemy listener
document.addEventListener('DOMContentLoaded', () => {
    if (map) {
        map.getView().on('change:resolution', () => {
            caveLayer.getSource().refresh();
        });
    }
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

// Źródło dla pomiarów
window.measureSource = new ol.source.Vector();
const measureVector = new ol.layer.Vector({
    source: window.measureSource,
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

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const map = document.getElementById('map');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            menuToggle.style.display = 'none';
        });

        map.addEventListener('click', function() {
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                menuToggle.style.display = 'flex';
            }
        });
    }
});

// ========== OBSŁUGA OKIEN MODALNYCH ==========
window.DisplayWrapperAbout = function() {
    const modal = document.getElementById('wrapper-about');
    modal.style.display = 'block'
}

window.CloseWrapperAbout = function() {
    const modal = document.getElementById('wrapper-about');
    modal.style.display = 'none'
}

// Funkcja do obsługi przeciągania okien modalnych
function makeDraggable(modal) {
    const header = modal.querySelector('.modal-header, .wrapper-header');
    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function dragStart(e) {
        if ((e.target.closest('.modal-header') || e.target.closest('.wrapper-header')) && 
            !e.target.closest('.btn-close') && !e.target.closest('.close')) {
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

// Zmienne globalne dla pogody
let weatherActive = false;

// Funkcja do pobierania danych pogodowych
async function getWeatherData(coordinates) {
    const [lon, lat] = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,cloudcover,windspeed_10m`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.current;
    } catch (error) {
        console.error('Błąd podczas pobierania danych pogodowych:', error);
        return null;
    }
}

// Funkcja wyświetlająca okno pogodowe
async function DisplayWrapperWeather(coordinates) {
    console.log('Próba wyświetlenia okna pogodowego');
    const weatherData = await getWeatherData(coordinates);
    if (!weatherData) {
        console.error('Nie udało się pobrać danych pogodowych');
        return;
    }

    console.log('Pobrane dane pogodowe:', weatherData);

    // Pokaż okno modalne
    const wrapper = document.getElementById('wrapper-weather');
    if (wrapper) {
        const weatherInfo = wrapper.querySelector('#weather-info');
        if (weatherInfo) {
            weatherInfo.innerHTML = `
                <p><i class="fas fa-thermometer-half"></i> <strong>Temperatura:</strong> ${weatherData.temperature_2m}°C</p>
                <p><i class="fas fa-cloud-rain"></i> <strong>Opady:</strong> ${weatherData.precipitation} mm</p>
                <p><i class="fas fa-cloud"></i> <strong>Zachmurzenie:</strong> ${weatherData.cloudcover}%</p>
                <p><i class="fas fa-wind"></i> <strong>Prędkość wiatru:</strong> ${weatherData.windspeed_10m} km/h</p>
            `;
        }
        wrapper.style.display = 'block';
        console.log('Okno pogodowe zostało wyświetlone');
    }
}

// Funkcja zamykająca okno pogodowe
window.CloseWrapperWeather = function() {
    const wrapper = document.getElementById('wrapper-weather');
    if (wrapper) {
        wrapper.style.display = 'none';
        console.log('Okno pogodowe zostało zamknięte');
    }
};

// Funkcja obsługująca kliknięcie na mapę dla pogody
async function handleWeatherClick(evt) {
    console.log('Kliknięcie na mapę', weatherActive);
    if (!weatherActive) return;
    
    evt.preventDefault();
    
    await DisplayWrapperWeather(evt.coordinate);
    
    // Dezaktywuj narzędzie po użyciu
    weatherActive = false;
    const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
    if (button) {
        button.classList.remove('active');
    }
    map.getViewport().style.cursor = 'default';
}

// Funkcja przełączająca narzędzie pogody
window.ToggleLayersWMS_Weather = function() {
    console.log('Przełączanie narzędzia pogody, obecny stan:', weatherActive);
    
    // Jeśli narzędzie jest już aktywne, wyłącz je
    if (weatherActive) {
        weatherActive = false;
        map.getViewport().style.cursor = 'default';
        const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
        if (button) {
            button.classList.remove('active');
        }
        CloseWrapperWeather();
        console.log('Narzędzie pogody zostało wyłączone');
        return;
    }

    // Aktywuj narzędzie
    weatherActive = true;
    map.getViewport().style.cursor = 'crosshair';
    const button = document.querySelector('button[onclick="ToggleLayersWMS_Weather()"]');
    if (button) {
        button.classList.add('active');
    }
    console.log('Narzędzie pogody zostało aktywowane');
};

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
            parcelLayer,
            demLayer,
            caveLayer,
            campLayer,
            kayakLayer,
            bikeLayer,
            markerLayer,
            measureVector
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

    // Dodaj warstwę pomiarową po inicjalizacji mapy
    // const measureLayer = initMeasureLayer();
    // map.addLayer(measureLayer);

    // Zmiana kursora przy najechaniu na punkt
    map.on('pointermove', function(e) {
        const pixel = map.getEventPixel(e.originalEvent);
        const hit = map.hasFeatureAtPixel(pixel);
        const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
            return feature;
        });
        
        if (hit && feature && markerSource.getFeatures().includes(feature)) {
            map.getViewport().style.cursor = 'pointer';
        } else if (!weatherActive && !markerActive) {
            map.getViewport().style.cursor = '';
        }
    });

    // Dodanie warstw szlaków do mapy
    for (const color in trailLayers) {
        map.addLayer(trailLayers[color]);
    }

    // Dodaj listener kliknięcia do mapy dla pogody
    map.on('click', handleWeatherClick);

    // ========== ZMIENNE GLOBALNE ==========
    let draw; // current draw interaction
    let sketch; // currently drawn feature
    let measureTooltipElement;
    let measureTooltip;
    let clickListener = null; // listener for marker placement
    let selectedMarker = null; // selected marker reference

    // ========== FUNKCJE POMIAROWE ==========
    window.MeasureLength = function() {
        measureLength(map);
    }

    window.MeasureArea = function() {
        measureArea(map);
    }

    window.ClearMeasure = function() {
        clearMeasure(map);
    }

    // ========== PRZEŁĄCZANIE WARSTW ==========
    // Funkcja do przełączania pojedynczej warstwy
    window.toggleLayer = toggleLayer;

    // Mapowanie nazw warstw do obiektów warstw
    window.ToggleLayersWMS_Osm = function() {
        toggleLayer(osmLayer, 'osm');
    };
    window.ToggleLayersWMS_Dzialki = function() {
        toggleLayer(parcelLayer, 'dzialki');
    };
    window.ToggleLayersWMS_OrtoHD = function() {
        toggleLayer(ortoLayer, 'ortoHD');
    };
    window.ToggleLayersWMS_DEM = function() {
        toggleLayer(demLayer, 'dem');
    };
    window.ToggleLayersWMS_Cave = function() {
        toggleLayer(caveLayer, 'cave');
    };
    window.ToggleLayersWMS_Camp = function() {
        toggleLayer(campLayer, 'camp');
    };
    window.ToggleLayersWMS_Kayak = function() {
        toggleLayer(kayakLayer, 'kayak');
    };
    window.ToggleLayersWMS_Bike = function() {
        toggleLayer(bikeLayer, 'bike');
    };

    // Specjalna obsługa dla warstw wektorowych
    window.ToggleLayersWMS_Wektory = function() {
        const checkbox = document.getElementById('vector');
        const isChecked = checkbox.checked;
        
        // Przełącz widoczność warstw wektorowych
        markerLayer.setVisible(isChecked);
        measureVector.setVisible(isChecked);
        
        // Obsługa tooltipów
        const tooltips = document.getElementsByClassName('ol-tooltip');
        for (let tooltip of tooltips) {
            tooltip.style.display = isChecked ? 'block' : 'none';
        }
    }

    // Specjalna obsługa dla szlaków
    window.ToggleLayersWMS_Szlaki = function() {
        const checkbox = document.getElementById('szlaki');
        const isChecked = checkbox.checked;
        const modal = document.getElementById('wrapper-trails');
        const trailColors = ['red', 'blue', 'green', 'yellow', 'black'];
        
        if (isChecked) {
            modal.style.display = 'block';
            trailColors.forEach(color => {
                trailLayers[color]?.setVisible(true);
                document.getElementById(`trail-${color}`).checked = true;
            });
        } else {
            modal.style.display = 'none';
            trailColors.forEach(color => {
                trailLayers[color]?.setVisible(false);
                document.getElementById(`trail-${color}`).checked = false;
            });
        }
    }

    window.CloseWrapperTrails = function() {
        const modal = document.getElementById('wrapper-trails');
        modal.style.display = 'none';
        document.getElementById('szlaki').checked = false;
        const trailColors = ['red', 'blue', 'green', 'yellow', 'black'];
        trailColors.forEach(color => {
            trailLayers[color]?.setVisible(false);
            document.getElementById(`trail-${color}`).checked = false;
        });
    }

    // Uproszczona obsługa pojedynczych szlaków
    window.toggleTrail = toggleTrail;
    ['Yellow', 'Green', 'Blue', 'Red', 'Black'].forEach(color => {
        window[`ToggleLayersWMS_Szlaki_${color}`] = function() {
            toggleTrail(color.toLowerCase());
        };
    });

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
            // Obsługa błędów
            let message = 'Wystąpił błąd podczas pobierania wysokości: ';
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    message += 'Brak uprawnień do geolokalizacji.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    message += 'Informacja o lokalizacji jest niedostępna.';
                    break;
                case error.TIMEOUT:
                    message += 'Upłynął limit czasu określania lokalizacji.';
                    break;
                default:
                    message += 'Nieznany błąd.';
                    break;
            }
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
    let markerActive = false;
    window.AddMarker = function() {
        const mapCanvas = map.getTargetElement().querySelector('canvas');
        
        // Jeśli narzędzie jest już aktywne, wyłącz je
        if (markerActive) {
            markerActive = false;
            if (mapCanvas) {
                mapCanvas.style.cursor = '';
            }
            if (clickListener) {
                map.un('click', clickListener);
                clickListener = null;
            }
            const button = document.querySelector('button[onclick="AddMarker()"]');
            if (button) {
                button.classList.remove('active');
            }
            return;
        }

        // Aktywuj narzędzie
        markerActive = true;
        if (mapCanvas) {
            mapCanvas.style.cursor = 'crosshair';
        }
        const button = document.querySelector('button[onclick="AddMarker()"]');
        if (button) {
            button.classList.add('active');
        }
        
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
            
            // Wyłącz narzędzie po dodaniu znacznika
            markerActive = false;
            if (mapCanvas) {
                mapCanvas.style.cursor = '';
            }
            map.un('click', clickListener);
            clickListener = null;
            const button = document.querySelector('button[onclick="AddMarker()"]');
            if (button) {
                button.classList.remove('active');
            }
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

        navigator.geolocation.getCurrentPosition(
            function(position) {
                // Konwersja współrzędnych do formatu OpenLayers
                const coordinates = ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]);
                
                // Animowane przejście do lokalizacji użytkownika
                const view = map.getView();
                view.animate({
                    center: coordinates,
                    zoom: 18,
                    duration: 1000
                });

                // Tworzenie punktu lokalizacji
                const locationFeature = new ol.Feature({
                    geometry: new ol.geom.Point(coordinates)
                });

                // Styl dla punktu lokalizacji
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

                // Usunięcie poprzedniego punktu lokalizacji, jeśli istnieje
                const locationSource = map.getLayers().getArray().find(layer => 
                    layer.get('name') === 'userLocation'
                );
                if (locationSource) {
                    map.removeLayer(locationSource);
                }

                // Utworzenie nowej warstwy dla punktu lokalizacji
                const locationLayer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [locationFeature]
                    }),
                    name: 'userLocation',
                    zIndex: LAYER_ZINDEX.MARKERS + 1
                });

                map.addLayer(locationLayer);
            },
            function(error) {
                let message = '';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        message = 'Brak uprawnień do geolokalizacji.\n\n' +
                                 'Aby zresetować uprawnienia:\n' +
                                 '1. Kliknij ikonę kłódki obok adresu strony\n' +
                                 '2. W ustawieniach lokalizacji wybierz "Resetuj uprawnienia"\n' +
                                 '3. Odśwież stronę i spróbuj ponownie';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Nie można określić twojej lokalizacji';
                        break;
                    case error.TIMEOUT:
                        message = 'Upłynął limit czasu określania lokalizacji';
                        break;
                    default:
                        message = 'Wystąpił nieznany błąd podczas określania lokalizacji';
                }
                alert(message);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }

    // Upewniamy się, że funkcja jest dostępna globalnie
    window.GetUserLocation = GetUserLocation;

  } catch (error) {
    // Obsługa błędów
    let message = 'Wystąpił błąd podczas inicjalizacji mapy: ';
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
  }
});