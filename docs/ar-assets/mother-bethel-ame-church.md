# Mother Bethel AME Church `.usdz` Intake

This is the first real iOS hero-asset pipeline for the AR runtime.

## Runtime contract

- Catalog path: `/models/mother-bethel-ame-church.usdz`
- Bundled iOS path: `ios/PhillyARTours/ARAssets/models/mother-bethel-ame-church.usdz`
- Runtime tuning fields:
  - `scale`
  - `rotationYDeg`
  - `verticalOffsetM`
- Rebuild command after asset drop:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export PATH="$HOME/.gem/ruby/2.6.0/bin:$PATH"
export RUBYOPT='-rlogger'
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npx expo run:ios --port 8081
```

## Scene target

- Stop: `Mother Bethel AME Church`
- AR type: `portal_reconstruction`
- Intent: reconstructed exterior moment with elegant spatial depth, not a cluttered panel
- User outcome: one premium 3D historical moment visible from a comfortable standing distance

## Asset requirements

- Format: `.usdz`
- Coordinate system: upright Y-axis
- Pivot: centered and stable for front-of-user placement
- Scale target: authored for current runtime scale `1.0`
- Materials: PBR where useful, but keep texture memory disciplined
- Visual bias: architectural fidelity, silhouette clarity, period-respectful detail

## Build constraints

- Keep the first version simple enough to validate runtime loading fast
- Avoid overbuilding a full block-sized scene in v1
- Prefer one hero composition with a few supporting elements over many small props
- Do not rely on thin details that disappear on small monocular displays

## Recommended v1 composition

- church exterior massing
- facade detail that reads clearly at medium distance
- one or two supporting foreground anchors
- optional ground plane or low pedestal treatment if needed for readability

## Export checklist

- Filename is exactly `mother-bethel-ame-church.usdz`
- Opens locally in Quick Look
- Reasonable file size for mobile iteration
- No missing textures
- Normals and material orientation look correct on device
- Rebuild app and verify runtime loads model instead of fallback card
- Tune current starting values on device:
  - `scale: 1`
  - `rotationYDeg: 180`
  - `verticalOffsetM: 0`

## Nice-to-have later

- secondary animation pass
- richer lighting polish
- alternate close-range version
- Android `.glb` parity asset
