# Philly Tours

Philly Tours is a premium Philadelphia cultural touring platform built for beautiful city movement, layered narration, live compass guidance, selective native AR handoff, and lightweight glasses companion experiences when a stop deserves more than audio alone.

The platform now has two aligned faces:

- a cinematic web companion at `https://api.philly-tours.com`
- a native iOS / Android app with tour pages, route collections, live Compass guidance, scavenger hunts, gamified progress, and AR/glasses handoff surfaces

The next platform extension is spatial computing:

- iPhone remains the route, narration, Compass, and AR handoff companion
- Meta and other glasses remain lightweight audio, notification, and future overlay hardware
- Apple Vision Pro is the premium passenger, parked, and post-drive immersive layer

## Current App Shape

- Premium city-route posture for Philadelphia neighborhoods, corridors, and legacy routes
- Main shell: Home, AR, Board, Settings, and Compass
- Compass tab: route cards select a story path, the live needle points toward the next stop, foreground location watches arrival radius, and the target advances automatically when the user reaches a stop
- Turn-by-turn handoff: `Navigate to Next Point` opens Apple Maps or Google Maps for the current Compass target
- Board tab: persisted scoring, levels, streaks, daily quest progress, and scavenger-hunt-first tour collection
- Tour pages: each tour opens to its own native detail page with route points, narration, map preview, and AR handoff context
- Cinematic mobile web shell with Google / Apple sign-in and production backend auth
- Native Android shell now visually aligned with the webapp across tabs, route cards, hunt surfaces, Compass mode, and companion setup
- Native iOS AR bridge: `ios/PhillyARTours/PhillyNativeAR.swift`
- Glasses companion scaffolding: `src/services/wearables.ts`, `src/services/companion.ts`, `src/services/glassesDisplay.ts`, `src/screens/CompanionSetupScreen.tsx`
- Maps are point-based in the app; route polylines are intentionally suppressed so the product reads as compass points instead of a generic route line.
- visionOS roadmap and positioning: `docs/visionos-integration-plan.md`
- Hosted payments + entitlement sync: `src/services/payments.ts` and `server/sync-server.js`
- Server-issued session auth: `src/services/auth.ts` and `server/sync-server.js`
- Shared theming and UI primitives: `src/theme/appTheme.tsx` and `src/components/ui/Primitives.tsx`

## Key Files

- App entry: `App.tsx`
- Tabs: `src/navigation/MainTabs.tsx`
- Home: `src/screens/HomeScreen.tsx`
- Profile: `src/screens/ProfileScreen.tsx`
- Scavenger Hunt: `src/screens/ScavengerHuntScreen.tsx`
- Compass / drive guidance: `src/screens/DriveScreen.tsx`
- Glasses display abstraction: `src/services/glassesDisplay.ts`
- Live location and heading helpers: `src/services/location.ts`
- Board / gamification: `src/screens/ProgressScreen.tsx`, `src/services/gameProgress.ts`
- Tour detail pages: `src/screens/TourDetailScreen.tsx`
- Native AR: `ios/PhillyARTours/PhillyNativeAR.swift`
- Sync backend: `server/sync-server.js`
- EAS config: `eas.json`

## Product Positioning

Philly Tours is not just a walking-tour app. The product direction is a luxury cultural driving companion for Philadelphia:

- follow scenic city routes with premium narration and a live Compass
- hear Black legacy, innovation, and place-based storytelling in motion
- move through routes shaped by Story Logistics: each next stop is the closest meaningful place that keeps the story, geography, and momentum moving forward
- stay in the car when the route itself is the experience
- step out when AR, architecture, or site-specific context matters
- use Apple Maps or Google Maps for turn-by-turn directions while the app keeps the story target and Compass state

Story Logistics is the Founders route logic:

```txt
next stop = closest meaningful stop that keeps the story moving forward
```

It is more intentional than sorting by distance, popularity, or category alone. Each route balances neighborhood flow, emotional arc, no-backtracking movement, and the Founders Compass north-star direction.

This is especially strong for:

- luxury and near-luxury drivers
- visitors who want an elegant Philadelphia experience
- culturally curious locals
- Black heritage, innovation, and architecture routes
- passengers who want a premium spatial layer on Apple Vision Pro without changing the drive-first core product

Supporting docs:

- `docs/vehicle-platform-plan.md`
- `docs/product-direction.md`
- `docs/app-shape-next-plan.md`
- `docs/drive-mode-positioning.md`
- `docs/visionos-integration-plan.md`
- `docs/google-maps-platform-plan.md`

## Local Development

Install dependencies:

```bash
npm install
```

Start Metro for the dev client:

```bash
npm run start:metro:dev-client
```

Run the static webapp with generated data:

```bash
npm run webapp:serve
```

Build a deployable static bundle:

```bash
npm run webapp:build
```

Build and package an upload-ready release:

```bash
npm run webapp:package
```

Build and deploy the static webapp to Cloudflare Pages:

```bash
npm run deploy
```

Run the local backend:

```bash
npm run sync-server
```

Open the iOS workspace:

```bash
open ios/PhillyARTours.xcworkspace
```

Notes:

- Open the `.xcworkspace`, not the `.xcodeproj`.
- Device builds need local network access if they are expected to talk to Metro or the local sync server.
- If the app shows `localhost:4000` in a release build, that build was created without the correct EAS public env baked in.
- Web camera and geolocation features work on `http://localhost`, but public browser deployments should use `https`.
- Android device builds should avoid root-level server secret files that Metro might try to parse.
- Some generated web assets in `webapp/` are build outputs. Rebuild with `npm run webapp:build` before deploys when data or config changes.

## Environment

Example environment values live in `.env.example`.

Important groups:

- Expo public app config
- Server auth + builder/admin accounts
- Stripe checkout + webhooks
- Apple / Google purchase verification
- Google Maps Platform server access
- Google Maps browser shell rendering
- AWS Polly narration generation
- Image generation providers for AR asset work

For production web deploys, keep the browser Google Maps key out of git and inject it at build time with:

- `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY` for the Google Maps JavaScript API
- `GOOGLE_MAPS_API_KEY` for server-side `Routes`, `Places`, and `Geocoding`

The web build now also reads optional ignored files such as `.env.production.local` and `.env.web.local`, so you can keep the browser key local while still generating a production-ready `web-dist`.

## Git LFS

This repo uses Git LFS for large vendor artifacts, including the XREAL APK under `vendor-sdk/xreal/`.

Install and initialize Git LFS before pulling or pushing branches that include those assets:

```bash
brew install git-lfs
git lfs install
git lfs pull
```

The tracked patterns live in `.gitattributes`. If you add new large binary SDK files, track them with Git LFS before committing.

## Payments / Backend

The local sync server lives in `server/sync-server.js`.

Production-oriented auth notes:

- Every app session is now issued by the backend as a signed JWT.
- Tourist mode still uses lightweight sign-in, but backend requests are authenticated instead of trusting raw client headers.
- Builder/admin access is configured from `BUILDER_ADMIN_ACCOUNTS_JSON`, not from bundled client credentials.
- Legacy `ADMIN_API_KEY` support is optional and should stay disabled in production.

Deployment docs:

- `docs/server-deployment.md`
- `docs/webapp-deployment.md`
- `docs/production-launch-checklist.md`
- `docs/cloudflare-turnstile-and-api-launch.md`
- `docs/meta-wearables-companion-plan.md`
- `deploy/sync-server.env.example`
- `deploy/philly-tours-sync.service.example`
- `deploy/Caddyfile.api.example`
- `deploy/nginx-api.philly-tours.conf.example`
Stripe webhook forwarding:

```bash
npm run stripe:listen
```

Development builds can read `EXPO_PUBLIC_SYNC_SERVER_URL` from local `.env`.

For local backend work, keep server-only secrets in `server.local.env` or `.env.server`.
The sync server and webapp data builder load those before `.env`, so client-safe `EXPO_PUBLIC_*` values can stay in `.env` without mixing in private server credentials.

Do not keep real backend secrets in root-level Expo-facing env filenames such as `.env.server.local` when running native Android builds. Metro can try to parse unexpected root files during bundling.

EAS preview / release builds do not get your local `.env`, so required public values must be set in `eas.json` or in EAS environment configuration.

Cloudflare-secured production auth now expects:

- `EXPO_PUBLIC_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_WEB_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_IOS_APP_STORE_URL=https://apps.apple.com/...`
- `EXPO_PUBLIC_ANDROID_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=...`
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`

On native Android, the current onboarding flow bypasses the embedded Cloudflare browser challenge and uses the app session flow directly. The browser/web shell still keeps Cloudflare in front of provider sign-in.

## Android Device Runs

The repo already contains a native Android project at `android/`.

Typical device run flow from this Mac:

```bash
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export PATH="$ANDROID_HOME/platform-tools:$PATH"
npx expo run:android
```

Useful checks:

```bash
adb devices -l
./node_modules/.bin/tsc --noEmit
```

If the Android app should use production payments and auth, point `EXPO_PUBLIC_SYNC_SERVER_URL` at `https://api.philly-tours.com` and use the live publishable Stripe key in local `.env`.

## Meta Wearables DAT iOS Setup

The Meta iOS SDK is wired into the Xcode project via Swift Package Manager, but pairing will stay unavailable until the iOS target has real DAT project values.

Current required `MWDAT` values:

- `MetaAppID`
- `ClientToken`
- `AppLinkURLScheme`

In this repo they are currently exposed as iOS target build settings:

- `META_WEARABLES_APP_ID`
- `META_WEARABLES_CLIENT_TOKEN`
- `META_WEARABLES_APP_LINK_URL_SCHEME`

The app reads those into `ios/PhillyARTours/Info.plist` under `MWDAT`. Replace the placeholder values in the Xcode target before testing Meta glasses registration on device.
The Apple Team ID should come from Xcode signing for the app target.

Important:

- These are native iOS build settings, not `EXPO_PUBLIC_*` values.
- Set them locally in Xcode for your personal build environment. Do not commit real Meta app credentials to `project.pbxproj`.
- The current companion setup screen will now explain which Meta DAT values are still placeholders.
- The real Meta project credentials should come from the Wearables Developer Center, not from the app bundle or backend env.

## Meta Wearables DAT Android Setup

Android now has a safe opt-in DAT wiring path.

By default, the Android build stays in manual Meta glasses mode:

- pair glasses in Android Bluetooth settings
- route narration through the phone's active audio output
- use the phone for route control and AR handoff

To enable native Android DAT registration, set the following before building:

- `android/gradle.properties`
  - `metaWearablesDatEnabled=true`
  - `metaWearablesApplicationId=<your Meta Wearables app id>`
- local Android credentials
  - `GITHUB_TOKEN` in your shell, or
  - `github_token=<token>` in `android/local.properties`

The DAT Android SDK is fetched from GitHub Packages, so builds will fail if native DAT is enabled without package access.

When DAT is enabled, the Android app exposes:

- native Meta registration / unregistration
- device-state aware companion status in `PhillyNativeWearables`
- the same React Native companion surface used by iOS
## Meta Companion Build Path

The current Meta grant path is a companion-device prototype, not glasses-native AR.

The target Phase 1 demo is:

1. pair Meta glasses from inside the phone app
2. route stop narration through the companion-preferred audio path
3. support a small command set like `next stop`, `pause`, `repeat`, and `open AR on phone`
4. deep-link into the correct phone AR-ready stop when richer visuals are needed

Primary planning doc:

- `docs/meta-wearables-companion-plan.md`

That plan now tracks what is already scaffolded in the repo and what still needs to be completed for a credible grant demo.
## EAS Builds

The project is configured for internal preview builds in `eas.json`.

iOS preview build:

```bash
npx eas-cli build --platform ios --profile preview
```

Android preview build:

```bash
npx eas-cli build --platform android --profile preview
```

Current profiles:

- `development`: dev client
- `preview`: internal distribution
- `production`: release/profile for store delivery

## Narration Workflow

Source files:

- `docs/narration-script-catalog.csv`
- `src/data/narrationScriptMap.ts`
- `src/data/narrationCatalog.ts`
- `src/services/narration.ts`

Common commands:

```bash
npm run narration:scripts:map
npm run narration:map
```

Generate one Polly stop:

```bash
npm run narration:polly -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --variant walk --force
npm run narration:map
```

## AR Asset Workflow

Source files:

- `docs/ar-asset-catalog.csv`
- `src/data/arAssetCatalog.ts`
- `docs/ar-scene-manifests/`
- `docs/ar-briefs/`
- `docs/ar-job-packs/`
- `scripts/generate-ar-review-dashboard.mjs`

Common commands:

```bash
npm run ar:jobs:generate
npm run ar:reviews:dashboard
npm run ar:catalog:sync-runtime
```

The curated AR production set currently has 8 priority moments:

1. Lewis Latimer Light Bulb Exhibit
2. Garrett Morgan Traffic Signal
3. Dr. Charles Drew Blood Bank
4. Mercy-Douglass Nurse Training
5. Barbara Bates Center
6. Joe Frazier's Gym / Cloverlay
7. Allen Iverson's Hampton Park Courts
8. Sonny Hill League @ Tustin

Runtime AR expects iOS `.usdz` assets and Android/Web `.glb` assets. Keep paths stable once referenced in `src/data/arAssetCatalog.ts`.

## Builder Access

Builder/admin credentials are server-side only. Source and generation flow:

- `docs/builder-admins.csv`
- `scripts/generate-builder-admin-credentials.mjs`
- `generated/builder-admin-accounts.json`

Generate hashed account records after editing the CSV:

```bash
npm run builder:admins:map
```

Then copy the printed JSON into your server environment as `BUILDER_ADMIN_ACCOUNTS_JSON` and set a strong `AUTH_JWT_SECRET`.

Do not commit real builder/admin credentials to the repo.

Questions or want to collaborate? Open an issue.
