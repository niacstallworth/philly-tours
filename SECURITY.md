# Security Policy

## Scope

This repository is the shared Philly Tours platform workspace for the native app, web companion, and city-pack tooling.

Production deploys for individual cities should happen from city-specific repos, not from this platform repo.

The current production backend for Philly Tours is:

- `https://api.philly-tours.com`

For the longer internal policy, see [docs/security-policy.md](docs/security-policy.md).

## Supported Versions

The actively maintained default branch and the live production backend behind `api.philly-tours.com` are the supported targets.

## Reporting a Vulnerability

Please report vulnerabilities privately to:

- `info@foundersthreads.org`

Include:

- a short description of the issue
- the affected surface: local, iOS, Android, web, backend, or city-pack tooling
- reproduction steps
- screenshots or logs only after redacting secrets and personal data

Please do not post unredacted secrets, tokens, private keys, precise user locations, or production credentials in issues, pull requests, screenshots, chat transcripts, or commits.

## Secret Handling

- Keep server-only secrets in `server.local.env` or server-owned environment files.
- Keep client-safe values in `EXPO_PUBLIC_*` variables only when they are intended to ship to the app or browser.
- Never commit live Stripe, Supabase service-role, AWS, GitHub, Turnstile, Apple, or other provider credentials.
- If a credential is exposed, rotate it first, then remove it from logs, screenshots, local artifacts, and the affected environment.

## Location And Device Privacy

- Treat location, heading, route progress, and companion-device payloads as sensitive user-context data.
- Avoid copying precise coordinates or live route state into bug reports, PRs, screenshots, or shared logs.
- Review security-sensitive changes before push when they touch auth, payments, env loading, deploy scripts, permissions, location behavior, companion integrations, or navigation handoffs.
