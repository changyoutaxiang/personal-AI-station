#!/usr/bin/env bash
set -euo pipefail

# 紧急数据恢复脚本
# 用法: scripts/emergency-restore.sh [backup_file] [target_db_path]

BACKUP_FILE=${1:-}
TARGET_DB=${2:-data/digital-brain.db}
BACKUP_DIR="data/backups"

if [[ -z "$BACKUP_FILE" ]]; then
  echo "🔍 查找最新的备份文件..."
  
  # 查找最新的.db备份文件
  LATEST_DB=$(find "$BACKUP_DIR" -name "*.db" -type f -exec stat -f "%m %N" {} \; 2>/dev/null | sort -nr | head -1 | cut -d' ' -f2-)
  
  if [[ -n "$LATEST_DB" ]]; then
    BACKUP_FILE="$LATEST_DB"
    echo "📁 找到最新备份: $BACKUP_FILE"
  else
    echo "❌ 未找到任何备份文件"
    echo "请手动指定备份文件: scripts/emergency-restore.sh <backup_file>"
    exit 1
  fi
fi

if [[ ! -f "$BACKUP_FILE" ]]; then
  echo "❌ 备份文件不存在: $BACKUP_FILE"
  exit 1
fi

echo "🚨 紧急数据恢复开始"
echo "📁 备份文件: $BACKUP_FILE"
echo "🎯 目标数据库: $TARGET_DB"
echo ""

# 1. 备份当前数据库（如果存在）
if [[ -f "$TARGET_DB" ]]; then
  CURRENT_BACKUP="${TARGET_DB}.emergency_backup.$(date +%Y%m%d_%H%M%S)"
  echo "💾 备份当前数据库到: $CURRENT_BACKUP"
  cp "$TARGET_DB" "$CURRENT_BACKUP"
  echo "✅ 当前数据库已备份"
fi

# 2. 验证备份文件完整性
echo "🔍 验证备份文件完整性..."
if sqlite3 "$BACKUP_FILE" "SELECT COUNT(*) FROM sqlite_master;" >/dev/null 2>&1; then
  echo "✅ 备份文件完整性验证通过"
else
  echo "❌ 备份文件损坏，无法恢复"
  exit 1
fi

# 3. 创建目标目录
mkdir -p "$(dirname "$TARGET_DB")"

# 4. 恢复数据库
echo "🔄 开始恢复数据库..."
cp "$BACKUP_FILE" "$TARGET_DB"
echo "✅ 数据库文件恢复完成"

# 5. 验证恢复后的数据库
echo "🔍 验证恢复后的数据库..."
if sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM sqlite_master;" >/dev/null 2>&1; then
  echo "✅ 恢复后数据库验证通过"
else
  echo "❌ 恢复后数据库验证失败"
  
  # 如果有备份，尝试恢复
  if [[ -f "$CURRENT_BACKUP" ]]; then
    echo "🔄 尝试恢复原数据库..."
    cp "$CURRENT_BACKUP" "$TARGET_DB"
    echo "⚠️  已恢复到原始状态"
  fi
  exit 1
fi

# 6. 数据统计
echo ""
echo "📊 恢复后数据统计:"
echo "================================"
echo "Todos总数: $(sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM todos;" 2>/dev/null || echo "表不存在")"
echo "活跃Todos: $(sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM todos WHERE deleted_at IS NULL;" 2>/dev/null || echo "表不存在")"
echo "OKR目标: $(sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM okr_goals;" 2>/dev/null || echo "表不存在")"
echo "记录条目: $(sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM entries;" 2>/dev/null || echo "表不存在")"
echo "Todos事件: $(sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM todos_events;" 2>/dev/null || echo "表不存在")"
echo "OKR事件: $(sqlite3 "$TARGET_DB" "SELECT COUNT(*) FROM okr_events;" 2>/dev/null || echo "表不存在")"
echo "================================"

# 7. 检查关键表和触发器
echo "🔍 检查关键组件..."
required_tables=("todos" "todos_events" "okr_goals" "okr_events" "entries")
missing_tables=()

for table in "${required_tables[@]}"; do
  if sqlite3 "$TARGET_DB" "SELECT name FROM sqlite_master WHERE type='table' AND name='$table';" | grep -q "$table"; then
    echo "✅ 表 $table 存在"
  else
    echo "⚠️  表 $table 缺失"
    missing_tables+=("$table")
  fi
done

# 8. 检查触发器
triggers=("trg_todos_after_insert" "trg_todos_after_update" "trg_okr_after_insert" "trg_okr_after_update")
missing_triggers=()

for trigger in "${triggers[@]}"; do
  if sqlite3 "$TARGET_DB" "SELECT name FROM sqlite_master WHERE type='trigger' AND name='$trigger';" | grep -q "$trigger"; then
    echo "✅ 触发器 $trigger 存在"
  else
    echo "⚠️  触发器 $trigger 缺失"
    missing_triggers+=("$trigger")
  fi
done

# 9. 生成恢复报告
echo ""
echo "📋 恢复完成报告:"
echo "================================"
echo "恢复时间: $(date)"
echo "备份文件: $BACKUP_FILE"
echo "目标数据库: $TARGET_DB"
echo "备份文件大小: $(stat -f%z "$BACKUP_FILE" 2>/dev/null || echo "unknown") bytes"
echo "恢复后文件大小: $(stat -f%z "$TARGET_DB" 2>/dev/null || echo "unknown") bytes"

if [[ ${#missing_tables[@]} -eq 0 && ${#missing_triggers[@]} -eq 0 ]]; then
  echo "状态: ✅ 完全恢复成功"
else
  echo "状态: ⚠️  部分恢复（存在缺失组件）"
  if [[ ${#missing_tables[@]} -gt 0 ]]; then
    echo "缺失表: ${missing_tables[*]}"
  fi
  if [[ ${#missing_triggers[@]} -gt 0 ]]; then
    echo "缺失触发器: ${missing_triggers[*]}"
  fi
fi
echo "================================"

echo "🎉 紧急数据恢复完成！"
echo "💡 建议: 请重启应用以确保所有更改生效"

if [[ -f "$CURRENT_BACKUP" ]]; then
  echo "📁 原数据库备份位置: $CURRENT_BACKUP"
fi