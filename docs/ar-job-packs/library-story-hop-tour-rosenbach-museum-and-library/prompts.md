# Rosenbach Museum & Library

Provider-agnostic AR generation job pack for `library-story-hop-tour-rosenbach-museum-and-library`.

## Stop Summary

- Tour: Library Story Hop Tour
- Priority: 17
- AR Type: `floating_story_card`
- Asset status: `planned`
- Runtime targets:
  - iOS: `/models/rosenbach-museum-and-library.usdz`
  - Android: `/models/rosenbach-museum-and-library.glb`
  - Web: `/models/rosenbach-museum-and-library.glb`

## Creative Direction

- Headline: Editorial AR story card
- Concept goal: Create an editorial story-card scene that privileges readability over spectacle.
- Historical era: historic Philadelphia
- Style preset: `editorial`
- Visual priority: `readability`
- Asset request: manuscript cards; toy and book reveal; collection overlay
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: busy backgrounds, unreadable layouts, overdecorated borders, dense clutter

## AI Guardrails

- Use AI for concept ideation, moodboards, references, and rough starting geometry only.
- Do not treat 2D image output as the final AR object.
- Final user-facing output must become a cleaned 3D asset packaged as .usdz for iOS and .glb for Android/web.
- Favor historically grounded scenes over speculative spectacle.
- Optimize for one clear AR moment at a time rather than layered clutter.

## Suggested API Stages

- `text_brief`
- `concept_image`

## Text Brief Prompt

```
You are preparing an internal production brief for a mobile AR scene.
The output should help a human artist or producer create a historically grounded 3D asset.
Do not describe final app UI, dashboards, or developer tooling.

Stop: Rosenbach Museum & Library
Tour: Library Story Hop Tour
AR type: floating_story_card
Scene goal: Create an editorial story-card scene that privileges readability over spectacle.
Historical era: historic Philadelphia
Style preset: editorial
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: manuscript cards, toy and book reveal, collection overlay, story card stack, headline frame, lightweight foreground treatment
Fallback type: card
Negative prompt / avoid list: busy backgrounds, unreadable layouts, overdecorated borders, dense clutter

Asset request from catalog: manuscript cards; toy and book reveal; collection overlay
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

Stop: Rosenbach Museum & Library
Tour: Library Story Hop Tour
AR type: floating_story_card
Scene goal: Create an editorial story-card scene that privileges readability over spectacle.
Historical era: historic Philadelphia
Style preset: editorial
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: manuscript cards, toy and book reveal, collection overlay, story card stack, headline frame, lightweight foreground treatment
Fallback type: card
Negative prompt / avoid list: busy backgrounds, unreadable layouts, overdecorated borders, dense clutter

Scene headline: Editorial AR story card
Desired visual emphasis: readability
Target atmosphere: editorial

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: busy backgrounds, unreadable layouts, overdecorated borders, dense clutter
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Rosenbach Museum & Library
Tour: Library Story Hop Tour
AR type: floating_story_card
Scene goal: Create an editorial story-card scene that privileges readability over spectacle.
Historical era: historic Philadelphia
Style preset: editorial
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: manuscript cards, toy and book reveal, collection overlay, story card stack, headline frame, lightweight foreground treatment
Fallback type: card
Negative prompt / avoid list: busy backgrounds, unreadable layouts, overdecorated borders, dense clutter

Primary asset request: manuscript cards; toy and book reveal; collection overlay
Expected runtime targets: iOS /models/rosenbach-museum-and-library.usdz, Android /models/rosenbach-museum-and-library.glb, Web /models/rosenbach-museum-and-library.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: busy backgrounds, unreadable layouts, overdecorated borders, dense clutter
```
