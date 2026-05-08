# Private Asset Upload Workflow

Use this when the private tour catalog already contains asset paths and you want
to upload the real files into Supabase Storage without changing the public repo.

## Current command

Create the local folder tree first:

```bash
npm run content:scaffold:private-assets -- --file private-content/black-inventors-tour.catalog.json --kind audio
```

Then dry-run the upload:

```bash
npm run content:upload:private-assets -- --file private-content/black-inventors-tour.catalog.json --kind audio --dry-run
```

Then run the real upload:

```bash
npm run content:upload:private-assets -- --file private-content/black-inventors-tour.catalog.json --kind audio
```

## Local file layout

The uploader expects a gitignored local workspace under:

`private-content/assets/`

Inside that folder, mirror the bucket name and object path exactly.

Example for the inventor tour:

```text
private-content/assets/
  tour-audio-private/
    audio/
      black-inventors-tour/
        lewis-latimer-light-bulb-exhibit-drive.mp3
        lewis-latimer-light-bulb-exhibit-walk.mp3
        garrett-morgan-traffic-signal-drive.mp3
        garrett-morgan-traffic-signal-walk.mp3
```

The scaffold command creates the directory tree plus `.placeholder.txt` files so
you can see every expected asset path before the real MP3s exist.

## Required env

The upload script reads the same local env files as the importer and requires:

- `EXPO_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

If you want to synthesize draft MP3s with AWS Polly before upload, also set:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- optional `AWS_SESSION_TOKEN`
- optional `POLLY_DEFAULT_VOICE_ID`
- optional `POLLY_DEFAULT_ENGINE`

## Behavior

- `--kind audio` uploads only audio assets
- `--kind model` uploads only model assets
- no `--kind` flag uploads every asset listed in the catalog
- `--dry-run` reports which files are ready and which files are still missing
- uploads use `upsert: true`, so replacing a draft MP3 with a final MP3 reuses the same path

## Why this matters

The catalog file becomes the source of truth for:

- bucket name
- object path
- media type
- per-stop asset coverage

That means your narration production workflow can stay simple:

1. export or render the final MP3
2. save it into the matching local path
3. run the upload command
4. test the signed URL through the private content endpoint

## Polly bridge

If you want to generate private draft MP3s from the exported inventor-tour CSV:

```bash
npm run narration:polly -- \
  --csv private-content/exports/black-inventors-tour-narration-script-catalog.csv \
  --output-dir private-content/assets/tour-audio-private/audio/black-inventors-tour \
  --dry-run
```

Then run the real generation without `--dry-run`.
