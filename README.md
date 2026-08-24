# Movie & Series Tracker

Webtech-Projekt (3. Semester, HTW Berlin) — ein browserbasierter Tracker für Filme und Serien, entwickelt von Swen Suck und Yves-Leon Saint-Léon.

## Projektziel

Ziel war es, eine vollständige Webanwendung mit modernem Frontend und REST-Backend zu entwickeln. Die App ermöglicht es Nutzern, Filme und Serien zu ihrer persönlichen Watchlist hinzuzufügen, zu bearbeiten und zu organisieren. Über die TMDB-Integration werden Metadaten (Poster, Trailer, Bewertungen) automatisch abgerufen. Ein separater "Collection"-Bereich sowie ein Widget zum Sehen, was andere Nutzer gerade schauen, runden die Anwendung ab.

## Tech-Stack

- **Framework:** Vue 3 (Composition API, `<script setup>`)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS
- **Build-Tool:** Vite
- **Tests:** Vitest + Vue Test Utils
- **Backend:** Spring Boot (separates Repository)
- **Auth:** Eigenes Login-System (JWT-basiert, Multi-User)

## Features

- Filme und Serien hinzufügen, bearbeiten und löschen
- Automatischer Poster-Abruf via TMDB (über IMDb-ID)
- Detailseite mit Trailer, Bewertung und Beschreibung
- Favoriten-Funktion
- Zufalls-Pick aus der eigenen Liste
- Collection-Übersicht als Cover-Mosaik
- "Was andere schauen"-Widget (Einträge anderer Accounts)
- Multi-User-Login (eigene Session pro Nutzer)
- 10 Unit-Tests (Vitest) + GitHub Actions CI

## Voraussetzungen

- Node.js `>= 20.19`
- Das **Backend** muss lokal laufen (standardmäßig auf `http://localhost:8080`)

## Projekt starten

```sh
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten (Hot-Reload)
npm run dev
```

Die App ist dann unter `http://localhost:5173` erreichbar.

## Weitere Befehle

```sh
# Produktions-Build erstellen
npm run build

# Unit-Tests ausführen
npm run test:unit

# Linting
npm run lint
```

## Projektstruktur

```
src/
├── api/          # Axios-Clients (mediaApi, authApi, discoverApi)
├── auth/         # Session-Management
├── components/   # Wiederverwendbare Vue-Komponenten
├── router/       # Vue Router Konfiguration
├── types/        # TypeScript-Typen (FilmDto, SerieDto, …)
├── utils/        # Hilfsfunktionen (z. B. Fehlerextraktion)
└── views/        # Seitenkomponenten (Home, Login, Details, Collection)
```

## Entwickelt von

- [Swen Suck](https://github.com/superSwen)
- [Yves-Leon Saint-Léon](https://github.com/YvesSaintLeonnn)
