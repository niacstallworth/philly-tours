# Allen Iverson's Hampton Park Courts

Provider-agnostic AR generation job pack for `black-american-sports-allen-iverson-s-hampton-park-courts`.

## Stop Summary

- Tour: Black American Sports
- Priority: 7
- AR Type: `object_on_plinth`
- Asset status: `in_production`
- Runtime targets:
  - iOS: `/models/allen-iverson-s-hampton-park-courts.usdz`
  - Android: `/models/allen-iverson-s-hampton-park-courts.glb`
  - Web: `/models/allen-iverson-s-hampton-park-courts.glb`

## Creative Direction

- Headline: Museum-style object scene
- Concept goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
- Historical era: late 20th to early 21st century Philadelphia basketball
- Style preset: `cinematic`
- Visual priority: `readability`
- Asset request: basketball and crossover trail object; mural card; legacy marker
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

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

Stop: Allen Iverson's Hampton Park Courts
Tour: Black American Sports
AR type: object_on_plinth
Scene goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
Historical era: late 20th to early 21st century Philadelphia basketball
Style preset: cinematic
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: basketball and crossover trail object, mural card, legacy marker, hero object, plinth/base, annotation card
Fallback type: card
Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

Asset request from catalog: basketball and crossover trail object; mural card; legacy marker
Producer notes: [strategy-reset] sports object scene prioritized over site reconstruction

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

Stop: Allen Iverson's Hampton Park Courts
Tour: Black American Sports
AR type: object_on_plinth
Scene goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
Historical era: late 20th to early 21st century Philadelphia basketball
Style preset: cinematic
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: basketball and crossover trail object, mural card, legacy marker, hero object, plinth/base, annotation card
Fallback type: card
Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

Scene headline: Museum-style object scene
Desired visual emphasis: readability
Target atmosphere: cinematic

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: floating fragments, broken anatomy, abstract sculptures, futuristic materials
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Allen Iverson's Hampton Park Courts
Tour: Black American Sports
AR type: object_on_plinth
Scene goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
Historical era: late 20th to early 21st century Philadelphia basketball
Style preset: cinematic
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: basketball and crossover trail object, mural card, legacy marker, hero object, plinth/base, annotation card
Fallback type: card
Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

Primary asset request: basketball and crossover trail object; mural card; legacy marker
Expected runtime targets: iOS /models/allen-iverson-s-hampton-park-courts.usdz, Android /models/allen-iverson-s-hampton-park-courts.glb, Web /models/allen-iverson-s-hampton-park-courts.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: floating fragments, broken anatomy, abstract sculptures, futuristic materials
```
