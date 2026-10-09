# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
A small private group (the user and their travel companions) on an October trip to Málaga. They use it on phones, one-handed, while walking the city, deciding where to eat, drink or wander next. It is not a public site. (Confirmed: "just us on the trip".)

## Product Purpose
A personal interactive map of restaurants, bars, cafés, the market, viewpoints, landmarks, parks, walks and the beach in Málaga, distilled from tips the AirBNB host Antonio sent ahead of the trip. Success: on the street, someone can see what is nearby, read Antonio's reason for recommending it, and get directions in a few taps.

## Positioning
It is Antonio's own list, not a generic guide: each place carries the host's original tip alongside a short description, rating and price.

## Operating Context
Used outdoors on phones in bright sun, often walking, with intermittent attention. Static site on GitHub Pages; Leaflet map with CARTO raster basemap (key loaded from git-ignored `js/config.js`); all place data in `data/pois.json` (about 30 places).

## Capabilities and Constraints
- Static site, no backend or build step: vanilla HTML/CSS/JS, Leaflet.
- Category markers, filters with counts, hover preview and click detail panel (photo, description, Antonio's tip, rating/price, Google Maps and TripAdvisor links), list view as an alternative to the map, favorites with a Saved filter.
- The CARTO API key must never be committed or appear in tracked files.
- Photos carry credits (Wikimedia Commons) that must stay visible.

## Brand Commitments
- Name stays "Antonio's Málaga".
- Antonio's original tip text stays prominent and verbatim.
- Favorites (heart, map badge, Saved filter) stay.
- The map/list toggle and category filters stay as the navigation model.

## Evidence on Hand
Real place data, descriptions, host tips, ratings, prices and credited photos in `data/pois.json`. No testimonials or external claims should be invented.

## Product Principles
- Phone-first, one-handed, readable in sunlight.
- Antonio's voice is the point; the interface serves his tips.
- Fast to scan: where, what kind, how far, what he said.
- Private and personal in tone, not a commercial travel product.

## Accessibility & Inclusion
Outdoor legibility (high contrast, large touch targets) is a product need; no formal standard stated.
