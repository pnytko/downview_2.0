/**
 * @file geolocation-service.js
 * @description Serwis do obsługi geolokalizacji
 */

import { MAP_CONFIG } from '../../core/config/map-config.js';

/**
 * Pobiera i wyświetla lokalizację użytkownika na mapie
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @returns {Promise<GeolocationPosition>} Obietnica z pozycją użytkownika
 */
export function getUserLocation(map) {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolokalizacja nie jest wspierana przez twoją przeglądarkę.'));
            return;
        }
        
        navigator.geolocation.getCurrentPosition(
            // Sukces
            (position) => {
                handleGeolocationSuccess(position, map);
                resolve(position);
            },
            // Błąd
            (error) => {
                handleGeolocationError(error);
                reject(error);
            },
            // Opcje
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    });
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
        ),
        type: 'userLocation'
    });

    // Ustaw styl dla punktu lokalizacji
    userLocation.setStyle(createUserLocationStyle());

    // Usuń poprzednie punkty lokalizacji (jeśli istnieją)
    removeExistingUserLocation(map);

    // Dodaj nową warstwę z lokalizacją
    addUserLocationLayer(map, userLocation);

    // Przesuń mapę do lokalizacji użytkownika
    centerMapOnUserLocation(map, longitude, latitude);
}

/**
 * Tworzy styl dla punktu lokalizacji użytkownika
 * @returns {ol.style.Style} Styl punktu lokalizacji
 */
function createUserLocationStyle() {
    return new ol.style.Style({
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
    });
}

/**
 * Usuwa istniejącą warstwę lokalizacji użytkownika
 * @param {ol.Map} map - Instancja mapy OpenLayers
 */
function removeExistingUserLocation(map) {
    const layers = map.getLayers();
    layers.forEach(layer => {
        if (layer.get('name') === 'userLocation') {
            map.removeLayer(layer);
        }
    });
}

/**
 * Dodaje warstwę z lokalizacją użytkownika
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {ol.Feature} userLocation - Feature z lokalizacją użytkownika
 */
function addUserLocationLayer(map, userLocation) {
    const vectorLayer = new ol.layer.Vector({
        name: 'userLocation',
        source: new ol.source.Vector({
            features: [userLocation]
        }),
        zIndex: 999 // Ustaw wysoki zIndex, aby warstwa była zawsze na wierzchu
    });
    map.addLayer(vectorLayer);
}

/**
 * Centruje mapę na lokalizacji użytkownika
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @param {number} longitude - Długość geograficzna
 * @param {number} latitude - Szerokość geograficzna
 */
function centerMapOnUserLocation(map, longitude, latitude) {
    map.getView().animate({
        center: ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857'),
        zoom: MAP_CONFIG.userLocationZoom || MAP_CONFIG.startZoom,
        duration: MAP_CONFIG.animation.duration
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
    console.error('Błąd geolokalizacji:', message);
    alert(message);
}

/**
 * Śledzi lokalizację użytkownika w czasie rzeczywistym
 * @param {ol.Map} map - Instancja mapy OpenLayers
 * @returns {number} ID interwału śledzenia
 */
export function trackUserLocation(map) {
    // Pobierz początkową lokalizację
    getUserLocation(map).catch(error => console.error('Błąd początkowej geolokalizacji:', error));
    
    // Ustaw interwał aktualizacji lokalizacji
    const trackingInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            position => handleGeolocationSuccess(position, map),
            error => console.warn('Błąd aktualizacji geolokalizacji:', error),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }, 10000); // Aktualizuj co 10 sekund
    
    return trackingInterval;
}

/**
 * Zatrzymuje śledzenie lokalizacji użytkownika
 * @param {number} trackingInterval - ID interwału śledzenia
 */
export function stopTrackingUserLocation(trackingInterval) {
    if (trackingInterval) {
        clearInterval(trackingInterval);
    }
}