# Antonio's Málaga

A personal interactive map of restaurants, bars, and sights in Málaga — distilled from the tips our AirBNB host Antonio sent ahead of an October trip.

Static site, no backend or database: all place data lives in [`data/pois.json`](data/pois.json). Built with [Leaflet.js](https://leafletjs.com/) and vanilla HTML/CSS/JS, hosted on GitHub Pages.

## Features

- Custom category markers (restaurants, bars, cafés, the market, viewpoints, landmarks, parks, walks, the beach)
- Hover a marker for a quick preview; click for a full detail panel with photo, description, Antonio's original tip, rating/price, and links to Google Maps / TripAdvisor
- Category filters with counts
- List view as a mobile-friendly alternative to the map
- Fully responsive — designed to be used on a phone while walking around the city

## Running locally

No build step needed — it's static files.

```bash
python3 -m http.server 8642
```

Then open `http://localhost:8642`.
