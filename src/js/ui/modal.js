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
export function displayWrapperTrails() {
    const modal = document.getElementById('wrapper-trails');
    modal.style.display = 'block';
}

export function closeWrapperTrails() {
    const modal = document.getElementById('wrapper-trails');
    modal.style.display = 'none';
}

// Funkcje obsługi okna znaczników
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

async function getElevation(lat, lon, retries = 3) {
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
            return data.results[0].elevation;
        } catch (error) {
            if (i === retries - 1) throw error; // Rzuć błąd tylko przy ostatniej próbie
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Zwiększający się czas oczekiwania
        }
    }
}

export async function displayWrapperMarker(formattedText) {
    const modal = document.getElementById('wrapper-marker');
    modal.style.display = 'block';
    document.getElementById('marker-coordinates').innerText = formattedText;
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
