#!/usr/bin/env bash
set -euo pipefail

# 数据完整性验证脚本
# 用法: scripts/verify-data-integrity.sh [database_path]

DB_PATH=${1:-data/digital-brain.db}

echo "🔍 开始验证数据库完整性: $DB_PATH"

if [[ ! -f "$DB_PATH" ]]; then
  echo "❌ 数据库文件不存在: $DB_PATH"
  exit 1
fi

# 1. SQLite完整性检查
echo "📋 执行SQLite完整性检查..."
if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
  echo "✅ SQLite完整性检查通过"
else
  echo "❌ SQLite完整性检查失败"
  exit 1
fi

# 2. 外键约束检查
echo "🔗 检查外键约束..."
foreign_key_errors=$(sqlite3 "$DB_PATH" "PRAGMA foreign_key_check;" | wc -l)
if [[ $foreign_key_errors -eq 0 ]]; then
  echo "✅ 外键约束检查通过"
else
  echo "❌ 发现 $foreign_key_errors 个外键约束错误"
  sqlite3 "$DB_PATH" "PRAGMA foreign_key_check;"
fi

# 3. 关键表存在性检查
echo "📊 检查关键表结构..."
required_tables=("todos" "todos_events" "okr_goals" "okr_events" "entries")
for table in "${required_tables[@]}"; do
  if sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q "$table"; then
    echo "✅ 表 $table 存在"
  else
    echo "⚠️  表 $table 不存在"
  fi
done

# 4. 触发器检查
echo "⚡ 检查数据持久化触发器..."
triggers=("trg_todos_after_insert" "trg_todos_after_update" "trg_okr_after_insert" "trg_okr_after_update")
for trigger in "${triggers[@]}"; do
  if sqlite3 "$DB_PATH" "SELECT name FROM sqlite_master WHERE type='trigger' AND name='$trigger';" | grep -q "$trigger"; then
    echo "✅ 触发器 $trigger 存在"
  else
    echo "⚠️  触发器 $trigger 不存在 - 数据可能无法自动记录到事件表"
  fi
done

# 5. 数据一致性检查
echo "🔄 检查数据一致性..."

# 检查todos表和todos_events表的一致性
todos_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos;" 2>/dev/null || echo "0")
todos_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(DISTINCT entity_id) FROM todos_events;" 2>/dev/null || echo "0")
echo "📝 Todos记录数: $todos_count, 事件记录覆盖的实体数: $todos_events_count"

# 检查okr_goals表和okr_events表的一致性
okr_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_goals;" 2>/dev/null || echo "0")
okr_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(DISTINCT entity_id) FROM okr_events;" 2>/dev/null || echo "0")
echo "🎯 OKR记录数: $okr_count, 事件记录覆盖的实体数: $okr_events_count"

# 6. 最近活动检查
echo "📅 检查最近数据活动..."
recent_todos=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos WHERE created_at > datetime('now', '-7 days');" 2>/dev/null || echo "0")
recent_okrs=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_goals WHERE created_at > datetime('now', '-7 days');" 2>/dev/null || echo "0")
recent_entries=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM entries WHERE created_at > datetime('now', '-7 days');" 2>/dev/null || echo "0")

echo "📊 最近7天新增数据:"
echo "  - Todos: $recent_todos"
echo "  - OKRs: $recent_okrs"
echo "  - Entries: $recent_entries"

# 7. 事件日志完整性
echo "📋 检查事件日志完整性..."
todos_with_events=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos t WHERE EXISTS (SELECT 1 FROM todos_events te WHERE te.entity_id = t.id AND te.event_type = 'create');" 2>/dev/null || echo "0")
okr_with_events=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_goals o WHERE EXISTS (SELECT 1 FROM okr_events oe WHERE oe.entity_id = o.id AND oe.event_type = 'create');" 2>/dev/null || echo "0")

echo "📝 有创建事件记录的数据:"
echo "  - Todos: $todos_with_events/$todos_count"
echo "  - OKRs: $okr_with_events/$okr_count"

# 8. 生成完整性报告
echo ""
echo "📋 数据完整性报告摘要:"
echo "================================"
echo "数据库文件: $DB_PATH"
echo "文件大小: $(stat -f%z "$DB_PATH" 2>/dev/null || echo "unknown") bytes"
echo "检查时间: $(date)"
echo "总数据量:"
echo "  - Todos: $todos_count (活跃: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos WHERE deleted_at IS NULL;" 2>/dev/null || echo "0"))"
echo "  - OKRs: $okr_count"
echo "  - Entries: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM entries;" 2>/dev/null || echo "0")"
echo "事件日志:"
echo "  - Todos事件: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos_events;" 2>/dev/null || echo "0")"
echo "  - OKR事件: $(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_events;" 2>/dev/null || echo "0")"
echo "================================"

echo "✅ 数据完整性验证完成"