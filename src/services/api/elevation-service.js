/**
 * @file elevation-service.js
 * @description Serwis do pobierania danych o wysokości terenu
 */

/**
 * Pobiera dane z API z obsługą timeout
 * @param {string} url - URL do API
 * @param {number} timeout - Czas oczekiwania w milisekundach
 * @returns {Promise<Response>} Odpowiedź z API
 * @throws {Error} Błąd w przypadku przekroczenia czasu lub innego problemu
 */
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        throw error;
    }
}

/**
 * Pobiera wysokość dla podanych współrzędnych geograficznych
 * @param {number} lat - Szerokość geograficzna
 * @param {number} lon - Długość geograficzna
 * @param {number} retries - Liczba prób w przypadku błędu
 * @returns {Promise<number>} Wysokość w metrach n.p.m.
 * @throws {Error} Błąd w przypadku problemów z API
 */
export async function fetchElevation(lat, lon, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetchWithTimeout(
                `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
                5000
            );
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Otrzymano nieprawidłowy format odpowiedzi");
            }
            
            const data = await response.json();
            
            if (!data.results || !data.results[0] || typeof data.results[0].elevation !== 'number') {
                throw new Error("Nieprawidłowa struktura odpowiedzi API");
            }
            
            return data.results[0].elevation;
        } catch (error) {
            console.warn(`Próba ${i+1}/${retries} pobrania wysokości nie powiodła się:`, error);
            
            if (i === retries - 1) {
                // Ostatnia próba nie powiodła się, rzuć błąd
                throw new Error(`Nie udało się pobrać wysokości po ${retries} próbach: ${error.message}`);
            }
            
            // Poczekaj przed kolejną próbą (zwiększając czas oczekiwania)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

/**
 * Pobiera wysokości dla wielu punktów
 * @param {Array<{lat: number, lon: number}>} points - Tablica punktów
 * @returns {Promise<Array<number>>} Tablica wysokości
 */
export async function fetchElevationBatch(points) {
    if (!points || points.length === 0) {
        return [];
    }
    
    try {
        const locations = points.map(p => `${p.lat},${p.lon}`).join('|');
        const response = await fetchWithTimeout(
            `https://api.open-elevation.com/api/v1/lookup?locations=${locations}`,
            10000 // Dłuższy timeout dla wielu punktów
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.results || !Array.isArray(data.results)) {
            throw new Error("Nieprawidłowa struktura odpowiedzi API");
        }
        
        return data.results.map(r => r.elevation);
    } catch (error) {
        console.error('Błąd podczas pobierania wysokości dla wielu punktów:', error);
        // Fallback - pobierz wysokości pojedynczo
        return Promise.all(points.map(async p => {
            try {
                return await fetchElevation(p.lat, p.lon);
            } catch (e) {
                return null; // W przypadku błędu zwróć null
            }
        }));
    }
}