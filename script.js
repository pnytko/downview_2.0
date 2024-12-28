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
  VECTOR: 100
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
      url: "https://mapy.geoportal.gov.pl/wss/service/pub/guest/G2_MOBILE_500/MapServer/WMSServer",
      params: {
        FORMAT: "image/png",
        TILED: true,
        VERSION: "1.1.1",
        LAYERS: layerId,
      },
      transition: 0,
      projection: "EPSG:4326",
    }),
    visible: false,
    zIndex: LAYER_ZINDEX.STREETS,
  });
};

// Warstwy WMS dla szlaków
const trailLayers = {
    yellow: createTrailLayer("10"),
    green: createTrailLayer("11"),
    blue: createTrailLayer("12"),
    red: createTrailLayer("13"),
    black: createTrailLayer("14"),
};

// Warstwy WMS dla działek
const parcelLayer = new ol.layer.Tile({
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
        },
        transition: 0,
        projection: "EPSG:4326",
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
    },
    transition: 0,
    projection: "EPSG:2180",
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
    visible: false,
    style: caveStyle,
    declutter: true,
});

caveLayer.setZIndex(10);

// Funkcja do przełączania warstwy OSM
function ToogleLayersWMS_Osm() {
    const osmLayer = map.getLayers().item(0);
    osmLayer.setVisible(!osmLayer.getVisible());
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

// Map Initialization
let map;

document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Inicjalizacja mapy
    map = new ol.Map({
        target: 'map',
        layers: [
            osmLayer,
            ortoLayer,
            demLayer,
            parcelLayer,
            caveLayer,
        ],
        view: new ol.View({
            center: ol.proj.fromLonLat(CONFIG.startCoords),
            zoom: CONFIG.startZoom,
            minZoom: CONFIG.minZoom,
            maxZoom: CONFIG.maxZoom,
        }),
    });

    // Dodanie warstw szlaków do mapy
    Object.values(trailLayers).forEach(layer => map.addLayer(layer));

    // Funkcja do przełączania widoczności szlaków
    window.toggleTrail = function(color) {
        const checkbox = document.getElementById(`trail-${color}`);
        const layer = trailLayers[color];
        if (layer) {
            layer.setVisible(checkbox.checked);
            console.log(`Przełączono szlak ${color}, widoczność:`, checkbox.checked);
        }

        // Włącz wszystkie szlaki, jeśli jakikolwiek checkbox jest zaznaczony
        const anyChecked = Array.from(document.querySelectorAll('.checkbox-wrapper input[type="checkbox"]')).some(cb => cb.checked);
        Object.values(trailLayers).forEach(layer => layer.setVisible(anyChecked));
    }

    // Mouse Position Control
    const mousePositionControl = new ol.control.MousePosition({
      coordinateFormat: ol.coordinate.createStringXY(4),
      projection: "EPSG:4326",
      className: "custom-mouse-position",
      target: document.getElementById("mouse-position"),
    });
    map.addControl(mousePositionControl);

    // Interaction
    const interaction = new ol.interaction.DragRotateAndZoom(); //ROTACJA SHIFT+LPM
    map.addInteraction(interaction);

    // Markers
    var markers = new ol.layer.Vector({
      source: new ol.source.Vector(),
      zIndex: 15,
      style: new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 1],
          src: "img/marker.png",
        }),
      }),
    });
    map.addLayer(markers);

    var marker1 = new ol.Feature(
      new ol.geom.Point(ol.proj.fromLonLat([20.9884, 50.0125]))
    );
    var marker2 = new ol.Feature(
      new ol.geom.Point(ol.proj.fromLonLat([20.9972, 49.9891]))
    );
    markers.getSource().addFeature(marker1);
    markers.getSource().addFeature(marker2);

    // ========== POMIARY ==========
    let draw;
    let sketch;
    let measureTooltipElement;
    let measureTooltip;
    const measureSource = new ol.source.Vector();
    const measureSource_layer = new ol.layer.Vector({
      source: measureSource,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    });

    function MeasureLength() {
      map.removeInteraction(draw);
      addInteraction('LineString');
    }

    function MeasureArea() {
      map.removeInteraction(draw);
      addInteraction('Polygon');
    }

    function ClearMeasure() {
      measureSource.clear();
      map.removeInteraction(draw);
      if (measureTooltipElement) {
        let elements = document.getElementsByClassName('ol-tooltip');
        while (elements[0]) {
          elements[0].parentNode.removeChild(elements[0]);
        }
      }
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
        stopEvent: false
      });
      map.addOverlay(measureTooltip);
    }

    function addInteraction(type) {
      draw = new ol.interaction.Draw({
        source: measureSource,
        type: type,
        style: new ol.style.Style({
          fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new ol.style.Stroke({
            color: 'rgba(0, 0, 0, 0.5)',
            lineDash: [10, 10],
            width: 2
          }),
          image: new ol.style.Circle({
            radius: 5,
            stroke: new ol.style.Stroke({
              color: 'rgba(0, 0, 0, 0.7)'
            }),
            fill: new ol.style.Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            })
          })
        })
      });

      createMeasureTooltip();

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
        createMeasureTooltip();
        ol.Observable.unByKey(listener);
      });

      map.addInteraction(draw);
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
      if (area > 10000) {
        output = (Math.round(area / 1000000 * 100) / 100) + ' km²';
      } else {
        output = (Math.round(area * 100) / 100) + ' m²';
      }
      return output;
    }

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
        vectorLayer.setVisible(document.getElementById('vector-wms').checked);
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

    window.ToogleLayersWMS_Szlaki_Yellow = function() {
      trailLayers.yellow.setVisible(document.getElementById('tr_y').checked);
    }

    window.ToogleLayersWMS_Szlaki_Green = function() {
      trailLayers.green.setVisible(document.getElementById('tr_g').checked);
    }

    window.ToogleLayersWMS_Szlaki_Blue = function() {
      trailLayers.blue.setVisible(document.getElementById('tr_b').checked);
    }

    window.ToogleLayersWMS_Szlaki_Red = function() {
      trailLayers.red.setVisible(document.getElementById('tr_r').checked);
    }

    window.ToogleLayersWMS_Szlaki_Black = function() {
      trailLayers.black.setVisible(document.getElementById('tr_bl').checked);
    }

    window.ToogleLayersWMS_Jaskinie = function() {
        const checkbox = document.getElementById('jaskinie');
        caveLayer.setVisible(checkbox.checked);
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
      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    }

    console.log('Mapa została zainicjalizowana pomyślnie');
  } catch (error) {
    console.error('Błąd podczas inicjalizacji mapy:', error);
  }
});