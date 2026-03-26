# Philly Tours

Philly Tours is a premium Philadelphia cultural touring platform built for beautiful city driving, layered narration, and selective native AR handoff when a stop deserves more than audio alone.

## Current App Shape

- Premium drive-first touring posture for Philadelphia neighborhoods, corridors, and legacy routes
- Main shell: Home, Scavenger Hunt, and Profile
- Native iOS AR bridge: `ios/PhillyARTours/PhillyNativeAR.swift`
- Meta glasses companion scaffolding: `src/services/wearables.ts`, `src/services/companion.ts`, `src/screens/CompanionSetupScreen.tsx`
- Hosted payments + entitlement sync: `src/services/payments.ts` and `server/sync-server.js`
- Server-issued session auth: `src/services/auth.ts` and `server/sync-server.js`
- Shared theming and UI primitives: `src/theme/appTheme.tsx` and `src/components/ui/Primitives.tsx`

## Key Files

- App entry: `App.tsx`
- Tabs: `src/navigation/MainTabs.tsx`
- Home: `src/screens/HomeScreen.tsx`
- Profile: `src/screens/ProfileScreen.tsx`
- Scavenger Hunt: `src/screens/ScavengerHuntScreen.tsx`
- Drive: `src/screens/DriveScreen.tsx`
- Native AR: `ios/PhillyARTours/PhillyNativeAR.swift`
- Sync backend: `server/sync-server.js`
- EAS config: `eas.json`

## Product Positioning

Philly Tours is not just a walking-tour app. The product direction is a luxury cultural driving companion for Philadelphia:

- drive scenic city routes with premium narration
- hear Black legacy, innovation, and place-based storytelling in motion
- stay in the car when the route itself is the experience
- step out when AR, architecture, or site-specific context matters

This is especially strong for:

- luxury and near-luxury drivers
- visitors who want an elegant Philadelphia experience
- culturally curious locals
- Black heritage, innovation, and architecture routes

Supporting docs:

- `docs/vehicle-platform-plan.md`
- `docs/product-direction.md`
- `docs/drive-mode-positioning.md`

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

## Environment

Example environment values live in `.env.example`.

Important groups:

- Expo public app config
- Server auth + builder/admin accounts
- Stripe checkout + webhooks
- Apple / Google purchase verification
- AWS Polly narration generation
- Image generation providers for AR asset work

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

For local backend work, keep server-only secrets in `.env.server.local` or `.env.server`.
The sync server loads those before `.env`, so client-safe `EXPO_PUBLIC_*` values can stay in `.env` without mixing in private server credentials.

EAS preview / release builds do not get your local `.env`, so required public values must be set in `eas.json` or in EAS environment configuration.

Cloudflare-secured production auth now expects:

- `EXPO_PUBLIC_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_WEB_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`

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
- `scripts/generate-ar-review-dashboard.mjs`

Common commands:

```bash
npm run ar:jobs:generate
npm run ar:reviews:dashboard
npm run ar:catalog:sync-runtime
```

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
