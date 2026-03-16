# Philly AR Tours

Philly AR Tours is a React Native / Expo mobile app for Philadelphia tour experiences with on-foot AR moments, a phone-side drive companion, and a local payments + sync backend.

This README is the current build-status document for the repo.

## Build Status

### Working now
- iPhone dev build runs from the native `ios/` project.
- Android native project exists and compiles successfully.
- App shell is live with:
  - Onboarding
  - Home
  - Map
  - AR
  - Drive
  - Profile
- Tour dataset is present in [src/data/tours.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/tours.ts).
- Drive session flow is implemented:
  - start route
  - persist session
  - mark arrived
  - advance to next stop
  - hand off to on-foot flow
- Home, Map, and Drive stay in sync with the active route.
- Deep-link handoff works across:
  - Home
  - Map
  - AR
- Local backend is implemented in [server/sync-server.js](/Users/nia/Documents/GitHub/philly-tours/server/sync-server.js).
- Local Stripe checkout session creation works.
- Local entitlements/orders/provider-event persistence works.
- User deletion requests can be recorded in the backend.
- Native iOS AR bridge is present and builds.
- First bundled iOS `.usdz` asset pipeline is in place.
- AR asset catalog, scene manifest, and production brief infrastructure exists.
- Narration flow now exists in app:
  - route-aware narration controls
  - auto narration on arrival
  - speech fallback when recorded files are missing
  - bundled audio files can now be dropped into `assets/audio/`
  - first recorded hero-stop audio batch is bundled
  - AWS Polly batch now adds broad secondary-stop coverage
  - `178` bundled narration audio assets are present in `assets/audio/`
  - runtime audio coverage now resolves for `89` stops
  - narration script catalog now contains `178` canonical rows (`89` drive, `89` walk)
  - AWS Polly generation pipeline is wired
  - Claude-based script generation pipeline is wired
  - narration coverage cues are visible in Home, Drive, Map, and AR
  - Home, Map, and AR can filter stops to `Full audio`
  - Drive can filter routes to `Full audio` only

### Partially working
- Native AR on iPhone requires a real ARKit-capable device for live tuning.
- Android AR bridge/runtime exists as a native bridge layer, but full AR runtime parity is not validated yet.
- Stripe checkout and webhook testing work locally, but production purchase validation is still incomplete.
- Narration still falls back to device speech for stops that do not yet have recorded or generated audio files.
- Local bundled narration assets require regenerating:
  - [src/data/narrationAudioMap.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationAudioMap.ts)
  - [src/data/narrationCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationCatalog.ts)
  with `npm run narration:map`.
- Narration coverage cues are now visible in:
  - Home
  - Drive
  - Map
  - AR
- Audio-first browse filters now exist in:
  - Home
  - Map
  - AR
  - Drive (route-level)

### Not complete yet
- Final recorded narration library and voice pipeline.
- Production-grade AR content for hero stops.
- On-device tuning for the first real 3D hero stops.
- Full Android runtime/device verification.
- Production auth, badges, and cross-device progress sync.
- Production content management workflow / CMS.
- CarPlay / Android Auto app targets.
- visionOS target.

## Product Shape

### Consumer app
Current user-facing experience is built around:
- one tour pack at a time
- elegant map flow
- selective AR moments instead of AR at every stop
- route-to-arrival-to-on-foot handoff
- lightweight premium UI rather than debug/admin surfaces

### Route model
The route flow is now:
1. Start a drive session
2. Navigate to the current stop
3. Arrive or auto-arrive inside trigger radius
4. Trigger narration
5. Continue on foot into map/AR context
6. Advance to next stop

## Architecture

### Mobile app
- Entry: [App.tsx](/Users/nia/Documents/GitHub/philly-tours/App.tsx)
- Tabs: [src/navigation/MainTabs.tsx](/Users/nia/Documents/GitHub/philly-tours/src/navigation/MainTabs.tsx)
- Screens:
  - [src/screens/OnboardingScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/OnboardingScreen.tsx)
  - [src/screens/HomeScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/HomeScreen.tsx)
  - [src/screens/MapScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/MapScreen.tsx)
  - [src/screens/ARScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/ARScreen.tsx)
  - [src/screens/DriveScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/DriveScreen.tsx)
  - [src/screens/ProfileScreen.tsx](/Users/nia/Documents/GitHub/philly-tours/src/screens/ProfileScreen.tsx)

### Route / handoff / narration services
- Drive session model: [src/services/driveMode.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/driveMode.ts)
- Deep links: [src/services/deepLinks.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/deepLinks.ts)
- Narration controller: [src/services/narration.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/narration.ts)
- Shared route hook: [src/hooks/useDriveSession.ts](/Users/nia/Documents/GitHub/philly-tours/src/hooks/useDriveSession.ts)
- Shared narration hook: [src/hooks/useNarration.ts](/Users/nia/Documents/GitHub/philly-tours/src/hooks/useNarration.ts)

### Backend
- Local server: [server/sync-server.js](/Users/nia/Documents/GitHub/philly-tours/server/sync-server.js)
- SQLite DB: `server/payments.db`
- Main endpoints:
  - `GET /health`
  - `GET /api/config/status`
  - `GET /api/entitlements`
  - `GET /api/orders`
  - `GET /api/provider-events`
  - `POST /api/privacy/delete-request`
  - `GET /api/admin/delete-requests`
  - `POST /api/admin/delete-requests/:id/fulfill`
  - `POST /api/payments/checkout-session`
  - `POST /api/payments/intent`
  - `POST /api/iap/verify`
  - `POST /api/stripe/webhook`

### Native AR
- JS bridge:
  - [src/services/native-ar/nativeBridge.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/native-ar/nativeBridge.ts)
  - [src/services/native-ar/iosArkitAdapter.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/native-ar/iosArkitAdapter.ts)
  - [src/services/native-ar/androidArcoreAdapter.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/native-ar/androidArcoreAdapter.ts)
- AR runtime helpers:
  - [src/services/ar.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/ar.ts)
  - [src/services/arManifest.ts](/Users/nia/Documents/GitHub/philly-tours/src/services/arManifest.ts)
- Native iOS files:
  - [ios/PhillyARTours/PhillyNativeAR.swift](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours/PhillyNativeAR.swift)
  - [ios/PhillyARTours/PhillyNativeAR.m](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours/PhillyNativeAR.m)

## Honest Layer Status

| Layer | Status |
| --- | --- |
| iPhone native dev build | Working |
| Android native compile | Working |
| Home / Map / Drive / AR / Profile shell | Working |
| Drive session + handoff flow | Working |
| Narration controls | Working with bundled audio + speech fallback |
| Narration script catalog | Working (`178` canonical rows) |
| Bundled narration audio | Working (`178` files, `89` stop entries wired) |
| Narration coverage cues | Working across Home / Drive / Map / AR |
| Full-audio browse filters | Working across Home / Map / AR / Drive |
| Local Stripe/backend stack | Working in local dev |
| Native iOS AR bridge | Working build path |
| Real on-device AR tuning | Requires physical ARKit device |
| Final 3D AR content library | In progress |
| Recorded narration library | Not complete |
| Production auth / badges | Not complete |
| CMS / content operations | Not complete |
| Car dashboard targets | Not started |
| visionOS target | Not started |

## Local Development

### Prerequisites
- Node via `nvm`
- Xcode + iOS Simulator
- CocoaPods available in PATH
- Java 21 for Android builds
- Android SDK / emulator for Android runtime verification
- Stripe CLI for local webhook testing

### Environment
Use [`.env.example`](/Users/nia/Documents/GitHub/philly-tours/.env.example) as the variable reference.

Important values include:
- `EXPO_PUBLIC_SYNC_SERVER_URL`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `ADMIN_API_KEY`
- Apple IAP fields
- Google Play fields
- AWS Polly / AWS credentials if generating narration through Polly
- `ADMIN_API_KEY`

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

### Run Android build
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export JAVA_HOME=$(/usr/libexec/java_home -v 21)
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
export ANDROID_SDK_ROOT=/opt/homebrew/share/android-commandlinetools
./android/gradlew :app:assembleDebug
```

### Run Stripe webhook forwarding
```bash
cd /Users/nia/Documents/GitHub/philly-tours
npm run stripe:listen
```

### Regenerate bundled narration map
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run narration:map
```

This regenerates:
- [src/data/narrationAudioMap.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationAudioMap.ts)
- [src/data/narrationCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/narrationCatalog.ts)

### Generate narration with AWS Polly
Input catalog:
- [docs/narration-script-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/narration-script-catalog.csv)

Output folder:
- [assets/audio](/Users/nia/Documents/GitHub/philly-tours/assets/audio)

Command:
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run narration:polly -- --limit 5
npm run narration:map
```

Current observed result in this repo:
- `178` audio files generated
- `89` stop entries wired to runtime bundled audio

Authentication options in `.env`:
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=... # only if using temporary STS credentials
POLLY_DEFAULT_VOICE_ID=Amy
POLLY_DEFAULT_ENGINE=neural
```

Useful options:
```bash
npm run narration:polly -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church
npm run narration:polly -- --variant drive
npm run narration:polly -- --force
```

### Generate narration scripts with Claude
Claude writes or updates rows in [docs/narration-script-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/narration-script-catalog.csv). By default it skips rows that already exist, so it will not overwrite your hand-written or recorded hero-stop scripts unless you pass `--force`.

Required `.env` values:
```env
ANTHROPIC_API_KEY=sk-ant-xxx
ANTHROPIC_MODEL=claude-sonnet-4-5
POLLY_DEFAULT_VOICE_ID=Amy
POLLY_DEFAULT_ENGINE=neural
```

Command:
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run narration:claude -- --limit 10
```

Useful options:
```bash
npm run narration:claude -- --stop-id black-american-legacy-and-quaker-heritage-arch-street-friends-meeting-house
npm run narration:claude -- --variant drive
npm run narration:claude -- --force
```

### Import narration CSV parts
If you receive narration CSV batches from another tool, import only the rows that safely map onto real app stop IDs:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run narration:import -- /absolute/path/to/part1.csv /absolute/path/to/part2.csv
```

### Normalize narration catalog stop IDs
Use this after imports or external edits if the CSV may contain stale stop IDs:
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run narration:normalize
```

Notes:
- exact `stopId` matches are imported directly
- unique title matches are mapped onto the real app stop ID
- ambiguous rows are skipped instead of guessing
- existing catalog rows are preserved unless you explicitly extend the importer behavior

## Current Focus

The current product priority is:
1. finish the iPhone product
2. expand real narration/audio assets
3. finish top hero AR stops with real 3D assets
4. complete Android runtime verification
5. return to vehicle targets and future platforms later

## Planning Docs

- AR asset catalog: [docs/ar-asset-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/ar-asset-catalog.csv)
- AR briefs: [docs/ar-briefs/README.md](/Users/nia/Documents/GitHub/philly-tours/docs/ar-briefs/README.md)
- AR scene manifests: [docs/ar-scene-manifests/README.md](/Users/nia/Documents/GitHub/philly-tours/docs/ar-scene-manifests/README.md)
- Product direction: [docs/product-direction.md](/Users/nia/Documents/GitHub/philly-tours/docs/product-direction.md)
- Vehicle platform plan: [docs/vehicle-platform-plan.md](/Users/nia/Documents/GitHub/philly-tours/docs/vehicle-platform-plan.md)
