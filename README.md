# 🗺️ DownView - Interaktywna Mapa Regionu Tarnowskiego

## 📋 Spis treści
- [O projekcie](#o-projekcie)
- [Funkcjonalności](#funkcjonalności)
- [Technologie](#technologie)
- [Instalacja](#instalacja)
- [Użytkowanie](#użytkowanie)
- [Warstwy mapy](#warstwy-mapy)
- [Narzędzia](#narzędzia)

## 🎯 O projekcie
DownView to interaktywna aplikacja mapowa stworzona w celach edukacyjnych, skupiająca się na regionie tarnowskim i jego okolicach. Projekt oferuje szereg funkcjonalności przydatnych dla archeologów, historyków, odkrywców i wszystkich zainteresowanych eksploracją regionu.

## ✨ Funkcjonalności

### 🗺️ Warstwy mapowe
- **OpenStreetMap (OSM)** - podstawowa warstwa mapowa
- **Ortofotomapa HD** - szczegółowe zdjęcia lotnicze
- **Działki** - warstwa katastralna
- **DEM** - numeryczny model terenu
- **Szlaki turystyczne** - z podziałem na kolory:
  - Czerwony
  - Niebieski
  - Zielony
  - Żółty
  - Czarny
- **Jaskinie** - lokalizacje jaskiń w regionie

### 🛠️ Narzędzia pomiarowe
- **Pomiar długości** - możliwość mierzenia odległości
- **Pomiar powierzchni** - obliczanie powierzchni obszarów
- **Znaczniki** - dodawanie punktów na mapie
- **Eksport do PDF** - możliwość zapisania widoku mapy

### 🎨 Personalizacja
- **Dostosowywanie warstw** - włączanie/wyłączanie poszczególnych warstw
- **Kontrola przezroczystości** - regulacja widoczności warstw
- **Wybór projekcji** - obsługa różnych układów współrzędnych:
  - EPSG:4326
  - EPSG:3857
- **Precyzja współrzędnych** - regulacja dokładności wyświetlanych współrzędnych

### 🧭 Nawigacja
- **Kontrola kierunków** - obracanie mapy w 8 kierunkach (N, NE, E, SE, S, SW, W, NW)
- **Tryb pełnoekranowy** - maksymalizacja obszaru mapy
- **Informacje o położeniu** - wyświetlanie aktualnych współrzędnych kursora

## 🔧 Technologie
- **OpenLayers 6** - główna biblioteka mapowa
- **JavaScript (ES6+)** - logika aplikacji
- **HTML5 & CSS3** - struktura i stylizacja
- **Font Awesome** - ikony interfejsu
- **jQuery** - obsługa interakcji

## 💻 Instalacja
1. Sklonuj repozytorium:
\`\`\`bash
git clone https://github.com/twoja-nazwa/downview.git
\`\`\`

2. Otwórz projekt w lokalnym serwerze (np. Python):
\`\`\`bash
python -m http.server
\`\`\`

3. Otwórz przeglądarkę i przejdź pod adres:
\`\`\`
http://localhost:8000
\`\`\`

## 🎮 Użytkowanie

### Podstawowa nawigacja
- **Przybliżanie/Oddalanie** - użyj kółka myszy
- **Przesuwanie** - przeciągnij mapę lewym przyciskiem myszy
- **Obrót** - użyj przycisków kierunkowych w górnej części mapy

### Pomiary
1. Wybierz narzędzie pomiarowe z paska narzędzi
2. Klikaj na mapie, aby wyznaczyć punkty pomiaru
3. Zakończ pomiar podwójnym kliknięciem

### Eksport do PDF
1. Ustaw pożądany widok mapy
2. Kliknij przycisk eksportu do PDF
3. Wybierz lokalizację zapisu pliku

## 📝 Licencja
Projekt jest dostępny na licencji MIT. Szczegóły w pliku [LICENSE](LICENSE).

## 🤝 Współpraca
Jesteśmy otwarci na współpracę! Jeśli masz pomysł na ulepszenie aplikacji:
1. Utwórz fork repozytorium
2. Stwórz nową gałąź z Twoimi zmianami
3. Wyślij pull request

## 📧 Kontakt
Jeśli masz pytania lub sugestie, skontaktuj się z nami:
- Email: [twój-email]
- GitHub: [twój-profil]
