# Security Policy

## Supported Versions

The current actively maintained branch and the production deployment behind `api.philly-tours.com` are the supported targets.

## Reporting a Vulnerability

If you find a vulnerability, report it privately to:

- `info@foundersthreads.org`

Please include:

- a short description of the issue
- affected environment: local, staging, production, iOS, Android, or web
- reproduction steps
- any screenshots or logs with secrets redacted

Please do not post unredacted secrets, access tokens, or private keys in issues, screenshots, chat transcripts, or pull requests.

## Secret Handling

- Keep server-only local secrets in `server.local.env` or a server-owned env file such as `/etc/philly-tours/sync-server.env`.
- Keep Expo / browser-safe values in `.env` only when they are intended to ship to the client as `EXPO_PUBLIC_*`.
- Never commit real Stripe, Supabase service-role, AWS, GitHub, Anthropic, Turnstile, or Apple private credentials.
- Avoid root-level secret files that native bundlers may try to parse during Android builds.

If a real credential is exposed in logs, screenshots, terminal output, or source:

1. rotate it with the provider
2. remove it from local logs and developer artifacts
3. replace it in the correct env file
4. redeploy or restart the affected service

## Location, Compass, And Navigation Privacy

The native app uses foreground location and device heading for the Compass tab, scavenger hunts, and arrival-radius detection.

- Request only foreground location unless a reviewed feature explicitly requires background location.
- Do not log precise latitude, longitude, heading, route progress, or arrival-radius events to analytics or terminal output without a reviewed privacy reason.
- Keep live location state on device for Compass behavior. If future server sync is added, document the data path and retention before shipping.
- The Compass tab may open Apple Maps or Google Maps for turn-by-turn directions. Those external apps then handle routing, rerouting, and their own privacy policies.
- Avoid including exact user locations in screenshots, issue reports, pull requests, or support threads unless the user has intentionally provided them.

## Glasses And Companion Devices

The app includes companion audio, notification, and future display-overlay scaffolding for glasses-style devices.

- Treat glasses display payloads as user-context data. They can include next stop names, heading, bearing, and route state.
- Do not send glasses payloads to a backend unless the product need, consent model, and retention policy are documented.
- Keep vendor credentials, DAT app IDs, client tokens, package registry tokens, and SDK access tokens out of git.
- Native glasses integrations should fail closed to phone-only or notification-only modes when credentials, pairing, or native modules are unavailable.

## AR Assets And Generated Content

AR assets can include historically sensitive scenes, licensed references, and large binary files.

- Do not commit licensed or private source references unless the repo is allowed to store them.
- Use Git LFS for large binary SDKs or production AR assets when needed.
- Keep runtime AR paths stable once referenced in `src/data/arAssetCatalog.ts`.
- Generated AR briefs, scene manifests, review dashboards, and job packs should not contain real provider API keys, private image prompts, or personal data.
- The app should keep narration, Compass, maps handoff, and fallback AR cards available when AR assets are missing or still in production.

## Client Settings And Local Storage

The app persists user-facing settings and progress locally, including theme mode, text scale, game progress, drive session state, and scavenger hunt state.

- Do not store auth secrets, payment secrets, provider tokens, or private keys in AsyncStorage.
- Treat local progress and route state as user data when sharing device logs or screenshots.
- Light mode is the app default. Users can manually switch to dark mode in Settings; theme preference is local app state, not a security boundary.

## Operational Notes

- Stripe live and test keys must stay separated between local development and production.
- Production webhooks should point only at the production backend.
- Builder/admin credentials should not be committed in plaintext CSV or screenshots.
- Security-sensitive changes should be reviewed before push when they touch auth, payments, env loading, deployment scripts, native permissions, location behavior, companion device bridges, or external navigation handoffs.
