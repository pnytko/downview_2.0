/**
 * @file file-drop.js
 * @description Obsługa przeciągania i upuszczania plików na mapę
 */

import { LAYER_ZINDEX } from '../../core/state/app-state.js';
import { FILE_CONFIG } from '../../core/config/map-config.js';

/**
 * Znajduje lub tworzy warstwę wektorową na mapie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @returns {ol.layer.Vector} Warstwa wektorowa
 */
export function findVectorLayer(map) {
    let vectorLayer;
    
    // Szukaj istniejącej warstwy
    map.getLayers().forEach(layer => {
        if (layer.get('name') === FILE_CONFIG.vectorLayerName) {
            vectorLayer = layer;
        }
    });

    // Jeśli nie znaleziono, stwórz nową warstwę
    if (!vectorLayer) {
        vectorLayer = new ol.layer.Vector({
            source: new ol.source.Vector(),
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
            zIndex: LAYER_ZINDEX.MARKERS,
            name: FILE_CONFIG.vectorLayerName
        });
        
        map.addLayer(vectorLayer);
    }
    
    return vectorLayer;
}

/**
 * Inicjalizuje obsługę przeciągania plików na mapę
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function initFileDropHandler(map) {
    const vectorLayer = findVectorLayer(map);
    
    if (!vectorLayer) {
        console.error('Nie znaleziono warstwy wektorowej');
        return;
    }

    setupDropZone(document.body, files => handleFiles(files, map, vectorLayer));
    
    // Dodaj informację o obsługiwanych formatach
    addDropInstructions(map);
}

/**
 * Dodaje instrukcje dotyczące przeciągania plików
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function addDropInstructions(map) {
    const instructionsElement = document.createElement('div');
    instructionsElement.className = 'drop-instructions';
    instructionsElement.innerHTML = `
        <div class="drop-instructions-content">
            <i class="fas fa-file-import"></i>
            <p>Przeciągnij i upuść pliki GPX, KML lub KMZ</p>
        </div>
    `;
    
    // Dodaj element do mapy
    map.getTargetElement().appendChild(instructionsElement);
    
    // Ukryj instrukcje po kliknięciu
    instructionsElement.addEventListener('click', () => {
        instructionsElement.style.display = 'none';
    });
    
    // Automatycznie ukryj instrukcje po 5 sekundach
    setTimeout(() => {
        instructionsElement.style.opacity = '0';
        setTimeout(() => {
            instructionsElement.style.display = 'none';
        }, 1000);
    }, 5000);
}

/**
 * Konfiguruje strefę upuszczania plików
 * @param {HTMLElement} dropZone - Element strefy upuszczania
 * @param {Function} onDrop - Funkcja wywoływana po upuszczeniu plików
 */
function setupDropZone(dropZone, onDrop) {
    // Obsługa zdarzeń przeciągania
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    // Dodaj klasy CSS podczas przeciągania
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('drag-active');
        });
    });
    
    // Usuń klasy CSS po zakończeniu przeciągania
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('drag-active');
        });
    });

    // Obsługa upuszczenia plików
    dropZone.addEventListener('drop', e => {
        const files = e.dataTransfer.files;
        onDrop(files);
    });
}

/**
 * Przetwarza upuszczone pliki
 * @param {FileList} files - Lista upuszczonych plików
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {ol.layer.Vector} vectorLayer - Warstwa wektorowa
 */
function handleFiles(files, map, vectorLayer) {
    // Sprawdź, czy są jakieś pliki
    if (files.length === 0) {
        return;
    }
    
    // Przetwórz każdy plik
    [...files].forEach(file => {
        // Sprawdź rozmiar pliku
        if (file.size > FILE_CONFIG.maxFileSize) {
            alert(`Plik ${file.name} jest zbyt duży. Maksymalny rozmiar to ${FILE_CONFIG.maxFileSize / (1024 * 1024)} MB.`);
            return;
        }
        
        // Pobierz rozszerzenie pliku
        const extension = file.name.toLowerCase().split('.').pop();
        
        // Sprawdź, czy format jest obsługiwany
        if (FILE_CONFIG.supportedFormats.includes(extension)) {
            processFile(file, extension, map, vectorLayer);
        } else {
            alert(`Nieobsługiwany format pliku: ${extension}. Obsługiwane formaty: ${FILE_CONFIG.supportedFormats.join(', ')}`);
        }
    });
}

/**
 * Przetwarza pojedynczy plik
 * @param {File} file - Plik do przetworzenia
 * @param {string} extension - Rozszerzenie pliku
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {ol.layer.Vector} vectorLayer - Warstwa wektorowa
 */
async function processFile(file, extension, map, vectorLayer) {
    try {
        // Pokaż informację o ładowaniu
        showLoadingIndicator(map, `Ładowanie pliku ${file.name}...`);
        
        let content;
        
        // Obsługa plików KMZ (skompresowane KML)
        if (extension === 'kmz') {
            content = await extractKMLFromKMZ(file);
        } else {
            // Obsługa plików GPX i KML
            content = await readFileContent(file);
        }

        // Parsuj zawartość pliku
        const features = parseFileContent(content, extension, map);
        
        // Dodaj features do mapy
        addFeaturesToMap(features, vectorLayer, map);
        
        // Ukryj informację o ładowaniu
        hideLoadingIndicator(map);
        
        // Pokaż informację o sukcesie
        showSuccessMessage(map, `Plik ${file.name} został pomyślnie załadowany.`);
    } catch (error) {
        console.error('Błąd podczas przetwarzania pliku:', error);
        
        // Ukryj informację o ładowaniu
        hideLoadingIndicator(map);
        
        // Pokaż informację o błędzie
        alert(`Błąd podczas przetwarzania pliku ${file.name}. Sprawdź czy plik jest poprawny.`);
    }
}

/**
 * Pokazuje wskaźnik ładowania
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} message - Komunikat do wyświetlenia
 */
function showLoadingIndicator(map, message) {
    // Usuń istniejący wskaźnik, jeśli istnieje
    hideLoadingIndicator(map);
    
    // Stwórz nowy wskaźnik
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.innerHTML = `
        <div class="loading-spinner"></div>
        <p>${message}</p>
    `;
    
    // Dodaj wskaźnik do mapy
    map.getTargetElement().appendChild(loadingElement);
}

/**
 * Ukrywa wskaźnik ładowania
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function hideLoadingIndicator(map) {
    const loadingElement = map.getTargetElement().querySelector('.loading-indicator');
    
    if (loadingElement) {
        loadingElement.remove();
    }
}

/**
 * Pokazuje komunikat o sukcesie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {string} message - Komunikat do wyświetlenia
 */
function showSuccessMessage(map, message) {
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    // Dodaj komunikat do mapy
    map.getTargetElement().appendChild(successElement);
    
    // Automatycznie ukryj komunikat po 3 sekundach
    setTimeout(() => {
        successElement.style.opacity = '0';
        setTimeout(() => {
            successElement.remove();
        }, 500);
    }, 3000);
}

/**
 * Czyta zawartość pliku
 * @param {File} file - Plik do odczytania
 * @returns {Promise<string>} Zawartość pliku
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
 * @param {File} file - Plik KMZ
 * @returns {Promise<string>} Zawartość pliku KML
 */
async function extractKMLFromKMZ(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);
        
        // Szukaj pliku KML w archiwum
        const kmlFile = Object.values(zip.files).find(file => 
            file.name.toLowerCase().endsWith('.kml')
        );

        if (!kmlFile) {
            throw new Error('Nie znaleziono pliku KML w archiwum KMZ');
        }

        return await kmlFile.async('text');
    } catch (error) {
        console.error('Błąd podczas wyodrębniania KML z KMZ:', error);
        throw error;
    }
}

/**
 * Parsuje zawartość pliku na features
 * @param {string} content - Zawartość pliku
 * @param {string} format - Format pliku (gpx, kml)
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @returns {Array<ol.Feature>} Tablica features
 */
function parseFileContent(content, format, map) {
    // Wybierz odpowiedni parser
    const parser = format === 'gpx' ? new ol.format.GPX() : new ol.format.KML();
    
    // Parsuj zawartość pliku
    return parser.readFeatures(content, {
        dataProjection: 'EPSG:4326',
        featureProjection: map.getView().getProjection()
    });
}

/**
 * Dodaje features do mapy
 * @param {Array<ol.Feature>} features - Tablica features
 * @param {ol.layer.Vector} vectorLayer - Warstwa wektorowa
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function addFeaturesToMap(features, vectorLayer, map) {
    // Ustaw styl dla features
    const trackStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#ff0000',
            width: 4
        })
    });
    
    // Dodaj features do warstwy
    features.forEach(feature => {
        // Ustaw typ feature
        feature.set('type', 'imported');
        
        // Ustaw styl
        feature.setStyle(trackStyle);
        
        // Dodaj do warstwy
        vectorLayer.getSource().addFeature(feature);
    });
    
    // Dopasuj widok do zasięgu features
    if (features.length > 0) {
        const extent = vectorLayer.getSource().getExtent();
        
        map.getView().fit(extent, {
            padding: FILE_CONFIG.padding,
            maxZoom: FILE_CONFIG.maxZoom
        });
    }
}