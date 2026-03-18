# Ogontz Theatre Site

Provider-agnostic AR generation job pack for `old-york-road-corridor-ogontz-theatre-site`.

## Stop Summary

- Tour: Old York Road Corridor
- Priority: 20
- AR Type: `portal_reconstruction`
- Asset status: `planned`
- Runtime targets:
  - iOS: `/models/ogontz-theatre-site.usdz`
  - Android: `/models/ogontz-theatre-site.glb`
  - Web: `/models/ogontz-theatre-site.glb`

## Creative Direction

- Headline: Hero portal reconstruction
- Concept goal: Create a spatially convincing reconstruction with foreground depth and a clear portal framing moment.
- Historical era: historic Philadelphia
- Style preset: `cinematic`
- Visual priority: `atmosphere`
- Asset request: theatre facade reconstruction; performance poster overlays
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: science fiction elements, neon cyberpunk styling, modern cars, modern glass towers, exaggerated fantasy ruins

## AI Guardrails

- Use AI for concept ideation, moodboards, references, and rough starting geometry only.
- Do not treat 2D image output as the final AR object.
- Final user-facing output must become a cleaned 3D asset packaged as .usdz for iOS and .glb for Android/web.
- Favor historically grounded scenes over speculative spectacle.
- Optimize for one clear AR moment at a time rather than layered clutter.

## Suggested API Stages

- `text_brief`
- `concept_image`
- `rough_mesh`

## Text Brief Prompt

```
You are preparing an internal production brief for a mobile AR scene.
The output should help a human artist or producer create a historically grounded 3D asset.
Do not describe final app UI, dashboards, or developer tooling.

Stop: Ogontz Theatre Site
Tour: Old York Road Corridor
AR type: portal_reconstruction
Scene goal: Create a spatially convincing reconstruction with foreground depth and a clear portal framing moment.
Historical era: historic Philadelphia
Style preset: cinematic
Visual priority: atmosphere
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: theatre facade reconstruction, performance poster overlays, portal frame, foreground occlusion pass, historic depth backdrop
Fallback type: card
Negative prompt / avoid list: science fiction elements, neon cyberpunk styling, modern cars, modern glass towers, exaggerated fantasy ruins

Asset request from catalog: theatre facade reconstruction; performance poster overlays
Producer notes: [pipeline-sync] no generated pipeline artifacts yet

Return:
1. A concise scene concept paragraph.
2. A composition breakdown with foreground, midground, and background.
3. A material/reference checklist.
4. A risk list covering historical accuracy, readability, and placement drift concerns.
5. Recommended reference imagery or archival material to gather before modeling.
```

## Concept Image Prompt

```
Generate an internal concept image only. This is not the final runtime asset.
The image should help art direction, lighting, composition, and texture planning for a future 3D model.
Preserve historical plausibility and avoid speculative sci-fi embellishment.

Stop: Ogontz Theatre Site
Tour: Old York Road Corridor
AR type: portal_reconstruction
Scene goal: Create a spatially convincing reconstruction with foreground depth and a clear portal framing moment.
Historical era: historic Philadelphia
Style preset: cinematic
Visual priority: atmosphere
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: theatre facade reconstruction, performance poster overlays, portal frame, foreground occlusion pass, historic depth backdrop
Fallback type: card
Negative prompt / avoid list: science fiction elements, neon cyberpunk styling, modern cars, modern glass towers, exaggerated fantasy ruins

Scene headline: Hero portal reconstruction
Desired visual emphasis: atmosphere
Target atmosphere: cinematic

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: science fiction elements, neon cyberpunk styling, modern cars, modern glass towers, exaggerated fantasy ruins
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Ogontz Theatre Site
Tour: Old York Road Corridor
AR type: portal_reconstruction
Scene goal: Create a spatially convincing reconstruction with foreground depth and a clear portal framing moment.
Historical era: historic Philadelphia
Style preset: cinematic
Visual priority: atmosphere
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: theatre facade reconstruction, performance poster overlays, portal frame, foreground occlusion pass, historic depth backdrop
Fallback type: card
Negative prompt / avoid list: science fiction elements, neon cyberpunk styling, modern cars, modern glass towers, exaggerated fantasy ruins

Primary asset request: theatre facade reconstruction; performance poster overlays
Expected runtime targets: iOS /models/ogontz-theatre-site.usdz, Android /models/ogontz-theatre-site.glb, Web /models/ogontz-theatre-site.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: science fiction elements, neon cyberpunk styling, modern cars, modern glass towers, exaggerated fantasy ruins
```
