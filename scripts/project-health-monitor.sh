#!/bin/bash

# Digital Brain 项目健康监控器
# 实时监控项目状态，预防冗余积累

# 配置
ALERT_THRESHOLD_DOCS=20
ALERT_THRESHOLD_TEMP=5
ALERT_THRESHOLD_DISK=100M
MONITOR_LOG="./logs/health-monitor.log"

# 创建日志目录
mkdir -p "./logs"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$MONITOR_LOG"
}

# 文档健康检查
check_document_health() {
    log "📄 文档健康检查..."
    
    # 统计各类文档
    local total_docs=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
    local core_docs=$(ls *.md 2>/dev/null | wc -l)
    local temp_docs=$(find . -name "test-*.js" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
    
    echo "📊 文档统计:"
    echo "  总文档: $total_docs (阈值: $ALERT_THRESHOLD_DOCS)"
    echo "  核心文档: $core_docs"
    echo "  临时文件: $temp_docs (阈值: $ALERT_THRESHOLD_TEMP)"
    
    # 预警检查
    if [[ $total_docs -gt $ALERT_THRESHOLD_DOCS ]]; then
        echo -e "${RED}⚠️ 警告: 文档数量超标 ($total_docs > $ALERT_THRESHOLD_DOCS)${NC}"
        return 1
    fi
    
    if [[ $temp_docs -gt $ALERT_THRESHOLD_TEMP ]]; then
        echo -e "${RED}⚠️ 警告: 临时文件过多 ($temp_docs > $ALERT_THRESHOLD_TEMP)${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ 文档健康良好${NC}"
    return 0
}

# 磁盘使用监控
check_disk_usage() {
    log "💾 磁盘使用监控..."
    
    local total_size=$(du -sh . 2>/dev/null | cut -f1)
    local db_size=$(du -sh data/digital-brain.db 2>/dev/null | cut -f1 || echo "0")
    local node_size=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "0")
    
    echo "📊 磁盘使用:"
    echo "  项目总大小: $total_size"
    echo "  数据库: $db_size"
    echo "  依赖包: $node_size"
    
    # 转换大小为数字进行比较
    local total_bytes=$(du -sb . 2>/dev/null | cut -f1)
    local threshold_bytes=104857600  # 100MB
    
    if [[ $total_bytes -gt $threshold_bytes ]]; then
        echo -e "${YELLOW}⚠️ 注意: 项目较大 ($total_size)${NC}"
    fi
    
    echo -e "${GREEN}✅ 磁盘使用正常${NC}"
}

# 文件类型分析
analyze_file_types() {
    log "🔍 文件类型分析..."
    
    echo "📈 文件分布:"
    echo "  Markdown: $(find . -name "*.md" -not -path "./node_modules/*" | wc -l)"
    echo "  JavaScript: $(find . -name "*.js" -not -path "./node_modules/*" | wc -l)"
    echo "  TypeScript: $(find . -name "*.ts" -not -path "./node_modules/*" | wc -l)"
    echo "  CSS: $(find . -name "*.css" -not -path "./node_modules/*" | wc -l)"
    echo "  备份文件: $(find . -name "*.tar.gz" | wc -l)"
    echo "  日志文件: $(find . -name "*.log" | wc -l)"
}

# 冗余检测
detect_redundancy() {
    log "🔍 冗余检测..."
    
    # 检测重复图片
    local duplicate_images=$(find . -name "*.jpg" -o -name "*.png" | sort | uniq -d | wc -l)
    echo "  重复图片: $duplicate_images"
    
    # 检测旧备份
    local old_backups=$(find data/backups -name "*.db" -mtime +7 2>/dev/null | wc -l)
    echo "  旧数据库备份: $old_backups"
    
    # 检测临时测试文件
    local test_files=$(find . -name "test-*.js" -not -path "./src/*" -not -path "./node_modules/*" | wc -l)
    echo "  临时测试文件: $test_files"
}

# 生成健康报告
generate_health_report() {
    local report_file="./logs/health-report-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" <<EOF
{
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "project_size": "$(du -sh . 2>/dev/null | cut -f1)",
    "document_count": $(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l),
    "temp_file_count": $(find . -name "test-*.js" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l),
    "backup_count": $(find . -name "*.tar.gz" | wc -l),
    "database_size": "$(du -sh data/digital-brain.db 2>/dev/null | cut -f1 || echo '0')",
    "health_score": "$(calculate_health_score)"
}
EOF
    
    echo "📊 健康报告已生成: $report_file"
}

# 计算健康评分
calculate_health_score() {
    local score=100
    
    # 文档扣分
    local doc_count=$(find . -name "*.md" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
    if [[ $doc_count -gt $ALERT_THRESHOLD_DOCS ]]; then
        score=$((score - 20))
    fi
    
    # 临时文件扣分
    local temp_count=$(find . -name "test-*.js" -not -path "./node_modules/*" -not -path "./.next/*" | wc -l)
    if [[ $temp_count -gt $ALERT_THRESHOLD_TEMP ]]; then
        score=$((score - 15))
    fi
    
    # 确保分数在0-100之间
    score=$((score < 0 ? 0 : score > 100 ? 100 : score))
    echo "$score"
}

# 实时监控
continuous_monitor() {
    log "🔍 开始实时监控..."
    
    while true; do
        echo "
=== $(date) ==="
        check_document_health
        check_disk_usage
        analyze_file_types
        detect_redundancy
        
        # 每10秒检查一次
        sleep 10
    done
}

# 每日检查
daily_check() {
    log "📅 每日健康检查..."
    
    local issues=0
    
    check_document_health || ((issues++))
    check_disk_usage || ((issues++))
    analyze_file_types
    detect_redundancy
    generate_health_report
    
    if [[ $issues -eq 0 ]]; then
        echo -e "${GREEN}✅ 项目健康状况良好${NC}"
    else
        echo -e "${RED}⚠️ 发现 $issues 项需要关注${NC}"
        echo "建议运行: ./scripts/auto-cleanup.sh"
    fi
}

# 使用说明
usage() {
    echo "Usage: $0 {check|monitor|daily|report}"
    echo ""
    echo "Commands:"
    echo "  check   - 单次健康检查"
    echo "  monitor - 持续监控模式"
    echo "  daily   - 每日检查模式"
    echo "  report  - 生成健康报告"
}

# 主程序
case "$1" in
    check)
        check_document_health
        check_disk_usage
        analyze_file_types
        detect_redundancy
        ;;
    monitor)
        continuous_monitor
        ;;
    daily)
        daily_check
        ;;
    report)
        generate_health_report
        ;;
    *)
        usage
        ;;
esac