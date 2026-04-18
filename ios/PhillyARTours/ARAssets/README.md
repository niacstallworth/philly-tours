# ARAssets

This folder is the bundled iOS intake path for real `.usdz` AR assets used by the native AR bridge.

## Contract

- Keep runtime catalog paths in the form `/models/<slug>.usdz`
- Drop the actual iOS file into `ios/PhillyARTours/ARAssets/models/<slug>.usdz`
- Keep the paired Android/Web `.glb` asset path in `src/data/arAssetCatalog.ts`
- Rebuild iOS after adding or replacing a `.usdz`

## Priority AR Moments

The current curated production set is tracked in `src/data/arAssetCatalog.ts` and generated into `docs/ar-briefs/` and `docs/ar-scene-manifests/`.

1. Lewis Latimer Light Bulb Exhibit
   - Runtime path: `/models/lewis-latimer-light-bulb-exhibit.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/lewis-latimer-light-bulb-exhibit.usdz`
2. Garrett Morgan Traffic Signal
   - Runtime path: `/models/garrett-morgan-traffic-signal.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/garrett-morgan-traffic-signal.usdz`
3. Dr. Charles Drew Blood Bank
   - Runtime path: `/models/dr-charles-drew-blood-bank.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/dr-charles-drew-blood-bank.usdz`
4. Mercy-Douglass Nurse Training
   - Runtime path: `/models/mercy-douglass-nurse-training.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/mercy-douglass-nurse-training.usdz`
5. Barbara Bates Center
   - Runtime path: `/models/barbara-bates-center.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/barbara-bates-center.usdz`
6. Joe Frazier's Gym / Cloverlay
   - Runtime path: `/models/joe-frazier-s-gym-cloverlay.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/joe-frazier-s-gym-cloverlay.usdz`
7. Allen Iverson's Hampton Park Courts
   - Runtime path: `/models/allen-iverson-s-hampton-park-courts.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/allen-iverson-s-hampton-park-courts.usdz`
8. Sonny Hill League @ Tustin
   - Runtime path: `/models/sonny-hill-league-tustin.usdz`
   - Bundled file: `ios/PhillyARTours/ARAssets/models/sonny-hill-league-tustin.usdz`

## Notes

- This folder is copied into the app bundle through the Xcode project resources phase.
- The native iOS AR loader checks both the raw bundle root and `ARAssets/models/` so future assets can follow the same pattern.
- Keep filenames lowercase, hyphenated, and stable once referenced in the catalog.
- A tour stop can still work without a bundled asset; the app should keep narration, Compass, maps handoff, and fallback AR cards available while assets are in production.
