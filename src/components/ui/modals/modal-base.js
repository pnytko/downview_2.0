/**
 * @file modal-base.js
 * @description Bazowe funkcje dla obsługi okien modalnych
 */

/**
 * Funkcja do obsługi przeciągania okien modalnych
 * @param {HTMLElement} modal - Element okna modalnego
 */
export function makeDraggable(modal) {
    if (!modal) return;

    const header = modal.querySelector('.modal-header');
    if (!header) return;

    let isDragging = false;
    let startX;
    let startY;
    let modalStartX;
    let modalStartY;

    /**
     * Rozpoczyna przeciąganie okna modalnego
     * @param {MouseEvent} e - Zdarzenie myszy
     */
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

    /**
     * Obsługuje przeciąganie okna modalnego
     * @param {MouseEvent} e - Zdarzenie myszy
     */
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

    /**
     * Kończy przeciąganie okna modalnego
     */
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

/**
 * Wyświetla okno modalne
 * @param {string} modalId - Identyfikator okna modalnego
 */
export function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        makeDraggable(modal);
    }
}

/**
 * Ukrywa okno modalne
 * @param {string} modalId - Identyfikator okna modalnego
 */
export function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Inicjalizuje wszystkie okna modalne
 */
export function initModals() {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => makeDraggable(modal));
    
    // Dodaj obsługę zamykania modali
    document.querySelectorAll('.btn-close').forEach(button => {
        const modal = button.closest('.modal');
        if (modal) {
            button.addEventListener('click', () => {
                hideModal(modal.id);
            });
        }
    });
    
    // Dodaj obsługę kliknięcia poza modalem
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            document.querySelectorAll('.modal').forEach(modal => {
                hideModal(modal.id);
            });
        }
    });
}