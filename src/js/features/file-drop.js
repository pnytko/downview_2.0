import { LAYER_ZINDEX } from '../core/app-state.js';

// Konfiguracja
const CONFIG = {
    SUPPORTED_FORMATS: ['gpx', 'kml', 'kmz'],
    VECTOR_LAYER_NAME: 'measure',
    MAX_ZOOM: 18,
    PADDING: [50, 50, 50, 50]
};

// Style dla importowanych tras
const TRACK_STYLE = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#ff0000',
        width: 4
    })
});

/**
 * Inicjalizuje obsługę przeciągania plików na mapę
 */
export function initFileDropHandler(map) {
    const vectorLayer = findVectorLayer(map);
    if (!vectorLayer) {
        console.error('Nie znaleziono warstwy wektorowej');
        return;
    }

    setupDropZone(document.body, files => handleFiles(files, map, vectorLayer));
}

/**
 * Znajduje warstwę wektorową na mapie
 */
function findVectorLayer(map) {
    let vectorLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('name') === CONFIG.VECTOR_LAYER_NAME) {
            vectorLayer = layer;
        }
    });
    return vectorLayer;
}

/**
 * Konfiguruje strefę upuszczania plików
 */
function setupDropZone(dropZone, onDrop) {
    // Zapobiegaj domyślnym zachowaniom
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Obsługa upuszczonych plików
    dropZone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        onDrop(files);
    });
}

/**
 * Przetwarza upuszczone pliki
 */
function handleFiles(files, map, vectorLayer) {
    [...files].forEach(file => {
        const extension = file.name.toLowerCase().split('.').pop();
        
        if (CONFIG.SUPPORTED_FORMATS.includes(extension)) {
            processFile(file, extension, map, vectorLayer);
        } else {
            console.warn(`Nieobsługiwany format pliku: ${extension}`);
        }
    });
}

/**
 * Przetwarza pojedynczy plik
 */
async function processFile(file, extension, map, vectorLayer) {
    try {
        let content;
        
        if (extension === 'kmz') {
            content = await extractKMLFromKMZ(file);
        } else {
            content = await readFileContent(file);
        }

        const features = parseFileContent(content, extension, map);
        addFeaturesToMap(features, vectorLayer, map);
        
    } catch (error) {
        console.error(`Błąd podczas przetwarzania pliku ${file.name}:`, error);
    }
}

/**
 * Czyta zawartość pliku
 */
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * Wyodrębnia KML z pliku KMZ
 */
async function extractKMLFromKMZ(file) {
    const arrayBuffer = await file.arrayBuffer();
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    const kmlFile = Object.values(zip.files).find(file => 
        file.name.toLowerCase().endsWith('.kml')
    );

    if (!kmlFile) {
        throw new Error('Nie znaleziono pliku KML w archiwum KMZ');
    }

    return await kmlFile.async('text');
}

/**
 * Parsuje zawartość pliku na features
 */
function parseFileContent(content, format, map) {
    const parser = format === 'gpx' ? new ol.format.GPX() : new ol.format.KML();
    return parser.readFeatures(content, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection()
    });
}

/**
 * Dodaje features do mapy
 */
function addFeaturesToMap(features, vectorLayer, map) {
    // Zastosuj styl do features
    features.forEach(feature => feature.setStyle(TRACK_STYLE));

    // Dodaj features do warstwy
    vectorLayer.getSource().addFeatures(features);
    
    // Dopasuj widok do zasięgu features
    const extent = vectorLayer.getSource().getExtent();
    map.getView().fit(extent, {
        padding: CONFIG.PADDING,
        maxZoom: CONFIG.MAX_ZOOM
    });
}
