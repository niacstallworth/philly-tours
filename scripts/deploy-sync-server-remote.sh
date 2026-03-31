#!/bin/zsh

set -euo pipefail

SCRIPT_DIR=${0:A:h}
SOURCE_ROOT=${SCRIPT_DIR:h}

REMOTE_HOST=${PHILLY_TOURS_REMOTE_HOST:-}
REMOTE_USER=${PHILLY_TOURS_REMOTE_USER:-philly}
REMOTE_APP_DIR=${PHILLY_TOURS_REMOTE_APP_DIR:-/srv/philly-tours}
REMOTE_SERVICE_NAME=${PHILLY_TOURS_REMOTE_SERVICE_NAME:-philly-tours-sync}

if [[ -z "$REMOTE_HOST" ]]; then
  echo "Set PHILLY_TOURS_REMOTE_HOST to the SSH host you want to deploy to." >&2
  exit 1
fi

REMOTE_TARGET="$REMOTE_USER@$REMOTE_HOST"

ssh "$REMOTE_TARGET" "mkdir -p '$REMOTE_APP_DIR'"

rsync -az \
  "$SOURCE_ROOT/server/" \
  "$SOURCE_ROOT/scripts/" \
  "$SOURCE_ROOT/deploy/" \
  "$SOURCE_ROOT/package.json" \
  "$SOURCE_ROOT/package-lock.json" \
  "$REMOTE_TARGET:$REMOTE_APP_DIR/"

ssh "$REMOTE_TARGET" "\
  set -euo pipefail; \
  mkdir -p '$REMOTE_APP_DIR'; \
  cd '$REMOTE_APP_DIR'; \
  npm install --omit=dev --no-audit --no-fund; \
  echo 'Code synced to $REMOTE_APP_DIR'; \
  echo 'Next steps:'; \
  echo '  1. Create /etc/philly-tours/sync-server.env from deploy/sync-server.env.example'; \
  echo '  2. Install or adapt deploy/philly-tours-sync.service.example as your systemd unit'; \
  echo '  3. sudo systemctl daemon-reload'; \
  echo '  4. sudo systemctl enable $REMOTE_SERVICE_NAME'; \
  echo '  5. sudo systemctl restart $REMOTE_SERVICE_NAME'; \
  echo '  6. Put Nginx or Caddy in front of http://127.0.0.1:4000'; \
  echo '  7. Point api.philly-tours.com at that host'; \
  echo '  8. Rebuild client apps with EXPO_PUBLIC_SYNC_SERVER_URL and EXPO_PUBLIC_WEB_SYNC_SERVER_URL set to the public HTTPS URL'; \
"
