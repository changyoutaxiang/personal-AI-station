#!/usr/bin/env bash
set -euo pipefail

# 自动备份设置脚本
# 用法: scripts/setup-auto-backup.sh [频率]
# 频率选项: hourly, daily, weekly

FREQUENCY=${1:-"daily"}
PROJECT_DIR=$(pwd)
CRONTAB_BACKUP="/tmp/crontab_backup_$(date +%Y%m%d_%H%M%S)"

echo "🔧 设置自动备份系统"
echo "📁 项目目录: $PROJECT_DIR"
echo "⏰ 备份频率: $FREQUENCY"
echo ""

# 1. 验证脚本存在
if [[ ! -f "scripts/auto-backup.sh" ]]; then
  echo "❌ 备份脚本不存在: scripts/auto-backup.sh"
  exit 1
fi

if [[ ! -x "scripts/auto-backup.sh" ]]; then
  echo "🔧 添加执行权限到备份脚本..."
  chmod +x scripts/auto-backup.sh
fi

# 2. 备份现有crontab
echo "💾 备份现有crontab..."
if crontab -l > "$CRONTAB_BACKUP" 2>/dev/null; then
  echo "✅ 现有crontab已备份到: $CRONTAB_BACKUP"
else
  echo "ℹ️  没有现有的crontab"
  touch "$CRONTAB_BACKUP"
fi

# 3. 生成cron表达式
case "$FREQUENCY" in
  "hourly")
    CRON_EXPRESSION="0 * * * *"
    DESCRIPTION="每小时"
    ;;
  "daily")
    CRON_EXPRESSION="0 2 * * *"
    DESCRIPTION="每天凌晨2点"
    ;;
  "weekly")
    CRON_EXPRESSION="0 2 * * 0"
    DESCRIPTION="每周日凌晨2点"
    ;;
  "6hours")
    CRON_EXPRESSION="0 */6 * * *"
    DESCRIPTION="每6小时"
    ;;
  *)
    echo "❌ 不支持的频率: $FREQUENCY"
    echo "支持的频率: hourly, daily, weekly, 6hours"
    exit 1
    ;;
esac

# 4. 创建新的crontab条目
BACKUP_COMMAND="cd $PROJECT_DIR && ./scripts/auto-backup.sh >> data/backup.log 2>&1"
VERIFY_COMMAND="cd $PROJECT_DIR && ./scripts/verify-data-integrity.sh >> data/verify.log 2>&1"

echo "📝 生成crontab条目..."
cat > "/tmp/new_crontab" <<EOF
# 现有的crontab条目
EOF

# 添加现有的crontab（如果有）
if [[ -s "$CRONTAB_BACKUP" ]]; then
  # 过滤掉已存在的digital-brain备份任务
  grep -v "digital-brain.*auto-backup" "$CRONTAB_BACKUP" >> "/tmp/new_crontab" || true
fi

# 添加新的备份任务
cat >> "/tmp/new_crontab" <<EOF

# Digital Brain 自动备份 ($DESCRIPTION)
$CRON_EXPRESSION $BACKUP_COMMAND

# Digital Brain 数据完整性验证 (每天凌晨3点)
0 3 * * * $VERIFY_COMMAND
EOF

echo "📋 新的crontab内容:"
echo "================================"
cat "/tmp/new_crontab"
echo "================================"
echo ""

# 5. 询问用户确认
read -p "是否要安装这个crontab? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ 用户取消安装"
  echo "💡 如果要手动安装，请运行: crontab /tmp/new_crontab"
  exit 0
fi

# 6. 安装新的crontab
echo "⚙️ 安装新的crontab..."
if crontab "/tmp/new_crontab"; then
  echo "✅ Crontab安装成功！"
else
  echo "❌ Crontab安装失败"
  echo "🔄 恢复原始crontab..."
  crontab "$CRONTAB_BACKUP" 2>/dev/null || true
  exit 1
fi

# 7. 验证安装
echo "🔍 验证crontab安装..."
if crontab -l | grep -q "digital-brain.*auto-backup"; then
  echo "✅ 自动备份任务已成功添加"
else
  echo "⚠️  自动备份任务可能没有正确添加"
fi

# 8. 创建日志目录
mkdir -p data
touch data/backup.log data/verify.log
echo "📁 日志文件已创建: data/backup.log, data/verify.log"

# 9. 测试备份脚本
echo "🧪 测试备份脚本..."
if ./scripts/auto-backup.sh; then
  echo "✅ 备份脚本测试成功"
else
  echo "❌ 备份脚本测试失败"
  echo "⚠️  请检查脚本权限和依赖"
fi

# 10. 显示管理命令
echo ""
echo "🎉 自动备份设置完成！"
echo "================================"
echo "备份频率: $DESCRIPTION"
echo "备份命令: $BACKUP_COMMAND"
echo "日志文件: data/backup.log"
echo ""
echo "📋 管理命令:"
echo "  查看crontab: crontab -l"
echo "  编辑crontab: crontab -e"
echo "  删除crontab: crontab -r"
echo "  查看备份日志: tail -f data/backup.log"
echo "  查看验证日志: tail -f data/verify.log"
echo "  手动备份: npm run backup"
echo "  验证数据: npm run backup:verify"
echo ""
echo "📁 备份位置: data/backups/"
echo "🔄 恢复备份: npm run backup:restore"
echo "================================"

# 11. 清理临时文件
rm -f "/tmp/new_crontab"
echo "🧹 临时文件已清理"
echo "💾 原始crontab备份: $CRONTAB_BACKUP"