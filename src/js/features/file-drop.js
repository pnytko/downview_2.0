import { LAYER_ZINDEX } from '../core/config.js';

export function initFileDropHandler(map) {
    const dropZone = document.body;

    // Get existing vector layer from map
    let vectorLayer;
    map.getLayers().forEach(layer => {
        if (layer.get('name') === 'measure') {
            vectorLayer = layer;
        }
    });

    if (!vectorLayer) {
        console.error('Vector layer not found');
        return;
    }

    // Create style for imported tracks
    const trackStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: '#ff0000',
            width: 4
        })
    });

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Handle dropped files
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        handleFiles(files);
    }

    function handleFiles(files) {
        [...files].forEach(file => {
            const extension = file.name.toLowerCase().split('.').pop();
            
            if (['gpx', 'kml', 'kmz'].includes(extension)) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const content = e.target.result;
                    
                    switch(extension) {
                        case 'gpx':
                            handleGPX(content);
                            break;
                        case 'kml':
                            handleKML(content);
                            break;
                        case 'kmz':
                            handleKMZFile(file);
                            break;
                    }
                };

                if (extension !== 'kmz') {
                    reader.readAsText(file);
                } else {
                    handleKMZFile(file);
                }
            }
        });
    }

    function handleGPX(content) {
        const gpxFormat = new ol.format.GPX();
        const features = gpxFormat.readFeatures(content, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection()
        });

        // Apply style to features
        features.forEach(feature => {
            feature.setStyle(trackStyle);
        });

        // Add features to existing vector source
        vectorLayer.getSource().addFeatures(features);
        
        // Fit view to the features extent
        const extent = vectorLayer.getSource().getExtent();
        map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 18
        });
    }

    function handleKML(content) {
        const kmlFormat = new ol.format.KML();
        const features = kmlFormat.readFeatures(content, {
            dataProjection: 'EPSG:4326',
            featureProjection: map.getView().getProjection()
        });

        // Apply style to features
        features.forEach(feature => {
            feature.setStyle(trackStyle);
        });

        // Add features to existing vector source
        vectorLayer.getSource().addFeatures(features);
        
        // Fit view to the features extent
        const extent = vectorLayer.getSource().getExtent();
        map.getView().fit(extent, {
            padding: [50, 50, 50, 50],
            maxZoom: 18
        });
    }

    async function handleKMZFile(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const zip = await JSZip.loadAsync(arrayBuffer);
            
            // Find the KML file in the KMZ (which is actually a ZIP)
            const kmlFile = Object.values(zip.files).find(file => 
                file.name.toLowerCase().endsWith('.kml')
            );

            if (!kmlFile) {
                throw new Error('No KML file found in KMZ');
            }

            const kmlContent = await kmlFile.async('text');
            handleKML(kmlContent);
        } catch (error) {
            console.error('Error processing KMZ file:', error);
        }
    }
}
