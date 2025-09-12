#!/usr/bin/env bash
set -euo pipefail

# Restore SQLite DB from a backup file
# Usage: scripts/restore.sh <backup_sqlite_file> [restore_path]

SRC_DB=${1:-}
DEST_DB=${2:-db/digital_brain.sqlite}

if [[ -z "$SRC_DB" ]]; then
  echo "Usage: scripts/restore.sh <backup_sqlite_file> [restore_path]" >&2
  exit 1
fi

mkdir -p "$(dirname "$DEST_DB")"

cp "$SRC_DB" "$DEST_DB"
echo "Restored DB to $DEST_DB from $SRC_DB"
