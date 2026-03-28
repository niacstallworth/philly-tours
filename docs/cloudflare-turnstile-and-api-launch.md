# Cloudflare Turnstile and API Launch

This project now expects the public sync server to live at:

- `https://api.philly-tours.com`

The static webapp and the native login flow both use Cloudflare Turnstile before creating app sessions.

## 1. Create the API DNS record

In Cloudflare DNS for `philly-tours.com`, add:

- Type: `CNAME`
- Name: `api`
- Target: the public hostname of your server

If you are pointing directly at a VPS IP instead, use:

- Type: `A`
- Name: `api`
- IPv4 address: your server IP

## 2. Run the sync server on the host

Use:

- `deploy/philly-tours-sync.service.example`
- `deploy/sync-server.env.example`

The Node process should listen locally on:

- `http://127.0.0.1:4000`

## 3. Put HTTPS in front of the API

Choose one:

- Caddy: `deploy/Caddyfile.api.example`
- Nginx: `deploy/nginx-api.philly-tours.conf.example`

Target:

- `api.philly-tours.com` -> `http://127.0.0.1:4000`

## 4. Add required production env

At minimum:

- `EXPO_PUBLIC_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_WEB_SYNC_SERVER_URL=https://api.philly-tours.com`
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=...`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY=...`
- `AUTH_JWT_SECRET=...`
- `SUPABASE_DB_URL=...`

## 5. Create Turnstile widgets

In Cloudflare Turnstile:

- create a widget for the native/mobile sign-in flow
- create a widget for the web sign-in flow if you want a separate configuration

The current app code can use the same site key everywhere if you prefer a single widget.

## 6. Rebuild the webapp after env changes

After setting the web-facing env values locally:

```bash
npm run webapp:build
```

Then upload the refreshed `web-dist/` to Cloudflare Pages.

## 7. Verify

Check these URLs:

- `https://api.philly-tours.com/health`
- `https://philly-tours.com`
- `https://www.philly-tours.com`

Then verify:

- web login shows the Cloudflare challenge
- sign-in succeeds and creates a session
- profile subscription still writes to Supabase
- iOS and Android onboarding require Turnstile when the site key is configured
