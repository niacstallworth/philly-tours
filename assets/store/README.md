# Store Screenshot Capture Set

Captured April 2026 for Philly Tours app store, play store, and web launch materials.

Caption and ordering guidance lives in `docs/store-screenshot-captions.md`.

## Framed Marketing Graphics

Use raw `core-*` screenshots for App Store and Play Store submission. Use framed screenshots for marketing, launch posts, website sections, README visuals, and press materials.

Run this command to regenerate captioned store graphics from the curated screenshots:

```bash
npm run store:screenshots:frame
```

Generated outputs:

- `framed/ios/*.png`
- `framed/ipad/*.png`
- `framed/android/*.png`
- `framed/web/*.png`

These framed files preserve the source device dimensions and add simple launch captions for store listings, social posts, and website marketing.

## Store Upload Decision

Primary submission choice:

- Apple App Store: use raw screenshots from `ios/core-*` and `ipad/core-*`
- Google Play Store: use raw screenshots from `android/core-*`
- Marketing and social: use `framed/*`

Raw screenshots are the safest store-submission choice because they show the native app directly and keep review focus on the product experience.

### App Store iPhone Upload Order

1. `ios/core-01-home.png`
2. `ios/core-02-ar.png`
3. `ios/core-03-board.png`
4. `ios/core-05-compass.png`
5. `ios/core-04-settings.png`

### App Store iPad Upload Order

1. `ipad/core-01-home.png`
2. `ipad/core-02-ar.png`
3. `ipad/core-03-board.png`
4. `ipad/core-05-compass.png`
5. `ipad/core-04-settings.png`

### Google Play Upload Order

1. `android/core-01-home.png`
2. `android/core-02-ar.png`
3. `android/core-03-board.png`
4. `android/core-05-compass.png`
5. `android/core-04-settings.png`

## Curated Native Sets

Use the `core-*` files as the clean working set.

### iPhone

- `ios/core-01-home.png`
- `ios/core-02-ar.png`
- `ios/core-03-board.png`
- `ios/core-04-settings.png`
- `ios/core-05-compass.png`

Size: 1320 x 2868

### iPad

- `ipad/core-01-home.png`
- `ipad/core-02-ar.png`
- `ipad/core-03-board.png`
- `ipad/core-04-settings.png`
- `ipad/core-05-compass.png`

Size: 2064 x 2752

Note: `ipad/core-05-compass.png` is the clean compass-only capture. Raw iPad map handoff captures remain in the folder for reference.

### Android Razr

- `android/core-01-home.png`
- `android/core-02-ar.png`
- `android/core-03-board.png`
- `android/core-04-settings.png`
- `android/core-05-compass.png`

Size: 1080 x 2640

## Web Companion

- `web/01-home.png`
- `web/02-compass.png`
- `web/03-board.png`
- `web/04-ar.png`
- `web/05-settings.png`
- `web/06-privacy.png`
- `web/07-support.png`

Size: 1290 x 2796

## Raw Captures

Non-core files in these folders are raw capture history from setup prompts, permission sheets, relaunch attempts, and verification passes. Keep them for reference, but do not use them as the primary store submission set.
