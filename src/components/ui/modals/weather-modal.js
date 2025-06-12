/**
 * @file weather-modal.js
 * @description Obsługa okna modalnego dla informacji pogodowych
 */

import { showModal, hideModal, makeDraggable } from './modal-base.js';
import { APP_STATE } from '../../../core/state/app-state.js';

// ID okna modalnego pogody
const WEATHER_MODAL_ID = 'wrapper-weather';

/**
 * Wyświetla okno modalne z informacjami pogodowymi
 * @param {string} content - Zawartość HTML do wyświetlenia
 * @param {Array<number>} [coordinates] - Współrzędne punktu, dla którego wyświetlane są dane pogodowe
 */
export function displayWrapperWeather(content, coordinates) {
    // Pobierz element okna modalnego
    let modal = document.getElementById(WEATHER_MODAL_ID);
    
    // Jeśli element nie istnieje, stwórz go
    if (!modal) {
        modal = createWeatherModal();
    }
    
    // Aktualizuj zawartość okna modalnego
    const contentContainer = modal.querySelector('.modal-content');
    if (contentContainer) {
        contentContainer.innerHTML = content;
    }
    
    // Wyświetl okno modalne
    showModal(WEATHER_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.weather = true;
    }
}

/**
 * Tworzy element okna modalnego pogody
 * @returns {HTMLElement} Element okna modalnego
 */
function createWeatherModal() {
    // Stwórz element okna modalnego
    const modal = document.createElement('div');
    modal.id = WEATHER_MODAL_ID;
    modal.className = 'modal';
    
    // Dodaj zawartość okna modalnego
    modal.innerHTML = `
        <div class="modal-header">
            <h2>Warunki pogodowe</h2>
            <button class="btn-close" onclick="closeWrapperWeather()">
                <i class="fas fa-power-off"></i>
            </button>
        </div>
        <div class="modal-content">
            <div class="weather-info">Ładowanie danych pogodowych...</div>
        </div>
    `;
    
    // Dodaj okno modalne do dokumentu
    document.body.appendChild(modal);
    
    // Dodaj obsługę przeciągania
    makeDraggable(modal);
    
    return modal;
}

/**
 * Zamyka okno modalne pogody
 */
export function closeWrapperWeather() {
    hideModal(WEATHER_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.weather = false;
    }
}

/**
 * Inicjalizuje okno modalne pogody
 */
export function initWeatherModal() {
    // Pobierz przycisk zamykania okna modalnego
    const closeButton = document.querySelector('#wrapper-weather .btn-close');
    if (closeButton) {
        // Dodaj obsługę kliknięcia przycisku zamykania
        closeButton.addEventListener('click', closeWrapperWeather);
    }
    
    // Dodaj globalną funkcję zamykania okna modalnego
    window.closeWrapperWeather = closeWrapperWeather;
}

/**
 * Aktualizuje pozycję okna modalnego pogody
 * @param {number} x - Pozycja X
 * @param {number} y - Pozycja Y
 */
export function updateWeatherModalPosition(x, y) {
    const modal = document.getElementById(WEATHER_MODAL_ID);
    if (modal) {
        // Pobierz wymiary okna modalnego
        const rect = modal.getBoundingClientRect();
        
        // Oblicz nową pozycję, aby okno modalne było widoczne
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        // Upewnij się, że okno modalne nie wychodzi poza ekran
        const newX = Math.min(Math.max(0, x - rect.width / 2), windowWidth - rect.width);
        const newY = Math.min(Math.max(0, y - rect.height / 2), windowHeight - rect.height);
        
        // Ustaw nową pozycję
        modal.style.left = `${newX}px`;
        modal.style.top = `${newY}px`;
    }
}