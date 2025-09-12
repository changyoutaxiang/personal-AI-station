#!/usr/bin/env bash
set -euo pipefail

# Verify basic integrity of the SQLite DB
# Usage: scripts/check_integrity.sh [database_path]

DB_PATH=${1:-db/digital_brain.sqlite}

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required but not found." >&2
  exit 1
fi

sqlite3 "$DB_PATH" "PRAGMA integrity_check;"
echo "Counts:"
echo -n "todos: " && sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos;" || true
echo -n "events: " && sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos_events;" || true
