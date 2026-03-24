# Philly Tours

Philly Tours is a React Native + Expo app for story-first Philadelphia touring with narrated stops, selective native AR moments on iOS, hosted checkout, and an internal builder workflow for tuning and review.

## Current Status

- The iOS app launches and runs on a physical iPad.
- Native AR is working on device: models render in space through the custom iOS bridge.
- The current shipped shell is Home + Scavenger Hunt + Profile, with native AR launched through the iOS bridge rather than a dedicated React screen.
- Builder mode is gated by an email/password CSV.
- Drive narration is manual only now. It no longer auto-plays on arrival.
- Public page button colors are pinned by surface:
  - Login: `#007eff`
  - Home: `#007eff`
  - Map: `#a835f2`
  - Tourist AR: `#89f336`
  - Drive: `#007eff`
  - Profile: `#ffbf00`
- Builder has its own theme setting for internal UI testing.
- The AR asset pipeline now covers:
  - catalog
  - job-pack generation
  - concept-image runs
  - manual rough-mesh handoff
  - mesh ingest/runtime staging
  - device review import
  - approval/dashboard artifacts

## What Is In The App

### Tourist flow

- [OnboardingScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/OnboardingScreen.tsx)
- [HomeScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/HomeScreen.tsx)
- [ScavengerHuntScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/ScavengerHuntScreen.tsx)
- [DriveScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/DriveScreen.tsx)
- [ProfileScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/ProfileScreen.tsx)

### Builder flow

- builder-only login gate in [builderAccess.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/builderAccess.ts)
- builder theme controls in [ProfileScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/ProfileScreen.tsx)
- native AR session implementation in [PhillyNativeAR.swift](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours/PhillyNativeAR.swift)

### App shell

- Entry: [App.tsx](/Users/nia/Documents/GitHub/philly-tours/App.tsx)
- Tab shell: [MainTabs.tsx](/Users/nia/Documents/GitHub/philly-tours/src/navigation/MainTabs.tsx)
- Shared button/theme system: [appTheme.tsx](/Users/nia/Documents/GitHub/philly-tours/src/theme/appTheme.tsx)
- Shared UI primitives: [Primitives.tsx](/Users/nia/Documents/GitHub/philly-tours/src/components/ui/Primitives.tsx)

## Quick Start

### Install

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm install
```

### Run Metro for the iPad dev client

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run start:metro:dev-client
```

### Open the iOS workspace

```bash
open /Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours.xcworkspace
```

Run from Xcode on device, or try:

```bash
npm run ios:device
```

Important:

- Open the `.xcworkspace`, not the `.xcodeproj`.
- The app needs local network access on iPad so it can reach Metro.
- If AR launches but placement drifts, that is a tuning problem, not a launch/build problem.

### Run the local backend

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run sync-server
```

The payment/profile surface expects the sync server at the URL configured by `EXPO_PUBLIC_SYNC_SERVER_URL`.

## Builder Access

Builder mode is controlled by:

- [builder-admins.csv](/Users/nia/Documents/GitHub/philly-tours/docs/builder-admins.csv)
- [builderAdminCredentials.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/builderAdminCredentials.ts)

After editing the CSV, regenerate the runtime map:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run builder:admins:map
```

Important:

- This is a local client-side gate for internal use.
- It is not production-grade server auth.

## Narration Workflow

### Source of truth

- Script catalog: [narration-script-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/narration-script-catalog.csv)
- Generated script map: [narrationScriptMap.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationScriptMap.ts)
- Generated audio/runtime catalog: [narrationCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationCatalog.ts)
- Narration controller: [narration.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/narration.ts)

### Regenerate script/runtime data

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run narration:scripts:map
npm run narration:map
```

### Regenerate one stop's Polly audio

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run narration:polly -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --variant walk --force
npm run narration:map
```

### Builder-side audio check

Builder-mode audio verification currently lives in the shared touring surfaces and narration tools:

- `Play Stop Audio` plays the bundled/recorded audio
- `Play Script Voice` speaks the current script text

That makes it easy to catch mismatches between the script catalog and the shipped MP3.

## AR On-Device Loop

The app now supports a builder-side iPad validation loop:

- prepare AR
- launch AR
- mark stability
- save pass notes
- copy tuning snapshot
- copy review/approval closeout

Key files:

- [PhillyNativeAR.swift](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours/PhillyNativeAR.swift)
- [arAssetCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/arAssetCatalog.ts)
- [generate-ar-review-dashboard.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/generate-ar-review-dashboard.mjs)

### Review dashboard

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:reviews:dashboard
```

Generated outputs live under:

- [generated/ar-runtime-staging/device-reviews](/Users/nia/Documents/GitHub/philly-tours/generated/ar-runtime-staging/device-reviews)

Useful artifacts:

- [dashboard.md](/Users/nia/Documents/GitHub/philly-tours/generated/ar-runtime-staging/device-reviews/dashboard.md)
- [next-actions.md](/Users/nia/Documents/GitHub/philly-tours/generated/ar-runtime-staging/device-reviews/next-actions.md)
- [next-device-pass.md](/Users/nia/Documents/GitHub/philly-tours/generated/ar-runtime-staging/device-reviews/next-device-pass.md)

### Import a full AR closeout from the clipboard

```bash
cd /Users/nia/Documents/GitHub/philly-tours
pbpaste | npm run ar:closeout:import -- --dry-run
pbpaste | npm run ar:closeout:import
```

### Apply a copied tuning snapshot directly

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:tuning:apply -- --snapshot '<paste snapshot here>' --dry-run
```

## AR Asset Pipeline

### Source of truth

- Asset catalog: [ar-asset-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/ar-asset-catalog.csv)
- Generated runtime catalog: [arAssetCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/arAssetCatalog.ts)
- Scene manifests: [docs/ar-scene-manifests](/Users/nia/Documents/GitHub/philly-tours/docs/ar-scene-manifests)
- Job packs: [docs/ar-job-packs](/Users/nia/Documents/GitHub/philly-tours/docs/ar-job-packs)

### Generate job packs

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:jobs:generate
```

### Run concept-image jobs

Dry-run:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:jobs:run -- --dry-run --limit 1 --stage concept_image --provider replicate --force
```

Real runs require API credentials from [.env.example](/Users/nia/Documents/GitHub/philly-tours/.env.example).

### Rough mesh workflow

`rough_mesh` currently defaults to a manual handoff workspace:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:jobs:run -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --stage rough_mesh
```

That creates a reviewed drop zone under:

- [generated/ar](/Users/nia/Documents/GitHub/philly-tours/generated/ar)

### Ingest cleaned mesh exports

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:mesh:ingest -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --dry-run
```

### Stage runtime assets

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:runtime:stage -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --source-dir /absolute/path/to/reviewed-assets --dry-run
```

### Sync runtime readiness

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run ar:catalog:sync-runtime
```

## Payment / Sync Backend

The local sync server is:

- [server/sync-server.js](/Users/nia/Documents/GitHub/philly-tours/server/sync-server.js)

Run it with:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run sync-server
```

Stripe webhook forwarding:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run stripe:listen
```

Important:

- Development builds can read `EXPO_PUBLIC_SYNC_SERVER_URL` from local `.env`.
- EAS preview/release builds do not get your local `.env`; put required public values in [eas.json](/Users/nia/Documents/GitHub/philly-tours/eas.json) or EAS secrets/env config.
- If a release build ever shows `http://localhost:4000`, that build was produced without the preview env baked in.

## EAS Builds

The repo is now set up for internal iOS preview builds through [eas.json](/Users/nia/Documents/GitHub/philly-tours/eas.json).

Typical commands:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npx eas-cli build --platform ios --profile preview
```

```bash
cd /Users/nia/Documents/GitHub/philly-tours
npx eas-cli build --platform android --profile preview
```

Notes:

- `preview` is the internal-distribution profile for device installs.
- `development` is the dev-client profile.
- The current preview profile bakes in `EXPO_PUBLIC_SYNC_SERVER_URL` and `EXPO_PUBLIC_APP_SCHEME`.

## Environment

Main environment examples live in:

- [.env.example](/Users/nia/Documents/GitHub/philly-tours/.env.example)

Not every key is needed for every workflow.

Typical groups:

- Expo/public app config
- Replicate / FAL / Stability image generation
- Anthropic text generation
- AWS Polly narration generation
- Stripe checkout + webhook handling

## Reality Check

What is solid right now:

- public app shell
- builder login gate
- page-aware button theming
- physical iPad AR launch
- hosted checkout and backend entitlement sync
- EAS iOS internal preview builds
- builder review/tuning workflow
- narration script vs audio comparison
- AR asset pipeline scaffolding

What still needs continued tuning:

- AR drift and placement refinement
- final asset quality stop by stop
- production-grade admin auth
- broader device polish beyond the current iPad flow

## Useful Paths

- App shell: [App.tsx](/Users/nia/Documents/GitHub/philly-tours/App.tsx)
- Tabs: [MainTabs.tsx](/Users/nia/Documents/GitHub/philly-tours/src/navigation/MainTabs.tsx)
- Theme system: [appTheme.tsx](/Users/nia/Documents/GitHub/philly-tours/src/theme/appTheme.tsx)
- iOS native AR: [PhillyNativeAR.swift](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours/PhillyNativeAR.swift)
- Drive flow: [DriveScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/DriveScreen.tsx)
- Narration service: [narration.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/narration.ts)
- Builder access: [builderAccess.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/builderAccess.ts)
- Payments + checkout: [payments.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/payments.ts)
- Sync backend: [sync-server.js](/Users/nia/Documents/GitHub/philly-tours/server/sync-server.js)
- AR job runner: [run-ar-job-packs.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/run-ar-job-packs.mjs)
- Review dashboard: [generate-ar-review-dashboard.mjs](/Users/nia/Documents/GitHub/philly-tours/scripts/generate-ar-review-dashboard.mjs)
