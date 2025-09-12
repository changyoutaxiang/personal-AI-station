#!/usr/bin/env bash
set -euo pipefail

# Lightweight migration runner for SQLite
# Usage: scripts/migrate.sh [database_path]

DB_PATH=${1:-db/digital_brain.sqlite}
MIGRATIONS_DIR="db/migrations"

mkdir -p "$(dirname "$DB_PATH")"

# Ensure sqlite3 exists
if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required but not found. Please install sqlite3." >&2
  exit 1
fi

# Ensure schema_migrations exists
sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));"

applied_versions=$(sqlite3 "$DB_PATH" "SELECT version FROM schema_migrations ORDER BY version;")

# Apply migrations in lexical order
for file in $(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
  version=$(basename "$file" .sql)
  if echo "$applied_versions" | grep -q "^${version}$"; then
    echo "Already applied: $version"
    continue
  fi
  echo "Applying: $version"
  sqlite3 "$DB_PATH" < "$file"
  echo "Applied: $version"
done

echo "Migrations complete. DB: $DB_PATH"
