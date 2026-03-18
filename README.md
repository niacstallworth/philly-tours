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
- AR launch flow now uses a safer in-app preflight before entering native AR.
- AR tuning snapshots can now be written back into the asset catalog with `npm run ar:tuning:apply`.
- Narration flow now exists in app:
  - route-aware narration controls
  - auto narration on arrival
  - speech fallback when recorded files are missing
  - bundled audio files can now be dropped into `assets/audio/`
  - first recorded hero-stop audio batch is bundled
  - AWS Polly batch now fills the remaining uncovered stops
  - `336` bundled narration audio assets are present in `assets/audio/`
  - runtime audio coverage now resolves for all `188` stops
  - narration script catalog now contains `376` canonical rows (`188` drive, `188` walk)
  - AWS Polly generation pipeline is wired
  - Claude-based script generation pipeline is wired
  - narration coverage cues are visible in Home, Drive, Map, and AR
  - Home, Map, and AR can filter stops to `Full audio`
  - Drive can filter routes to `Full audio` only

### Partially working
- Native AR on iPhone requires a real ARKit-capable device for live tuning.
- Android AR bridge/runtime exists as a native bridge layer, but full AR runtime parity is not validated yet.
- Stripe checkout and webhook testing work locally, but production purchase validation is still incomplete.
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
| Narration script catalog | Working (`376` canonical rows) |
| Bundled narration audio | Working (`336` files, `188` stop entries wired) |
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

Shortcut:
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run metro
```

### Run Metro for a dev client on device
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run metro:dev-client
```

### Run iOS dev build
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export RUBYOPT='-rlogger'
npx expo run:ios --port 8081
```

Shortcut:
```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ios:device
```

### iPad / Xcode dev-client checklist
- Open [PhillyARTours.xcworkspace](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours.xcworkspace), not the `.xcodeproj`.
- Start Metro before launching the app on a physical device:
  `npm run metro:dev-client`
- Keep the iPad and Mac on the same Wi-Fi network.
- On first launch, allow `Philly AR Tours` to access devices on your local network so it can reach Metro on port `8081`.
- If local-network access was previously denied, delete the app from the iPad, reinstall it, and allow the prompt again.
- If Xcode starts showing missing Expo module maps again, clear `~/Library/Developer/Xcode/DerivedData/PhillyARTours-*` and rebuild from the workspace.
- In the AR screen, tap `Prepare AR Moment`, let the app confirm AR readiness, then tap `Enter AR Now`.
- Close the current AR scene before launching a different stop so only one object is live at a time.

### Apply AR tuning snapshot
Copy the snapshot from the AR screen, then run:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:tuning:apply -- --dry-run
npm run ar:tuning:apply
```

This updates [docs/ar-asset-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/ar-asset-catalog.csv) and regenerates [src/data/arAssetCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/arAssetCatalog.ts).

For a reusable device QA pass, use [docs/ar-assets/generic-device-smoke-checklist.md](/Users/nia/Documents/GitHub/philly-tours/docs/ar-assets/generic-device-smoke-checklist.md).

### Generate AR job packs
Generate provider-agnostic per-stop job folders for API-driven AR asset work:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:jobs:generate
```

This creates [docs/ar-job-packs](/Users/nia/Documents/GitHub/philly-tours/docs/ar-job-packs), with one folder per AR stop containing:
- `job.json` for structured pipeline metadata, runtime targets, and stage planning
- `prompts.md` for text-brief, concept-image, and rough-mesh prompts

### Run AR job packs
Run the first live provider-backed stage from the generated job packs:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:jobs:run -- --dry-run --limit 1
```

Current behavior:
- Default stage is `text_brief`
- Default provider is `anthropic`
- Default limit is `1` so you do not accidentally fan out paid API calls
- Generated stage outputs land in `generated/ar/<stopId>/<stage>/<provider>/`
- `--dry-run` writes the prompt and run metadata without calling the provider

Useful options:
```bash
npm run ar:jobs:run -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --dry-run
npm run ar:jobs:run -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --stage text_brief --provider anthropic
npm run ar:jobs:run -- --all --stage text_brief --provider anthropic
npm run ar:jobs:run -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --stage concept_image --provider replicate --dry-run
npm run ar:jobs:run -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --stage concept_image --provider replicate
npm run ar:jobs:run -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --stage rough_mesh
```

Live provider support is currently implemented for:
- `text_brief` via Anthropic
- `concept_image` via Replicate (`black-forest-labs/flux-1.1-pro` by default)

Fallback provider support is still available for:
- `concept_image` via fal

The rough-mesh stage now defaults to a no-cost `manual` provider that builds a modeler handoff workspace from the stop prompt plus any existing concept-image outputs. It writes:
- `output.md` with modeling priorities and references
- `mesh-handoff.json` with placement/runtime targets and cleanup guidance
- `cleanup-checklist.md`
- `references.md`

This is intended to bridge concept review into Blender/manual cleanup without paying for a mesh API before you are ready.

### Ingest cleaned rough-mesh assets
Once a cleaned `.usdz` or `.glb` is ready, drop it into:

- `generated/ar/<stopId>/rough_mesh/manual/reviewed/`

The mesh-ingest helper creates a guide file in that folder automatically and looks for either:
- the final runtime filenames from the job pack
- the `*-blockout.*` filenames suggested by the rough-mesh handoff

Dry-run the ingest first:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:mesh:ingest -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --dry-run
```

Then do the real staging:

```bash
npm run ar:mesh:ingest -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church
```

This writes:
- `generated/ar-runtime-staging/<stopId>/mesh-ingest-manifest.json`
- `generated/ar-runtime-staging/<stopId>/mesh-ingest-manifest.md`

And stages into the same runtime destinations used by the app:
- iOS: `ios/PhillyARTours/ARAssets/models/*.usdz`
- Android/Web: `assets/models/*.glb`

On a real run, this also refreshes:
- `docs/ar-asset-catalog.csv`
- generated scene manifests / job packs
- the AR review dashboard

Relevant `.env` values for live image generation:
```env
REPLICATE_API_TOKEN=r8_xxx
REPLICATE_DEFAULT_MODEL=black-forest-labs/flux-1.1-pro
REPLICATE_DEFAULT_ASPECT_RATIO=3:2
REPLICATE_DEFAULT_OUTPUT_FORMAT=png
```

Optional fallback image-provider values:
```env
FAL_KEY=your_fal_key
FAL_DEFAULT_MODEL=fal-ai/flux/dev
FAL_DEFAULT_IMAGE_SIZE=landscape_4_3
FAL_DEFAULT_OUTPUT_FORMAT=jpeg
```

### Stage reviewed runtime assets
Prepare reviewed model files for the runtime asset locations without manually copying them around:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:runtime:stage -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --source-dir /absolute/path/to/reviewed-assets --dry-run
```

You can also pass files explicitly:
```bash
npm run ar:runtime:stage -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --ios-file /absolute/path/to/model.usdz --android-file /absolute/path/to/model.glb --web-file /absolute/path/to/model.glb
```

The staging script writes a manifest under:
- `generated/ar-runtime-staging/<stopId>/staging-manifest.json`
- `generated/ar-runtime-staging/<stopId>/staging-manifest.md`

Destination conventions:
- iOS runtime asset target: `ios/PhillyARTours/ARAssets/models/*.usdz`
- Android/Web runtime asset target: `assets/models/*.glb`

On a real run, it also triggers `npm run ar:catalog:sync-runtime` for that stop so the catalog/dashboard pick up the newly staged runtime asset state.

### Ingest AR job outputs
Summarize generated AR workspace outputs into a review-friendly index:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:jobs:ingest
```

This writes:
- `generated/ar/ingest-index.json`
- `generated/ar/ingest-index.md`

The ingest index does not modify runtime assets yet. It just tells you:
- which stages exist for each stop
- which files were produced
- whether the stop is ready for concept review, mesh cleanup, or runtime packaging next

### Sync runtime readiness back into the catalog
Write pipeline progress back into the source-of-truth AR catalog and regenerate the runtime files:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:catalog:sync-runtime -- --dry-run
npm run ar:catalog:sync-runtime
```

This updates:
- [docs/ar-asset-catalog.csv](/Users/nia/Documents/GitHub/philly-tours/docs/ar-asset-catalog.csv)
- [src/data/arAssetCatalog.ts](/Users/nia/Documents/GitHub/philly-tours/src/data/arAssetCatalog.ts)
- [docs/ar-scene-manifests](/Users/nia/Documents/GitHub/philly-tours/docs/ar-scene-manifests)
- [docs/ar-job-packs](/Users/nia/Documents/GitHub/philly-tours/docs/ar-job-packs)

And writes a sync report to:
- `generated/ar-runtime-staging/catalog-sync/report.json`
- `generated/ar-runtime-staging/catalog-sync/report.md`

### Approve a stop after a good device pass
Once a stop feels solid on-device, promote it to `approved` without hand-editing the catalog:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:catalog:approve -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --note "Stable on iPad after slow floor scan." --dry-run
```

Then do the real approval:

```bash
npm run ar:catalog:approve -- --stop-id black-american-legacy-and-quaker-heritage-mother-bethel-ame-church --note "Stable on iPad after slow floor scan."
```

This command:
- sets `assetStatus` to `approved`
- appends a `[manual-status] ...` note to the catalog row
- regenerates the imported catalog, scene manifests, and job packs

It refuses to approve a stop that is still `planned` unless you pass `--force`.

### Apply an approval queue copied from the AR screen
The AR screen can now copy a queue of approval commands for all stable, buildable stops. Pipe that queue into:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
pbpaste | npm run ar:catalog:approve-queue -- --dry-run
```

Then apply it for real:

```bash
pbpaste | npm run ar:catalog:approve-queue
```

You can also read from a saved file:

```bash
npm run ar:catalog:approve-queue -- --file /absolute/path/to/approval-queue.txt --dry-run
```

### Import a full device review report from the AR screen
The AR screen can also copy a full review report for the current tour, including asset status, pass status, notes, approval candidates, and retune items.

Preview an import from the clipboard:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
pbpaste | npm run ar:reviews:import -- --dry-run
```

Then import it for real:

```bash
pbpaste | npm run ar:reviews:import
```

If a preview import looks good and you want to bless it without recopypasting from the device:

```bash
npm run ar:reviews:promote -- --tour-id <tourId> --dry-run
npm run ar:reviews:promote -- --tour-id <tourId>
```

You can also apply a queued batch of preview promotions:

```bash
pbpaste | npm run ar:reviews:promote-queue -- --dry-run
pbpaste | npm run ar:reviews:promote-queue
```

Or use the generated aggregate queue directly:

```bash
npm run ar:reviews:promote-next -- --dry-run
npm run ar:reviews:promote-next
```

To advance the full review pipeline in order, run:

```bash
npm run ar:reviews:advance -- --dry-run
npm run ar:reviews:advance
```

That applies queued preview promotions first, then queued approvals. You can also pass `--skip-promotions` or `--skip-approvals`.

### Import a full AR session closeout from the AR screen
If you use `Copy Session Closeout` on the AR screen, the clipboard bundle includes both the selected stop’s tuning snapshot and the full tour device review. The importer applies the tuning snapshot first, then imports the review report.

Preview a closeout import from the clipboard:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
pbpaste | npm run ar:closeout:import -- --dry-run
```

Then import it for real:

```bash
pbpaste | npm run ar:closeout:import
```

Optional flags:

```bash
pbpaste | npm run ar:closeout:import -- --dry-run --skip-tuning
pbpaste | npm run ar:closeout:import -- --dry-run --skip-review
npm run ar:closeout:import -- --file /absolute/path/to/session-closeout.txt --dry-run
```
On a real run, it now refreshes the approval queue after promotions so newly unlocked approvals get applied in the same pass.

This writes:
- `generated/ar-runtime-staging/device-reviews/<tourId>-preview.json` and friends when you use `--dry-run`
- `generated/ar-runtime-staging/device-reviews/<tourId>-latest.json` and friends on a real import
- `generated/ar-runtime-staging/device-reviews/<tourId>-current-approval-queue.txt`
- `generated/ar-runtime-staging/device-reviews/<tourId>-current-retune-queue.md`
- `generated/ar-runtime-staging/device-reviews/dashboard.json`
- `generated/ar-runtime-staging/device-reviews/dashboard.md`
- `generated/ar-runtime-staging/device-reviews/next-actions.json`
- `generated/ar-runtime-staging/device-reviews/next-actions.md`
- `generated/ar-runtime-staging/device-reviews/next-session-handoff.json`
- `generated/ar-runtime-staging/device-reviews/next-session-handoff.md`
- `generated/ar-runtime-staging/device-reviews/next-device-pass.json`
- `generated/ar-runtime-staging/device-reviews/next-device-pass.md`
- `generated/ar-runtime-staging/device-reviews/next-approval-queue.txt`
- `generated/ar-runtime-staging/device-reviews/next-projected-approval-queue.txt`
- `generated/ar-runtime-staging/device-reviews/next-retune-queue.md`
- `generated/ar-runtime-staging/device-reviews/first-device-review-queue.md`

The imported report includes:
- stable / drift / retune summary counts
- approval candidates with ready-to-run approval commands
- buildable stops that still need more tuning

Dry-run imports are now treated as preview-only and do not count as official reviews in the dashboard/action queues. You can either import a real review from the iPad or promote an existing preview into the official `-latest.*` files.

If you have older preview imports from before that naming split, normalize them once:

```bash
npm run ar:reviews:normalize
```

The extra queue files make the next step explicit:
- `*-approval-queue.txt` can be piped into `npm run ar:catalog:approve-queue`
- `*-retune-queue.md` is a focused list for the next iPad tuning pass

For reviewed tours, the dashboard generator also writes stale-proof current companions:
- `*-current-approval-queue.txt` from the latest catalog status plus imported device-pass results
- `*-current-retune-queue.md` from the same recomputed review state

You can also regenerate the cross-tour dashboard directly:

```bash
npm run ar:reviews:dashboard
```

The review dashboard now refreshes automatically after:
- `npm run ar:catalog:sync-runtime`
- `npm run ar:catalog:approve`
- `npm run ar:catalog:approve-queue`
- `npm run ar:closeout:import`
- `npm run ar:tuning:apply`
- `npm run ar:reviews:import`

The dashboard pass also emits a focused action board:
- `next-actions.md` for immediate approvals, retunes, and tours that still need a first device pass
- `next-actions.json` for any future tooling or UI layer
- `next-session-handoff.md` for the next desk + iPad work block
- `next-session-handoff.json` for any future UI/automation layer
- `next-device-pass.md` for the recommended iPad session packet
- `next-device-pass.json` for tooling around that packet
- `next-preview-promotion-queue.txt` for tours that already have preview-only device reviews
- `next-projected-approval-queue.txt` for approvals that would unlock after promoting previews
- `next-approval-queue.txt` for one cross-tour approval batch
- `next-retune-queue.md` for the current retune backlog
- `first-device-review-queue.md` for tours that have buildable stops but no imported device review yet

To apply the current aggregate approval queue directly:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:catalog:approve-next -- --dry-run
npm run ar:catalog:approve-next
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
- `336` audio files generated
- `188` stop entries wired to runtime bundled audio

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
