#!/bin/zsh

set -euo pipefail

SCRIPT_DIR=${0:A:h}
REPO_ROOT=${SCRIPT_DIR:h}
RUNTIME_DIR="$REPO_ROOT/.runtime"
PID_FILE="$RUNTIME_DIR/sync-server.pid"
LOG_FILE="$RUNTIME_DIR/sync-server.log"

mkdir -p "$RUNTIME_DIR"

if [[ -f "$PID_FILE" ]]; then
  EXISTING_PID=$(<"$PID_FILE")
  if kill -0 "$EXISTING_PID" 2>/dev/null; then
    echo "Sync server is already running with PID $EXISTING_PID"
    exit 0
  fi
  rm -f "$PID_FILE"
fi

cd "$REPO_ROOT"
nohup "$REPO_ROOT/scripts/start-sync-server.sh" >>"$LOG_FILE" 2>&1 &
SERVER_PID=$!
echo "$SERVER_PID" >"$PID_FILE"

sleep 3

if kill -0 "$SERVER_PID" 2>/dev/null; then
  echo "Sync server started with PID $SERVER_PID"
  echo "Log file: $LOG_FILE"
else
  echo "Sync server failed to stay up. Recent log output:"
  tail -n 40 "$LOG_FILE" || true
  exit 1
fi
