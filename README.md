# Philly Tours Platform

This repo is now the shared platform/template workspace for multi-city work.

It is where we:

- evolve the shared app engine
- maintain city-pack tooling
- prototype new city launches
- keep Philly and Baltimore logic in one source workspace
- scaffold new city packs
- export locked single-city repos when a city is ready for its own production lane

It is **not** the safe place to do production deploys for a single city anymore.

Use the city-specific repos for that:

- `/Users/nia/Documents/GitHub/philly-tours-philly`
- `/Users/nia/Documents/GitHub/philly-tours-baltimore`

More detail lives in:

- [docs/project-readme.md](https://github.com/niacstallworth/philly-tours/blob/main/docs/project-readme.md)
- [docs/multi-city-platform-plan.md](https://github.com/niacstallworth/philly-tours/blob/main/docs/multi-city-platform-plan.md)
- [docs/multi-city-refactor-checklist.md](https://github.com/niacstallworth/philly-tours/blob/main/docs/multi-city-refactor-checklist.md)

Useful platform commands:

- `npm run city:runtime:generate`
- `npm run city:create -- --id <city-id> --city "<City Name>" --state <ST> --lat <num> --lng <num>`
- `npm run city:validate`
- `CITY=<city> npm run webapp:build`
- `npm run city:export -- --city <city-id> --dest </absolute/path/to/new-repo>`
