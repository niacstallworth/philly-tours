# ARAssets

This folder is the bundled iOS intake path for real `.usdz` AR assets.

## Contract

- Keep runtime catalog paths in the form `/models/<slug>.usdz`
- Drop the actual iOS file into `ios/PhillyARTours/ARAssets/models/<slug>.usdz`
- Rebuild iOS after adding or replacing a `.usdz`

## First Hero Stop

- Mother Bethel AME Church runtime path: `/models/mother-bethel-ame-church.usdz`
- Expected bundled file: `ios/PhillyARTours/ARAssets/models/mother-bethel-ame-church.usdz`

## Notes

- This folder is copied into the app bundle through the Xcode project resources phase.
- The native iOS AR loader checks both the raw bundle root and `ARAssets/models/` so future assets can follow the same pattern.
- Keep filenames lowercase, hyphenated, and stable once referenced in the catalog.
