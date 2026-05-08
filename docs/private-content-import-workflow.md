# Private Content Import Workflow

Use this workflow when you are ready to load real paid tours into Supabase
without putting them back into public Git.

## 1. Keep the real catalog local

- copy [private-tour-catalog-template.json](/Users/nia/Documents/GitHub/philly-tours/docs/private-tour-catalog-template.json)
- save your working file as `private-content/catalog.json`
- do not commit that file

## 2. Upload paid media to private buckets

Recommended buckets:

- `tour-audio-private`
- `tour-models-private`
- `tour-images-private`

The import file should reference bucket + object path for each private asset.

## 3. Make sure server/db env is present

The import script reads local env files and needs either:

- `SUPABASE_DB_URL`
- or `EXPO_PUBLIC_SUPABASE_URL` plus `SUPABASE_DB_PASSWORD`

If you want the app to serve signed private media after import, also set:

- `SUPABASE_SERVICE_ROLE_KEY`

## 4. Run the import

```bash
npm run content:import:private
```

Optional:

```bash
node scripts/import-private-tour-catalog.mjs --file private-content/catalog.json --dry-run
```

## Import behavior

- each imported tour replaces the existing `private_content` copy for that tour id
- stops, scripts, and media assets are reloaded under that tour
- public demo data in the repo is not changed

## After import

1. start the sync server
2. sign in with a user who has the matching entitlement
3. verify `/api/content/catalog`
4. verify `/api/content/tours/:tourId`
5. verify premium audio/model URLs resolve through signed storage access
