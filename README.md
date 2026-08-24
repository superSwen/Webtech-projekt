# Movie & Series Tracker

> Hochschulprojekt · HTW Berlin · Webtech, 3. Semester (WiSe 2025/26)

Browserbasierter Tracker für Filme und Serien, entwickelt von Swen Suck und Yves-Leon Saint-Léon. Nutzer können ihre persönliche Watchlist pflegen, Metadaten (Poster, Trailer, Ratings) werden automatisch über TMDB/OMDb angereichert.

---

## Für Interessierte: Projekt lokal starten

Das Projekt besteht aus zwei Teilen — Frontend (dieses Repo) und Backend (Spring Boot). Um die App vollständig zu erleben, müssen beide laufen.

### Voraussetzungen

| Tool | Version |
|------|---------|
| Node.js | `>= 20.19` |
| Java | `>= 21` |
| Backend-Repo | [Movie-Series-Tracker-Swen-Yves/webtech-backend](https://github.com/Movie-Series-Tracker-Swen-Yves) |

### Schritt-für-Schritt

**1. Backend starten**
```sh
# Backend-Repo klonen und starten (Spring Boot, Port 8080)
git clone <backend-repo-url>
cd <backend-verzeichnis>
./gradlew bootRun
```

**2. Frontend starten**
```sh
# Dieses Repo klonen
git clone https://github.com/superSwen/Webtech-projekt.git
cd Webtech-projekt

# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

**3. App öffnen**

Browser: `http://localhost:5173`

Testnutzer können direkt im Login-Screen angelegt werden — die App unterstützt mehrere Accounts.

---

## Features

- Filme und Serien hinzufügen, bearbeiten und löschen
- Automatischer Poster-Abruf via TMDB (über IMDb-ID)
- Detailseite mit Trailer, Bewertung und Beschreibung
- Favoriten-Funktion
- Zufalls-Pick aus der eigenen Liste (Movie-Roulette)
- Collection-Übersicht als Cover-Mosaik
- „Was andere schauen"-Widget (Einträge anderer Accounts)
- Multi-User-Login mit JWT-Auth
- 10 Unit-Tests (Vitest) + GitHub Actions CI

## Tech-Stack

| Bereich | Technologie |
|---------|-------------|
| Framework | Vue 3 (Composition API, `<script setup>`) |
| Sprache | TypeScript |
| Styling | Tailwind CSS |
| Build | Vite |
| Tests | Vitest + Vue Test Utils |
| Backend | Spring Boot (separates Repo) |
| APIs | TMDB, OMDb |

## Weitere Befehle

```sh
npm run build        # Produktions-Build
npm run test:unit    # Unit-Tests
npm run lint         # Linting
```

## Projektstruktur

```
src/
├── api/          # Axios-Clients (mediaApi, authApi, tmdbApi, omdbApi)
├── auth/         # Session-Management (JWT)
├── components/   # Wiederverwendbare Vue-Komponenten
├── router/       # Vue Router (mit Auth-Guard)
├── types/        # TypeScript-Typen (FilmDto, SerieDto, …)
├── utils/        # Hilfsfunktionen (Favoriten, Fehlerextraktion)
└── views/        # Seitenkomponenten (Home, Login, Details, Collection)
```

## Entwickelt von

- [Swen Suck](https://github.com/superSwen)
- [Yves-Leon Saint-Léon](https://github.com/YvesSaintLeonnn)
