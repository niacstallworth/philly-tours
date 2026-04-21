# Contributing to Philly Tours

Thank you for considering contributing to **Philly Tours** — a premium drive-first Philadelphia cultural touring platform with native AR, Meta wearables, spatial computing plans, and a cinematic web companion.

We welcome bug reports, feature ideas, documentation improvements, and code contributions. This document outlines the process so everything stays smooth and on-brand.

## Code of Conduct

Be kind, respectful, and professional. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## Development Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/niacstallworth/philly-tours.git
   cd philly-tours
   ```

2. **Install Git LFS** (required for large vendor assets)
   ```bash
   brew install git-lfs
   git lfs install
   git lfs pull
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start development servers**
   ```bash
   # Metro for dev client
   npm run start:metro:dev-client

   # Local sync backend
   npm run sync-server

   # Web companion (optional)
   npm run webapp:serve
   ```

5. **Open native projects**
   - iOS: `open ios/PhillyARTours.xcworkspace`
   - Android: `npx expo run:android`

See the full [Local Development section](https://github.com/niacstallworth/philly-tours/blob/codex/ar-launch-preflight/README.md#local-development) in the detailed README for environment variables, Stripe webhook listening, Android device tips, and more.

## Branch Strategy

- `main` → Protected production/stable branch (lightweight forwarder only)
- `codex/*` → All active development (e.g. `codex/ar-launch-preflight`, `codex/visionos-foundation`)
- Create feature branches off the appropriate `codex/*` branch: `codex/your-feature-name`

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:`, `chore:`, `test:`, etc.

Example: `feat: add Meta wearables companion pairing screen`

## Pull Request Process

1. Fork the repo (or branch from the relevant `codex/*` branch).
2. Make your changes.
3. Update the detailed README on `codex/ar-launch-preflight` if needed.
4. Open a PR targeting the appropriate `codex/*` branch.
5. Ensure:
   - Code is TypeScript clean (`npx tsc --noEmit`)
   - You’ve tested on iOS/Android/web where applicable
   - You’ve added/updated relevant docs in the `docs/` folder

## What We’d Love Help With

- Tests (Jest + React Native Testing Library)
- GitHub Actions CI/CD (lint, typecheck, EAS previews)
- VisionOS / spatial computing prototypes
- Android parity for Meta wearables
- Accessibility audit & improvements
- Marketing visuals / demo video for the README

## Questions?

Open an issue or reach out via the repo. We’re a small team (currently solo) and appreciate every contribution!
