# Product Direction

## Positioning

Philly AR Tours should feel like a premium cultural guide, not a builder console and not a generic dark-theme utility app.

The consumer product should read as:
- elegant
- editorial
- inviting
- feminine in taste and restraint
- clear in hierarchy
- spatially focused

It should not read as:
- technical
- gamified
- crowded
- dashboard-heavy
- developer-first
- sci-fi for its own sake

## Story Logistics

Philly Tours routes should feel arranged by someone who understands both the city and the human experience of moving through it.

Story Logistics is the Founders route logic:

```txt
next stop = closest meaningful stop that keeps the story moving forward
```

In simple program language:

```ts
nextStop = bestStop({
  nearEnough: true,
  keepsMomentum: true,
  avoidsBacktracking: true,
  fitsStoryArc: true,
  respectsNorthStar: true
});
```

This is not generic pin sorting. It is distance plus direction plus story logic plus no annoying jumps. The route should feel like Philadelphia unfolding in the user's body, not like a spreadsheet of landmarks.

## Consumer App Rules

### What the user should see
- one tour pack at a time
- one clear featured stop at a time
- one clean map state at a time
- one AR action at a time
- progress that feels personal, not mechanical

### What the user should not see
- build queues
- provider names
- prompt metadata
- pipeline stages
- asset readiness statuses
- internal brief paths
- webhook or backend diagnostics

All production and planning tools should be hidden from the main product experience or moved to an internal-only mode.

## Visual Language

### Tone
The app should feel like a blend of:
- fashion editorial restraint
- boutique museum technology
- modern cultural hospitality

### Palette
Recommended primary palette:
- midnight plum: `#060312`
- deep velvet: `#130a25`
- satin aubergine: `#1b102d`
- warm porcelain: `#fff3ea`
- blush accent: `#ff8ca8`
- apricot gold: `#ffbc8a`
- pale aqua accent: `#8fd7c3`

Use pink/blush as a selective accent, not a wash across every element.

### Typography direction
Use:
- high-contrast serif or elegant display serif for hero headlines
- refined sans for controls, body, labels, and navigation

Desired feeling:
- confident
- polished
- sensual without being gimmicky

### Surfaces
Use:
- large rounded containers
- soft contrast layers
- fewer hard outlines
- selective glow or highlight edges
- more space between content groups

Avoid:
- chip overload
- stacked diagnostic cards
- sharp utilitarian borders everywhere

## Navigation Rules

The app should have five simple top-level destinations only:
- Home
- Map
- AR
- Progress
- Profile

The Build screen should not appear in consumer navigation.

## AR Strategy

## Core AR Principle
Every stop can have content.
Not every stop should have full AR.

### Recommended stop classes
- `Hero 3D`
  - true 3D object or spatial scene
  - only for the strongest stops
- `Light Spatial`
  - small callout, marker, arrow, or silhouette
- `Audio + Map`
  - no spatial object, only narrative support

### Why
Trying to make every stop a full AR moment creates:
- cost bloat
- visual repetition
- weak quality
- poor calibration outdoors
- a cluttered user experience

## Meta Glasses / Small-Eye Display Rules

Meta-style monocular display changes the design target.

### Do
- present one primary object at a time
- use short labels only
- keep overlays compact and directional
- let audio do the narrative heavy lifting
- bias for legibility at a glance
- keep content near the real-world site, not floating everywhere

### Do not
- design for full-screen takeover
- use large paragraph cards in-eye
- stack multiple panels simultaneously
- rely on complex menus in AR
- assume the user can comfortably read dense text in space

## Vision Pro / Spatial Computing Rules

Vision Pro should extend the product upward into premium spatial computing, not replace the drive-first app.

### Do
- treat Vision Pro as passenger, parked, or post-drive only
- use immersive scenes for the strongest landmarks and reconstructions
- preserve the route and narration spine from the phone experience
- favor volumetric landmarks, restrained labels, and shared narration controls
- keep the transition between phone and immersive mode obvious and low-friction

### Do not
- imply headset use while driving
- fork the product into a separate tourism concept disconnected from the route
- rebuild every screen as spatial UI before the hero moments are proven
- force every stop into an immersive scene

### Best overlay types for this hardware
- single 3D artifact
- subtle architectural ghost overlay
- miniature portal window
- directional beacon / route arrow
- short identity label with year or title
- restrained historical silhouette

## 3D Content Rules

### The final user-facing AR should be 3D first
Concept images are useful for internal planning only.
They should not be the product.

### Best execution path
Use AI for:
- concept ideation
- moodboards
- texture direction
- art references
- rough historical composition studies

Do not use AI 2D image output as the final AR object.

### Final asset path should be
- concept brief
- manual or guided 3D modeling
- optimized `.usdz` for iOS
- optimized `.glb` for Android/web if needed
- on-site placement tuning

### Suggested tool chain
- ChatGPT or Grok for creative briefing and structure
- Blender for final asset cleanup and assembly
- Reality Composer Pro for iOS scene packaging
- optional AI mesh tools only as rough starting geometry, not final production assets

## Overlay Style Direction

Reference target: the Motorola mixed reality case study style.

What to borrow from that reference:
- clean spatial hierarchy
- minimal but premium floating UI
- elegant anchoring
- restrained motion
- spatial graphics that feel integrated, not slapped on top

What to avoid copying literally:
- oversized futuristic HUD language
- dense enterprise AR interface framing
- full-screen spectacle that does not fit Meta glasses constraints

## First AR Production Pass

Build these as the first premium 3D moments:
- Mother Bethel AME Church
- President's House / Liberty Bell Center
- Johnson House
- Masonic Temple
- The Palestra

Each should get:
- one strong hero object or reconstruction
- one concise title line
- one spatial anchor behavior
- supporting audio

## Immediate Product Priorities

1. Keep consumer UI simple and elegant.
2. Hide production/debug tooling from main app flow.
3. Build true 3D hero stops one by one.
4. Use audio as the narrative layer and AR as the visual jewel.
5. Design overlays specifically for small-eye-display hardware.

## Next App Shape Plan

The next product-shape pass is tracked in `docs/app-shape-next-plan.md`.

Focus areas:
- visual Founders Board share cards
- richer Board state and set logic
- production-quality AR moment assets
- more human Compass arrival states

## Execution Recommendation

The correct execution is not more bulk generation.
The correct execution is:
- curate fewer AR moments
- make them materially better
- build them one by one
- preserve elegance in the app shell

This project wins on taste, restraint, and quality of spatial moments, not on the raw count of generated overlays.
