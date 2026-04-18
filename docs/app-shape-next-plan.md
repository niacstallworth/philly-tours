# App Shape Next Plan

## Product Read

Philly Tours now has a clearer product shape: Home invites the day, Compass guides movement, Tours hold the story paths, Board turns place into progress, AR Community Rooms make stops feel inhabited, and Profile/Settings gives the brand a personal home.

The next phase should make each feature feel inevitable rather than simply adding more surface area.

## North Star

The app should feel like a living Philadelphia compass:

- North Broad is the north star of the Founders Compass.
- Routes open outward from the city center as place-based story paths.
- The Board turns visited stops into claimed city memory.
- AR appears only when the place deserves a visual jewel.
- Community voices make historic sites feel active, not static.

## Planned Upgrades

### 1. Better Founders Board Share Cards

Current state:
- The Board has a native share action with text-based route, rank, XP, claimed stops, streak, next compass point, and app link.

Next upgrade:
- Render a visual share card from the user's Founders Board state.
- Include route name, rank, XP, streak, claimed stop count, next compass point, and a branded Founders Threads visual mark.
- Keep the card platform-safe for Instagram Stories, Threads, Messages, Facebook, and standard iOS/Android share targets.

Implementation direction:
- Start with a branded in-app card preview.
- Add image capture/export after the preview layout is stable.
- Keep plain-text sharing as a fallback for devices or targets that cannot receive image payloads.

Success criteria:
- A user can share something that looks like an achievement, not only a website link.
- The shared card makes the app recognizable without requiring extra explanation.

### 2. Richer Board State

Current state:
- The Board shows score, levels, streaks, badges, active quest progress, collection cards, and a Philadelphia Founders Board inside the active quest card.

Next upgrade:
- Make the Board feel more like a city game that grows with the user.
- Add visible districts or sets based on tour collections.
- Use claimed, visited, next, locked, and special AR states as distinct board language.
- Let scavenger hunts create bonus spaces or temporary board challenges.

Implementation direction:
- Keep the board visual inside the Board card so the tab remains scrollable and stable.
- Add set-completion rewards before adding more currencies.
- Use the existing persisted `gameProgress` state before introducing new storage.

Success criteria:
- Users understand what to do next by looking at the Board.
- The Board rewards real touring behavior instead of feeling like decorative stats.

### 3. AR Moment Asset Pass

Current state:
- AR is selectively planned and tied to strong stops, with docs and manifests already in the repo.

Next upgrade:
- Convert the highest-value AR stops into production-ready asset briefs and final 3D assets.
- Keep AR moments sparse, premium, and site-specific.

Priority moments:
- Mother Bethel AME Church
- President's House / Liberty Bell Center
- Johnson House
- Masonic Temple
- The Palestra

Implementation direction:
- For each stop, define one hero object or reconstruction, one title line, one anchor behavior, and one supporting audio moment.
- Use concept images only for planning.
- Produce optimized `.usdz` for iOS and `.glb` for Android/web where needed.

Success criteria:
- AR moments feel like jewels in the tour, not generic overlays.
- Each AR asset has a clear reason to exist at that place.

### 4. Emotional Compass Moments

Current state:
- Compass can watch live location, aim toward the next stop, hand off to Apple/Google Maps, and auto-advance near a stop.

Next upgrade:
- Make arrival and near-stop states feel more authored and human.
- When the user approaches a stop, the Compass should shift from navigation into story readiness.
- Use short, digestible language rather than technical routing copy.

Implementation direction:
- Add arrival bands such as `approaching`, `nearby`, and `arrived`.
- Trigger concise contextual copy for each state.
- Add optional haptic and narration prompts where platform-safe.
- Keep turn-by-turn routing delegated to Apple Maps / Google Maps.

Success criteria:
- The Compass feels alive without pretending to be a full maps engine.
- Users feel the story opening as they reach the place.

## Implementation Order

1. Fix the share payload so the full Founders Board copy always travels with the share action.
2. Add visual Founders Board share-card preview inside the Board tab.
3. Add image export/share once the preview is stable.
4. Expand board set logic and special AR/scavenger states.
5. Build one production-quality AR moment before scaling to the full priority list.
6. Add Compass arrival bands and human copy.

## Guardrails

- Do not turn the app into a crowded dashboard.
- Do not over-gamify the product until the core touring loop feels elegant.
- Do not make every stop an AR stop.
- Do not replace Apple/Google Maps for turn-by-turn navigation.
- Do not expose internal provider names, build states, or technical language to users.

## Open Questions

- Should the first visual share card be square, story format, or both?
- Should Board districts map to tours, neighborhoods, or themes?
- Which single AR stop should become the first polished production asset?
- Should arrival prompts be voiced, visual, haptic, or a layered combination?
