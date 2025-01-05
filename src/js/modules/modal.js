// Funkcje obsługi okna O aplikacji
export function displayWrapperAbout() {
    const modal = document.getElementById('wrapper-about');
    modal.style.display = 'block';
}

export function closeWrapperAbout() {
    const modal = document.getElementById('wrapper-about');
    modal.style.display = 'none';
}

// Funkcje obsługi okna szlaków
export function closeWrapperTrails() {
    const modal = document.getElementById('wrapper-trails');
    modal.style.display = 'none';
}

// Funkcje obsługi okna znaczników
export async function displayWrapperMarker(marker) {
    const modal = document.getElementById('wrapper-marker');
    modal.style.display = 'block';

    // Pobierz współrzędne znacznika
    const coordinates = marker.getGeometry().getCoordinates();
    const lonLat = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    
    // Pobierz wysokość z OpenElevation API
    try {
        const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lonLat[1]},${lonLat[0]}`);
        const data = await response.json();
        const elevation = data.results[0].elevation;
        
        // Formatowanie współrzędnych
        const formattedCoords = `Długość: ${lonLat[0].toFixed(6)}°\nSzerokość: ${lonLat[1].toFixed(6)}°\nWysokość: ${elevation.toFixed(1)} m n.p.m.`;
        
        document.getElementById('marker-coordinates').innerText = formattedCoords;
    } catch (error) {
        console.error('Błąd podczas pobierania wysokości:', error);
        // W przypadku błędu wyświetl współrzędne bez wysokości
        const formattedCoords = `Długość: ${lonLat[0].toFixed(6)}°\nSzerokość: ${lonLat[1].toFixed(6)}°\nWysokość: niedostępna`;
        document.getElementById('marker-coordinates').innerText = formattedCoords;
    }
}

export function closeWrapperMarker() {
    const modal = document.getElementById('wrapper-marker');
    modal.style.display = 'none';
}

// Funkcje obsługi okna pogody
export function displayWrapperWeather(coordinates) {
    const modal = document.getElementById('wrapper-weather');
    modal.style.display = 'block';
    
    // Konwersja współrzędnych
    const lonLat = ol.proj.transform(coordinates, 'EPSG:3857', 'EPSG:4326');
    const weatherInfo = document.getElementById('weather-info');
    weatherInfo.innerHTML = '<p>Ładowanie danych pogodowych...</p>';
    
    return lonLat;
}

export function closeWrapperWeather() {
    const modal = document.getElementById('wrapper-weather');
    modal.style.display = 'none';
}

// Funkcja do obsługi przeciągania okien modalnych
export function makeDraggable(modal) {
    if (!modal) return;

    const header = modal.querySelector('.modal-header');
    if (!header) return;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    function getTransformedPosition() {
        const transform = window.getComputedStyle(modal).transform;
        if (transform === 'none') return { x: 0, y: 0 };
        
        const matrix = new DOMMatrixReadOnly(transform);
        return {
            x: matrix.m41,
            y: matrix.m42
        };
    }

    function dragStart(e) {
        const pos = getTransformedPosition();
        xOffset = pos.x;
        yOffset = pos.y;
        
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;

        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
            modal.style.cursor = 'grabbing';
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;

            // Sprawdź granice okna
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const modalRect = modal.getBoundingClientRect();

            // Ogranicz pozycję modala do granic okna
            if (currentX < 0) currentX = 0;
            if (currentY < 0) currentY = 0;
            if (currentX + modalRect.width > windowWidth) currentX = windowWidth - modalRect.width;
            if (currentY + modalRect.height > windowHeight) currentY = windowHeight - modalRect.height;

            xOffset = currentX;
            yOffset = currentY;

            requestAnimationFrame(() => {
                setTranslate(currentX, currentY, modal);
            });
        }
    }

    function dragEnd() {
        if (isDragging) {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
            modal.style.cursor = '';
        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
    }

    // Usuń poprzednie event listenery (jeśli istnieją)
    header.removeEventListener('mousedown', dragStart);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);

    // Dodaj nowe event listenery
    header.addEventListener('mousedown', dragStart, { passive: false });
    document.addEventListener('mousemove', drag, { passive: false });
    document.addEventListener('mouseup', dragEnd, { passive: true });

    // Dodaj style wskazujące, że element można przeciągać
    header.style.cursor = 'grab';
}

// Inicjalizacja przeciągania dla wszystkich okien modalnych
export function initModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => makeDraggable(modal));
}
