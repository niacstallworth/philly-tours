# Garrett Morgan Traffic Signal

Provider-agnostic AR generation job pack for `black-inventors-tour-garrett-morgan-traffic-signal`.

## Stop Summary

- Tour: Black Inventors Tour
- Priority: 2
- AR Type: `animated_diagram`
- Asset status: `in_production`
- Runtime targets:
  - iOS: `/models/garrett-morgan-traffic-signal.usdz`
  - Android: `/models/garrett-morgan-traffic-signal.glb`
  - Web: `/models/garrett-morgan-traffic-signal.glb`

## Creative Direction

- Headline: Animated explainer scene
- Concept goal: Create a readable explanatory object or mechanism scene where motion supports understanding.
- Historical era: early 20th century innovation
- Style preset: `documentary`
- Visual priority: `readability`
- Asset request: signal mechanism; intersection explainer; patent timeline
- Placement note: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
- Negative prompt / avoid list: messy composition, extra parts, abstract background noise, unreadable labels

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

Stop: Garrett Morgan Traffic Signal
Tour: Black Inventors Tour
AR type: animated_diagram
Scene goal: Create a readable explanatory object or mechanism scene where motion supports understanding.
Historical era: early 20th century innovation
Style preset: documentary
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: signal mechanism, intersection explainer, patent timeline, primary mechanism, step labels, motion sequence overlays
Fallback type: card
Negative prompt / avoid list: messy composition, extra parts, abstract background noise, unreadable labels

Asset request from catalog: signal mechanism; intersection explainer; patent timeline
Producer notes: [strategy-reset] object-centered AR candidate prioritized over building/site reconstruction

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

Stop: Garrett Morgan Traffic Signal
Tour: Black Inventors Tour
AR type: animated_diagram
Scene goal: Create a readable explanatory object or mechanism scene where motion supports understanding.
Historical era: early 20th century innovation
Style preset: documentary
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: signal mechanism, intersection explainer, patent timeline, primary mechanism, step labels, motion sequence overlays
Fallback type: card
Negative prompt / avoid list: messy composition, extra parts, abstract background noise, unreadable labels

Scene headline: Animated explainer scene
Desired visual emphasis: readability
Target atmosphere: documentary

Requirements:
- Keep the scene legible as a single clear AR moment.
- Avoid crowded compositions and complex HUD overlays.
- Bias toward forms that can be translated cleanly into a 3D asset.
- Avoid: messy composition, extra parts, abstract background noise, unreadable labels
```

## Rough Mesh Prompt

```
Generate a rough 3D blockout or starting geometry only.
This output will be cleaned manually before becoming a production AR asset.
Do not assume the generated mesh is final quality.

Stop: Garrett Morgan Traffic Signal
Tour: Black Inventors Tour
AR type: animated_diagram
Scene goal: Create a readable explanatory object or mechanism scene where motion supports understanding.
Historical era: early 20th century innovation
Style preset: documentary
Visual priority: readability
Runtime placement: Place the scene directly in front of the visitor at a safe standing distance within the 40m trigger zone.
Requested content layers: signal mechanism, intersection explainer, patent timeline, primary mechanism, step labels, motion sequence overlays
Fallback type: card
Negative prompt / avoid list: messy composition, extra parts, abstract background noise, unreadable labels

Primary asset request: signal mechanism; intersection explainer; patent timeline
Expected runtime targets: iOS /models/garrett-morgan-traffic-signal.usdz, Android /models/garrett-morgan-traffic-signal.glb, Web /models/garrett-morgan-traffic-signal.glb

Requirements:
- Prioritize silhouette, scale, and spatial readability over decorative detail.
- Preserve clean separable geometry for manual cleanup in Blender or similar tools.
- Favor historically plausible massing and proportions.
- Avoid: messy composition, extra parts, abstract background noise, unreadable labels
```
