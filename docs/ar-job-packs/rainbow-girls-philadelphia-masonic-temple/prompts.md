# Masonic Temple

Provider-agnostic AR generation job pack for `rainbow-girls-philadelphia-masonic-temple`.

## Stop Summary

- Tour: Rainbow Girls Philadelphia
- Priority: 5
- AR Type: `object_on_plinth`
- Asset status: `planned`
- Runtime targets:
  - iOS: `/models/masonic-temple.usdz`
  - Android: `/models/masonic-temple.glb`
  - Web: `/models/masonic-temple.glb`

## Creative Direction

- Headline: Museum-style object scene
- Concept goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
- Historical era: late 19th to 20th century Philadelphia
- Style preset: `architectural`
- Visual priority: `historical_accuracy`
- Asset request: Rainbow jewels; ceremonial symbols; spatial story cards
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

Stop: Masonic Temple
Tour: Rainbow Girls Philadelphia
AR type: object_on_plinth
Scene goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
Historical era: late 19th to 20th century Philadelphia
Style preset: architectural
Visual priority: historical_accuracy
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: Rainbow jewels, ceremonial symbols, spatial story cards, hero object, plinth/base, annotation card
Fallback type: card
Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

Asset request from catalog: Rainbow jewels; ceremonial symbols; spatial story cards
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

Stop: Masonic Temple
Tour: Rainbow Girls Philadelphia
AR type: object_on_plinth
Scene goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
Historical era: late 19th to 20th century Philadelphia
Style preset: architectural
Visual priority: historical_accuracy
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: Rainbow jewels, ceremonial symbols, spatial story cards, hero object, plinth/base, annotation card
Fallback type: card
Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

Scene headline: Museum-style object scene
Desired visual emphasis: historical_accuracy
Target atmosphere: architectural

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

Stop: Masonic Temple
Tour: Rainbow Girls Philadelphia
AR type: object_on_plinth
Scene goal: Create a clean hero object presentation with museum-style framing and minimal clutter.
Historical era: late 19th to 20th century Philadelphia
Style preset: architectural
Visual priority: historical_accuracy
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: Rainbow jewels, ceremonial symbols, spatial story cards, hero object, plinth/base, annotation card
Fallback type: card
Negative prompt / avoid list: floating fragments, broken anatomy, abstract sculptures, futuristic materials

Primary asset request: Rainbow jewels; ceremonial symbols; spatial story cards
Expected runtime targets: iOS /models/masonic-temple.usdz, Android /models/masonic-temple.glb, Web /models/masonic-temple.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: floating fragments, broken anatomy, abstract sculptures, futuristic materials
```
