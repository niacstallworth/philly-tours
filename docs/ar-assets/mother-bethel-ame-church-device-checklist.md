# Mother Bethel AME Church On-Device AR Tuning Checklist

Use this checklist on a real ARKit-capable iPhone or iPad. The simulator cannot validate the real 3D scene.

## Preflight

- Confirm the app build includes `ios/PhillyARTours/ARAssets/models/mother-bethel-ame-church.usdz`
- Confirm the selected stop is `Mother Bethel AME Church`
- Confirm the AR tab shows current tuning values:
  - scale
  - rotation
  - vertical offset

## First launch checks

1. Launch the `Mother Bethel AME Church` AR moment
2. Confirm the real `.usdz` model appears instead of the fallback card
3. Move slowly around the object and check stability

## Tuning outcomes to report

### Size
- too small
- too large
- reads correctly at standing distance

### Orientation
- facing backward
- rotated left
- rotated right
- facing correctly

### Height
- too low into the ground
- floating too high
- sitting correctly in the visitor's sightline

### Readability
- silhouette reads well immediately
- too much detail disappears at distance
- facade reads clearly
- object needs simplification

## Recommended patch targets

- `scale`
  - increase if the model feels toy-sized
  - decrease if it overwhelms the frame
- `rotationYDeg`
  - adjust if the front face is not presented correctly
- `verticalOffsetM`
  - positive raises the model
  - negative lowers the model

## Current starting values

- `scale: 1`
- `rotationYDeg: 180`
- `verticalOffsetM: 0`

## Report format

Send back one line in this format:

```text
Mother Bethel AME Church [black-american-legacy-and-quaker-heritage-mother-bethel-ame-church]: scale 1.2, rotationYDeg 135, verticalOffsetM 0.15
```

Then apply it with:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:tuning:apply
```

The script reads the copied snapshot from the macOS clipboard, updates `docs/ar-asset-catalog.csv`, and regenerates the runtime catalog.
