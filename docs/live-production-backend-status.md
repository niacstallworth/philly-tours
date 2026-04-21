# Live Production Backend Status

This document records the public production backend state that is live for Philly Tours.

Verified on April 21, 2026 against:

- `https://api.philly-tours.com/health`
- `https://api.philly-tours.com/api/config/status`

## Production API

- Live API host: `https://api.philly-tours.com`
- Runtime mode: `production`
- Health endpoint: up
- Config status endpoint: up
- Reverse proxy / HTTPS edge: Cloudflare in front of the Express sync server

## Verified Capabilities

The production config endpoint confirms:

- Auth configured
- Builder/admin auth configured
- Database connected
- Stripe payments configured
- Apple IAP verification configured for production
- Google Play purchase verification configured
- Cloudflare Turnstile configured
- Google Maps server integration configured
- Google Maps default region: `us`
- Google Maps default language: `en`

The production health endpoint confirms:

- API health: `ok`
- Stripe configuration detected
- Database configuration detected

## Public Verification Commands

Use these commands to re-check the live state without exposing server secrets:

```bash
curl -fsS https://api.philly-tours.com/health
curl -fsS https://api.philly-tours.com/api/config/status
```

Expected high-level result:

- both requests return success
- `/health` returns `ok: true`
- `/api/config/status` returns `mode: "production"`
- auth, payments, database, Turnstile, IAP, and Google Maps flags return `true`

## Notes

- This file records public operational status only.
- Production secrets remain server-side and must not be committed to the repo.
- The live server environment remains the source of truth for secret values.
