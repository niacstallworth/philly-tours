# Multi-City Refactor Checklist

Use this as the working checklist for converting Philly Tours into a reusable city platform.

Reference plan:
- [docs/multi-city-platform-plan.md](/Users/nia/Documents/GitHub/philly-tours/docs/multi-city-platform-plan.md)

## Success Definition

The repo is ready for city #2 when:

- Philly builds from a city pack instead of hardcoded app copy
- the web build can target a city by config
- the mobile app can target a city by config
- SEO, branding, and runtime defaults come from city-owned files
- adding a second city does not require branching the codebase

## Phase 1: Define The Contract

Goal:
- create the city-pack structure
- define the minimum schema
- add validation

Checklist:

- [x] Write platform architecture plan
- [x] Create `cities/philly/`
- [x] Add `city.json`
- [x] Add `branding.json`
- [x] Add `seo.json`
- [x] Add `social.json`
- [x] Add `business-profile.json`
- [x] Add a validator script
- [x] Add an npm command for validation
- [x] Decide final required fields for `tours.json`
- [x] Decide final required fields for `narration.json`
- [x] Decide final required fields for `ar.json`

Exit condition:
- a city pack exists and can be validated from the command line

## Phase 2: Move Philly SEO + Branding Into The City Pack

Goal:
- move non-route copy first

Checklist:

- [x] Move homepage title/description into `cities/philly/seo.json`
- [x] Move catalog title/description into `cities/philly/seo.json`
- [x] Move organization/schema defaults into `cities/philly/seo.json`
- [x] Move hero eyebrow/title/body into `cities/philly/branding.json`
- [x] Move social links into `cities/philly/social.json`
- [x] Move GBP copy into `cities/philly/business-profile.json`
- [x] Refactor web build to read SEO config from the city pack
- [x] Refactor homepage/webapp hero copy to read from the city pack

Exit condition:
- Philly web SEO and branding build from `cities/philly/*`

## Phase 3: Move Philly Tours Into The City Pack

Goal:
- make tour metadata city-owned

Checklist:

- [x] Define `tours.json` schema
- [x] Extract tour-level metadata from [src/data/tours.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/tours.ts)
- [x] Move stop arrays into the city pack
- [x] Move card/hero artwork references into the city pack
- [x] Refactor build/runtime adapters to read `cities/philly/tours.json`
- [x] Keep route order stable after migration

Exit condition:
- Philly tours are loaded from `cities/philly/tours.json`

## Phase 4: Move Narration + AR Metadata

Goal:
- move the deepest city-specific content into city-owned files

Checklist:

- [x] Define `narration.json` schema
- [x] Define `ar.json` schema
- [x] Move Philly stop narration into `cities/philly/narration.json`
- [x] Move Philly AR metadata into `cities/philly/ar.json`
- [x] Refactor narration runtime to read the city pack
- [x] Refactor AR/runtime helpers to read the city pack

Exit condition:
- Philly narration and AR content no longer need hardcoded Philadelphia fallback text in shared logic

## Phase 5: Introduce City Runtime Helpers

Goal:
- centralize how the app reads city config

Checklist:

- [x] Add `src/city-runtime/getActiveCity.ts`
- [x] Add `src/city-runtime/getCityBranding.ts`
- [x] Add `src/city-runtime/getCitySeo.ts`
- [x] Add `src/city-runtime/getCityTours.ts`
- [x] Add `src/city-runtime/getCityNarration.ts`
- [x] Remove direct random imports of city-specific constants where possible

Exit condition:
- shared app code reads city data through adapters instead of city-specific imports

## Phase 6: Add Multi-City Build Flow

Goal:
- make the repo build any supported city from config

Checklist:

- [x] Add `CITY` env support to build scripts
- [x] Create `scripts/build-city-data.mjs`
- [x] Create `scripts/build-city-web-dist.mjs`
- [x] Create `scripts/generate-city-product-videos.mjs`
- [x] Make `webapp:build` city-aware or add `webapp:build:city`
- [x] Make deploy docs city-aware

Exit condition:
- `CITY=philly` builds current Philly output

## Phase 7: Launch City #2

Goal:
- prove this is a platform, not a Philly-only project

Checklist:

- [x] Choose second city
- [x] Create `cities/<city>/` pack
- [ ] Prepare 5+ launch tours
- [ ] Prepare 40+ validated stops
- [ ] Prepare search image, logo, and local hero assets
- [ ] Prepare local SEO kit
- [x] Build and test domain/deploy target
- [x] Export safe single-city production repos for Philly and Baltimore

Exit condition:
- second city launches from the same codebase

## Phase 8: Operationalize The Platform

Goal:
- make the shared repo usable for future city creation and safe repo spin-outs

Checklist:

- [x] Add a generated city runtime registry
- [x] Add a city-pack scaffold command
- [x] Add a city-repo export command
- [x] Block accidental platform deploys
- [x] Move Philly production to a separate single-city repo
- [x] Push Philly and Baltimore into separate private GitHub repos

Exit condition:
- a new city can be scaffolded here and exported into its own locked repo without hand-editing core files

## Recommended Order Of Attack

Do this next, in order:

1. finish Phase 1 schemas
2. refactor web SEO + branding
3. refactor tours
4. refactor narration and AR
5. add city build flags
6. stand up Baltimore or DC

## What Not To Do

- do not fork the repo per city
- do not add city-specific `if/else` logic all over the shared runtime
- do not start 5 cities at once
- do not move tours before the schema is nailed down

## Best Second-City Candidates

Shortlist:

- Baltimore
- Washington, DC
- Atlanta
- Detroit
- Chicago
- New Orleans
- Memphis

Best first proof:

- Baltimore
