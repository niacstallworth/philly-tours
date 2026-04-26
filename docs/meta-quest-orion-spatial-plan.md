# Meta Quest 2 and Orion Spatial Plan

## Goal

Add a headset-native mixed reality lane for Philly Tours that can be built and tested on Quest 2 now, while designing the interaction model and spatial UI to fit Orion-style true AR glasses later.

This is a new spatial client lane, not a rewrite of the current React Native app.

## Hardware Posture

### Build and test hardware now

Use Quest 2 as the practical development headset:

- Unity as the runtime shell
- Meta XR All-in-One SDK as the primary platform SDK
- OpenXR enabled
- Quest passthrough enabled for mixed reality prototyping
- hand tracking first, controller fallback second

Quest 2 is the current build/test target because it is available mixed reality hardware with a mature Unity workflow.

### Design target later

Treat Orion as the future design target:

- lightweight floating UI
- small-field-of-view spatial composition
- hand pinch and gaze-first selection
- voice-first commands
- minimal overlay density
- no dependence on large VR menus or controller-only flows

Important limitation:

Quest 2 passthrough is not the same thing as Orion. Quest 2 shows the real world through headset cameras. Orion is true optical AR glasses. The prototype should validate interaction model, layout density, and scene grammar, not pretend the hardware is equivalent.

## Product Rule

Philly Tours should keep two Meta lanes instead of forcing one product to do everything:

1. the current phone-plus-companion lane for audio, narration, pairing, and phone-native AR handoff
2. a new Unity spatial lane for headset-native mixed reality moments

The Unity lane should focus on premium stop moments, not replace the route, payment, or full consumer shell.

## Stack

Start the headset runtime with:

- Unity
- Meta XR All-in-One SDK
- OpenXR
- Quest 2 passthrough
- hand tracking with controller fallback
- world-space UI panels

Recommended repo posture:

- keep the existing React Native app as the source of truth for tours, stops, narration, entitlements, and progress
- add a separate Unity project in a future folder such as `spatial/quest-unity/`
- consume exported stop and AR manifest data from this repo instead of duplicating content authoring inside Unity

Current repo command:

```bash
CITY=philly npm run spatial:quest:build
```

Current generated payload path:

- `spatial/runtime/philly/quest-scenes.json`

## Architecture Boundary

### React Native app remains source of truth

The current app should continue to own:

- tour catalog and stop sequencing
- Story Logistics ordering
- narration text and audio references
- entitlements and auth
- mobile-native AR handoff
- profile, payments, and progression

### Unity spatial client owns

The Quest 2 client should own:

- passthrough scene setup
- spatial anchors and placement behaviors
- hand/gaze/controller interaction handling
- floating cards and world-space UI
- scene transitions between stop states
- headset-safe presentation rules

### Shared data contract

The Unity client should read generated content from the existing repo artifacts:

- `cities/<city>/ar.json`
- `docs/ar-scene-manifests/*.json`
- future exported runtime bundles derived from `src/services/arManifest.ts`

Each stop payload should eventually expose only the fields the headset client needs:

- `stopId`
- `stopTitle`
- `headline`
- `summary`
- `arType`
- `runtimeAssets`
- `contentLayers`
- `placementNote`
- `anchorStyle`
- `voicePrompts`
- `interactionHints`

That keeps Unity thin and prevents a second content system from emerging.

## Spatial UX Rules

Build the Orion-style UI like this:

- small floating cards
- one primary object at a time
- one action cluster at a time
- voice-first commands
- hand pinch/select
- short labels
- concise narration prompts
- restrained route arrows and beacons

Avoid:

- giant VR menus
- controller dependency
- dense stacked panels
- full-screen overlays
- long paragraphs in space
- dashboard-style diagnostics in headset

Assume glasses-sized field of view even while testing on Quest 2.

## Interaction Model

### Primary inputs

- voice for `start tour`, `next stop`, `repeat`, `pause`, `hide panel`, `open on phone`
- hand tracking for pinch, tap, and panel reposition
- gaze or head-aim for focus targeting

### Fallback inputs

- Quest controllers only as a safety fallback for testing and accessibility

### Panel grammar

Use a small set of repeatable spatial surfaces:

- `Hero card`
  - title
  - one-sentence context
  - one primary action
- `Route beacon`
  - directional marker toward next point of attention
- `Object label`
  - short identity tag with year or role
- `Narration chip`
  - play, pause, repeat, next

If a layout needs more than one hero card and one support surface at once, it is too dense for the Orion target.

## Scene Types

Map existing Philly Tours AR types into a headset-safe grammar:

- `portal_reconstruction`
  - anchored reconstruction plus one small card
- `historical_figure_presence`
  - figure or silhouette plus one label and audio cue
- `before_after_overlay`
  - restrained overlay with explicit alignment aid
- `object_on_plinth`
  - museum-style hero object plus short annotation
- `animated_diagram`
  - one animated mechanism with step chips
- `floating_story_card`
  - only for light scenes, and never as a dense text wall
- `route_ghost`
  - directional breadcrumbing only

## Quest 2 Implementation Notes

### Passthrough setup

Enable passthrough in the Unity Quest project and use it as the base environment layer for stop scenes and lightweight route overlays.

The first technical validation loop should cover:

- passthrough scene boot
- hand tracking
- controller fallback
- world-space panel readability
- anchor stability
- panel occlusion and depth comfort

### Spatial anchoring

Prototype these anchor behaviors first:

- front-of-user floating panel
- ground-anchored object
- location-marker beacon
- object-follow support label

Keep placement conservative. The goal is readability and comfort, not spectacle.

## Orion Compatibility Rules

To stay Orion-compatible later:

- design for a much smaller comfortable content envelope than Quest 2 allows
- keep critical actions near the center of view
- assume text must be glanceable
- avoid reliance on controller affordances
- keep narration as the main storytelling channel
- treat overlays as brief, supportive, and spatially intentional

The best Orion outcome is:

- audio carries the story
- spatial content provides one clear visual jewel
- the UI disappears quickly when the user does not need it

## First Build Slice

The first Unity slice should prove the interaction model with one hero stop.

Recommended first stop:

- Mother Bethel AME Church

Why:

- already prioritized in product docs
- already represented in AR planning data
- strong fit for a single hero reconstruction plus concise story card

First-slice feature list:

1. launch into passthrough on Quest 2
2. place one anchored hero object or reconstruction
3. show one floating title card
4. support narration controls with hand pinch
5. support `next`, `repeat`, and `hide` by voice
6. fall back to controllers if hand tracking is unavailable

## Delivery Sequence

1. Keep the React Native mobile app as the route and account backbone.
2. Create a separate Unity Quest project.
3. Export a minimal scene payload from existing AR manifests.
4. Prove one hero stop in Quest 2 passthrough.
5. Validate hand tracking, voice commands, and panel readability.
6. Expand to two or three hero stops only after the scene grammar feels stable.
7. Keep checking every addition against Orion-style small-FOV constraints.

## Guardrails

- Do not rebuild the whole app shell in Unity first.
- Do not make the headset client the source of truth for tours or narration.
- Do not optimize for controller-first VR interaction.
- Do not let Quest 2's wider headset affordances justify crowded layouts.
- Do not confuse Quest passthrough validation with true Orion hardware validation.

## Immediate Repo Follow-Up

The next implementation pass for this repository should do three things:

1. flesh out the Unity project in `spatial/quest-unity/`
2. load the generated JSON export into Quest scenes through `StreamingAssets`
3. keep the current Meta companion plan intact for phone-first wearable audio and control flows
