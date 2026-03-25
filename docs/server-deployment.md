# Server Deployment

This project does not require a cloud vendor secret manager, but it does require that production secrets stay out of the repo and out of the client bundle.

## Recommended Setup

Use:

- a dedicated Linux user such as `philly`
- a checked-out app directory such as `/srv/philly-tours`
- a root-owned env file such as `/etc/philly-tours/sync-server.env`
- a `systemd` service based on `deploy/philly-tours-sync.service.example`

The env file should be created on the server and never committed.

## Example Layout

- app code: `/srv/philly-tours`
- secret env file: `/etc/philly-tours/sync-server.env`
- service file: `/etc/systemd/system/philly-tours-sync.service`

## File Permissions

Set strict permissions on the secret env file:

```bash
sudo mkdir -p /etc/philly-tours
sudo chown root:root /etc/philly-tours
sudo chmod 700 /etc/philly-tours
sudo cp deploy/sync-server.env.example /etc/philly-tours/sync-server.env
sudo chown root:root /etc/philly-tours/sync-server.env
sudo chmod 600 /etc/philly-tours/sync-server.env
```

Only root should be able to read the file.

## Builder/Admin Accounts

Builder/admin accounts are server-side only.

1. Edit `docs/builder-admins.csv`
2. Mark the real account rows as active
3. Run:

```bash
npm run builder:admins:map
```

4. Copy the printed JSON into `BUILDER_ADMIN_ACCOUNTS_JSON` in the server env file

Do not commit real builder/admin credentials or generated live account JSON.

## Required Production Variables

At minimum, set:

- `NODE_ENV=production`
- `PORT`
- `EXPO_PUBLIC_SYNC_SERVER_URL`
- `AUTH_JWT_SECRET`
- `BUILDER_ADMIN_ACCOUNTS_JSON`
- `SUPABASE_DB_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Important Security Notes

- Keep `ALLOW_LEGACY_ADMIN_API_KEY` unset in production.
- Rotate any secrets that have been stored in local `.env` files, screenshots, chats, or shared notes.
- Never expose `SUPABASE_SERVICE_ROLE_KEY`, Stripe secret keys, or JWT secrets to the mobile app.
- Only `EXPO_PUBLIC_*` values are safe for the client bundle.

## Start and Enable

After copying the service file into place:

```bash
sudo systemctl daemon-reload
sudo systemctl enable philly-tours-sync
sudo systemctl start philly-tours-sync
sudo systemctl status philly-tours-sync
```

## Reverse Proxy

Put the Node server behind HTTPS using Nginx or Caddy and point:

- `api.example.com` -> `http://127.0.0.1:4000`

Then use that HTTPS URL as `EXPO_PUBLIC_SYNC_SERVER_URL` in production app builds.
