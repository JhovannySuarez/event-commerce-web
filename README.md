# Event Planner Web

Frontend application for Event Planner.

## Vision

Help people plan unforgettable events through an intelligent planning experience.

## Tech Stack

- Angular 22
- TypeScript
- Angular Material
- SCSS
- Material Symbols
- Standalone Components

## Project Structure

src/app

core/

features/

shared/

layouts/

## Documentation

See `/docs`

## Backend

https://github.com/JhovannySuarez/event-commerce-backend
## Venue search

The client uses `environment.apiUrl`. Global catalogs are loaded from `GET /event-types` and `GET /event-types/{id}/subtypes`, without tenant parameters. Cards display backend names/descriptions in backend order. Routes use `/venue-search/:eventTypeCode`; direct navigation resolves the code from the catalog and sends only its global UUID to `GET /venues/search`.

Subtypes remain in form state and are not search filters. Loading, empty and retry states are available for both catalogs. Changing route cancels pending catalog, subtype and search requests and clears the previous selection/results. Each new search starts at Q1/page 0; pagination retains submitted filters and changing tier requires an explicit click.

Run the focused contract and flow tests with:

```sh
npm test -- --watch=false --ts-config=tsconfig.venue-search.spec.json --include=src/app/features/venue-search/venue-search.spec.ts
```
