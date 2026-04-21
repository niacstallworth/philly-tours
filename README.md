# Philly Tours

## Live Production Status

Production backend is live at `https://api.philly-tours.com`.

Verified on April 21, 2026:

- Live Production API responds from `/health`
- `/api/config/status` reports `mode: "production"`
- Payments are configured through Stripe, Apple IAP production, and Google Play purchase verification
- Auth and builder/admin auth are configured
- Database is connected
- External services are integrated, including Cloudflare Turnstile and Google Maps
- Health and config endpoints are verified

Public checks:

```bash
curl -fsS https://api.philly-tours.com/health
curl -fsS https://api.philly-tours.com/api/config/status
```

## Active Project Branch

The active project README currently lives on the `codex/visionos-foundation` branch.

- Current README: [codex/visionos-foundation/README.md](https://github.com/niacstallworth/philly-tours/blob/codex/visionos-foundation/README.md)
- Branch: [codex/visionos-foundation](https://github.com/niacstallworth/philly-tours/tree/codex/visionos-foundation)
- Earlier preflight branch: [codex/ar-launch-preflight](https://github.com/niacstallworth/philly-tours/tree/codex/ar-launch-preflight)

This `main` branch README is intentionally kept as a forwarder.
