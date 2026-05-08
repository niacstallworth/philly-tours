# Private Content Preflight

Run this before importing real paid tours:

```bash
npm run content:test:private
```

What it checks:

- required DB env is present
- Postgres connection succeeds
- `private_content` schema tables exist

It does not write or modify any data.

If preflight passes, the next command is:

```bash
npm run content:import:private -- --dry-run
```
