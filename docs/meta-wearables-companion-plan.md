# Meta Wearables Companion Plan

This plan defines the first Philly Tours product slice that aligns with Meta AI glasses and the Wearables Device Access Toolkit direction.

The goal is not to port the phone AR app into glasses. The goal is to turn Philly Tours into a strong companion-device experience where the glasses handle hands-free context and control, while the phone remains the source of truth for rich UI, payments, and native AR.

## Current Repo Status

The repo is already past pure planning. These pieces now exist and should be treated as the starting line for the grant prototype, not as future ideas:

- low-level toolkit wrapper:
  - `src/services/wearables.ts`
- Philly Tours companion orchestration:
  - `src/services/companion.ts`
- reactive session hook:
  - `src/hooks/useCompanionSession.ts`
- setup surface in the mobile app:
  - `src/screens/CompanionSetupScreen.tsx`
- native iOS DAT bridge and registration plumbing:
  - `ios/PhillyARTours/AppDelegate.swift`
  - `ios/PhillyARTours/Info.plist`

That means the next work should focus on closing the demo loop, not rebuilding scaffolding that is already in place.

## Product Rule

The first Meta-compatible version should be a glasses companion flow.

It should do five things well:

- pair glasses to a signed-in Philly Tours user
- route narration to a wearable-friendly audio path
- accept hands-free commands for tour progression
- return contextual stop information on demand
- hand off to phone-native AR when needed

It should not try to do:

- full glasses-native AR scene rendering
- checkout on glasses
- builder/admin operations from glasses
- rich profile management on glasses

## Why This Direction Fits Philly Tours

The repo already has strong building blocks for a glasses companion experience:

- signed-in sessions and role-aware backend auth:
  - `src/services/auth.ts`
  - `server/sync-server.js`
- narration pipeline:
  - `src/services/narration.ts`
  - `src/data/narrationCatalog.ts`
  - `src/data/narrationScriptMap.ts`
- stop handoff model:
  - `src/services/deepLinks.ts`
- mobile-native AR fallback:
  - `ios/PhillyARTours/PhillyNativeAR.swift`
  - `android/app/src/main/java/com/founders/phillyartours`

What is missing is the companion layer between the signed-in phone app and Meta glasses.

## Phase 1 Demo Goal

Build a convincing glasses-enhanced tourism demo with this flow:

1. user signs into Philly Tours on phone
2. user pairs Meta glasses from inside the app
3. glasses become the primary narration/audio surface
4. user can say or trigger:
   - `start tour`
   - `next stop`
   - `repeat`
   - `pause`
   - `open AR on phone`
5. when a stop needs visual depth, the phone opens directly into the correct stop/AR-ready state

This is the first implementation target that moves Philly Tours from “good mobile tourism app” to “serious Meta glasses companion concept.”

## Reviewer-Facing Demo Flow

The strongest near-term demo is:

1. user signs into Philly Tours on phone
2. user opens the Meta companion setup screen and pairs glasses
3. user starts a tour stop and hears narration through the companion route
4. user triggers:
   - `next stop`
   - `pause`
   - `repeat`
   - `open AR on phone`
5. app deep-links directly into the phone AR-ready stop state
6. if glasses disconnect, phone playback and controls remain usable

This shows companion value clearly without depending on glasses-native computer vision.

## Companion Scope

### Supported actions in Phase 1

- pair/unpair glasses
- reconnect to known glasses
- fetch current stop context
- start/stop narration
- repeat narration
- advance to next stop
- trigger “open on phone”

### Explicitly out of scope in Phase 1

- full camera-based landmark recognition
- real-time glasses computer vision labeling
- live translation
- wearable-side purchases
- standalone glasses app replacing the phone

## Proposed Architecture

### Mobile app remains the source of truth

The phone app owns:

- signed-in user identity
- tour entitlement state
- route/stop progress
- payment state
- AR launch

The glasses companion layer should be modeled as a peripheral tied to the signed-in phone session, not a separate product surface.

### New client modules

Add these modules:

- `src/services/wearables.ts`
  - low-level Meta toolkit wrapper
  - pairing
  - permission checks
  - connection/session state
  - wearable capability discovery

- `src/services/companion.ts`
  - Philly Tours-specific orchestration layer
  - maps glasses events into app actions
  - exposes:
    - `pairWearable()`
    - `disconnectWearable()`
    - `getWearableStatus()`
    - `handleWearableCommand()`

- `src/screens/CompanionSetupScreen.tsx`
  - pairing UX
  - connection status
  - granted permissions
  - reconnect / forget device

- `src/hooks/useCompanionSession.ts`
  - reactive wearable status and command handling for UI

### Existing modules to extend

- `src/services/narration.ts`
  - support a companion playback target mode
  - preserve phone playback fallback

- `src/services/deepLinks.ts`
  - formalize “open on phone” stop handoff from wearable command

- `App.tsx`
  - register companion listeners after authenticated session restore

- `src/screens/ProfileScreen.tsx`
  - elevate the companion card from a static settings entry into a live system status surface

## Backend Requirements

The backend should treat a wearable as a paired device, not as an independent privileged user.

### New database tables

- `wearable_devices`
  - `id`
  - `user_id`
  - `device_platform`
  - `device_model`
  - `display_name`
  - `external_device_id`
  - `created_at`
  - `updated_at`
  - `last_seen_at`
  - `revoked_at`

- `wearable_pairings`
  - `id`
  - `user_id`
  - `wearable_device_id`
  - `status`
  - `created_at`
  - `updated_at`

- `companion_sessions`
  - `id`
  - `user_id`
  - `wearable_device_id`
  - `issued_at`
  - `expires_at`
  - `revoked_at`

### New backend endpoints

Add routes under `/api/wearables`:

- `POST /api/wearables/register`
- `POST /api/wearables/pair`
- `POST /api/wearables/unpair`
- `GET /api/wearables`
- `POST /api/wearables/session`
- `POST /api/wearables/command`

These routes should require an authenticated phone user session and should never grant builder/admin capabilities to the wearable session.

## Security Rules

These rules are non-negotiable:

- a wearable cannot authenticate as a builder/admin directly
- wearable sessions must be scoped to a signed-in phone user
- wearable tokens must be revocable
- losing a phone session should invalidate companion session issuance
- builder/admin actions remain phone-only and session-protected

## Command Model

Use a small, explicit command set.

Suggested command type:

```ts
export type CompanionCommand =
  | { type: "start_tour"; tourId: string }
  | { type: "next_stop" }
  | { type: "repeat_narration" }
  | { type: "pause_narration" }
  | { type: "resume_narration" }
  | { type: "get_stop_context" }
  | { type: "open_ar_on_phone"; tourId: string; stopId: string };
```

Map these into existing Philly Tours behavior instead of inventing a second state machine.

## Narration Strategy

Glasses compatibility should start with narration because that is already one of the strongest parts of the repo.

Phase 1 narration behavior:

- glasses become preferred audio route when connected
- phone remains fallback route
- current stop or next stop narration can be started from wearable command
- repeat/pause/resume should be explicit companion commands

This builds directly on:

- `src/services/narration.ts`
- `src/hooks/useNarration.ts`

## AR Strategy

Do not attempt to move current iPhone-native AR scenes into glasses first.

Phase 1 AR behavior:

- glasses trigger intent only
- phone receives `open_ar_on_phone`
- app deep-links into:
  - selected tour
  - selected stop
  - AR-ready state

This uses the existing handoff pattern instead of replacing it.

## UX Surface Changes

### New Profile section

Add a wearable companion card to `ProfileScreen`:

- pair glasses
- show connection status
- reconnect / forget device
- quick test command status

### Optional builder tooling

Builder mode can expose a limited diagnostics panel:

- last companion command
- current paired device
- current playback target

But builder-only diagnostics should not be required for the consumer flow.

## Phase Plan

### Phase 1: Demo-critical loop

Goal: pair, hear narration, issue a few commands, and hand off to phone AR.

Already in repo:

- pairing wrapper in `src/services/wearables.ts`
- companion command layer in `src/services/companion.ts`
- reactive hook in `src/hooks/useCompanionSession.ts`
- setup UI in `src/screens/CompanionSetupScreen.tsx`

Must complete next:

- narration output preference for companion-connected sessions
- command-to-app wiring for:
  - `next_stop`
  - `pause_narration`
  - `repeat_narration`
  - `open_ar_on_phone`
- AR handoff preflight checks before opening the phone flow
- visible fallback behavior when glasses disconnect or are unavailable

Definition of done:

- a user can pair glasses in-app
- a stop can start narration through the companion-preferred route
- at least three commands work end to end
- `open AR on phone` opens the correct tour/stop context

### Phase 2: Hardening and operator confidence

Goal: make the companion flow dependable enough for demos, testers, and pilot use.

- backend support for:
  - `wearable_devices`
  - `wearable_pairings`
  - `companion_sessions`
- `/api/wearables` routes for pairing/session lifecycle
- reconnect and stale-session recovery
- richer stop context requests like “tell me about this stop”
- diagnostics surfaced in Profile or a limited builder panel

Definition of done:

- wearable state survives app restarts in a controlled way
- revoked or stale sessions fail safely
- connection state and errors are understandable from the app UI

### Phase 3: Advanced wearable behaviors

Goal: expand companion value only after the core loop is stable.

- arrival-aware automatic cueing
- limited camera/context awareness if the toolkit path supports it cleanly
- accessibility-specific touring variants
- glasses-first scavenger interactions

Definition of done:

- new wearable behaviors add value without weakening the baseline companion loop
- no advanced feature becomes a dependency for pairing, narration, or AR handoff

## Grant Positioning

Once Phase 1 exists, Philly Tours can be framed as:

- a hands-free cultural tourism companion
- a wearable-guided storytelling system
- an accessibility-forward city exploration tool
- a bridge between glasses audio/context and phone-native AR depth

That is much closer to a credible Meta AI glasses narrative than phone-only mobile AR.

## Implementation Order

Build in this order:

1. extend `src/services/narration.ts` so companion-connected sessions become the preferred playback target
2. finish command routing in `src/services/companion.ts` against real tour/narration state
3. harden `CompanionSetupScreen` and `useCompanionSession` so connection state is obvious and demo-friendly
4. add AR handoff preflight around the existing deep-link pattern
5. add backend wearable device/session endpoints
6. add richer context and reconnect behavior

Do not start with camera/computer-vision features before pairing, session control, and narration routing exist.

## Working Checklist

### Phase 1 checklist

- [x] DAT iOS package and native registration bridge are wired
- [x] `wearables.ts` exists as the low-level integration point
- [x] `companion.ts` exists with the initial command model
- [x] `useCompanionSession.ts` exists
- [x] `CompanionSetupScreen.tsx` exists
- [ ] narration prefers wearable-connected output when available
- [ ] phone fallback is explicit and user-visible
- [ ] `next_stop` is validated against real route progression
- [ ] `pause_narration` / `repeat_narration` are tested end to end
- [ ] `open_ar_on_phone` opens the correct stop with preflight checks
- [ ] demo script is tested on real Meta hardware

### Phase 2 checklist

- [ ] wearable tables exist in the backend
- [ ] `/api/wearables` session routes are implemented
- [ ] revoked or stale sessions fail safely
- [ ] reconnect flow handles app restarts
- [ ] Profile surfaces live companion diagnostics

### Phase 3 checklist

- [ ] arrival-aware cueing is added
- [ ] accessibility-specific touring variants are defined
- [ ] advanced wearable behaviors are gated behind stable Phase 1 and 2 behavior
