#!/usr/bin/env bash
set -euo pipefail

# 数据迁移脚本 - 确保版本升级时数据安全
# 用法: scripts/migrate-data.sh [target_version]

TARGET_VERSION=${1:-"latest"}
DB_PATH="data/digital-brain.db"
MIGRATIONS_DIR="db/migrations"
BACKUP_DIR="data/backups/migration"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")

echo "🔄 开始数据迁移到版本: $TARGET_VERSION"

# 1. 创建迁移备份目录
mkdir -p "$BACKUP_DIR"

# 2. 迁移前完整备份
echo "📦 创建迁移前备份..."
if [[ -f "$DB_PATH" ]]; then
  cp "$DB_PATH" "$BACKUP_DIR/pre_migration_${TIMESTAMP}.db"
  sqlite3 "$DB_PATH" ".dump" > "$BACKUP_DIR/pre_migration_${TIMESTAMP}.sql"
  echo "✅ 迁移前备份完成"
else
  echo "⚠️  数据库文件不存在，创建新数据库"
fi

# 3. 验证迁移前数据完整性
if [[ -f "$DB_PATH" ]]; then
  echo "🔍 验证迁移前数据完整性..."
  if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
    echo "✅ 迁移前数据完整性验证通过"
  else
    echo "❌ 迁移前数据完整性验证失败，停止迁移"
    exit 1
  fi
fi

# 4. 记录迁移前数据统计
if [[ -f "$DB_PATH" ]]; then
  echo "📊 记录迁移前数据统计..."
  cat > "$BACKUP_DIR/pre_migration_stats_${TIMESTAMP}.txt" <<EOF
migration_timestamp=$TIMESTAMP
target_version=$TARGET_VERSION
db_size=$(stat -f%z "$DB_PATH" 2>/dev/null || echo "0")
todos_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos;" 2>/dev/null || echo "0")
okr_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_goals;" 2>/dev/null || echo "0")
entries_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM entries;" 2>/dev/null || echo "0")
todos_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos_events;" 2>/dev/null || echo "0")
okr_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_events;" 2>/dev/null || echo "0")
EOF
fi

# 5. 执行数据库迁移
echo "🔧 执行数据库结构迁移..."

# 确保数据库目录存在
mkdir -p "$(dirname "$DB_PATH")"

# 如果有迁移脚本目录，执行迁移
if [[ -d "$MIGRATIONS_DIR" ]]; then
  echo "📋 应用数据库迁移脚本..."
  
  # 确保schema_migrations表存在
  sqlite3 "$DB_PATH" "CREATE TABLE IF NOT EXISTS schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')));"
  
  # 获取已应用的迁移
  applied_versions=$(sqlite3 "$DB_PATH" "SELECT version FROM schema_migrations ORDER BY version;" 2>/dev/null || echo "")
  
  # 应用新的迁移
  migration_applied=false
  for file in $(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
    version=$(basename "$file" .sql)
    if echo "$applied_versions" | grep -q "^${version}$"; then
      echo "⏭️  跳过已应用的迁移: $version"
      continue
    fi
    
    echo "🔄 应用迁移: $version"
    if sqlite3 "$DB_PATH" < "$file"; then
      echo "✅ 迁移 $version 应用成功"
      migration_applied=true
    else
      echo "❌ 迁移 $version 应用失败"
      
      # 恢复备份
      if [[ -f "$BACKUP_DIR/pre_migration_${TIMESTAMP}.db" ]]; then
        echo "🔄 恢复迁移前备份..."
        cp "$BACKUP_DIR/pre_migration_${TIMESTAMP}.db" "$DB_PATH"
        echo "✅ 已恢复到迁移前状态"
      fi
      exit 1
    fi
  done
  
  if [[ "$migration_applied" == "false" ]]; then
    echo "ℹ️  没有新的迁移需要应用"
  fi
else
  echo "ℹ️  没有找到迁移脚本目录，跳过结构迁移"
fi

# 6. 初始化数据库（确保所有表和触发器存在）
echo "🔧 初始化数据库结构..."
if command -v node >/dev/null 2>&1; then
  if node -e "require('./src/lib/db.ts').initDatabase()" 2>/dev/null; then
    echo "✅ 数据库结构初始化完成"
  else
    echo "⚠️  数据库结构初始化失败，但继续迁移"
  fi
else
  echo "⚠️  Node.js不可用，跳过数据库初始化"
fi

# 7. 验证迁移后数据完整性
echo "🔍 验证迁移后数据完整性..."
if sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"; then
  echo "✅ 迁移后数据完整性验证通过"
else
  echo "❌ 迁移后数据完整性验证失败"
  
  # 恢复备份
  if [[ -f "$BACKUP_DIR/pre_migration_${TIMESTAMP}.db" ]]; then
    echo "🔄 恢复迁移前备份..."
    cp "$BACKUP_DIR/pre_migration_${TIMESTAMP}.db" "$DB_PATH"
    echo "✅ 已恢复到迁移前状态"
  fi
  exit 1
fi

# 8. 记录迁移后数据统计
echo "📊 记录迁移后数据统计..."
cat > "$BACKUP_DIR/post_migration_stats_${TIMESTAMP}.txt" <<EOF
migration_timestamp=$TIMESTAMP
target_version=$TARGET_VERSION
db_size=$(stat -f%z "$DB_PATH" 2>/dev/null || echo "0")
todos_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos;" 2>/dev/null || echo "0")
okr_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_goals;" 2>/dev/null || echo "0")
entries_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM entries;" 2>/dev/null || echo "0")
todos_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM todos_events;" 2>/dev/null || echo "0")
okr_events_count=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM okr_events;" 2>/dev/null || echo "0")
EOF

# 9. 创建迁移后备份
echo "📦 创建迁移后备份..."
cp "$DB_PATH" "$BACKUP_DIR/post_migration_${TIMESTAMP}.db"
sqlite3 "$DB_PATH" ".dump" > "$BACKUP_DIR/post_migration_${TIMESTAMP}.sql"
echo "✅ 迁移后备份完成"

# 10. 生成迁移报告
echo "📋 生成迁移报告..."
cat > "$BACKUP_DIR/migration_report_${TIMESTAMP}.txt" <<EOF
数据迁移报告
================================
迁移时间: $(date)
目标版本: $TARGET_VERSION
迁移时间戳: $TIMESTAMP

迁移前数据:
EOF

if [[ -f "$BACKUP_DIR/pre_migration_stats_${TIMESTAMP}.txt" ]]; then
  cat "$BACKUP_DIR/pre_migration_stats_${TIMESTAMP}.txt" >> "$BACKUP_DIR/migration_report_${TIMESTAMP}.txt"
fi

cat >> "$BACKUP_DIR/migration_report_${TIMESTAMP}.txt" <<EOF

迁移后数据:
EOF

cat "$BACKUP_DIR/post_migration_stats_${TIMESTAMP}.txt" >> "$BACKUP_DIR/migration_report_${TIMESTAMP}.txt"

cat >> "$BACKUP_DIR/migration_report_${TIMESTAMP}.txt" <<EOF

迁移状态: 成功
备份位置: $BACKUP_DIR
================================
EOF

echo "✅ 迁移报告生成完成"

# 11. 运行完整性验证
if [[ -f "./scripts/verify-data-integrity.sh" ]]; then
  echo "🔍 运行完整的数据完整性验证..."
  if ./scripts/verify-data-integrity.sh; then
    echo "✅ 完整数据验证通过"
  else
    echo "⚠️  完整数据验证发现问题，但迁移已完成"
  fi
fi

echo ""
echo "🎉 数据迁移完成！"
echo "📊 迁移统计:"
echo "================================"
if [[ -f "$BACKUP_DIR/pre_migration_stats_${TIMESTAMP}.txt" && -f "$BACKUP_DIR/post_migration_stats_${TIMESTAMP}.txt" ]]; then
  echo "迁移前:"
  grep "_count=" "$BACKUP_DIR/pre_migration_stats_${TIMESTAMP}.txt" | sed 's/^/  /'
  echo "迁移后:"
  grep "_count=" "$BACKUP_DIR/post_migration_stats_${TIMESTAMP}.txt" | sed 's/^/  /'
fi
echo "================================"
echo "📁 备份位置: $BACKUP_DIR"
echo "📋 迁移报告: $BACKUP_DIR/migration_report_${TIMESTAMP}.txt"
echo "💡 建议: 请重启应用以确保所有更改生效"