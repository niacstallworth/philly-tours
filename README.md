# Philly AR Tours

Philly AR Tours is an Expo/React Native mobile app for location-based Philadelphia tours with a native AR bridge, local payment/IAP testing, and shared tour/session infrastructure.

This README is a current project-status document so reviewers can quickly see what is real, what is being built now, and what is still ahead.

## Current Status

### Working now
- Expo/React Native TypeScript app structure is in place and runs on iOS and Android dev builds.
- `ios/` and `android/` native projects exist in this repo.
- App icon, onboarding flow, session persistence, and tabbed app shell are implemented.
- Local tour dataset exists in `src/data/tours.ts`.
- Home, Map, AR, Progress, and Profile screens exist and render live app state.
- Local payments/sync backend exists in `server/sync-server.js`.
- SQLite-backed orders, entitlements, receipts, idempotency, and provider event tables exist.
- Stripe checkout session creation works in local development.
- Apple and Google IAP credential plumbing exists in backend config/status checks.
- Socket.IO sync server and room presence tracking exist.
- Geofence/location watch patterns exist and are wired into the app flow.

### In progress
- Stripe checkout return-to-app flow on iOS dev build.
- Stripe webhook testing flow for local status transitions.
- AR tab integration with real native session behavior.
- Better in-app debug visibility for checkout/webhook results.

### Not complete yet
- Real AR rendering with placed 3D content at stops.
- Production-grade tour content management/CMS workflow.
- Audio narration pipeline and player experience.
- Production authentication, badges, and cross-device progress sync.
- Full release validation for Apple/Google purchase flows.
- Web app parity with the mobile experience.

## Architecture

### Mobile app
- Entry: `App.tsx`
- Navigation shell: `src/navigation/MainTabs.tsx`
- Screens:
  - `src/screens/HomeScreen.tsx`
  - `src/screens/MapScreen.tsx`
  - `src/screens/ARScreen.tsx`
  - `src/screens/ProgressScreen.tsx`
  - `src/screens/ProfileScreen.tsx`
  - `src/screens/OnboardingScreen.tsx`

### Payments and sync backend
- Local server: `server/sync-server.js`
- Storage: SQLite database at `server/payments.db`
- Key endpoints:
  - `GET /health`
  - `GET /api/config/status`
  - `GET /api/entitlements`
  - `GET /api/orders`
  - `GET /api/provider-events`
  - `POST /api/payments/checkout-session`
  - `POST /api/payments/intent`
  - `POST /api/iap/verify`
  - `POST /api/stripe/webhook`

### Native AR bridge
- JS/native bridge access:
  - `src/services/native-ar/nativeBridge.ts`
  - `src/services/native-ar/iosArkitAdapter.ts`
  - `src/services/native-ar/androidArcoreAdapter.ts`
- Native templates:
  - `native-bridge-templates/ios`
  - `native-bridge-templates/android`

## Honest Status By Layer

| Layer | Status |
| --- | --- |
| Project structure and native projects | Real and usable |
| Local tour data and app shell | Real and usable |
| Socket.IO sync server | Real and usable |
| SQLite payment/entitlement backend | Real and usable |
| Stripe checkout session creation | Real and usable in local dev |
| Stripe webhook/status transition testing | In progress |
| Geofence/location watch logic | Partially implemented |
| Map experience with production tour content | In progress |
| Native AR rendering | Stub/partial |
| Audio narration system | Not built |
| Authentication and badges | Partial/local only |
| Web app | Placeholder only |

## What Reviewers Should Know

- This is no longer just a raw scaffold.
- The repo now contains a real iOS project, a real Android project, and a functioning local backend with persistent payment/order data.
- The strongest production-adjacent pieces today are:
  - app structure
  - local backend
  - payments/IAP credential plumbing
  - sync/session infrastructure
- The hardest remaining product work is still ahead:
  - real AR experience
  - tour content system
  - audio
  - polished production purchase flows

## Local Development

### Prerequisites
- Node via `nvm`
- Xcode + iOS Simulator
- CocoaPods available in PATH
- Stripe CLI for webhook testing

### Environment
Use `.env` in the repo root. Example values are in `.env.example`.

Important variables:
- `EXPO_PUBLIC_SYNC_SERVER_URL`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `EXPO_PUBLIC_IAP_PLUS_IOS`
- `EXPO_PUBLIC_IAP_PRO_IOS`
- `EXPO_PUBLIC_IAP_PLUS_ANDROID`
- `EXPO_PUBLIC_IAP_PRO_ANDROID`
- `APPLE_IAP_BUNDLE_ID`
- `APPLE_IAP_ISSUER_ID`
- `APPLE_IAP_KEY_ID`
- `APPLE_IAP_PRIVATE_KEY`
- `APPLE_IAP_ENV`
- `GOOGLE_PLAY_PACKAGE_NAME`
- `GOOGLE_SERVICE_ACCOUNT_JSON` or `GOOGLE_SERVICE_ACCOUNT_FILE`

### Run backend
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run sync-server
```

### Run Metro
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npx expo start -c --port 8081
```

### Run iOS dev build
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export RUBYOPT='-rlogger'
npx expo run:ios --port 8081
```

### Run Stripe webhook forwarding
```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run stripe:listen
```

## Current Focus

Active build focus:
- reliable iOS checkout return flow
- webhook-driven Stripe status updates
- improving AR tab from scaffold to working native behavior
- moving from local/static tour data toward a real content layer

## Planning Docs

- AR production plan: `docs/ar-production-sheet.md`
- AR build tracker: `docs/ar-build-tracker.csv`
- AR asset catalog source: `docs/ar-asset-catalog.csv`

## AR Asset Generation

The AR asset catalog now supports `fal`-driven concept image generation for planned AR stops.

Catalog fields used by the generator:
- `imageProvider`
- `falModel`
- `falPrompt`
- `falImageSize`
- `replicateModel`
- `replicatePrompt`
- `replicateAspectRatio`
- `replicateOutputFormat`
- `stabilityEndpoint`
- `stabilityPrompt`
- `stabilityAspectRatio`
- `stabilityOutputFormat`
- `generatedImagePath`

### Import catalog changes
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:catalog:import
```

### Generate AR concept images with fal
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:fal:generate
```

Useful options:
- `npm run ar:fal:generate -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church`
- `npm run ar:fal:generate -- --limit 3`
- `npm run ar:fal:generate -- --force`

Notes:
- `FAL_KEY` must be present in `.env` or the shell environment.
- This generator is local/server-side only. Do not expose `FAL_KEY` in mobile client code.
- Generated files are written into `assets/generated/ar-references/` and written back into the catalog CSV.

### Generate routed AR concept images
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:images:generate
```

Useful options:
- `npm run ar:images:generate -- --limit 5`
- `npm run ar:images:generate -- --provider stability`
- `npm run ar:images:generate -- --provider replicate`
- `npm run ar:images:generate -- --provider fal`
- `npm run ar:images:generate -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church`
- `npm run ar:images:generate -- --force`

Routing defaults:
- `stability`: `before_after_overlay`, `object_on_plinth`, `animated_diagram`
- `replicate`: `portal_reconstruction`, `historical_figure_presence`
- `fal`: `floating_story_card`, `route_ghost`

Notes:
- Explicit `imageProvider` on a catalog row overrides type-based routing.

### Generate AR concept images with Stability
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:stability:generate
```

Useful options:
- `npm run ar:stability:generate -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church`
- `npm run ar:stability:generate -- --limit 3`
- `npm run ar:stability:generate -- --force`

Notes:
- `STABILITY_API_KEY` must be present in `.env` or the shell environment.
- Current implementation uses the official Stability `v2beta/stable-image/generate/{core|ultra}` API.
- Generated files are written into `assets/generated/ar-references/` and written back into the catalog CSV.

### Generate AR concept images with Replicate
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:replicate:generate
```

Useful options:
- `npm run ar:replicate:generate -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church`
- `npm run ar:replicate:generate -- --limit 3`
- `npm run ar:replicate:generate -- --force`

Notes:
- `REPLICATE_API_TOKEN` must be present in `.env` or the shell environment.
- Current implementation uses the official Replicate model prediction API with `Prefer: wait`.
- Default model is `black-forest-labs/flux-pro`.
- Generated files are written into `assets/generated/ar-references/` and written back into the catalog CSV.

## Files To Review First

- `App.tsx`
- `server/sync-server.js`
- `src/data/tours.ts`
- `src/screens/ProfileScreen.tsx`
- `src/screens/MapScreen.tsx`
- `src/screens/ARScreen.tsx`
- `src/services/payments.ts`
- `src/services/native-ar/nativeBridge.ts`
