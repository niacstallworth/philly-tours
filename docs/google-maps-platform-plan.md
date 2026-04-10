# Google Maps Platform Plan

This document captures which Google Maps Platform products fit `Philly Tours` now, which ones are later-stage options, and which problem each one solves.

## Current product shape

Today the repo uses:

- Google My Maps links for tour-pack sharing in the web companion
- Expo location services for device position and heading
- a lightweight Leaflet + OpenStreetMap route map on the web
- stop-based drive session logic in `src/services/driveMode.ts`

That means the product gap is not "add every Maps API."

The product gap is:

- generate better routes between known stops
- estimate time and distance more accurately
- optionally enrich stops with place details
- keep future expansion paths visible without overbuilding today

## Recommended now

### `Routes API`

This should be the first Google Maps Platform integration.

Use it for:

- route geometry between tour stops
- travel time and distance estimates
- waypoint-aware route previews
- better drive-mode routing than the current hand-authored stop progression alone

Why now:

- it matches the current drive-first product directly
- it improves both web route previews and native drive mode
- it replaces the highest-value missing capability first

### `Places API (New)`

Use it when we want richer stop-level context or discovery.

Good uses:

- place details for known stops
- opening hours, ratings, phone, website, photos
- nearby place discovery around a stop
- admin lookup when a stop is being authored or refreshed

Why now:

- it complements the existing stop catalog cleanly
- it can enrich route pages without changing core drive logic

### `Geocoding API`

Use it for content operations and lightweight presentation support.

Good uses:

- convert editorial stop addresses into lat/lng during authoring
- reverse-geocode a visitor location into a readable area label
- normalize addresses for internal tour content workflows

Why now:

- it helps the content pipeline immediately
- it is lower-risk than adding more map UI surface area

## Add to the wire, but not first

These should stay visible in the implementation plan, but they do not need to be the first integration milestone.

### `Roads API`

Use this if the app starts working with live breadcrumb traces from a moving vehicle.

Good uses later:

- snapping noisy GPS breadcrumbs to the road network
- reconstructing the actual path a user drove
- improving route playback from recorded traces
- cleaning up location drift for future "follow the driven route" features

Why not first:

- current drive mode is stop-based, not breadcrumb-based
- `Routes API` solves the more immediate product need
- there is no active trace recording pipeline in the repo today

Decision:

- keep `Roads API` on the wire as the first route-quality expansion after `Routes API`

### `Maps 3D SDK for Android` and `Maps 3D SDK for iOS`

Use these only if the map itself becomes an immersive premium product surface.

Good uses later:

- landmark-forward 3D approach views
- cinematic route intros
- premium destination previews before arrival
- a future map experience where 3D city context is itself a feature

Why not first:

- the current product value is narration plus AR handoff, not 3D map exploration
- the native app does not yet expose a large in-app Google map surface
- 3D map integration would add platform-specific implementation and design cost before basic routing is upgraded

Decision:

- keep the 3D SDKs on the wire as a premium later-stage option after 2D routing is proven

## Skip for now

These are not the right first move for the current repo shape:

- `Directions API`
- `Distance Matrix API`
- `Navigation SDK`
- `Map Tiles API`
- `Aerial View API`
- `Street View Publish API`
- `Route Optimization API`

Most of these either overlap with `Routes API`, solve fleet problems we do not have, or add presentation complexity before the core route experience is upgraded.

## Suggested rollout order

1. Add `Routes API` for route previews, ETA, and waypoint routing.
2. Add `Places API (New)` for stop enrichment and nearby discovery.
3. Add `Geocoding API` for authoring and address normalization.
4. Revisit `Roads API` only if we begin collecting or replaying live breadcrumb traces.
5. Revisit the 3D SDKs only if immersive map presentation becomes a validated premium feature.

## Repo fit

The most natural integration points are:

- `src/services/location.ts` for device position inputs
- `src/services/driveMode.ts` for route sequencing and drive-state logic
- `src/screens/DriveScreen.tsx` for route-facing mobile UX
- `webapp/app.js` for route preview rendering and stop detail pages
- `server/sync-server.js` for server-mediated calls that should not expose private API usage directly to clients

## Product rule

Google Maps Platform should support the premium tour experience.

It should not turn the product into:

- a generic navigation app
- a fleet dashboard
- an expensive 3D map demo without a clear user payoff
