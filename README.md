# Philly Tours

Philly Tours is a premium Philadelphia cultural touring platform for cinematic city routes, layered narration, live Compass guidance, selective native AR handoff, and lightweight companion experiences when a stop deserves more than audio alone.

This README is the source of truth for project shape, local development, deployment, and operational notes. Older topic docs remain useful for deeper context, but when they disagree with this file, follow this file first.

## Live Surfaces

- Web app: `https://philly-tours.com`
- Production API: `https://api.philly-tours.com`
- Health check: `https://api.philly-tours.com/health`
- Config status: `https://api.philly-tours.com/api/config/status`

The platform has two aligned faces:

- a static Cloudflare Pages web companion with route browsing, profile/auth surfaces, maps, newsletter signup, and web push opt-in
- a native iOS / Android app with tour pages, route collections, live Compass guidance, scavenger hunts, gamified progress, AR handoff, and glasses companion scaffolding

## Product Shape

- Premium Philadelphia route collections across neighborhoods, legacy corridors, Black history, innovation, architecture, sports, libraries, and civic routes
- Main app shell: Home, AR, Board, Profile, Blog, and Compass
- Compass guidance points to the next meaningful stop and can hand off turn-by-turn routing to Apple Maps or Google Maps
- Story Logistics keeps routes moving by choosing the closest meaningful next stop that preserves story flow, geography, and momentum
- Board tab persists scoring, levels, streaks, quests, and scavenger-hunt progress
- Tour pages include route points, narration, map previews, and AR context
- Web push notifications use OneSignal with a user-triggered opt-in from the Profile tab

Supporting product docs:

- `docs/product-direction.md`
- `docs/vehicle-platform-plan.md`
- `docs/drive-mode-positioning.md`
- `docs/visionos-integration-plan.md`
- `docs/google-maps-platform-plan.md`

## Key Files

- App entry: `App.tsx`
- Tabs: `src/navigation/MainTabs.tsx`
- Home: `src/screens/HomeScreen.tsx`
- Profile: `src/screens/ProfileScreen.tsx`
- Compass / drive guidance: `src/screens/DriveScreen.tsx`
- Board / gamification: `src/screens/ProgressScreen.tsx`, `src/services/gameProgress.ts`
- Tour detail pages: `src/screens/TourDetailScreen.tsx`
- Glasses display abstraction: `src/services/glassesDisplay.ts`
- Native AR bridge: `ios/PhillyARTours/PhillyNativeAR.swift`
- Static webapp: `webapp/`
- Web data builders: `scripts/build-webapp-data.mjs`, `scripts/build-webapp-dist.mjs`
- Sync backend: `server/sync-server.js`
- Cloudflare Pages deploy workflow: `.github/workflows/deploy-cloudflare-pages.yml`

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
- Web camera and geolocation features work on `http://localhost`, but public browser deployments should use `https`.
- Device builds need local network access if they are expected to talk to Metro or a local sync server.
- Avoid root-level server secret files while running native builds; bundlers can inspect unexpected files.

## Web Deployment

Production web deploys run remotely through GitHub Actions. Push to `main` or manually run the `Deploy Cloudflare Pages` workflow in GitHub Actions.

The workflow:

```text
push to main
-> GitHub Actions installs dependencies
-> npm run webapp:build
-> wrangler pages deploy web-dist --project-name philly-tours
-> Cloudflare Pages serves philly-tours.com
```

Required GitHub repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY`
- `EXPO_PUBLIC_ONESIGNAL_APP_ID`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`

`npm run deploy` is intentionally disabled locally to avoid building `web-dist` on this machine. Emergency direct uploads are still available with:

```bash
npm run deploy:local
```

Use that local path only when GitHub Actions is unavailable.

## Environment

Example values live in `.env.example`.

Important groups:

- Expo public app config
- browser-safe web config exposed as `EXPO_PUBLIC_*`
- server auth + builder/admin accounts
- Stripe checkout + webhooks
- Apple / Google purchase verification
- Google Maps Platform keys
- Cloudflare Turnstile
- OneSignal web push
- AWS Polly narration generation

Browser-safe values are public once deployed. Keep private server values out of `EXPO_PUBLIC_*`.

For production web deploys, set browser-safe values in GitHub Actions secrets, because GitHub Actions is now the build source. Cloudflare Pages dashboard variables do not feed this repo's build unless the project is converted to a Git-connected Pages project.

Server-only secrets belong in server-owned env files or provider secret stores, not in the static webapp.

## Security

Security policy: `docs/security-policy.md`.

Core rules:

- Never commit real Stripe secret keys, Supabase service-role keys, AWS keys, GitHub tokens, Cloudflare API tokens, private Apple credentials, or provider secrets.
- Do not post unredacted secrets in screenshots, chats, issues, pull requests, logs, or terminal output.
- Public browser keys such as Supabase publishable keys, Turnstile site keys, Google Maps browser keys, and OneSignal app IDs must still be restricted at the provider level.
- Rotate any token that appears in a screenshot or chat transcript.
- Keep production API secrets on the backend host, not in the client bundle.

## Backend And Payments

The sync server lives in `server/sync-server.js`.

Production-oriented notes:

- Production API: `https://api.philly-tours.com`
- App sessions are issued by the backend as signed JWTs.
- Builder/admin access is configured from server env, not bundled client credentials.
- Stripe webhook forwarding for local work:

```bash
npm run stripe:listen
```

Backend deployment docs:

- `docs/live-production-backend-status.md`
- `docs/server-deployment.md`
- `docs/production-launch-checklist.md`
- `deploy/sync-server.env.example`
- `deploy/philly-tours-sync.service.example`
- `deploy/Caddyfile.api.example`
- `deploy/nginx-api.philly-tours.conf.example`

## Git LFS

This repo uses Git LFS for large vendor artifacts and binary SDK assets.

```bash
brew install git-lfs
git lfs install
git lfs pull
```

Track new large binary SDK files with Git LFS before committing them.

## Useful Checks

```bash
npm run webapp:serve
node --check webapp/app.js
curl -fsS https://api.philly-tours.com/health
curl -fsS https://api.philly-tours.com/api/config/status
```

For production web config verification:

```bash
curl -fsS https://philly-tours.com/site-config.js
curl -I https://philly-tours.com/OneSignalSDKWorker.js
```
