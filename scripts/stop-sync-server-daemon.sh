#!/bin/zsh

set -euo pipefail

SCRIPT_DIR=${0:A:h}
REPO_ROOT=${SCRIPT_DIR:h}
PID_FILE="$REPO_ROOT/.runtime/sync-server.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "No sync server PID file found."
  exit 0
fi

SERVER_PID=$(<"$PID_FILE")

if kill -0 "$SERVER_PID" 2>/dev/null; then
  kill "$SERVER_PID"
  echo "Stopped sync server PID $SERVER_PID"
else
  echo "PID $SERVER_PID is not running."
fi

rm -f "$PID_FILE"
