#!/bin/bash

# Digital Brain 备份管理器
# 功能：智能备份系统，支持自动备份和恢复

# 配置
BACKUP_ROOT="./data/cleanup-backups"
MAX_BACKUPS=10
RETENTION_DAYS=30

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 创建备份目录
mkdir -p "$BACKUP_ROOT"

# 智能备份
smart_backup() {
    local backup_type=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="db-backup-$backup_type-$timestamp"
    
    log "🔄 创建$backup_type备份: $backup_name"
    
    case $backup_type in
        "full")
            # 完整项目备份
            tar -czf "$BACKUP_ROOT/$backup_name.tar.gz" \
                --exclude="node_modules" \
                --exclude=".next" \
                --exclude="*.tar.gz" \
                --exclude="data/backups" \
                .
            ;;
        "db")
            # 数据库备份
            tar -czf "$BACKUP_ROOT/$backup_name.tar.gz" \
                data/digital-brain.db \
                data/backups/ \
                2>/dev/null || true
            ;;
        "docs")
            # 文档备份
            tar -czf "$BACKUP_ROOT/$backup_name.tar.gz" \
                *.md \
                docs/ \
                knowledge-base/ \
                2>/dev/null || true
            ;;
    esac
    
    log "✅ 备份完成: $backup_name.tar.gz"
}

# 清理旧备份
cleanup_old_backups() {
    log "🧹 清理旧备份..."
    
    # 按时间清理
    find "$BACKUP_ROOT" -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
    
    # 按数量清理（保留最新的MAX_BACKUPS个）
    local backup_count=$(ls -1 "$BACKUP_ROOT"/*.tar.gz 2>/dev/null | wc -l)
    if [[ $backup_count -gt $MAX_BACKUPS ]]; then
        ls -t "$BACKUP_ROOT"/*.tar.gz | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f
        log "🗑️ 清理了 $(($backup_count - MAX_BACKUPS)) 个旧备份"
    fi
}

# 恢复备份
restore_backup() {
    local backup_file=$1
    if [[ -f "$BACKUP_ROOT/$backup_file" ]]; then
        log "🔄 开始恢复: $backup_file"
        tar -xzf "$BACKUP_ROOT/$backup_file"
        log "✅ 恢复完成: $backup_file"
    else
        log "❌ 备份文件不存在: $backup_file"
    fi
}

# 列出备份
list_backups() {
    log "📋 可用备份:"
    ls -lh "$BACKUP_ROOT"/*.tar.gz 2>/dev/null | awk '{print $9 " - " $5 " - " $6 " " $7 " " $8}' || echo "无备份文件"
}

# 磁盘使用报告
disk_usage_report() {
    log "💾 磁盘使用报告:"
    echo "项目总大小: $(du -sh . 2>/dev/null | cut -f1)"
    echo "数据库大小: $(du -sh data/digital-brain.db 2>/dev/null | cut -f1 || echo 'N/A')"
    echo "备份总大小: $(du -sh $BACKUP_ROOT 2>/dev/null | cut -f1 || echo '0')"
}

# 健康检查
health_check() {
    log "🏥 项目健康检查:"
    
    # 检查文档数量
    local doc_count=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
    echo "文档数量: $doc_count (目标: ≤15)"
    
    # 检查临时文件
    local temp_count=$(find . -name "test-*.js" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
    echo "临时文件: $temp_count (目标: ≤5)"
    
    # 检查磁盘使用
    disk_usage_report
}

# 使用说明
usage() {
    echo "Usage: $0 {full|db|docs|list|restore|cleanup|health}"
    echo ""
    echo "Commands:"
    echo "  full      - 完整项目备份"
    echo "  db        - 数据库备份"
    echo "  docs      - 文档备份"
    echo "  list      - 列出备份"
    echo "  restore   - 恢复备份"
    echo "  cleanup   - 清理旧备份"
    echo "  health    - 健康检查"
}

# 主程序
case "$1" in
    full|db|docs)
        smart_backup "$1"
        cleanup_old_backups
        ;;
    list)
        list_backups
        ;;
    restore)
        if [[ -n "$2" ]]; then
            restore_backup "$2"
        else
            echo "请指定备份文件名"
            list_backups
        fi
        ;;
    cleanup)
        cleanup_old_backups
        ;;
    health)
        health_check
        ;;
    *)
        usage
        ;;
esac