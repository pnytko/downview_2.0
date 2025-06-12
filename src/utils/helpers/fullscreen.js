/**
 * @file fullscreen.js
 * @description Narzędzia do obsługi trybu pełnoekranowego
 */

/**
 * Przełącza tryb pełnoekranowy
 * @returns {Promise<void>} Obietnica, która rozwiązuje się po przełączeniu trybu
 */
export async function toggleFullScreen() {
    try {
        const elem = document.documentElement;
        
        if (!document.fullscreenElement) {
            // Wejście w tryb pełnoekranowy
            await elem.requestFullscreen();
        } else {
            // Wyjście z trybu pełnoekranowego
            await document.exitFullscreen();
        }
    } catch (err) {
        console.error('Błąd podczas przełączania trybu pełnoekranowego:', err);
        alert(`Błąd podczas przechodzenia w tryb pełnoekranowy: ${err.message}`);
    }
}

/**
 * Sprawdza, czy tryb pełnoekranowy jest dostępny
 * @returns {boolean} Czy tryb pełnoekranowy jest dostępny
 */
export function isFullscreenAvailable() {
    return document.fullscreenEnabled || 
           document.webkitFullscreenEnabled || 
           document.mozFullScreenEnabled ||
           document.msFullscreenEnabled;
}

/**
 * Wchodzi w tryb pełnoekranowy
 * @param {HTMLElement} [element=document.documentElement] - Element, który ma być wyświetlany w trybie pełnoekranowym
 * @returns {Promise<void>} Obietnica, która rozwiązuje się po wejściu w tryb pełnoekranowy
 */
export async function enterFullscreen(element = document.documentElement) {
    try {
        if (element.requestFullscreen) {
            await element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
            await element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari, Opera
            await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
            await element.msRequestFullscreen();
        }
    } catch (err) {
        console.error('Błąd podczas wchodzenia w tryb pełnoekranowy:', err);
        throw err;
    }
}

/**
 * Wychodzi z trybu pełnoekranowego
 * @returns {Promise<void>} Obietnica, która rozwiązuje się po wyjściu z trybu pełnoekranowego
 */
export async function exitFullscreen() {
    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
            await document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari, Opera
            await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
            await document.msExitFullscreen();
        }
    } catch (err) {
        console.error('Błąd podczas wychodzenia z trybu pełnoekranowego:', err);
        throw err;
    }
}

/**
 * Inicjalizuje obsługę przycisku trybu pełnoekranowego
 * @param {string} [buttonSelector='.tool-button[title="Pełny ekran"]'] - Selektor przycisku trybu pełnoekranowego
 */
export function initFullscreenButton(buttonSelector = '.tool-button[title="Pełny ekran"]') {
    const fullscreenButton = document.querySelector(buttonSelector);
    
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullScreen);
        
        // Aktualizuj ikonę przycisku w zależności od stanu trybu pełnoekranowego
        document.addEventListener('fullscreenchange', () => {
            const icon = fullscreenButton.querySelector('i');
            if (icon) {
                if (document.fullscreenElement) {
                    icon.classList.remove('fa-expand');
                    icon.classList.add('fa-compress');
                } else {
                    icon.classList.remove('fa-compress');
                    icon.classList.add('fa-expand');
                }
            }
        });
    }
}