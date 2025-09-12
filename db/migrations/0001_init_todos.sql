-- 0001_init_todos.sql
-- Initializes durable Todos storage with soft delete and event logging

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Migration bookkeeping
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

-- Todos main table
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,              -- UUID (v7 recommended)
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT,                        -- JSON-encoded array (string)
  priority INTEGER DEFAULT 0,       -- 0=normal, higher=more important
  due_date TEXT,                    -- ISO8601 string (UTC)
  source TEXT DEFAULT 'manual',
  version INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_todos_due ON todos (due_date);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos (priority);

-- Events table (append-only)
CREATE TABLE IF NOT EXISTS todos_events (
  event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('create','update')),
  title TEXT,
  content TEXT,
  tags TEXT,
  priority INTEGER,
  due_date TEXT,
  source TEXT,
  version INTEGER,
  created_at TEXT,
  updated_at TEXT,

  actor TEXT DEFAULT 'system',
  occurred_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(entity_id) REFERENCES todos(id) ON DELETE NO ACTION
);
CREATE INDEX IF NOT EXISTS idx_todos_events_entity ON todos_events (entity_id, occurred_at);

-- Trigger: after insert -> create event
CREATE TRIGGER IF NOT EXISTS trg_todos_after_insert
AFTER INSERT ON todos
BEGIN
  INSERT INTO todos_events (
    entity_id, event_type, title, content, tags, priority, due_date, source, version, created_at, updated_at
  ) VALUES (
    NEW.id, 'create', NEW.title, NEW.content, NEW.tags, NEW.priority, NEW.due_date, NEW.source, NEW.version, NEW.created_at, NEW.updated_at
  );
END;

-- Trigger: after update -> update event
CREATE TRIGGER IF NOT EXISTS trg_todos_after_update
AFTER UPDATE ON todos
BEGIN
  INSERT INTO todos_events (
    entity_id, event_type, title, content, tags, priority, due_date, source, version, created_at, updated_at
  ) VALUES (
    NEW.id, 'update', NEW.title, NEW.content, NEW.tags, NEW.priority, NEW.due_date, NEW.source, NEW.version, NEW.created_at, NEW.updated_at
  );
END;

-- Mark this migration as applied
INSERT OR IGNORE INTO schema_migrations (version) VALUES ('0001_init_todos');
