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

## Search a known venue

The search page can switch between general filters and a venue-name/date form.
After three trimmed characters, suggestions are requested from
`GET /venues/autocomplete?query=...` and displayed as name/city/state.
Selecting a suggestion is required; text alone is not a venue selection.

Known-venue searches use `GET /venues/{id}/availability` with the global
`eventTypeId`, local-calendar `eventDate`, `tier`, `page`, and `pageSize`.
Hidden city/guest/subtype fields are not sent. Each returned Event Space uses its
own card and date/slot availability. An empty first Q1 page automatically loads
Q2 for the same venue (+/-15 days). General search still changes tiers manually.
Switching modes cancels pending requests and clears results. This feature requires
the matching backend endpoints documented in the backend `docs/venue-search.md`.

## Event Space detail

Click a space name in search results to open `/event-spaces/:id`. The optional
`eventTypeId` and `eventDate` query parameters select the calendar type/month;
direct navigation resolves the space and supported global types from the backend.
The page loads detail, venue reviews, and monthly availability independently.
Review scores belong to the venue, not the individual space. Images are deferred.
Calendar data uses the same configured slots/full-day rules as venue search and
is not a booking confirmation.
