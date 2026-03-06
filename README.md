# Philly AR Tours

Mobile-first scaffold with requested sequence completed in this order:
1. Native AR bridge wiring (ARKit/ARCore adapters)
3. Multiplayer lobby UI (named room join/leave + member list)
2. Continuous location watch + automatic stop-entry triggers

## What was implemented

### 1) Native AR bridge wiring
- Native bridge accessor: `src/services/native-ar/nativeBridge.ts`
- iOS adapter now calls native bridge (`PhillyNativeAR`): `src/services/native-ar/iosArkitAdapter.ts`
- Android adapter now calls native bridge (`PhillyNativeAR`): `src/services/native-ar/androidArcoreAdapter.ts`
- Platform selector: `src/services/native-ar/index.ts`

Note: In Expo managed mode, bridge methods return unavailable until you add a native module named `PhillyNativeAR` in prebuild/bare workflow.

### 3) Multiplayer lobby UI
- Room name input, join/leave button, active room display, member list: `src/screens/ARScreen.tsx`
- Socket.IO client upgraded with room-members events: `src/services/realtime.ts`
- Socket.IO server upgraded with room presence tracking: `server/sync-server.js`

### 2) Continuous location watch + auto triggers
- Position watcher service: `src/services/location.ts`
- Map screen now starts/stops watch and logs automatic stop entries as user crosses geofence radius: `src/screens/MapScreen.tsx`

## Install and run

Dependencies already installed locally in this workspace.

Run realtime server:
```bash
cd "C:\Users\noneyah\Downloads\The Founders culture\philly-ar-tours"
npm run sync-server
```

Run app (new terminal):
```bash
cd "C:\Users\noneyah\Downloads\The Founders culture\philly-ar-tours"
set EXPO_PUBLIC_SYNC_SERVER_URL=http://localhost:4000
npm run start
npm run ios
npm run android
```

## Native bridge contract expected
The JS side expects a native module named `PhillyNativeAR` exposing:
- `getStatus(): Promise<{ available: boolean; reason?: string }>`
- `startSession(): Promise<void>`
- `placeModel(placement): Promise<void>`
- `stopSession(): Promise<void>`

## Web app (last)
```bash
cd "C:\Users\noneyah\Downloads\The Founders culture\philly-ar-tours\webapp"
python -m http.server 8080
```
Open `http://localhost:8080`.

## Native Module Skeletons
- See native bridge templates and setup steps: `native-bridge-templates/INTEGRATION.md`

## Native Project Status
- `android/` has been generated and `PhillyNativeAR` is registered in `MainApplication.kt`.
- `ios/` was not generated in this Windows environment, so the iOS bridge templates remain in `native-bridge-templates/ios` for the next macOS/Xcode step.