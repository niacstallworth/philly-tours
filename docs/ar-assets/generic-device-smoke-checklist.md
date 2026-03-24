# Generic On-Device AR Smoke Checklist

Use this checklist on a real ARKit-capable iPhone or iPad. The simulator cannot validate plane detection, placement stability, or real-world scale.

## Preflight

- Confirm the app is running from [PhillyARTours.xcworkspace](/Users/nia/Documents/GitHub/philly-tours/ios/PhillyARTours.xcworkspace)
- Confirm Metro is running with:
  `npm run start:metro:dev-client`
- Confirm the device has Local Network access enabled for `Philly AR Tours`
- Confirm the selected stop has an AR moment available

## First launch checks

1. Launch an AR moment on the device
2. Confirm the camera feed appears without a native crash
3. Confirm the AR object, card, or scene appears instead of a blank state
4. Move slowly around the object and check whether it stays anchored in place
5. Rotate the device and confirm the scene stays readable

## Placement checks

### Stability
- object stays fixed while walking a few steps
- object jitters heavily
- object drifts away from the intended placement

### Scale
- too small to read comfortably
- too large for the room or sidewalk context
- feels believable at standing distance

### Height
- buried into the floor or surface
- floating too high
- sits correctly in the user sightline

### Orientation
- facing the wrong direction
- sideways / rotated incorrectly
- facing correctly on first placement

### Readability
- subject reads immediately
- silhouette is confusing from a few feet away
- text or details are too small
- visual hierarchy feels strong

## Session resiliency checks

1. Exit the AR screen and reopen it
2. Confirm the AR moment still launches cleanly
3. Cold-launch the app again from the home screen
4. Confirm the AR moment can still reconnect to Metro and open without a RedBox

## Good artifacts to capture

- stop name
- whether the object was stable or drifting
- whether scale felt too big / too small / correct
- whether height felt too low / too high / correct
- one screenshot or short screen recording if something feels off

## Report format

Use one line per stop:

```text
[stop-name]: stable yes/no, scale small/ok/large, height low/ok/high, orientation wrong/ok, notes ...
```

If the AR screen exposes a tuning snapshot, copy it and apply it with:

```bash
cd /Users/nia/Documents/GitHub/philly-tours
export NVM_DIR="$HOME/.nvm" && . "$NVM_DIR/nvm.sh"
npm run ar:tuning:apply
```
