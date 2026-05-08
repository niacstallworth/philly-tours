# Private Content Backend Notes

Philly Tours is being sold as a real product, so the public repo should not be
the source of truth for premium route data, narration, audio, or AR assets.

## Recommended Private Content Split

- app and backend code remain in Git
- premium tours move to a private data backend
- paid media moves to protected object storage

## Good Supabase Fit

Supabase is a strong fit for the next phase:

- Postgres tables for tours, stops, narration, AR metadata, and entitlements
- Supabase Storage for paid audio and AR assets
- Auth + RLS to control which users can access purchased tours
- signed URLs for time-limited media delivery

## Suggested Private Tables

- `tours`
- `tour_stops`
- `tour_narration_scripts`
- `tour_media_assets`
- `tour_entitlements`
- `tour_purchases`

## Suggested Storage Buckets

- `tour-audio-private`
- `tour-models-private`
- `tour-images-private`

## Access Model

- public repo contains only demo content
- authenticated users fetch purchased tour metadata from the backend
- paid audio and AR files are delivered through protected storage access

## Current Repo Wiring

- `server/sync-server.js` reads private tour rows from `private_content.*`
- private media assets should be stored in Supabase Storage and referenced by bucket + object path
- set `SUPABASE_SERVICE_ROLE_KEY` on the sync server so it can mint signed URLs for private audio, cover images, and AR assets
- the mobile app now reads runtime tour media URLs from the sync server response instead of relying only on checked-in asset maps

## Immediate Product Direction

After the public-repo cleanup, the next implementation phase should be:

1. create private content tables
2. move the real production catalog into Supabase
3. move premium audio and AR assets into private storage
4. gate access by purchase or entitlement
5. update the app to fetch live content instead of importing static production files
