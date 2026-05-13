# Philly Tours

This branch uses the canonical project README on `main`:

- [Full project README](https://github.com/niacstallworth/philly-tours/blob/main/docs/project-readme.md)
- [Live production backend status](https://github.com/niacstallworth/philly-tours/blob/main/docs/live-production-backend-status.md)
- [Security policy](https://github.com/niacstallworth/philly-tours/blob/main/docs/security-policy.md)

Production API:

- `https://api.philly-tours.com`
- `/health`
- `/api/config/status`

## Deployment

Web deploys run remotely through GitHub Actions. Push to `main` or run the `Deploy Cloudflare Pages` workflow manually from GitHub Actions.

Required GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `EXPO_PUBLIC_ONESIGNAL_APP_ID`

`npm run deploy` is intentionally disabled locally to avoid building `web-dist` on this machine. Emergency direct uploads are still available with `npm run deploy:local`.
