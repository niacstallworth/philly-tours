# Webapp Deployment

This repo now includes a static browser webapp in `webapp/` backed by generated tour and narration data.

Use this guide for extra web deployment context. The top-level `README.md` is the source of truth for the current Philly Tours production deployment.

## What Needs To Be Hosted

At minimum, your web host needs to serve:

- `webapp/index.html`
- `webapp/styles.css`
- `webapp/app.js`
- `webapp/tours-data.js`
- `webapp/narration-data.js`
- `assets/audio/`
- `assets/models/` if you want web 3D model previews

The webapp expects narration files at `/assets/audio/...`.
Web model previews should be deployed at `/assets/models/...`.

## Generate Fresh Web Data

Before deploying, regenerate the browser data bundles:

```bash
npm run webapp:data
```

That command rebuilds:

- `webapp/tours-data.js`
- `webapp/narration-data.js`

If you want a fresh upload package for another static host or an emergency manual upload:

```bash
npm run webapp:package
```

That command rebuilds `web-dist/` and creates:

- `web-release/philly-ar-tours-webapp.zip`

## Local Verification

Run the local static server:

```bash
npm run webapp:serve
```

Then open:

```text
http://localhost:4173
```

`localhost` is allowed to use camera and geolocation in modern browsers, so this is the right way to test AR live mode locally.

## Production Requirement: HTTPS

For real browser deployments, camera and geolocation generally require a secure context.

That means:

- `http://localhost` is okay for development
- `https://your-domain.com` is okay for production
- plain `http://your-domain.com` is not reliable for AR live mode

If you want camera, GPS, and browser speech features to work consistently, deploy the public webapp on HTTPS.

## Suggested Server Layout

Example:

- app repo checkout: `/srv/philly-tours`
- static web root: `/srv/philly-tours/webapp`
- audio files: `/srv/philly-tours/assets/audio`

## Cloudflare Pages Production Path

Production deploys for this repo now run through GitHub Actions into the existing Cloudflare Pages project. This avoids local `web-dist` builds and keeps deploys consistent.

The normal flow is:

```text
push to main
-> GitHub Actions
-> npm run webapp:build
-> wrangler pages deploy web-dist --project-name philly-tours
```

GitHub Actions needs these repository secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY`
- `EXPO_PUBLIC_ONESIGNAL_APP_ID`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`

Do not put `CLOUDFLARE_API_TOKEN` in Cloudflare Pages plaintext variables. It belongs in GitHub Actions secrets.

Cloudflare Pages remains the production host because:

- HTTPS is included
- custom domains are straightforward
- the webapp is static
- browser camera and geolocation work correctly on secure origins

The deployed structure is:

- use `web-dist/` as the publish directory
- keep `webapp/_redirects` so SPA routes fall back to `index.html`
- let the build step copy `assets/audio/` and `assets/models/` into the deploy output

`web-dist/` should include:

- `index.html`
- `app.js`
- `styles.css`
- `tours-data.js`
- `narration-data.js`
- `ar-data.js`
- `_headers`
- `_redirects`
- `OneSignalSDKWorker.js`
- `assets/audio/...`
- `assets/models/...`

Keep the browser key restricted in Google Cloud:

- restrict it to the `Maps JavaScript API`
- restrict referrers to your actual domains, such as `https://philly-tours.com/*` and any preview host you intentionally use
- do not reuse the server-only `GOOGLE_MAPS_API_KEY` in the browser build

### Important Cloudflare Note

The current Cloudflare Pages project is a direct-upload project. GitHub Actions performs the build and then uploads `web-dist/` with Wrangler. Cloudflare dashboard build variables do not feed this repo's production build unless the Pages project is recreated as a Git-connected project.

### Production Google Maps Note

The Home tab and route views can render in two different ways:

- with `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY`, the shell uses the interactive Google Maps JavaScript API
- without that browser key, the Home tab falls back to a Google-hosted embed so production does not show a blank map shell

If you want full in-shell map interactivity on production, publish a browser-restricted `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY` through GitHub Actions secrets rather than committing it into `webapp/site-config.js`.

### Emergency Static Upload Shortcut

If GitHub Actions is unavailable:

1. Run:

```bash
npm run deploy:local
```

This builds locally and uploads directly to Cloudflare Pages. Use it sparingly because it recreates `web-dist/` on the local machine.

## Nginx Example

This example serves the static webapp at `https://tours.example.com` and exposes the audio directory at `/assets/audio/`.

```nginx
server {
    listen 80;
    server_name tours.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name tours.example.com;

    ssl_certificate /etc/letsencrypt/live/tours.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tours.example.com/privkey.pem;

    root /srv/philly-tours/webapp;
    index index.html;

    location /assets/audio/ {
        alias /srv/philly-tours/assets/audio/;
        access_log off;
        expires 7d;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Caddy Example

```caddy
tours.example.com {
    root * /srv/philly-tours/webapp
    encode gzip zstd
    file_server

    handle_path /assets/audio/* {
        root * /srv/philly-tours
        file_server
    }

    try_files {path} /index.html
}
```

If you use Caddy, make sure `/assets/audio/...` resolves to files under `assets/audio/`.

## Deploy Checklist

1. Confirm required GitHub Actions secrets are present.
2. Push to `main` or manually run `Deploy Cloudflare Pages`.
3. Confirm the GitHub Actions run succeeds.
4. Verify:
   - homepage loads
   - Home tab shows a Google map
   - route map loads
   - recorded narration plays
   - Route alerts can request browser notification permission
   - AR live can request camera permission
   - geolocation works on your deployed domain

## Notes

- Leaflet map tiles are fetched from OpenStreetMap at runtime, so the client still needs network access.
- The webapp is static; it does not require the sync server just to render tours, maps, or narration.
- If you later add authenticated browser features or payments, keep those behind your existing backend instead of embedding secrets in the webapp.
