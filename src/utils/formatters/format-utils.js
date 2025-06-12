/**
 * @file format-utils.js
 * @description Narzędzia do formatowania różnych typów danych
 */

/**
 * Formatuje długość w metrach na czytelny tekst
 * @param {number} meters - Długość w metrach
 * @returns {string} Sformatowana długość
 */
export function formatLength(meters) {
    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${meters.toFixed(2)} m`;
}

/**
 * Formatuje powierzchnię w metrach kwadratowych na czytelny tekst
 * @param {number} area - Powierzchnia w metrach kwadratowych
 * @returns {string} Sformatowana powierzchnia
 */
export function formatArea(area) {
    if (area >= 1000000) {
        return `${(area / 1000000).toFixed(2)} km²`;
    } else if (area >= 10000) {
        return `${(area / 10000).toFixed(2)} ha`;
    }
    return `${area.toFixed(2)} m²`;
}

/**
 * Formatuje współrzędne geograficzne
 * @param {number} lon - Długość geograficzna
 * @param {number} lat - Szerokość geograficzna
 * @param {string} format - Format wyświetlania ('dd', 'dms', 'ddm')
 * @returns {string} Sformatowane współrzędne
 */
export function formatCoordinates(lon, lat, format = 'dd') {
    switch (format) {
        case 'dms': // Stopnie, minuty, sekundy
            return `${formatDMS(lat, 'NS')}, ${formatDMS(lon, 'EW')}`;
        case 'ddm': // Stopnie, minuty dziesiętne
            return `${formatDDM(lat, 'NS')}, ${formatDDM(lon, 'EW')}`;
        case 'dd': // Stopnie dziesiętne
        default:
            return `${lat.toFixed(6)}°, ${lon.toFixed(6)}°`;
    }
}

/**
 * Formatuje współrzędne w formacie stopni, minut, sekund
 * @param {number} value - Wartość współrzędnej
 * @param {string} hemispheres - Półkule ('NS' dla szerokości, 'EW' dla długości)
 * @returns {string} Sformatowana współrzędna
 */
function formatDMS(value, hemispheres) {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutes = Math.floor((absolute - degrees) * 60);
    const seconds = ((absolute - degrees - minutes / 60) * 3600).toFixed(2);
    const hemisphere = value >= 0 ? hemispheres[0] : hemispheres[1];
    
    return `${degrees}° ${minutes}' ${seconds}" ${hemisphere}`;
}

/**
 * Formatuje współrzędne w formacie stopni i minut dziesiętnych
 * @param {number} value - Wartość współrzędnej
 * @param {string} hemispheres - Półkule ('NS' dla szerokości, 'EW' dla długości)
 * @returns {string} Sformatowana współrzędna
 */
function formatDDM(value, hemispheres) {
    const absolute = Math.abs(value);
    const degrees = Math.floor(absolute);
    const minutes = ((absolute - degrees) * 60).toFixed(4);
    const hemisphere = value >= 0 ? hemispheres[0] : hemispheres[1];
    
    return `${degrees}° ${minutes}' ${hemisphere}`;
}

/**
 * Formatuje datę i czas
 * @param {Date|string|number} date - Data do sformatowania
 * @param {string} [format='short'] - Format daty ('short', 'long', 'time', 'datetime')
 * @param {string} [locale='pl-PL'] - Lokalizacja
 * @returns {string} Sformatowana data
 */
export function formatDate(date, format = 'short', locale = 'pl-PL') {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    switch (format) {
        case 'long':
            return dateObj.toLocaleDateString(locale, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        case 'time':
            return dateObj.toLocaleTimeString(locale, { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
        case 'datetime':
            return dateObj.toLocaleString(locale, { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit',
                hour: '2-digit', 
                minute: '2-digit' 
            });
        case 'short':
        default:
            return dateObj.toLocaleDateString(locale, { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit' 
            });
    }
}

/**
 * Formatuje temperaturę
 * @param {number} temp - Temperatura w stopniach Celsjusza
 * @param {string} [unit='C'] - Jednostka temperatury ('C' lub 'F')
 * @returns {string} Sformatowana temperatura
 */
export function formatTemperature(temp, unit = 'C') {
    if (unit === 'F') {
        // Konwersja z Celsjusza na Fahrenheita
        const fahrenheit = (temp * 9/5) + 32;
        return `${fahrenheit.toFixed(1)}°F`;
    }
    return `${temp.toFixed(1)}°C`;
}

/**
 * Formatuje prędkość wiatru
 * @param {number} speed - Prędkość wiatru w km/h
 * @param {string} [unit='kmh'] - Jednostka prędkości ('kmh', 'ms', 'mph')
 * @returns {string} Sformatowana prędkość wiatru
 */
export function formatWindSpeed(speed, unit = 'kmh') {
    switch (unit) {
        case 'ms': // metry na sekundę
            return `${(speed / 3.6).toFixed(1)} m/s`;
        case 'mph': // mile na godzinę
            return `${(speed * 0.621371).toFixed(1)} mph`;
        case 'kmh': // kilometry na godzinę
        default:
            return `${speed.toFixed(1)} km/h`;
    }
}

/**
 * Formatuje opady
 * @param {number} precipitation - Opady w mm
 * @returns {string} Sformatowane opady
 */
export function formatPrecipitation(precipitation) {
    return `${precipitation.toFixed(1)} mm`;
}