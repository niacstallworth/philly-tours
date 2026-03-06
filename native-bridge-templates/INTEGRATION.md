# PhillyNativeAR Integration Guide

This project is currently Expo managed. Native module files are scaffolded in:
- `native-bridge-templates/ios`
- `native-bridge-templates/android`

To activate `PhillyNativeAR` bridge end-to-end, follow these steps.

## 1) Generate native projects

```bash
cd "C:\Users\noneyah\Downloads\The Founders culture\philly-ar-tours"
npx expo prebuild
```

This creates `ios/` and `android/` directories.

## 2) iOS wiring (Swift + Objective-C bridge)

1. Copy:
- `native-bridge-templates/ios/PhillyNativeAR.swift`
- `native-bridge-templates/ios/PhillyNativeAR.m`

Into your Xcode app target folder, e.g.:
- `ios/PhillyARTours/PhillyNativeAR.swift`
- `ios/PhillyARTours/PhillyNativeAR.m`

2. Ensure both files are in the app target's Build Phases > Compile Sources.
3. Build once in Xcode; if prompted, allow creation of a Swift bridging header.

## 3) Android wiring (Kotlin package)

1. Copy:
- `native-bridge-templates/android/PhillyNativeARModule.kt`
- `native-bridge-templates/android/PhillyNativeARPackage.kt`

Into:
- `android/app/src/main/java/com/founders/phillyartours/`

2. Register package in `MainApplication.kt` inside `getPackages()`:

```kotlin
packages.add(PhillyNativeARPackage())
```

3. Rebuild Android app.

## 4) Run app and verify bridge

1. Start realtime server:
```bash
npm run sync-server
```

2. Start app:
```bash
set EXPO_PUBLIC_SYNC_SERVER_URL=http://localhost:4000
npm run start
```

3. In app AR tab, press `Check AR Provider`.
- Expected provider: `arkit` on iOS, `arcore` on Android
- Expected reason should change from missing bridge to loaded bridge

## 5) Next native implementation points

### iOS (`PhillyNativeAR.swift`)
- Create/persist an `ARView`
- On `startSession`, run `ARWorldTrackingConfiguration`
- On `placeModel`, load `ModelEntity` from URL and anchor in scene
- On `stopSession`, pause AR session

### Android (`PhillyNativeARModule.kt`)
- Bind to ARCore session/lifecycle
- On `placeModel`, load GLB via Sceneform/Filament
- Anchor model to detected plane or cloud anchor

