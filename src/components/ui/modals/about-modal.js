/**
 * @file about-modal.js
 * @description Obsługa okna modalnego z informacjami o aplikacji
 */

import { showModal, hideModal } from './modal-base.js';
import { APP_STATE } from '../../../core/state/app-state.js';

// ID okna modalnego o aplikacji
const ABOUT_MODAL_ID = 'wrapper-about';

/**
 * Wyświetla okno modalne z informacjami o aplikacji
 */
export function displayWrapperAbout() {
    // Wyświetl okno modalne
    showModal(ABOUT_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.about = true;
    }
}

/**
 * Zamyka okno modalne z informacjami o aplikacji
 */
export function closeWrapperAbout() {
    hideModal(ABOUT_MODAL_ID);
    
    // Aktualizuj stan aplikacji
    if (APP_STATE.ui.modals) {
        APP_STATE.ui.modals.about = false;
    }
}

/**
 * Inicjalizuje okno modalne z informacjami o aplikacji
 */
export function initAboutModal() {
    // Pobierz przycisk zamykania okna modalnego
    const closeButton = document.querySelector('#wrapper-about .btn-close');
    if (closeButton) {
        // Dodaj obsługę kliknięcia przycisku zamykania
        closeButton.addEventListener('click', closeWrapperAbout);
    }
    
    // Pobierz przycisk otwierania okna modalnego
    const aboutButton = document.getElementById('aboutButton');
    if (aboutButton) {
        // Dodaj obsługę kliknięcia przycisku otwierania
        aboutButton.addEventListener('click', displayWrapperAbout);
    }
}

/**
 * Aktualizuje zawartość okna modalnego o aplikacji
 * @param {Object} appInfo - Informacje o aplikacji
 * @param {string} appInfo.version - Wersja aplikacji
 * @param {string} appInfo.releaseDate - Data wydania
 * @param {string} appInfo.description - Opis aplikacji
 * @param {Array<string>} appInfo.features - Lista funkcji
 */
export function updateAboutModalContent(appInfo) {
    const modal = document.getElementById(ABOUT_MODAL_ID);
    if (!modal) return;
    
    const contentContainer = modal.querySelector('.modal-content');
    if (!contentContainer) return;
    
    // Stwórz zawartość okna modalnego
    let content = `
        <h3>Czym jest i dla kogo jest aplikacja?</h3>
        <p>${appInfo.description || 'DownView 2 jest projektem niekomercyjnym wykonanym w celach edukacyjnych. Zakres map zawiera się dla całego świata, jednakże większość usług (np. OrtoHD, OSM czy działki) dostępna jest tylko dla Polski. Dostarczane usługi mogą być przydatne dla podróżników, archeologów, historyków, odkrywców czy detektorystów.'}</p>
        
        <h3>Podstawowe aspekty techniczne aplikacji</h3>
        <p>Aplikacja korzysta z biblioteki OpenLayers6 i integruje różne typy danych w postaci <b>warstw</b>. Część map funkcjonuje jako serwisy WMS, a część jako dane magazynowane na hostingu.</p>
    `;
    
    // Dodaj listę funkcji, jeśli istnieje
    if (appInfo.features && appInfo.features.length > 0) {
        content += `
            <h3>Główne funkcje</h3>
            <ul>
                ${appInfo.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        `;
    }
    
    // Dodaj informacje o wersji i dacie wydania, jeśli istnieją
    if (appInfo.version || appInfo.releaseDate) {
        content += `
            <h3>Informacje o wersji</h3>
            <p>
                ${appInfo.version ? `Wersja: <b>${appInfo.version}</b><br>` : ''}
                ${appInfo.releaseDate ? `Data wydania: <b>${appInfo.releaseDate}</b>` : ''}
            </p>
        `;
    }
    
    // Aktualizuj zawartość okna modalnego
    contentContainer.innerHTML = content;
}