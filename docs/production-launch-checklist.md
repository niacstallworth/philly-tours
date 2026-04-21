# Production Launch Checklist

Use this checklist before shipping the live backend and store-ready app builds.

## 1. Prepare Server Secrets

- Create a production env file from `deploy/sync-server.env.example`
- Set a strong `AUTH_JWT_SECRET`
- Set `BUILDER_ADMIN_ACCOUNTS_JSON` from `npm run builder:admins:map`
- Set `SUPABASE_DB_URL`
- Set Stripe live values:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Set Apple production verification values:
  - `APPLE_IAP_BUNDLE_ID`
  - `APPLE_IAP_ISSUER_ID`
  - `APPLE_IAP_KEY_ID`
  - `APPLE_IAP_PRIVATE_KEY`
  - `APPLE_IAP_ENV=production`
- Set Google Play verification values if Android purchases are live

## 2. Remove Legacy Admin Fallback

- Do not set `ALLOW_LEGACY_ADMIN_API_KEY` in production
- Do not rely on `ADMIN_API_KEY` for normal admin operations
- Confirm builder/admin actions work only through authenticated sessions

## 3. Deploy the Backend

- Deploy the app code to the production server
- Install dependencies with `npm install`
- Run the sync server through `systemd`
- Put the service behind HTTPS with Nginx or Caddy
- Point your public API host to the Node server

Example target:

- `https://api.philly-tours.com` -> `http://127.0.0.1:4000`

## 4. Verify Backend Auth

Check these manually against production:

- `GET /api/config/status` returns `authConfigured: true`
- anonymous `GET /api/entitlements` returns `401`
- tourist sign-in returns a token and `roles: ["tourist"]`
- builder sign-in returns `roles` including `builder`
- admin routes reject tourist tokens
- admin routes allow builder/admin tokens

## 5. Configure Production Mobile Builds

Production app builds must not use `localhost` or your LAN IP.

Make sure production builds use:

- `EXPO_PUBLIC_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_WEB_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_APP_SCHEME=phillyartours`

Important:

- `development` and `preview` can point at local/dev backend URLs
- `production` must point at the real HTTPS backend
- EAS production builds do not read your local `.env`
- Android release builds must use an upload/release keystore, not the debug keystore
- Set release signing through secure CI/EAS/local secrets only:
  - `PHILLY_TOURS_UPLOAD_STORE_FILE`
  - `PHILLY_TOURS_UPLOAD_STORE_PASSWORD`
  - `PHILLY_TOURS_UPLOAD_KEY_ALIAS`
  - `PHILLY_TOURS_UPLOAD_KEY_PASSWORD`
- Add the release/upload SHA-1 certificate fingerprint to the restricted Android Google Maps API key

## 6. Rebuild and Test Payments

- Rebuild the app after production env changes
- Verify hosted checkout opens successfully
- Complete a real or tightly scoped live test purchase
- Confirm:
  - order row recorded
  - entitlement row recorded
  - app unlock state matches backend

## 7. Verify Privacy / Admin Flows

- Submit a deletion request from the app
- Confirm it appears in the admin deletion queue
- Fulfill it from an authenticated builder/admin session
- Confirm backend records are purged

## 8. Final Security Pass

- Rotate any secrets that previously lived in broad local `.env` files
- Keep server-only secrets in host environment or root-owned server env files
- Keep only `EXPO_PUBLIC_*` values in app-facing env files
- Do not commit real builder/admin credentials

## 9. Release Gate

Before store submission or broad internal rollout:

- `npm run preflight:store` passes
- backend deployed under HTTPS
- auth enabled
- builder/admin accounts hashed and server-side only
- production EAS env set correctly
- store metadata prepared from `docs/store-submission-readiness.md`
- App Store privacy answers and Google Play Data Safety match the final build
- payments and entitlements verified
- privacy deletion flow verified
