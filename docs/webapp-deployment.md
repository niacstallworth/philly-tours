# Webapp Deployment

This repo now includes a static browser webapp in `webapp/` backed by generated tour and narration data.

Use this guide when you want to deploy the webapp to your own server instead of opening local files directly.

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

If you want a fresh upload package for Cloudflare Pages or another static host:

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

## Cloudflare Pages Recommendation

For this repo, Cloudflare Pages is the easiest production path because:

- HTTPS is included
- custom domains are straightforward
- the webapp is static
- browser camera and geolocation work correctly on secure origins

Recommended structure for Cloudflare:

- use `web-dist/` as the publish directory
- keep `webapp/_redirects` so SPA routes fall back to `index.html`
- let the build step copy `assets/audio/` and `assets/models/` into the deploy output

### Cloudflare Pages Deploy Flow

1. Run:

```bash
npm install
npm run webapp:build
```

2. Make sure this deploy directory exists:

- `web-dist/`

It should include:

- `index.html`
- `app.js`
- `styles.css`
- `tours-data.js`
- `narration-data.js`
- `ar-data.js`
- `_redirects`
- `_headers`
- `assets/audio/...`
- `assets/models/...`

3. In Cloudflare Pages:

- create a new Pages project
- connect your Git repo or use direct upload
- set the build command to:

```bash
npm run webapp:build
```

- set the output directory to:

```text
web-dist
```

4. Add browser-safe environment variables in Cloudflare Pages before the build runs:

- `EXPO_PUBLIC_WEB_SYNC_SERVER_URL`
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY`
- `EXPO_PUBLIC_GOOGLE_MAPS_EMBED_URL`
- `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY`
- optional `EXPO_PUBLIC_GOOGLE_MAPS_MAP_ID`

Keep the browser key restricted in Google Cloud:

- restrict it to the `Maps JavaScript API`
- restrict referrers to your actual domains, such as `https://philly-tours.com/*` and any preview host you intentionally use
- do not reuse the server-only `GOOGLE_MAPS_API_KEY` in the browser build

### Important Cloudflare Note

Cloudflare Pages publishes one output directory. This repo now uses `web-dist/` so the static app and `/assets/...` paths can ship together.

### Production Google Maps Note

The Home tab and route views can render in two different ways:

- with `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY`, the shell uses the interactive Google Maps JavaScript API
- without that browser key, the Home tab falls back to a Google-hosted embed so production does not show a blank map shell

If you want full in-shell map interactivity on production, publish a browser-restricted `EXPO_PUBLIC_GOOGLE_MAPS_JS_API_KEY` through your deploy environment rather than committing it into `webapp/site-config.js`.

### Static Upload Shortcut

If you prefer Cloudflare's direct upload flow instead of Git integration:

1. Run:

```bash
npm run webapp:package
```

2. In Cloudflare Pages choose the static file upload path.
3. Upload the contents of `web-dist/` or the packaged archive in `web-release/`.

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

1. Pull the latest repo on the server.
2. Run `npm install`.
3. Provide browser-safe deploy env values, either in your host's build settings or in an ignored local file such as `.env.production.local`.
4. Run `npm run webapp:data`.
5. Confirm `webapp/tours-data.js`, `webapp/narration-data.js`, and `webapp/site-config.js` were regenerated with the expected browser-safe config.
6. Point your web server root at `webapp/`.
7. Expose `assets/audio/` at `/assets/audio/`.
8. If you have `.glb` files, expose `assets/models/` at `/assets/models/`.
9. Serve the site on HTTPS.
10. Verify:
   - homepage loads
   - Home tab shows a Google map
   - route map loads
   - recorded narration plays
   - AR live can request camera permission
   - geolocation works on your deployed domain

## Notes

- Leaflet map tiles are fetched from OpenStreetMap at runtime, so the client still needs network access.
- The webapp is static; it does not require the sync server just to render tours, maps, or narration.
- If you later add authenticated browser features or payments, keep those behind your existing backend instead of embedding secrets in the webapp.
