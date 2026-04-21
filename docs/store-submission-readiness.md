# Store Submission Readiness

Use this as the working checklist for App Store Connect and Play Console.

Paste-ready listing text lives in `docs/store-listing-copy.md`.

Privacy and Data Safety console guidance lives in `docs/store-privacy-data-safety-guide.md`.

Submission handoff checklist lives in `docs/store-submission-next-actions.md`.

## Product Positioning

App name: Philly Tours

Store URLs:

- Privacy policy: `https://philly-tours.com/privacy.html`
- Support: `https://philly-tours.com/support.html`

Short description:

Drive-first Philadelphia history tours with maps, narration, compass progress, and native AR scenes.

Apple subtitle draft:

Compass-guided Philly history

Google short description:

Explore Philadelphia with story-driven maps, narration, compass progress, and native AR scenes.

Long description draft:

Philly Tours turns Philadelphia history into a guided mobile experience. Choose a themed route, follow the compass, hear narrated stories, track discoveries on the Board, and open native AR scenes at supported stops. The web companion helps preview tours, while the iOS and Android apps provide the full native touring and AR experience.

Core promises:

- Drive-first and walk-friendly Philadelphia cultural routes
- Compass-guided stop order and progress
- Narration, maps, weather context, and tour cards
- Native AR projection on supported iOS and Android devices
- Board progress, badges, rewards, and collection-style discovery

Apple keywords draft:

Philadelphia,tours,history,AR,maps,travel,walking tour,driving tour,Black history,architecture,museums

Promotional text draft:

Follow a compass-guided Philadelphia route, hear the story at each stop, and unlock native AR moments on supported devices.

Release notes draft:

Philly Tours launches with story-driven Philadelphia routes, maps, narration, compass guidance, Board progress, and native AR handoff for supported stops.

## Screenshot Storyboard

Capture 5 to 7 screenshots per store:

1. Home tab with featured tour and map
2. Tour detail page with route/stops visible
3. Compass tab showing direction and nearby stop context
4. Native AR scene or AR launch moment
5. Board tab with the score deck carousel
6. Settings or companion handoff if it looks polished
7. Web companion handoff only if needed for the store story

Avoid screenshots that show debug menus, local URLs, empty maps, missing images, or raw technical setup.

Suggested screenshot captions:

1. Start a Philadelphia route
2. Follow the Founders Compass
3. Hear stories at each stop
4. Open native AR scenes
5. Track progress on the Board
6. Preview tours from the web companion

## Apple App Store Connect

Required before submission:

- Privacy policy URL
- Support URL
- App category
- Age rating questionnaire
- App privacy answers
- Screenshots for the required iPhone sizes
- Review notes that explain where AR is found and whether the reviewer needs a location or test route
- Production build uploaded through Xcode or Transporter

Privacy answers should include the app and third-party SDK behavior. Review the final dependency set before answering.

Likely data categories to review:

- Location: used while the app is open for nearby stops, route progress, compass guidance, and scavenger reveals
- Camera: used for native AR placement
- Purchase data: used if in-app purchases or checkout are active
- Identifiers and diagnostics: include only if collected by analytics, payments, auth, crash reporting, or platform SDKs
- User content: include only if community posts/reflections are enabled in the submitted build

Reviewer notes draft:

Philly Tours is a Philadelphia touring app. To test the main flow, open a tour, visit the Compass tab, allow location while using the app, and open any AR-ready stop from the tour detail page. Native AR requires camera permission and a supported device. If the reviewer is not physically in Philadelphia, route and narration previews remain available, while location-triggered claims may not activate.

## Google Play Console

Required before production:

- App bundle upload
- Main store listing
- Privacy policy URL
- App access declaration, if login or paid content gates any area
- Ads declaration
- Content rating questionnaire
- Target audience and content
- Data Safety form
- Release notes
- Closed/internal testing where required by account status
- Release signing configured with an upload key or Play App Signing

Data Safety should match the final shipped build and SDK behavior.

Likely data categories to review:

- Approximate and precise location while the app is in use
- Photos/videos or camera access only for AR capture/placement behavior, if no images are uploaded
- Purchase history if payments are active
- User IDs or account info if auth/session features are active
- User-generated content if community room/reflection submission is active
- Diagnostics only if crash or analytics SDKs collect them

## Release Build Gates

Before submitting either store:

- No debug keystore for Android release builds
- Android release key SHA-1 added to the Android Google Maps API key restriction
- iOS bundle ID added to iOS map/API restrictions
- Production server URL points at HTTPS, not localhost or LAN IP
- No secret keys in source, app bundle, web JS, screenshots, logs, or docs
- Permission copy is human and matches actual behavior
- Location denial, camera denial, no-network, and map-failure states are friendly
- App version and build numbers incremented
- TestFlight/internal testing build installed on real devices
- App opens cleanly after force quit
- Maps, narration, Compass, Board, Settings, and AR handoff are tested
