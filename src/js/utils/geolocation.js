import { MAP_CONFIG } from '../core/map-init.js';

/**
 * Pobiera i wyświetla lokalizację użytkownika na mapie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
export function getUserLocation(map) {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            // Sukces
            (position) => handleGeolocationSuccess(position, map),
            // Błąd
            handleGeolocationError,
            // Opcje
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    } else {
        alert('Geolokalizacja nie jest wspierana przez twoją przeglądarkę.');
    }
}

/**
 * Obsługuje sukces pobrania lokalizacji
 * @param {GeolocationPosition} position - Pozycja użytkownika
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function handleGeolocationSuccess(position, map) {
    const { latitude, longitude } = position.coords;
    
    // Stwórz punkt z lokalizacją użytkownika
    const userLocation = new ol.Feature({
        geometry: new ol.geom.Point(
            ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857')
        )
    });

    // Ustaw styl dla punktu lokalizacji
    userLocation.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
            radius: 8,
            fill: new ol.style.Fill({
                color: '#3388ff'
            }),
            stroke: new ol.style.Stroke({
                color: '#fff',
                width: 2
            })
        })
    }));

    // Usuń poprzednie punkty lokalizacji (jeśli istnieją)
    const layers = map.getLayers();
    layers.forEach(layer => {
        if (layer.get('name') === 'userLocation') {
            map.removeLayer(layer);
        }
    });

    // Dodaj nową warstwę z lokalizacją
    const vectorLayer = new ol.layer.Vector({
        name: 'userLocation',
        source: new ol.source.Vector({
            features: [userLocation]
        }),
        zIndex: 999 // Ustaw wysoki zIndex, aby warstwa była zawsze na wierzchu
    });
    map.addLayer(vectorLayer);

    // Przesuń mapę do lokalizacji użytkownika
    map.getView().animate({
        center: ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'),
        zoom: MAP_CONFIG.userLocationZoom,
        duration: 1000
    });
}

/**
 * Obsługuje błąd pobrania lokalizacji
 * @param {GeolocationPositionError} error - Obiekt błędu
 */
function handleGeolocationError(error) {
    let message;
    switch(error.code) {
        case error.PERMISSION_DENIED:
            message = 'Nie udzielono zgody na geolokalizację.';
            break;
        case error.POSITION_UNAVAILABLE:
            message = 'Informacja o lokalizacji jest niedostępna.';
            break;
        case error.TIMEOUT:
            message = 'Przekroczono czas oczekiwania na lokalizację.';
            break;
        default:
            message = 'Wystąpił nieznany błąd podczas geolokalizacji.';
            break;
    }
    alert(message);
}
