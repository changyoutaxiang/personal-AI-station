#!/usr/bin/env bash
set -euo pipefail

# 自动备份脚本 - 确保数据绝对安全
# 用法: scripts/auto-backup.sh

DB_PATH="data/digital-brain.db"
BACKUP_DIR="data/backups"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
DATE_DIR="$BACKUP_DIR/$(date -u +"%Y-%m-%d")"

# 创建备份目录
mkdir -p "$DATE_DIR"

# 检查数据库文件是否存在
if [[ ! -f "$DB_PATH" ]]; then
  echo "❌ 数据库文件不存在: $DB_PATH"
  exit 1
fi

echo "🔄 开始自动备份数据库..."

# 1. 完整数据库备份
cp "$DB_PATH" "$DATE_DIR/digital-brain_${TIMESTAMP}.db"
echo "✅ 数据库文件备份完成"

# 2. SQL转储备份
sqlite3 "$DB_PATH" ".dump" > "$DATE_DIR/digital-brain_${TIMESTAMP}.sql"
echo "✅ SQL转储备份完成"

# 3. 关键数据JSON导出
sqlite3 -json "$DB_PATH" "SELECT * FROM todos WHERE deleted_at IS NULL;" > "$DATE_DIR/todos_active_${TIMESTAMP}.json" 2>/dev/null || echo "⚠️  todos表导出失败"
sqlite3 -json "$DB_PATH" "SELECT * FROM okr_goals;" > "$DATE_DIR/okr_goals_${TIMESTAMP}.json" 2>/dev/null || echo "⚠️  okr_goals表导出失败"
sqlite3 -json "$DB_PATH" "SELECT * FROM entries;" > "$DATE_DIR/entries_${TIMESTAMP}.json" 2>/dev/null || echo "⚠️  entries表导出失败"

# 4. 事件日志备份（用于数据恢复）
sqlite3 -json "$DB_PATH" "SELECT * FROM todos_events ORDER BY occurred_at DESC LIMIT 1000;" > "$DATE_DIR/todos_events_recent_${TIMESTAMP}.json" 2>/dev/null || echo "⚠️  todos_events表导出失败"
sqlite3 -json "$DB_PATH" "SELECT * FROM okr_events ORDER BY occurred_at DESC LIMIT 1000;" > "$DATE_DIR/okr_events_recent_${TIMESTAMP}.json" 2>/dev/null || echo "⚠️  okr_events表导出失败"

# 5. 生成备份元数据
cat > "$DATE_DIR/backup_meta_${TIMESTAMP}.txt" <<EOF
backup_timestamp=$TIMESTAMP
backup_date=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
db_path=$DB_PATH
db_size=$(stat -f%z "$DB_PATH" 2>/dev/null || echo "unknown")
db_checksum=$(shasum -a 256 "$DB_PATH" | awk '{print $1}')
todos_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos WHERE deleted_at IS NULL;" 2>/dev/null || echo "0")
okr_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_goals;" 2>/dev/null || echo "0")
entries_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM entries;" 2>/dev/null || echo "0")
todos_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos_events;" 2>/dev/null || echo "0")
okr_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_events;" 2>/dev/null || echo "0")
EOF

echo "✅ 备份元数据生成完成"

# 6. 清理旧备份（保留最近30天）
find "$BACKUP_DIR" -name "20*" -type d -mtime +30 -exec rm -rf {} + 2>/dev/null || true
echo "✅ 旧备份清理完成"

# 7. 验证备份完整性
if sqlite3 "$DATE_DIR/digital-brain_${TIMESTAMP}.db" "SELECT COUNT(*) FROM sqlite_master;" >/dev/null 2>&1; then
  echo "✅ 备份文件完整性验证通过"
else
  echo "❌ 备份文件完整性验证失败"
  exit 1
fi

echo "🎉 自动备份完成！备份位置: $DATE_DIR"
echo "📊 备份统计:"
cat "$DATE_DIR/backup_meta_${TIMESTAMP}.txt" | grep "_count="