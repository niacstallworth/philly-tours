# Johnson House

Provider-agnostic AR generation job pack for `black-american-legacy-and-quaker-heritage-johnson-house`.

## Stop Summary

- Tour: Black American Legacy & Quaker Heritage
- Priority: 3
- AR Type: `historical_figure_presence`
- Asset status: `planned`
- Runtime targets:
  - iOS: `/models/johnson-house.usdz`
  - Android: `/models/johnson-house.glb`
  - Web: `/models/johnson-house.glb`

## Creative Direction

- Headline: Figure-led historic scene
- Concept goal: Stage a respectful figure-led scene with strong silhouette clarity and restrained supporting context.
- Historical era: 18th to 19th century Philadelphia
- Style preset: `cinematic`
- Visual priority: `silhouette`
- Asset request: Underground Railroad scene; host figure silhouette; route overlay
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: uncanny faces, caricature proportions, modern clothing, modern accessories, crowd clutter

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

Stop: Johnson House
Tour: Black American Legacy & Quaker Heritage
AR type: historical_figure_presence
Scene goal: Stage a respectful figure-led scene with strong silhouette clarity and restrained supporting context.
Historical era: 18th to 19th century Philadelphia
Style preset: cinematic
Visual priority: silhouette
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: Underground Railroad scene, host figure silhouette, route overlay, hero figure silhouette, staging marker, supporting context card
Fallback type: card
Negative prompt / avoid list: uncanny faces, caricature proportions, modern clothing, modern accessories, crowd clutter

Asset request from catalog: Underground Railroad scene; host figure silhouette; route overlay
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

Stop: Johnson House
Tour: Black American Legacy & Quaker Heritage
AR type: historical_figure_presence
Scene goal: Stage a respectful figure-led scene with strong silhouette clarity and restrained supporting context.
Historical era: 18th to 19th century Philadelphia
Style preset: cinematic
Visual priority: silhouette
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: Underground Railroad scene, host figure silhouette, route overlay, hero figure silhouette, staging marker, supporting context card
Fallback type: card
Negative prompt / avoid list: uncanny faces, caricature proportions, modern clothing, modern accessories, crowd clutter

Scene headline: Figure-led historic scene
Desired visual emphasis: silhouette
Target atmosphere: cinematic

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: uncanny faces, caricature proportions, modern clothing, modern accessories, crowd clutter
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Johnson House
Tour: Black American Legacy & Quaker Heritage
AR type: historical_figure_presence
Scene goal: Stage a respectful figure-led scene with strong silhouette clarity and restrained supporting context.
Historical era: 18th to 19th century Philadelphia
Style preset: cinematic
Visual priority: silhouette
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: Underground Railroad scene, host figure silhouette, route overlay, hero figure silhouette, staging marker, supporting context card
Fallback type: card
Negative prompt / avoid list: uncanny faces, caricature proportions, modern clothing, modern accessories, crowd clutter

Primary asset request: Underground Railroad scene; host figure silhouette; route overlay
Expected runtime targets: iOS /models/johnson-house.usdz, Android /models/johnson-house.glb, Web /models/johnson-house.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: uncanny faces, caricature proportions, modern clothing, modern accessories, crowd clutter
```
