Vuzix Z100 Android integration readiness

Date reviewed: 2026-04-05

Source artifacts reviewed

- `vendor-sdk/vuzix/ultralite-sdk-android-1.9.zip`
- `vendor-sdk/vuzix/ultralite-sdk-android-sample-master.zip`
- `vendor-sdk/vuzix/unpacked/sdk/Vuzix-ultralite-sdk-android-0310591/README.md`
- `vendor-sdk/vuzix/unpacked/sample/ultralite-sdk-android-sample-master/app/src/main/java/com/vuzix/ultralite/sample/MainActivity.java`
- `vendor-sdk/vuzix/unpacked/sample/ultralite-sdk-android-sample-master/app/src/main/java/com/vuzix/ultralite/sample/DemoCanvasLayout.java`
- `vendor-sdk/vuzix/unpacked/sample/ultralite-sdk-android-sample-master/app/src/main/java/com/vuzix/ultralite/sample/DemoTapInput.java`

Bottom line

Vuzix is a real near-term Android integration path for Philly Tours.

This is not just Bluetooth audio. The SDK supports:

- connection and availability state
- requesting and releasing display control
- sending notifications
- sending text
- sending images
- canvas-style layouts on the glasses display
- tap input events from the glasses

That is enough for a genuine "tour companion display" on supported Vuzix hardware.

What the SDK requires

- Android 12+
- Vuzix Connect app installed on the phone
- Vuzix Z100 glasses

How the SDK is delivered

- public `.aar` included in the downloaded archive
- public javadocs included locally
- JitPack dependency path documented in the README

Practical integration fit for Philly Tours

Best first Vuzix feature slice:

1. mirror stop title + short summary to the glasses
2. show `next stop` and arrival distance
3. send lightweight notifications when narration starts or a stop changes
4. accept tap input for:
   - next stop
   - repeat narration
   - pause narration

This fits the app well because you already have:

- narration state
- current stop / next stop context
- companion command handlers
- Android-specific companion plumbing

What does not need to change first

- universal audio mode can stay the baseline
- Meta can remain the premium native branch
- Vuzix can be added as a second vendor-native branch on Android

Recommended architecture

- keep `universal audio mode` as the default transport story
- extend the wearable model beyond `platform: "meta_glasses"`
- add a vendor-native mode for `vuzix_z100`
- map existing companion commands onto Vuzix:
  - `next_stop`
  - `repeat_narration`
  - `pause_narration`
  - `resume_narration`
  - `get_stop_context`

Likely implementation approach

Android native:

- add a new native package/module for Vuzix
- wrap `UltraliteSDK.get(context)`
- expose availability / linked / connected / controlled state to React Native
- expose:
  - request control
  - release control
  - send notification
  - send text or canvas update
  - receive tap events and forward them to JS

React Native:

- widen `WearableDevice.platform` to support more than Meta
- add a Vuzix branch to `wearables.ts`
- add Vuzix-specific setup copy in the companion screen
- reuse existing companion command handling instead of inventing a parallel command system

Risks and constraints

- control can be lost when another app takes over the glasses
- the SDK expects the app to re-establish layout/canvas state after control is regained
- Vuzix Connect is a user dependency, so onboarding must mention it clearly
- this is Android-only from the reviewed SDK

Best next step

Build a tiny Android proof of concept outside the main app flow:

- detect SDK availability
- request control
- show current stop title on the glasses
- wire single tap to `next_stop`

If that works, the full Philly Tours integration is worth doing.
