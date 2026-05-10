# May 9 Launch Smoke Test

Use this checklist to verify the private premium catalog is behaving like a product, not just a data import.

## Goal

Confirm that:

- all premium tours appear in the catalog
- preview states and unlock states are clear
- signed audio playback works on real route detail screens
- purchase handoff feels intentional
- the app returns the user to the right place after checkout

## Environment

- Repo: `/Users/nia/Documents/GitHub/philly-tours`
- Local backend target currently used by the app: `/Users/nia/Services/philly-tours-backend`
- Status tracker: [private-content/tour-pack-status.csv](/Users/nia/Documents/GitHub/philly-tours/private-content/tour-pack-status.csv)

## Premium Catalog Count

Expected premium total: `18`

Expected premium tours:

- `black-american-legacy-and-quaker-heritage`
- `black-american-sports`
- `black-architects-tour`
- `black-inventors-tour`
- `black-medical-legacy`
- `college-hop-tour`
- `divine-9-legacy-tour`
- `eastern-star-weekend`
- `job-s-daughters`
- `library-story-hop-tour`
- `masonic-scavenger-hunt`
- `move-bombing-memorial`
- `old-york-road-corridor`
- `philadelphia-foundations`
- `philly-black-art-odyssey`
- `rainbow-girls-philadelphia`
- `septa-broad-street-line`
- `speakeasy-tour`

## 1. Catalog Visibility

Open the app and confirm:

- premium tours are visible on the main browse surface
- a locked tour card shows `Preview`
- an unlocked tour card shows `Unlocked`
- no premium route is missing from the list

Mark failures if:

- a premium tour does not appear
- multiple cards show the same route
- preview and unlock labels are inconsistent

## 2. Route Detail Smoke Test

Open at least these four routes:

- `black-inventors-tour`
- `speakeasy-tour`
- `divine-9-legacy-tour`
- `old-york-road-corridor`

For each route, confirm:

- the title and summary load
- stop list renders
- stop count feels correct
- preview copy is visible for locked users
- no obviously empty screen appears

## 3. Audio Playback Sample

For each of the same four routes, test:

- first stop `drive` audio
- first stop `walk` audio

If the route has more than 3 stops, also test:

- one middle stop audio
- one last stop audio

Pass conditions:

- audio starts
- no broken signed URL error
- no silent playback when the file should exist

## 4. Locked Preview Behavior

Using a non-entitled user, confirm:

- premium route opens in preview mode
- preview stops still show meaningful information
- locked content does not pretend to be unlocked
- purchase handoff names the exact route

Recommended routes for this check:

- `black-medical-legacy`
- `speakeasy-tour`

## 5. Unlock Flow

Using an entitled user or test unlock path, confirm:

- route becomes fully accessible
- all stops load after unlock
- audio is available beyond the preview limit
- the user returns to the same part of the app after checkout

Recommended routes for this check:

- `black-inventors-tour`
- `black-american-sports`

## 6. Drive/Compass Flow

Open the drive surface and confirm:

- premium routes appear there too
- locked routes show the correct preview messaging
- the unlock CTA carries the user into the correct membership screen

## 7. Final Go / No-Go Questions

Answer these before launch:

- Do all `18` premium tours appear?
- Do at least 4 sampled routes play audio correctly?
- Does preview mode feel understandable?
- Does unlock return the user to the same route flow?
- Is there any route that feels too broken to sell?

## If Something Fails

Use this quick triage order:

1. Check [private-content/tour-pack-status.csv](/Users/nia/Documents/GitHub/philly-tours/private-content/tour-pack-status.csv)
2. Check the affected workspace file in [private-content/tours](/Users/nia/Documents/GitHub/philly-tours/private-content/tours)
3. Re-import that one route:

```bash
npm run content:import:private -- --file private-content/tours/TOUR-ID.catalog.json
```

4. If audio is broken, re-upload that one route:

```bash
npm run content:upload:private-assets -- --file private-content/tours/TOUR-ID.catalog.json --kind audio
```

## Strongest Launch Sample Set

If time is tight, prioritize these for manual review:

- `black-inventors-tour`
- `black-medical-legacy`
- `black-american-sports`
- `speakeasy-tour`
- `divine-9-legacy-tour`
- `old-york-road-corridor`
