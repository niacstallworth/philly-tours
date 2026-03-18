# Happy Hollow Rec Center

Provider-agnostic AR generation job pack for `old-york-road-corridor-happy-hollow-rec-center`.

## Stop Summary

- Tour: Old York Road Corridor
- Priority: 22
- AR Type: `before_after_overlay`
- Asset status: `planned`
- Runtime targets:
  - iOS: `/models/happy-hollow-rec-center.usdz`
  - Android: `/models/happy-hollow-rec-center.glb`
  - Web: `/models/happy-hollow-rec-center.glb`

## Creative Direction

- Headline: Facade-accurate overlay
- Concept goal: Create a proportionally accurate architectural overlay optimized for comparison against the real site.
- Historical era: historic Philadelphia
- Style preset: `architectural`
- Visual priority: `facade_accuracy`
- Asset request: riot and community timeline; neighborhood memory overlay
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: warped facades, floating architecture, futuristic materials, incorrect street geometry, fantasy skyline

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

Stop: Happy Hollow Rec Center
Tour: Old York Road Corridor
AR type: before_after_overlay
Scene goal: Create a proportionally accurate architectural overlay optimized for comparison against the real site.
Historical era: historic Philadelphia
Style preset: architectural
Visual priority: facade_accuracy
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: riot and community timeline, neighborhood memory overlay, facade alignment overlay, material correction pass, street-edge guide
Fallback type: card
Negative prompt / avoid list: warped facades, floating architecture, futuristic materials, incorrect street geometry, fantasy skyline

Asset request from catalog: riot and community timeline; neighborhood memory overlay
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

Stop: Happy Hollow Rec Center
Tour: Old York Road Corridor
AR type: before_after_overlay
Scene goal: Create a proportionally accurate architectural overlay optimized for comparison against the real site.
Historical era: historic Philadelphia
Style preset: architectural
Visual priority: facade_accuracy
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: riot and community timeline, neighborhood memory overlay, facade alignment overlay, material correction pass, street-edge guide
Fallback type: card
Negative prompt / avoid list: warped facades, floating architecture, futuristic materials, incorrect street geometry, fantasy skyline

Scene headline: Facade-accurate overlay
Desired visual emphasis: facade_accuracy
Target atmosphere: architectural

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: warped facades, floating architecture, futuristic materials, incorrect street geometry, fantasy skyline
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Happy Hollow Rec Center
Tour: Old York Road Corridor
AR type: before_after_overlay
Scene goal: Create a proportionally accurate architectural overlay optimized for comparison against the real site.
Historical era: historic Philadelphia
Style preset: architectural
Visual priority: facade_accuracy
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: riot and community timeline, neighborhood memory overlay, facade alignment overlay, material correction pass, street-edge guide
Fallback type: card
Negative prompt / avoid list: warped facades, floating architecture, futuristic materials, incorrect street geometry, fantasy skyline

Primary asset request: riot and community timeline; neighborhood memory overlay
Expected runtime targets: iOS /models/happy-hollow-rec-center.usdz, Android /models/happy-hollow-rec-center.glb, Web /models/happy-hollow-rec-center.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: warped facades, floating architecture, futuristic materials, incorrect street geometry, fantasy skyline
```
