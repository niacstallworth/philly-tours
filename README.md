# Philly Tours

Philly Tours is an Expo / React Native app for Philadelphia tour storytelling, hosted checkout, narration, and selective native AR on iOS.

## Current App Shape

- Main shell: Home, Scavenger Hunt, and Profile
- Native iOS AR bridge: `ios/PhillyARTours/PhillyNativeAR.swift`
- Hosted payments + entitlement sync: `src/services/payments.ts` and `server/sync-server.js`
- Builder access gate: `src/services/builderAccess.ts`
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

## Local Development

Install dependencies:

```bash
npm install
```

Start Metro for the dev client:

```bash
npm run start:metro:dev-client
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

## Environment

Example environment values live in `.env.example`.

Important groups:

- Expo public app config
- Stripe checkout + webhooks
- Apple / Google purchase verification
- AWS Polly narration generation
- Image generation providers for AR asset work

## Payments / Backend

The local sync server lives in `server/sync-server.js`.

Stripe webhook forwarding:

```bash
npm run stripe:listen
```

Development builds can read `EXPO_PUBLIC_SYNC_SERVER_URL` from local `.env`.

EAS preview / release builds do not get your local `.env`, so required public values must be set in `eas.json` or in EAS environment configuration.

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

Builder mode is driven by:

- `docs/builder-admins.csv`
- `src/data/builderAdminCredentials.ts`

Regenerate credentials after editing the CSV:

```bash
npm run builder:admins:map
```

This is an internal client-side gate, not production-grade server auth.

Made with ❤️ for Philadelphia storytelling. Questions or want to collaborate? Open an issue!
