# Store Privacy And Data Safety Guide

Working guide for App Store Connect privacy nutrition labels and Google Play Data Safety.

This is not legal advice. Before submission, verify the final shipped build, enabled SDKs, analytics settings, payment flows, auth flows, and production backend behavior.

## Current App Signals

Native permissions declared:

- Location while in use
- Camera
- Bluetooth / Bluetooth connect
- Internet

Main user-facing data flows:

- Local profile setup: display name and email stored on the device.
- Location: used while the app is open for nearby stops, Compass, route progress, and discovery progress.
- Camera: used for native AR placement.
- Bluetooth: used to route narration to headphones or supported smart glasses.
- Newsletter: email may be submitted to the backend/web service when the user signs up.
- Purchases: Stripe checkout and native purchase verification may process purchase data when membership/checkout is active.
- Backend deletion request: email/display name/reason may be submitted when the user requests backend deletion.
- Local progress: Board, scavenger progress, theme, session, and companion status are stored locally.

Known app metadata:

- Privacy policy: `https://philly-tours.com/privacy.html`
- Support URL: `https://philly-tours.com/support.html`
- iOS bundle ID: `com.founders.phillyartours`
- Android package: `com.founders.phillyartours`

## Apple App Privacy

Use App Store Connect privacy answers that match the final build. Apple asks what data is collected from the app and linked to the user or used for tracking.

### Tracking

Recommended answer:

- Does this app use data for tracking? **No**

Reasoning:

- No ad tracking flow is present in the app copy reviewed here.
- Meta wearable analytics is configured opt-out in native metadata.
- Recheck every enabled SDK before final submission.

### Data Linked To The User

Likely categories to disclose if the corresponding features are enabled in the submitted build:

#### Contact Info

Select:

- Email Address
- Name, if display name is sent to backend or support flows

Purpose:

- App Functionality
- Account Management, if auth or membership support is active
- Developer's Advertising or Marketing only if newsletter signup is active and used for marketing email

Linked to user:

- **Yes** when submitted to newsletter, auth, purchase, support, or deletion endpoints.

Used for tracking:

- **No**

Notes:

- Local-only profile email/display name still appears in the app. If it never leaves the device in a specific build, answer based on Apple guidance for collected data. Because newsletter, checkout, auth, and deletion endpoints exist, treat email as collected when those flows are enabled.

#### Purchases

Select:

- Purchase History

Purpose:

- App Functionality
- Account Management

Linked to user:

- **Yes** if the backend stores entitlements, receipts, Stripe checkout sessions, payment intent IDs, customer IDs, or purchase tokens.

Used for tracking:

- **No**

Notes:

- Include this when paid membership, native purchases, Stripe checkout, or entitlement restore is active in the submitted build.

#### Location

Select:

- Precise Location
- Coarse Location

Purpose:

- App Functionality

Linked to user:

- Usually **No** if location is only used on device for nearby stops, Compass, and progress.
- Use **Yes** only if the submitted backend stores location tied to account/user records.

Used for tracking:

- **No**

Notes:

- The reviewed flow requests foreground location for nearby stops, Compass, and discovery progress. It should not be described as background tracking unless background location is added.

#### User Content

Select only if community/reflection submission is active in the submitted build:

- Other User Content

Purpose:

- App Functionality

Linked to user:

- **Yes** if posts/reflections are tied to a profile or account.

Used for tracking:

- **No**

Notes:

- Community room code currently stores local posts. If no user content is uploaded in the submitted build, do not claim this as collected.

#### Identifiers

Select if any final SDK or backend flow collects account IDs, user IDs, customer IDs, device IDs, or purchase IDs:

- User ID
- Device ID, only if collected by enabled SDKs or backend services

Purpose:

- App Functionality
- Account Management

Linked to user:

- **Yes** for account, purchase, and entitlement IDs.

Used for tracking:

- **No**

Notes:

- Recheck Stripe, Supabase/auth, platform purchase verification, and any crash/analytics tooling before final submission.

#### Diagnostics

Select if crash reporting, diagnostics, performance monitoring, or SDK diagnostics are enabled in the submitted build:

- Crash Data
- Performance Data
- Other Diagnostic Data

Purpose:

- App Functionality
- Analytics, only if used to measure app behavior

Linked to user:

- Usually **No**, unless tied to account/user ID.

Used for tracking:

- **No**

Notes:

- Do not select diagnostics solely because the app can log locally during development. Select it if production SDKs collect or transmit diagnostics.

### Data Not Collected Unless Final Build Does It

Do not select unless added or enabled:

- Contacts
- Photos or Videos
- Audio Data
- Browsing History
- Search History
- Sensitive Info
- Health and Fitness
- Financial Info beyond purchase/payment status handled by payment processors

## Google Play Data Safety

Google Play asks about data collected, shared, purpose, whether collection is optional, and deletion.

### Data Collection Summary

Recommended high-level answers:

- Does the app collect or share user data? **Yes**, if newsletter, purchases, auth, deletion requests, backend entitlements, or support flows are active.
- Is all user data encrypted in transit? **Yes**, if production endpoints are HTTPS only.
- Can users request data deletion? **Yes**, through support/deletion request flow and support email.
- Is data collection optional? **Partly**. Location, camera, Bluetooth, newsletter, and purchases are user-initiated/permissioned. Some data may be required for paid membership or support.

### Location

Data type:

- Approximate location
- Precise location

Collected:

- **Yes**

Shared:

- **No**, unless production backend or third-party SDK receives location.

Purpose:

- App functionality

Required or optional:

- Optional, but some Compass, nearby stop, and discovery features work best with it.

Ephemeral:

- Treat as **processed ephemerally** only if not stored or transmitted in the final build. If location is stored or sent to a backend, answer accordingly.

User-facing explanation:

Location helps Philly Tours show nearby stops, route progress, compass guidance, and location-based discoveries while the app is open.

### Personal Info

Data type:

- Email address
- Name, if display name is transmitted outside the device

Collected:

- **Yes** when users sign up for newsletter, use auth, request support/deletion, or complete purchase/account flows.

Shared:

- **Yes** with service providers only if email/name is sent to services such as email delivery, auth, payments, hosting/backend, or support tools.

Purpose:

- Account management
- App functionality
- Developer communications, if newsletter is active

Required or optional:

- Optional for browsing/touring preview.
- Required for newsletter, account, purchase support, or deletion request workflows.

User-facing explanation:

Email can be used for local profile display, newsletter signup, purchase/account support, and data deletion requests.

### Financial Info

Data type:

- Purchase history

Collected:

- **Yes** if membership, Stripe checkout, native purchase verification, entitlement restore, or paid access is active.

Shared:

- **Yes** with payment processors and app store purchase services as needed to process and verify purchases.

Purpose:

- Purchases
- App functionality
- Account management

Required or optional:

- Optional unless the user chooses paid access.

User-facing explanation:

Purchase information is used to process membership access and restore paid features.

### App Activity

Data type:

- App interactions, only if production analytics or backend events collect route/progress behavior.

Collected:

- **No** if Board/progress/session state remains local only.
- **Yes** if the final build uploads progress, events, route behavior, or analytics.

Purpose if enabled:

- App functionality
- Analytics

Required or optional:

- Depends on final implementation.

User-facing explanation:

Progress may be used to keep the Founders Board and route state current.

### App Info And Performance

Data type:

- Crash logs
- Diagnostics
- Other app performance data

Collected:

- **Yes** only if production crash reporting, analytics, payment diagnostics, or platform SDK diagnostics are active.

Shared:

- With service providers only, if enabled.

Purpose:

- App functionality
- Analytics, if used for product improvement

Required or optional:

- Usually required for app reliability if enabled.

### Device Or Other IDs

Data type:

- User IDs
- Device or other IDs

Collected:

- **Yes** if auth, backend accounts, purchase customer IDs, device IDs, or SDK identifiers are active.
- **No** if the final build keeps the profile fully local and does not use account/purchase identifiers.

Purpose:

- Account management
- App functionality
- Purchases

Shared:

- With service providers only if needed for auth, payments, or platform services.

### Photos And Videos / Camera

Google Play Data Safety usually concerns collected data, not just permission access.

Recommended:

- Do **not** say photos/videos are collected unless the app captures, uploads, stores, or shares camera images/video.

Permission explanation elsewhere:

- Camera access is used for native AR placement.

## Permission Declarations

### iOS Permission Copy

Current copy:

- Camera: `Camera access lets Philly Tours place AR scenes in your surroundings.`
- Location: `Location helps Philly Tours show nearby stops, route progress, and compass-guided discoveries while you use the app.`
- Bluetooth: `Bluetooth can route narration to headphones or supported smart glasses.`

These are acceptable because they are plain-language and feature-specific.

### Android Permission Copy

Use in Play Console permission declaration fields if requested:

- Location: Philly Tours uses location while the app is open to show nearby stops, guide the Compass, track route progress, and support location-based discoveries.
- Camera: Philly Tours uses the camera for native AR placement at supported stops.
- Bluetooth: Philly Tours uses Bluetooth to route narration to headphones or supported smart glasses.

## Data Deletion

User-facing answer:

Users can request account or app data deletion through support or the in-app deletion request flow.

Use:

- Support URL: `https://philly-tours.com/support.html`
- Support email: `info@foundersthreads.org`

Deletion scope:

- Local profile can be deleted on the device.
- Backend membership, purchase, newsletter, support, and account records require a deletion request.
- Payment processors and app stores may retain transaction records as required for legal, fraud prevention, tax, and platform compliance.

## Final Pre-Submission Verification

Before answering the live store forms:

- Confirm whether newsletter signup is enabled in the submitted build.
- Confirm whether Stripe checkout or native purchases are enabled.
- Confirm whether Supabase/auth provider sign-in is enabled.
- Confirm whether route progress or location is sent to the backend.
- Confirm whether any analytics, crash reporting, or performance SDK is active.
- Confirm whether community/reflection submissions are uploaded or local-only.
- Confirm production endpoints use HTTPS.
- Confirm the privacy policy matches the final answers.
- Confirm no secret keys are present in screenshots, app bundle, source, generated web JS, docs, or logs.
