# Public Repo Ownership Redaction Plan

This document is for the public `philly-tours` repository.

Goal:

- keep the app and platform code in Git
- remove or privatize the premium tour catalog, narration, AR planning, and sensitive operational data
- leave behind enough sample data for the app to build without exposing the real moat

## What Stays In Git

These areas are primarily product infrastructure and should remain in the public repo:

- `src/`
- `webapp/app.js`
- `webapp/styles.css`
- `App.tsx`
- `scripts/`
- `server/`
- `deploy/`
- `supabase/migrations/`
- `package.json`
- `package-lock.json`
- `app.json`
- `README.md`
- `assets/store/`
- generic placeholder config like `webapp/site-config.js`

Rule:

- code, migrations, and generic scaffolding stay
- real catalog content, premium assets, and sensitive records move out

## What Must Move Out

### 1. Tour Catalog And Route IP

These files expose the real route structure, stop order, titles, descriptions, and media references:

- `src/data/tours.ts`
- `webapp/tours-data.js`

Move to:

- private database tables
- private JSON in secure storage
- authenticated API responses

Public replacement:

- one fake or heavily reduced demo tour

### 2. Narration And Storywriting IP

These files contain the actual storytelling moat:

- `src/data/narrationScriptMap.ts`
- `webapp/narration-data.js`
- `docs/narration-script-catalog.csv`

Move to:

- private CMS
- Supabase private tables
- restricted content repo

Public replacement:

- short placeholder narration entries only

### 3. Audio Library

These files and references expose the premium audio product:

- `assets/audio/`
- `src/data/narrationCatalog.ts`
- `src/data/narrationAudioMap.ts`

Move to:

- private object storage
- signed URLs
- authenticated delivery

Public replacement:

- a few sample audio clips or no real audio at all

### 4. AR Production Planning And Asset Roadmap

These files expose how the premium AR layer is designed and prioritized:

- `src/data/arAssetCatalog.ts`
- `webapp/ar-data.js`
- `docs/ar-asset-catalog.csv`
- `docs/ar-briefs/`
- `docs/ar-scene-manifests/`
- `docs/ar-assets/`
- `assets/models/`

Move to:

- private asset storage
- private planning repo
- internal production workspace

Public replacement:

- one simplified demo AR object

### 5. Sensitive Operational Or Admin Data

These should not live in a public repo:

- `supabase/seed-data/users.json`
- `supabase/seed-data/payment_orders.json`
- `supabase/seed-data/entitlements.json`
- `supabase/seed-data/iap_receipts.json`
- `supabase/seed-data/provider_events.json`
- `supabase/seed-data/idempotency.json`
- `supabase/seed-data/deletion_requests.json`
- `docs/builder-admins.csv`
- `exports/philly-tour-stops-202604102315.csv`
- `exports/tour-address-audit-raw.json`

Move to:

- private operations storage
- local-only seed folders
- internal admin workspace

Public replacement:

- empty templates
- scrubbed examples
- no real user or payment records

## Safest First 5 Changes

### 1. Remove sensitive records first

First pull these out of the public repo:

- `supabase/seed-data/`
- `docs/builder-admins.csv`
- `exports/`

Why first:

- this is the highest privacy and operations risk
- these files are not needed to explain the product publicly

### 2. Replace the live tour catalog with sample data

Privatize:

- `src/data/tours.ts`
- `webapp/tours-data.js`

Replace with:

- one sample route
- fake stop names
- generic coordinates

Why second:

- this is the clearest expression of the business asset

### 3. Pull the narration corpus out of Git

Privatize:

- `src/data/narrationScriptMap.ts`
- `webapp/narration-data.js`
- `docs/narration-script-catalog.csv`

Replace with:

- minimal placeholder narration

Why third:

- the writing voice and historical assembly are premium IP

### 4. Move audio and AR assets to private delivery

Privatize:

- `assets/audio/`
- `assets/models/`
- `src/data/narrationCatalog.ts`
- `src/data/narrationAudioMap.ts`
- `src/data/arAssetCatalog.ts`
- `webapp/ar-data.js`

Replace with:

- demo-only assets or empty manifests

Why fourth:

- this protects the richest media layer without breaking the product architecture

### 5. Pull internal planning docs into a private workspace

Privatize:

- `docs/ar-briefs/`
- `docs/ar-scene-manifests/`
- `docs/ar-assets/`
- `docs/ar-asset-catalog.csv`

Keep in public repo:

- generic technical docs that explain architecture, setup, and deployment

Why fifth:

- these files reveal roadmap, priorities, asset quality targets, and production methods

## Suggested Public Repo Shape After Cleanup

Keep the public repo as:

- app code
- backend code
- schema and migrations
- deployment scripts
- sanitized demo content
- generic screenshots and branding

Move the real business moat into:

- private content storage
- private admin data storage
- private asset buckets
- private planning docs

## Minimal Demo Dataset Target

The public repo should ideally end up with:

- `1` demo tour
- `3-5` fake stops
- short placeholder narration
- no real admin or payment seed data
- no full premium audio library
- no full AR production catalog

## Execution Order

1. Delete or relocate `supabase/seed-data`, `exports`, and `docs/builder-admins.csv`
2. Replace `src/data/tours.ts` and `webapp/tours-data.js` with a demo catalog
3. Replace `src/data/narrationScriptMap.ts` and `webapp/narration-data.js` with placeholder copy
4. Remove `assets/audio`, `assets/models`, and related runtime maps from public Git
5. Remove `docs/ar-briefs`, `docs/ar-scene-manifests`, and `docs/ar-asset-catalog.csv`

## Notes

- The public repo currently contains real product IP, not just software infrastructure.
- The biggest business risk is not someone copying React code. It is someone learning the exact route catalog, narration style, audio footprint, AR roadmap, and operational structure.
- If the repo must stay public, the safest posture is "public engine, private museum."
