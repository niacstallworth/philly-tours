# Philly Tours Platform

This repository is now the shared platform workspace for Philly Tours and future city launches.

It holds:

- the shared React Native and web product engine
- city-pack content, branding, SEO, narration, and AR metadata
- build and validation scripts for city-aware web outputs
- export tooling for spinning a city into its own production repo

This repository does not serve as the production deploy lane for a single city. Platform-level deploys are intentionally blocked here.

Production city repos currently live at:

- `/Users/nia/Documents/GitHub/philly-tours-philly`
- `/Users/nia/Documents/GitHub/philly-tours-baltimore`

## Current Model

The platform now separates shared app logic from city-owned content.

Shared engine examples:

- navigation and screens in `src/`
- services and app behavior in `src/services/`
- web shell and templates in `webapp/`
- build/export scripts in `scripts/`

City-owned content examples:

- `cities/<city>/city.json`
- `cities/<city>/branding.json`
- `cities/<city>/seo.json`
- `cities/<city>/social.json`
- `cities/<city>/business-profile.json`
- `cities/<city>/tours.json`
- `cities/<city>/narration.json`
- `cities/<city>/ar.json`

The generated runtime registry currently supports:

- `philly`
- `baltimore`
- `dc`
- `atlanta`
- `new-orleans`

Default city: `philly`

## Quick Start

Install dependencies:

```bash
npm install
```

Start Expo Metro for the dev client:

```bash
npm run start:metro:dev-client
```

Run the local backend:

```bash
npm run sync-server
```

Serve the webapp for a city:

```bash
CITY=philly npm run webapp:serve
```

Build a city web bundle:

```bash
CITY=philly npm run webapp:build
```

## Common Platform Commands

Create a new city pack:

```bash
npm run city:create -- --id <city-id> --city "<City Name>" --state <ST> --lat <num> --lng <num>
```

Validate city-pack data:

```bash
npm run city:validate
```

Regenerate the city runtime registry after adding or removing a city:

```bash
npm run city:runtime:generate
```

Build generated city data:

```bash
CITY=philly npm run city:data
```

Build the city web distribution:

```bash
CITY=philly npm run city:web:build
```

Deploy a city preview explicitly from the platform repo:

```bash
CITY=philly npm run deploy:city
```

Export a city into its own repo:

```bash
npm run city:export -- --city <city-id> --dest </absolute/path/to/new-repo>
```

## Deploy Guardrail

`npm run deploy` is intentionally blocked in this repository.

Use:

- the city-specific repos for production deploys
- `npm run deploy:city` only when you explicitly want a platform-driven city preview deploy

## Repo Layout

```text
cities/               City packs and launch content
src/                  Shared native app engine
src/city-runtime/     Generated city registry and runtime readers
webapp/               Shared browser shell and generated web assets
scripts/              City-pack, build, deploy, and export tooling
docs/                 Product, deployment, and platform documentation
```

## Docs

- [Project Readme](docs/project-readme.md)
- [Multi-City Platform Plan](docs/multi-city-platform-plan.md)
- [Multi-City Refactor Checklist](docs/multi-city-refactor-checklist.md)
- [Webapp Deployment](docs/webapp-deployment.md)
- [Meta Quest 2 and Orion Spatial Plan](docs/meta-quest-orion-spatial-plan.md)
