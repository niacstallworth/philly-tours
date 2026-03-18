# Old York Road & North Broad

Provider-agnostic AR generation job pack for `old-york-road-corridor-old-york-road-and-north-broad`.

## Stop Summary

- Tour: Old York Road Corridor
- Priority: 26
- AR Type: `route_ghost`
- Asset status: `planned`
- Runtime targets:
  - iOS: `/models/old-york-road-and-north-broad.usdz`
  - Android: `/models/old-york-road-and-north-broad.glb`
  - Web: `/models/old-york-road-and-north-broad.glb`

## Creative Direction

- Headline: Wayfinding ghost route
- Concept goal: Create a directional guidance overlay with immediate legibility and minimal visual noise.
- Historical era: historic Philadelphia
- Style preset: `museum_card`
- Visual priority: `readability`
- Asset request: corridor route arrows; milestone reveal; wayfinding card
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: heavy clutter, chaotic perspective, illegible wayfinding, dense traffic

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

Stop: Old York Road & North Broad
Tour: Old York Road Corridor
AR type: route_ghost
Scene goal: Create a directional guidance overlay with immediate legibility and minimal visual noise.
Historical era: historic Philadelphia
Style preset: museum_card
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: corridor route arrows, milestone reveal, wayfinding card, direction arrows, milestone labels, route breadcrumbs
Fallback type: card
Negative prompt / avoid list: heavy clutter, chaotic perspective, illegible wayfinding, dense traffic

Asset request from catalog: corridor route arrows; milestone reveal; wayfinding card
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

Stop: Old York Road & North Broad
Tour: Old York Road Corridor
AR type: route_ghost
Scene goal: Create a directional guidance overlay with immediate legibility and minimal visual noise.
Historical era: historic Philadelphia
Style preset: museum_card
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: corridor route arrows, milestone reveal, wayfinding card, direction arrows, milestone labels, route breadcrumbs
Fallback type: card
Negative prompt / avoid list: heavy clutter, chaotic perspective, illegible wayfinding, dense traffic

Scene headline: Wayfinding ghost route
Desired visual emphasis: readability
Target atmosphere: museum_card

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: heavy clutter, chaotic perspective, illegible wayfinding, dense traffic
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Old York Road & North Broad
Tour: Old York Road Corridor
AR type: route_ghost
Scene goal: Create a directional guidance overlay with immediate legibility and minimal visual noise.
Historical era: historic Philadelphia
Style preset: museum_card
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: corridor route arrows, milestone reveal, wayfinding card, direction arrows, milestone labels, route breadcrumbs
Fallback type: card
Negative prompt / avoid list: heavy clutter, chaotic perspective, illegible wayfinding, dense traffic

Primary asset request: corridor route arrows; milestone reveal; wayfinding card
Expected runtime targets: iOS /models/old-york-road-and-north-broad.usdz, Android /models/old-york-road-and-north-broad.glb, Web /models/old-york-road-and-north-broad.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: heavy clutter, chaotic perspective, illegible wayfinding, dense traffic
```
