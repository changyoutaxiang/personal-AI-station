-- 移除entries表中的时间戳字段
-- 这个迁移将重建entries表，移除created_at和updated_at字段

BEGIN TRANSACTION;

-- 1. 创建新的entries表（不包含时间戳字段）
CREATE TABLE entries_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  project_tag TEXT,
  daily_report_tag TEXT,
  effort_tag TEXT DEFAULT '轻松',
  sort_order INTEGER DEFAULT 0
);

-- 2. 复制数据（排除时间戳字段）
INSERT INTO entries_new (id, content, project_tag, daily_report_tag, effort_tag, sort_order)
SELECT id, content, project_tag, daily_report_tag, effort_tag, sort_order
FROM entries;

-- 3. 删除旧表
DROP TABLE entries;

-- 4. 重命名新表
ALTER TABLE entries_new RENAME TO entries;

COMMIT;