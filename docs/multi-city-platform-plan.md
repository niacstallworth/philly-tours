# Multi-City Platform Plan

This document describes how to turn Philly Tours into a reusable city platform without cloning the repo for each market.

The goal is simple:

- one shared product engine
- one shared codebase
- city-specific content packs
- city-specific deploy targets and domains

Philly should become the first city pack, not the forever-special case.

## Why This Matters

Right now, city-specific content is mixed into the shared app in several places:

- [src/data/tours.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/tours.ts)
- [src/data/narrationCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationCatalog.ts)
- [src/data/narrationScriptMap.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationScriptMap.ts)
- [src/services/arManifest.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/arManifest.ts)
- [webapp/index.html](/Users/nia/Documents/GitHub/philly-tours/webapp/index.html)
- [webapp/app.js](/Users/nia/Documents/GitHub/philly-tours/webapp/app.js)
- [scripts/build-webapp-data.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/build-webapp-data.mjs)
- [scripts/build-webapp-dist.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/build-webapp-dist.mjs)
- [scripts/generate-product-videos.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/generate-product-videos.mjs)

That works for v1. It does not scale cleanly to Baltimore, DC, Atlanta, Detroit, or Chicago.

The next move is to separate:

1. platform-owned code
2. city-owned content and branding

## Target Architecture

Use one repo with city packs.

```text
cities/
  philly/
    city.json
    branding.json
    seo.json
    social.json
    tours.json
    narration.json
    ar.json
    business-profile.json
    assets/
      hero/
      cards/
      search/
      brand/
      video/
  baltimore/
    ...
  dc/
    ...

src/
  core/
  city-runtime/
  components/
  services/
  screens/

scripts/
  build-city-data.mjs
  build-city-web-dist.mjs
  generate-city-product-videos.mjs
  validate-city-pack.mjs

webapp/
  templates/
  assets/shared/
```

## Ownership Split

### Platform-Owned

These should be reusable across all cities:

- navigation
- map rendering
- compass logic
- AR shell and readiness logic
- auth
- payments
- profile
- board/progress systems
- route page rendering
- SEO page generation engine
- sitemap generation engine
- product video generation engine
- shared UI tokens and component behavior

Candidate shared paths:

- [src/navigation/MainTabs.tsx](/Users/nia/Documents/GitHub/philly-tours/src/navigation/MainTabs.tsx)
- [src/services/maps.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/maps.ts)
- [src/services/location.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/location.ts)
- [src/services/tourControl.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/tourControl.ts)
- [src/components/maps/RoutePreviewMap.tsx](/Users/nia/Documents/GitHub/philly-tours/src/components/maps/RoutePreviewMap.tsx)
- [webapp/styles.css](/Users/nia/Documents/GitHub/philly-tours/webapp/styles.css)

### City-Owned

These should move into city packs:

- city name and slug
- map center
- service area
- tours
- stops
- narration copy
- AR copy/metadata
- local SEO copy
- social handles
- Google Business Profile copy
- homepage hero copy
- favicon/search image/video variations
- route thumbnails

## Required City Pack Files

Each city should provide the following files.

### `city.json`

Purpose:
- identity
- geography
- runtime defaults

Suggested shape:

```json
{
  "id": "philly",
  "name": "Philly Tours",
  "shortName": "Philly",
  "cityName": "Philadelphia",
  "stateCode": "PA",
  "countryCode": "US",
  "slug": "philly-tours",
  "timezone": "America/New_York",
  "serviceArea": ["Philadelphia, PA"],
  "defaultMapCenter": {
    "lat": 39.9526,
    "lng": -75.1652,
    "zoom": 12
  },
  "defaultTourId": "black-american-legacy-and-quaker-heritage",
  "websiteOrigin": "https://philly-tours.com"
}
```

### `branding.json`

Purpose:
- visual identity
- city accent rules

Suggested fields:

```json
{
  "primary": "#f7c02a",
  "secondary": "#353432",
  "kellyGreen": "#007a33",
  "cityBlue": "#002d72",
  "ink": "#15100a",
  "paper": "#fff9df",
  "heroEyebrow": "Philly is ready",
  "heroTitle": "Big city stories. Your route, your pace.",
  "heroBody": "Choose a Philadelphia route, follow the Compass, hear the story, and open AR moments when the street is ready for you."
}
```

### `seo.json`

Purpose:
- page titles
- meta descriptions
- schema text
- sitemap settings

Suggested fields:

```json
{
  "homeTitle": "Philly Tours | Self-Guided Philadelphia Audio & AR Walking Tours",
  "homeDescription": "Walk Philadelphia with self-guided audio tours, maps, Compass guidance, AR-ready stops, Black history, architecture, sports, and hidden routes.",
  "catalogTitle": "Philadelphia Walking Tours | Philly Tours",
  "searchImage": "/assets/search/philly-tours-search-thumbnail.jpg",
  "organizationType": ["Organization", "TravelAgency"],
  "knowsAbout": [
    "Philadelphia walking tours",
    "Philadelphia audio tours",
    "Black history tours in Philadelphia"
  ]
}
```

### `social.json`

Purpose:
- web footer/profile links
- sameAs schema
- social launch assets

### `tours.json`

Purpose:
- tour metadata
- stop ordering
- artwork references

This is the future replacement for most of:

- [src/data/tours.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/tours.ts)

### `narration.json`

Purpose:
- walk narration
- drive narration
- short summaries

This should absorb the city-specific parts of:

- [src/data/narrationCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationCatalog.ts)
- [src/data/narrationScriptMap.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationScriptMap.ts)

### `ar.json`

Purpose:
- stop-level AR metadata
- historical era tags
- overlay copy
- model readiness text

### `business-profile.json`

Purpose:
- Google Business Profile descriptions
- category recommendations
- service/product text
- local outreach snippets

This should let you generate per-city versions of:

- [docs/local-seo-growth-kit.md](/Users/nia/Documents/GitHub/philly-tours/docs/local-seo-growth-kit.md)

## Build Model

Do not create one repo per city.

Use one repo and one build flag:

```text
CITY=philly
CITY=baltimore
CITY=dc
```

### Desired Flow

1. `build-city-data.mjs`
   - loads `cities/<id>/...`
   - transforms city pack into runtime data files

2. `build-city-web-dist.mjs`
   - renders the webapp for the target city
   - writes SEO pages, sitemap, robots, JSON-LD, legal pages

3. mobile runtime
   - reads the chosen city pack at build time
   - sets names, copy, route defaults, and assets

### Environment Variables

Suggested:

```text
CITY=philly
CITY_NAME=Philadelphia
SITE_ORIGIN=https://philly-tours.com
SITE_BRAND=Philly Tours
```

The scripts should prefer `CITY`, then derive the rest from `cities/<id>/city.json`.

## Migration Plan

Do this in phases.

### Phase 1: Define the Contract

Deliverables:

- create `cities/philly/`
- define `city.json`, `branding.json`, `seo.json`
- decide final field names
- add a validator script

Exit condition:
- the schema is stable enough that a second city could fill it out

### Phase 2: Move Philly Into the City Pack

Deliverables:

- move Philly SEO copy into `cities/philly/seo.json`
- move branding copy into `cities/philly/branding.json`
- move tours into `cities/philly/tours.json`
- move narration into `cities/philly/narration.json`

Exit condition:
- Philly still builds from the new city files with no visual regression

### Phase 3: Refactor the Build Scripts

Refactor:

- [scripts/build-webapp-data.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/build-webapp-data.mjs)
- [scripts/build-webapp-dist.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/build-webapp-dist.mjs)
- [scripts/generate-product-videos.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/generate-product-videos.mjs)

Goal:
- no hardcoded Philly assumptions in the build path

Exit condition:
- `CITY=philly` fully works

### Phase 4: Add City Runtime Adapters

Introduce small runtime helpers like:

- `getActiveCity()`
- `getCityBranding()`
- `getCitySeo()`
- `getCityTours()`

This is better than importing city constants directly into random files.

### Phase 5: Launch Second City

Only after Philly builds cleanly from config should you add:

- `cities/baltimore/` or `cities/dc/`

## What Must Stay Centralized

Centralize:

- payments
- auth
- code architecture
- analytics model
- AR/runtime behavior
- legal templates
- content schema
- product video format
- store submission workflow

Do not let each city drift into its own code style.

## What Should Be Localized Per City

Localize:

- tour lineup
- route order
- stop facts
- neighborhood framing
- city search language
- hero imagery
- Google Business Profile copy
- local backlinks and partner lists
- social launch copy

## Recommended Second City

For this product shape, the best candidates are:

- Baltimore
- Washington, DC
- Atlanta
- Chicago
- Detroit
- New Orleans
- Memphis

### Best Template-Proving Choice

Choose one of:

- Baltimore
- Washington, DC

Why:

- deep Black history
- strong neighborhood identity
- walkable/culturally dense corridors
- tourism and civic interest
- similar enough to Philly to reuse the product model
- different enough to prove this is not a one-city trick

## Launch Criteria For Any New City

Do not ship a new city unless it has:

- at least 5 launch-ready tours
- at least 40 validated stops
- route hero images
- search thumbnail
- homepage copy
- local SEO pack
- product video
- social launch assets
- backlink target list
- reviewed narration

## Main Risks

### 1. Codebase fragmentation

Avoid one-off conditions like:

- `if city === "philly"`
- `if city === "baltimore"`

Use city config instead.

### 2. Weak cultural specificity

The danger is making every city feel like "Philly in different clothes."

To avoid that:

- make route categories repeatable
- make the story details city-specific
- keep local review in the loop

### 3. Content bottleneck

The hardest part is not code.

It is:

- research
- stop validation
- narration quality
- image sourcing
- local authenticity

The content pipeline is the real product engine.

## Immediate Next Actions

1. Create `cities/philly/` and move only SEO + branding first
2. Add a `validate-city-pack.mjs` script
3. Refactor the web build scripts to read from the city folder
4. Move tours and narration second
5. Pick Baltimore or DC as the first template-proof city

## Recommendation

Do not duplicate the repo.

Turn this repo into a multi-city engine, then launch one second city from the same foundation.

That is the cleanest path to a network product instead of a stack of hard-to-maintain clones.
