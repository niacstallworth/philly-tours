# Vehicle Platform Plan

This document defines how `Philly AR Tours` should extend into in-vehicle platforms without turning the dashboard into a second copy of the mobile app.

## Product rule

The car experience is a driving companion.

It should do four things well:
- choose a tour
- route to the next stop
- play audio
- hand off to iPhone for on-foot AR

It should not attempt to deliver the full mobile app, checkout flow, or immersive AR scene on the dashboard.

## Platform priority

1. `iPhone`
   - source of truth for the full product
   - payments, profile, progress, map, AR
2. `CarPlay`
   - first vehicle companion target
3. `Android Auto / Android Automotive`
   - second vehicle companion target
4. OEM-specific integrations
   - only after the phone and car companion flows are proven

## Why this split is correct

- Dashboard platforms are tightly constrained by driver-distraction rules.
- The current app's value is strongest when the user is parked and on foot.
- The car version should get the visitor to the right place and prepare the handoff.
- The phone remains the right place for AR launch, payments, and rich tour exploration.

## Existing app pieces that can be reused

These repo areas already support a future car companion:

- Tour data:
  - `src/data/tours.ts`
- Session identity:
  - `src/services/session.ts`
- Backend config and entitlement checks:
  - `src/services/payments.ts`
  - `server/sync-server.js`
- Tour progress and stop selection concepts:
  - `src/screens/HomeScreen.tsx`
  - `src/screens/MapScreen.tsx`
  - `src/screens/ProgressScreen.tsx`

## Existing app pieces that should not be reused directly

Do not mirror these mobile surfaces into the car UI:

- `src/screens/TouristARScreen.tsx`
- `src/screens/BuilderARScreen.tsx`
- `src/screens/ProfileScreen.tsx`
- checkout UI
- build/admin flows
- long editorial text layouts
- dense chips and metadata panels

## CarPlay product scope

### Supported feature set
- Tour list
- Tour detail summary
- Start driving route
- Next stop card
- Audio playback controls
- Arrival prompt
- `Continue on iPhone` handoff

### CarPlay screen map

1. `Tour List`
   - title
   - duration
   - distance
   - theme/category

2. `Tour Detail`
   - short description
   - total stops
   - estimated duration
   - `Start Drive`

3. `Now Driving`
   - current tour
   - next stop
   - distance to stop
   - audio status

4. `Arrival`
   - stop title
   - one sentence of context
   - `Open on iPhone`

### Features to exclude from CarPlay
- payments
- profile management
- long-form text reading
- AR rendering
- complex map browsing
- production/debug UI

## Android Auto / Android Automotive scope

Keep the same product shape as CarPlay.

### Supported feature set
- Tour list
- Tour route start
- Next stop card
- Audio playback controls
- Arrival prompt
- Handoff to phone

### Android Auto screen map
- `Tour List`
- `Tour Detail`
- `Drive Route`
- `Now Playing`
- `Arrival / Continue on Phone`

## Shared driving-mode data model

Add a thin companion model rather than reusing the full mobile screen state.

Suggested types:

```ts
export type DriveTourSummary = {
  id: string;
  title: string;
  durationMin: number;
  distanceMiles: number;
  stopCount: number;
  heroStopTitle?: string;
};

export type DriveStop = {
  id: string;
  tourId: string;
  title: string;
  lat: number;
  lng: number;
  triggerRadiusM: number;
  audioUrl: string;
  arrivalSummary: string;
  handoffDeepLink: string;
};

export type DriveSession = {
  tourId: string;
  currentStopId: string;
  startedAt: number;
  mode: "drive" | "arrived" | "handoff";
};
```

## Handoff design

The car experience should end in a phone deep link.

### Handoff flow
1. user selects a tour in vehicle UI
2. car navigates to next stop
3. audio plays en route
4. on arrival, vehicle UI shows:
   - stop title
   - one short teaser line
   - `Continue on iPhone`
5. phone opens directly into:
   - selected tour
   - selected stop
   - AR-ready state

### Deep-link target

Suggested deep link shape:

```text
phillyartours://tour/<tourId>/stop/<stopId>/arrive
```

Later variants:

```text
phillyartours://tour/<tourId>/stop/<stopId>/ar
phillyartours://tour/<tourId>/stop/<stopId>/map
```

## Audio for vehicles

Vehicle mode should be audio-first.

### Minimum audio requirements
- one preview narration clip per stop
- play/pause/skip support
- safe auto-advance to next stop
- no dense on-screen storytelling required

### Recommended audio sequence
- tour intro
- en-route narration
- arrival chime
- stop teaser
- phone handoff prompt

## Payments and entitlements in vehicles

Do not implement checkout in the vehicle UI.

Vehicle companion should:
- read entitlement state
- show whether a tour is unlocked
- hand off locked-tour purchase to iPhone if needed

Phone app should remain the only payment surface.

## Map and routing behavior

Vehicle route mode should not copy the mobile map.

Instead it should provide:
- next destination
- route start
- nearby stop ordering
- arrival state

The phone app remains the detailed exploration surface.

## Repo implementation plan

### Phase 1: data preparation
- add `src/services/driveMode.ts`
- derive lightweight driving summaries from `src/data/tours.ts`
- add deep-link helpers for stop handoff

### Phase 2: iPhone handoff contract
- add deep-link parsing in `App.tsx`
- route directly into the selected tour + stop
- open AR-ready or map-ready state from the link

### Phase 3: CarPlay companion branch
- add native iOS CarPlay target
- implement template-driven screens only
- connect to shared driving summaries and deep links

### Phase 4: Android Auto branch
- add `androidx.car.app` layer
- reuse the same driving summaries and handoff logic

## Hard product rules

- The dashboard is not the place for AR scenes.
- The dashboard is not the place for checkout.
- The dashboard is not the place for long reading.
- The phone remains the premium on-foot experience.
- Vehicle mode exists to guide, narrate, and hand off.

## Immediate next implementation steps for this repo

1. add a shared `driveMode` service and types
2. add a stop handoff deep-link contract
3. wire the phone app to open a specific tour and stop from a deep link
4. only then start a CarPlay-specific native surface
