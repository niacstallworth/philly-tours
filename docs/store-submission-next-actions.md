# Store Submission Next Actions

Status: repo-side store preflight passes.

Last checked with:

```bash
npm run preflight:store
```

Result:

- All required preflight checks passed.
- No obvious committed secret values found in tracked or new source files checked by the preflight.

## Ready Assets

### Store Upload Screenshots

Use raw screenshots for store upload:

- iPhone: `assets/store/ios/core-*`
- iPad: `assets/store/ipad/core-*`
- Android: `assets/store/android/core-*`

Upload order is documented in `assets/store/README.md`.

### Marketing Screenshots

Use framed screenshots for website, social, README, and press material:

- `assets/store/framed/ios/*`
- `assets/store/framed/ipad/*`
- `assets/store/framed/android/*`
- `assets/store/framed/web/*`

Regenerate with:

```bash
npm run store:screenshots:frame
```

### Store Copy

- Listing copy: `docs/store-listing-copy.md`
- Screenshot captions: `docs/store-screenshot-captions.md`
- Privacy/Data Safety guide: `docs/store-privacy-data-safety-guide.md`
- Readiness checklist: `docs/store-submission-readiness.md`

## App Store Connect

1. Create or update the app record for `Philly Tours`.
2. Confirm bundle ID: `com.founders.phillyartours`.
3. Add privacy policy URL: `https://philly-tours.com/privacy.html`.
4. Add support URL: `https://philly-tours.com/support.html`.
5. Paste metadata from `docs/store-listing-copy.md`.
6. Upload raw iPhone screenshots from `assets/store/ios/core-*`.
7. Upload raw iPad screenshots from `assets/store/ipad/core-*`.
8. Fill App Privacy using `docs/store-privacy-data-safety-guide.md`.
9. Complete age rating and category forms.
10. Upload production build through Xcode, Transporter, or EAS flow.
11. Add App Review notes from `docs/store-listing-copy.md`.
12. Submit to TestFlight first, then App Review.

## Google Play Console

1. Create or update the app record for `Philly Tours`.
2. Confirm package name: `com.founders.phillyartours`.
3. Add privacy policy URL: `https://philly-tours.com/privacy.html`.
4. Paste metadata from `docs/store-listing-copy.md`.
5. Upload raw Android screenshots from `assets/store/android/core-*`.
6. Fill Data Safety using `docs/store-privacy-data-safety-guide.md`.
7. Complete app access, ads, content rating, target audience, and permissions declarations.
8. Upload an Android App Bundle.
9. Run internal testing before production release.
10. Submit for review.

## Final Local Gates Before Upload

Run:

```bash
npm run preflight:store
npm run webapp:build
npx tsc --noEmit
```

Then build native release artifacts:

- iOS archive for App Store / TestFlight
- Android release AAB for Play Console

Before submitting, verify on real devices:

- Fresh install opens cleanly.
- Home, AR, Board, Settings, and Compass render.
- Location denial is friendly.
- Camera/AR denial is friendly.
- Maps render on Android and iOS.
- No API keys or secrets appear in screenshots, logs, generated JS, or committed docs.
