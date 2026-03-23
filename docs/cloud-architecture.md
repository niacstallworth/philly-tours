# Cloud Architecture

## Current Direction

This app should use:

- Supabase as the primary backend platform
- Postgres as the primary database, through Supabase
- Firebase only for mobile push notifications and related device messaging features

This app should not use Firebase and Supabase as overlapping databases or overlapping auth systems.

## Responsibility Split

### Supabase

Supabase owns:

- primary relational data
- users and app-facing identity if auth is added
- purchases and entitlements
- backend deletion requests
- future hunt sync if token progress moves off-device
- future editable tour content if the catalog becomes admin-managed
- storage for uploaded assets if we later move media out of the bundle

### Postgres

Postgres is the actual system of record behind Supabase.

The first migrated schema mirrors the current SQLite server tables:

- `users`
- `payment_orders`
- `entitlements`
- `iap_receipts`
- `idempotency`
- `provider_events`
- `deletion_requests`

### Firebase

Firebase should stay narrow and support the mobile app where it is strongest:

- Firebase Cloud Messaging for push notifications
- optional App Check later if abuse protection becomes necessary

Firebase should not become the second primary database for this app.

## Why This Split

Using Supabase plus Firebase plus standalone Postgres as three separate centers of truth would create:

- duplicate auth logic
- duplicate user records
- duplicate permission rules
- higher ops overhead
- harder debugging during payments and entitlement work

Using Supabase as the backend foundation and Firebase only for notifications keeps the stack much simpler.

## Repo Status

The repo is now initialized for both platforms:

- Supabase local config: `/Users/nia/Documents/GitHub/philly-tours/supabase/config.toml`
- Firebase project binding: `/Users/nia/Documents/GitHub/philly-tours/.firebaserc`

Hosted Supabase linking is still pending because it requires the remote database password for project ref `inqopeveskosnfjhuein`.

## Next Steps

1. Link the repo to the hosted Supabase project.
2. Apply the first migration in `supabase/migrations`.
3. Export current SQLite data from `server/payments.db`.
4. Import that data into Supabase Postgres.
5. Update the Node sync server to read and write Postgres instead of SQLite.
6. Add Firebase Cloud Messaging only when push notifications are actually in scope.
