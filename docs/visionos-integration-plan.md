# visionOS Integration Plan

## Goal

Extend Philly Tours from a drive-first iPhone experience into a passenger-safe spatial computing product for Apple Vision Pro.

The product arc is:

- in-car narration on phone
- selective stop-by-stop AR handoff on phone
- immersive passenger-mode spatial recap and landmark exploration on Vision Pro

This is an extension of the current AR foundation, not a rewrite.

## Product Thesis

Philly Tours should position Vision Pro as a premium companion for parked, passenger, or post-drive moments.

Strong use cases:

- passenger-side immersive tour mode during a curated drive
- parked-at-the-stop landmark exploration in 3D
- post-route spatial recap of Black legacy, architecture, and innovation corridors
- shared family or small-group narration moments around volumetric landmarks

The app must never imply headset use while driving.

## Phase 1: Compatibility Build

First objective: get the existing app building and running as a compatible experience on Vision Pro, then convert to a native visionOS destination in Xcode when the project is ready.

Immediate steps:

1. Open `ios/PhillyARTours.xcworkspace` in the current Xcode release with visionOS support.
2. Add `Apple Vision` as a supported destination for the app target.
3. Confirm the app compiles against the visionOS SDK.
4. Run on the visionOS Simulator.
5. Validate the main shell, route browsing, narration surfaces, and AR entry points.

Expected outcome:

- the current UI works in a spatial window
- route browsing and narration remain phone-like at first
- this creates a low-risk base for later immersion work

## Phase 2: Native Spatial Upgrade

After the compatibility pass is stable, move the AR handoff from modal phone AR into a real spatial experience.

Primary native building blocks:

- RealityKit for 3D entities and scene composition
- SwiftUI `WindowGroup` for the standard app shell
- SwiftUI `ImmersiveSpace` for premium landmark moments
- shared state between route UI and immersive content

Target capabilities:

- volumetric Philly landmark placement
- floating historical markers and identity labels
- corridor-level spatial recap scenes
- shared spatial narration controls for small-group tours

## Phase 3: React Native Boundary

Keep the current React Native app as the source of truth for:

- tours
- stops
- narration sequencing
- progress
- entitlements

Use native visionOS surfaces only where spatial value is real:

- immersive landmark viewer
- volumetric route recap
- passenger-safe spatial dashboard

Do not assume Expo-only configuration is enough for full native visionOS support. Any dedicated visionOS shell should be treated as a native extension with explicit testing and build validation.

## Existing Repo Strengths

The repo already has useful foundations for visionOS work:

- native AR bridge in `ios/PhillyARTours/PhillyNativeAR.swift`
- RealityKit already linked in the native bridge
- route, stop, and narration data already structured in the app
- AR scene planning assets under `docs/ar-scene-manifests/`
- clear product posture around selective AR instead of forcing AR at every stop

## Immediate Engineering Tasks

1. Add Vision Pro positioning to product docs and README.
2. Add passenger-safety language to headset-related surfaces.
3. Audit `PhillyNativeAR.swift` for iOS-only assumptions before enabling visionOS destination work.
4. Identify which stops deserve true volumetric treatment first.
5. Define a thin bridge contract between React Native route state and native immersive scenes.

## Candidate First Spatial Stops

These are strong candidates for a first premium visionOS pass:

- Mother Bethel AME Church
- President's House / Liberty Bell Center
- Johnson House
- Masonic Temple
- The Palestra

Each should aim for:

- one strong hero object or reconstruction
- one clear spatial anchor strategy
- one concise title and supporting narration
- one obvious exit path back to the main route

## UX Rules

- Vision Pro is for passenger, parked, or post-drive use only.
- Do not create any flow that suggests headset use by the driver.
- Use narration as the backbone and spatial moments as the premium layer.
- Favor fewer, stronger immersive scenes over broad but shallow coverage.
- Preserve a clean handoff between phone route flow and immersive mode.

## Messaging Draft

Suggested positioning line:

`Stay in the car for narration, then step into immersive spatial Philly when you park or ride as a passenger.`

Expanded positioning:

`Philly Tours scales from premium in-car storytelling to full spatial exploration on Apple Vision Pro, turning landmark stops into immersive cultural experiences.`

## Open Questions

- Should Vision Pro be framed as a passenger companion first, or a post-drive recap product first?
- Which AR scenes already in planning are realistic to convert into volumetric launch content?
- Do we want one shared route shell across iPhone and visionOS, or a slimmer dedicated visionOS experience?

## Recommended First Commit Sequence

1. Docs and positioning updates
2. Xcode supported-destination change
3. visionOS simulator smoke test
4. native immersive scene prototype for one hero stop
