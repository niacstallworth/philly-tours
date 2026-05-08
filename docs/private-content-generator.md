# Private Content Generator

Use this when you want a private-catalog draft generated automatically from the
current repo data.

## Command

```bash
npm run content:generate:private
```

Default output:

- `private-content/catalog.generated.json`

## What it does

- reads the current checked-in webapp tour catalog
- reads the current checked-in narration data
- converts them into the `private-content` import format

## Important limitation

This generator can only export data that still exists in the repo.

Because the public repo was already sanitized, the generated draft will only
include the demo catalog unless you add more local source data first.

## Good use

- create a draft structure automatically
- replace demo entries with your real local-only tours
- then run:

```bash
npm run content:import:private -- --file private-content/catalog.generated.json --dry-run
```
