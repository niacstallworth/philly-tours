#!/bin/zsh

set -euo pipefail

APP_USER=${PHILLY_TOURS_APP_USER:-philly}
APP_GROUP=${PHILLY_TOURS_APP_GROUP:-$APP_USER}
APP_DIR=${PHILLY_TOURS_APP_DIR:-/srv/philly-tours}
ENV_DIR=${PHILLY_TOURS_ENV_DIR:-/etc/philly-tours}
ENV_FILE=${PHILLY_TOURS_ENV_FILE:-$ENV_DIR/sync-server.env}
SERVICE_NAME=${PHILLY_TOURS_SERVICE_NAME:-philly-tours-sync}
CADDYFILE_PATH=${PHILLY_TOURS_CADDYFILE_PATH:-/etc/caddy/Caddyfile}
API_HOST=${PHILLY_TOURS_API_HOST:-api.philly-tours.com}
SCRIPT_DIR=${0:A:h}
REPO_ROOT=${SCRIPT_DIR:h}

if [[ $EUID -ne 0 ]]; then
  echo "Run this script with sudo on the EC2 host." >&2
  exit 1
fi

echo "Bootstrapping Philly Tours API host for $API_HOST"

if command -v dnf >/dev/null 2>&1; then
  dnf update -y
  dnf install -y git curl

  if ! command -v node >/dev/null 2>&1; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
  fi

  if ! command -v caddy >/dev/null 2>&1; then
    dnf install -y 'dnf-command(copr)'
    dnf copr enable -y @caddy/caddy
    dnf install -y caddy
  fi

  if command -v firewall-cmd >/dev/null 2>&1; then
    firewall-cmd --permanent --add-service=http || true
    firewall-cmd --permanent --add-service=https || true
    firewall-cmd --reload || true
  fi
else
  echo "This bootstrap currently supports dnf-based hosts." >&2
  exit 1
fi

if ! getent group "$APP_GROUP" >/dev/null 2>&1; then
  groupadd --system "$APP_GROUP"
fi

if ! id "$APP_USER" >/dev/null 2>&1; then
  useradd --system --create-home --home-dir /srv/philly --gid "$APP_GROUP" "$APP_USER"
fi

mkdir -p "$APP_DIR" "$ENV_DIR"
chown -R "$APP_USER:$APP_GROUP" "$APP_DIR"

if [[ -f "$REPO_ROOT/package.json" && -d "$REPO_ROOT/server" ]]; then
  echo "Installing production dependencies in $APP_DIR"
  cd "$REPO_ROOT"
  rsync -az \
    "$REPO_ROOT/server/" \
    "$REPO_ROOT/scripts/" \
    "$REPO_ROOT/deploy/" \
    "$REPO_ROOT/package.json" \
    "$REPO_ROOT/package-lock.json" \
    "$APP_DIR/"
  chown -R "$APP_USER:$APP_GROUP" "$APP_DIR"
  sudo -u "$APP_USER" npm --prefix "$APP_DIR" install --omit=dev --no-audit --no-fund
else
  echo "Repo files not found next to this script; skipping code sync."
fi

if [[ ! -f "$ENV_FILE" ]]; then
  cp "$REPO_ROOT/deploy/sync-server.env.example" "$ENV_FILE"
  chmod 600 "$ENV_FILE"
  echo "Created $ENV_FILE from example. Fill in the real secrets before using the API."
else
  echo "Keeping existing env file at $ENV_FILE"
fi

cat >"/etc/systemd/system/${SERVICE_NAME}.service" <<EOF
[Unit]
Description=Philly Tours Sync Server
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=$APP_GROUP
WorkingDirectory=$APP_DIR
EnvironmentFile=$ENV_FILE
ExecStart=/usr/bin/env node server/sync-server.js
Restart=always
RestartSec=5
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$APP_DIR

[Install]
WantedBy=multi-user.target
EOF

cat >"$CADDYFILE_PATH" <<EOF
$API_HOST {
  encode zstd gzip

  header {
    X-Content-Type-Options nosniff
    X-Frame-Options SAMEORIGIN
    Referrer-Policy strict-origin-when-cross-origin
  }

  reverse_proxy 127.0.0.1:4000
}
EOF

systemctl daemon-reload
systemctl enable "$SERVICE_NAME"
systemctl restart "$SERVICE_NAME" || true
systemctl enable caddy
systemctl restart caddy

echo
echo "Next checks:"
echo "  systemctl status $SERVICE_NAME --no-pager"
echo "  systemctl status caddy --no-pager"
echo "  curl -i http://127.0.0.1:4000/health"
echo "  curl -i https://$API_HOST/health"
echo
echo "If the service fails to start, fill in $ENV_FILE and restart:"
echo "  systemctl restart $SERVICE_NAME"
