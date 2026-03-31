#!/bin/zsh

set -euo pipefail

SCRIPT_DIR=${0:A:h}
SOURCE_ROOT=${SCRIPT_DIR:h}
TARGET_ROOT=${PHILLY_TOURS_SYNC_RUNTIME_ROOT:-$HOME/Services/philly-tours-backend}
PLIST_PATH=${PHILLY_TOURS_SYNC_PLIST_PATH:-$HOME/Library/LaunchAgents/com.nia.philly-tours-sync.plist}
SERVICE_LABEL=${PHILLY_TOURS_SYNC_SERVICE_LABEL:-com.nia.philly-tours-sync}
LOG_DIR=${PHILLY_TOURS_SYNC_LOG_DIR:-$HOME/Library/Logs/philly-tours}

export NVM_DIR="$HOME/.nvm"
if [[ -s "$NVM_DIR/nvm.sh" ]]; then
  . "$NVM_DIR/nvm.sh"
else
  echo "nvm.sh not found at $NVM_DIR/nvm.sh" >&2
  exit 1
fi

mkdir -p "$TARGET_ROOT"
mkdir -p "$LOG_DIR"

rsync -a "$SOURCE_ROOT/server/" "$TARGET_ROOT/server/"
rsync -a "$SOURCE_ROOT/scripts/" "$TARGET_ROOT/scripts/"
cp "$SOURCE_ROOT/package.json" "$TARGET_ROOT/package.json"

if [[ -f "$SOURCE_ROOT/package-lock.json" ]]; then
  cp "$SOURCE_ROOT/package-lock.json" "$TARGET_ROOT/package-lock.json"
fi

if [[ -f "$SOURCE_ROOT/.env" ]]; then
  cp "$SOURCE_ROOT/.env" "$TARGET_ROOT/.env"
fi

if [[ -f "$SOURCE_ROOT/.env.server.local" ]]; then
  cp "$SOURCE_ROOT/.env.server.local" "$TARGET_ROOT/.env.server.local"
fi

if [[ -f "$SOURCE_ROOT/.env.server" ]]; then
  cp "$SOURCE_ROOT/.env.server" "$TARGET_ROOT/.env.server"
fi

chmod +x "$TARGET_ROOT/scripts/start-sync-server.sh"

cd "$TARGET_ROOT"
npm install --no-audit --no-fund

launchctl bootout "gui/$(id -u)" "$PLIST_PATH" >/dev/null 2>&1 || true
launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"
launchctl kickstart -k "gui/$(id -u)/$SERVICE_LABEL"

echo "Sync server runtime deployed to $TARGET_ROOT"
echo "Service restarted: $SERVICE_LABEL"
