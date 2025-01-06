/**
 * Przełącza tryb pełnoekranowy
 */
export function toggleFullScreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Błąd podczas przechodzenia w tryb pełnoekranowy: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}
