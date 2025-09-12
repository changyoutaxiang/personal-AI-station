#!/bin/bash

# Digital Brain 自动清理脚本
# 功能：定期清理冗余文件，保持项目整洁
# 使用：./scripts/auto-cleanup.sh [dry-run|execute]

# 配置变量
BACKUP_DIR="./data/cleanup-backups"
LOG_FILE="./logs/cleanup.log"
RETENTION_DAYS=7
DRY_RUN=${1:-"dry-run"}  # 默认dry-run模式

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 创建必要目录
mkdir -p "$BACKUP_DIR" "./logs"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 检查模式
if [[ "$DRY_RUN" == "execute" ]]; then
    log "🚀 执行清理模式"
    MODE="删除"
else
    log "🔍 预检模式 (dry-run)"
    MODE="[预检] 将删除"
fi

# 清理函数
cleanup_old_backups() {
    log "📦 清理旧数据库备份..."
    find ./data -name "*.db" -type f -not -name "digital-brain.db" -mtime +$RETENTION_DAYS | while read file; do
        log "$MODE 数据库备份: $file"
        [[ "$DRY_RUN" == "execute" ]] && rm -f "$file"
    done
}

cleanup_temp_files() {
    log "🗂️ 清理临时文件..."
    
    # 清理旧日志
    find . -name "*.log" -mtime +$RETENTION_DAYS | while read file; do
        log "$MODE 旧日志: $file"
        [[ "$DRY_RUN" == "execute" ]] && rm -f "$file"
    done
    
    # 清理临时压缩包
    find . -name "*.tar.gz" -not -path "./data/backups/*" -mtime +$RETENTION_DAYS | while read file; do
        log "$MODE 临时压缩包: $file"
        [[ "$DRY_RUN" == "execute" ]] && rm -f "$file"
    done
    
    # 清理测试文件
    find . -name "test-*.js" -not -path "./src/*" -mtime +$RETENTION_DAYS | while read file; do
        log "$MODE 测试文件: $file"
        [[ "$DRY_RUN" == "execute" ]] && rm -f "$file"
    done
}

cleanup_node_modules() {
    log "📦 清理Node.js缓存..."
    if [[ -d ".next" ]]; then
        log "$MODE Next.js缓存目录"
        [[ "$DRY_RUN" == "execute" ]] && rm -rf .next
    fi
    
    if [[ -f "package-lock.json" ]]; then
        log "📊 检查未使用依赖..."
        # 使用depcheck检查未使用依赖
        if command -v depcheck &> /dev/null; then
            depcheck --json > /tmp/depcheck.json 2>/dev/null || true
            UNUSED_DEPS=$(cat /tmp/depcheck.json | grep -o '"dependencies":\[[^]]*\]' | sed 's/"dependencies":\[//g' | sed 's/\]//g' | tr -d '"')
            if [[ -n "$UNUSED_DEPS" ]]; then
                log "⚠️ 发现未使用依赖: $UNUSED_DEPS"
            fi
        fi
    fi
}

# 文件大小监控
monitor_disk_usage() {
    local usage_before=$(du -sh . 2>/dev/null | cut -f1)
    log "💾 当前磁盘使用: $usage_before"
}

# 创建清理报告
generate_report() {
    local report_file="$BACKUP_DIR/cleanup-report-$(date +%Y%m%d_%H%M%S).txt"
    {
        echo "=== Digital Brain 清理报告 ==="
        echo "时间: $(date)"
        echo "模式: $DRY_RUN"
        echo ""
        echo "清理内容:"
        echo "- 旧数据库备份 (>$RETENTION_DAYS天)"
        echo "- 临时日志文件 (>$RETENTION_DAYS天)"
        echo "- 临时压缩包 (>$RETENTION_DAYS天)"
        echo "- 测试文件 (>$RETENTION_DAYS天)"
        echo ""
        echo "当前磁盘使用: $(du -sh . 2>/dev/null | cut -f1)"
    } > "$report_file"
    log "📊 清理报告已生成: $report_file"
}

# 主执行流程
main() {
    log "🧹 开始Digital Brain自动清理"
    
    monitor_disk_usage
    cleanup_old_backups
    cleanup_temp_files
    cleanup_node_modules
    generate_report
    
    if [[ "$DRY_RUN" == "execute" ]]; then
        log "✅ 清理完成！"
    else
        log "✅ 预检完成！使用 './scripts/auto-cleanup.sh execute' 执行清理"
    fi
}

# 执行主流程
main