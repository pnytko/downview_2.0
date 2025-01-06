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
export async function displayWrapperMarker(coordinates) {
    const modal = document.getElementById('wrapper-marker');
    modal.style.display = 'block';

    // Współrzędne są już w formacie EPSG:4326 (lon, lat)
    const lonLat = coordinates;
    
    // Najpierw pokaż współrzędne bez wysokości
    const initialCoords = `Długość: ${lonLat[0].toFixed(6)}°\nSzerokość: ${lonLat[1].toFixed(6)}°\nWysokość: pobieranie...`;
    document.getElementById('marker-coordinates').innerText = initialCoords;
    
    // Asynchronicznie pobierz i zaktualizuj wysokość
    try {
        const response = await fetch(`https://api.open-elevation.com/api/v1/lookup?locations=${lonLat[1]},${lonLat[0]}`);
        const data = await response.json();
        const elevation = data.results[0].elevation;
        
        // Zaktualizuj tekst o wysokość
        const formattedCoords = `Długość: ${lonLat[0].toFixed(6)}°\nSzerokość: ${lonLat[1].toFixed(6)}°\nWysokość: ${elevation.toFixed(1)} m n.p.m.`;
        document.getElementById('marker-coordinates').innerText = formattedCoords;
    } catch (error) {
        console.error('Błąd podczas pobierania wysokości:', error);
        // W przypadku błędu zaktualizuj tekst o informację o błędzie
        const formattedCoords = `Długość: ${lonLat[0].toFixed(6)}°\nSzerokość: ${lonLat[1].toFixed(6)}°\nWysokość: niedostępna`;
        document.getElementById('marker-coordinates').innerText = formattedCoords;
    }
}

export function closeWrapperMarker() {
    const modal = document.getElementById('wrapper-marker');
    modal.style.display = 'none';
}

// Funkcje obsługi okna pogody
export function displayWrapperWeather(content, coordinates) {
    const wrapper = document.getElementById('wrapper-weather');
    wrapper.innerHTML = `
        <div class="modal-header">
            <h2>Warunki pogodowe</h2>
            <button class="btn-close" onclick="CloseWrapperWeather()">
                <i class="fas fa-power-off"></i>
            </button>
        </div>
        <div class="modal-content">
            ${content}
        </div>
    `;
    wrapper.style.display = 'block';
    makeDraggable(wrapper);
}

export function CloseWrapperWeather() {
    const modal = document.getElementById('wrapper-weather');
    modal.style.display = 'none';
}

// Funkcja do obsługi przeciągania okien modalnych
export function makeDraggable(modal) {
    if (!modal) return;

    const header = modal.querySelector('.modal-header');
    if (!header) return;

    let isDragging = false;
    let startX;
    let startY;
    let modalStartX;
    let modalStartY;

    function dragStart(e) {
        if (e.target === header || header.contains(e.target)) {
            isDragging = true;
            header.style.cursor = 'grabbing';

            // Dodaj klasę dragging przy rozpoczęciu przeciągania
            modal.classList.add('dragging');

            const rect = modal.getBoundingClientRect();
            modalStartX = rect.left;
            modalStartY = rect.top;
            startX = e.clientX;
            startY = e.clientY;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            const newX = modalStartX + deltaX;
            const newY = modalStartY + deltaY;

            modal.style.left = `${newX}px`;
            modal.style.top = `${newY}px`;
        }
    }

    function dragEnd() {
        if (isDragging) {
            isDragging = false;
            header.style.cursor = 'grab';
            
            // Usuń klasę dragging po zakończeniu przeciągania
            modal.classList.remove('dragging');
        }
    }

    // Usuń poprzednie event listenery (jeśli istnieją)
    header.removeEventListener('mousedown', dragStart);
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', dragEnd);

    // Dodaj nowe event listenery
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    // Ustaw podstawowe style
    modal.style.position = 'absolute';
    modal.style.transform = 'none';
    header.style.cursor = 'grab';
}

// Inicjalizacja przeciągania dla wszystkich okien modalnych
export function initModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => makeDraggable(modal));
}
