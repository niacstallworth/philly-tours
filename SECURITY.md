# Security Policy

## Supported Versions

The current actively maintained branch and the production deployment behind `api.philly-tours.com` are the supported targets.

## Reporting a Vulnerability

If you find a vulnerability, report it privately to:

- `info@foundersthreads.org`

Please include:

- a short description of the issue
- affected environment: local, staging, production, iOS, Android, or web
- reproduction steps
- any screenshots or logs with secrets redacted

Please do not post unredacted secrets, access tokens, or private keys in issues, screenshots, chat transcripts, or pull requests.

## Secret Handling

- Keep server-only local secrets in `server.local.env` or a server-owned env file such as `/etc/philly-tours/sync-server.env`.
- Keep Expo / browser-safe values in `.env` only when they are intended to ship to the client as `EXPO_PUBLIC_*`.
- Never commit real Stripe, Supabase service-role, AWS, GitHub, Anthropic, Turnstile, or Apple private credentials.
- Avoid root-level secret files that native bundlers may try to parse during Android builds.

If a real credential is exposed in logs, screenshots, terminal output, or source:

1. rotate it with the provider
2. remove it from local logs and developer artifacts
3. replace it in the correct env file
4. redeploy or restart the affected service

## Operational Notes

- Stripe live and test keys must stay separated between local development and production.
- Production webhooks should point only at the production backend.
- Builder/admin credentials should not be committed in plaintext CSV or screenshots.
- Security-sensitive changes should be reviewed before push when they touch auth, payments, env loading, or deployment scripts.
