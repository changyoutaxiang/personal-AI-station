# 📅 Digital Brain 清理周期表

## 🎯 自动化清理计划

### 📊 清理频率矩阵

| 清理类型 | 频率 | 触发条件 | 保留时间 | 工具 |
|----------|------|----------|----------|------|
| **临时测试文件** | 每日 | 创建后3天 | 0天 | auto-cleanup.sh |
| **日志文件** | 每日 | 创建后7天 | 0天 | auto-cleanup.sh |
| **旧数据库备份** | 每周 | 创建后7天 | 0天 | auto-cleanup.sh |
| **压缩包** | 每周 | 创建后7天 | 0天 | auto-cleanup.sh |
| **文档归档** | 每月 | 版本发布后30天 | 永久归档 | backup-manager.sh |
| **未使用依赖** | 每月 | 月度检查 | 手动确认 | health-monitor.sh |
| **完整项目备份** | 每周 | 自动创建 | 30天 | backup-manager.sh |

## 🔧 实施指南

### 🕐 每日清理 (00:30 执行)
```bash
# 添加到 crontab
30 0 * * * cd /path/to/digital-brain && ./scripts/auto-cleanup.sh execute

# 或手动执行
./scripts/auto-cleanup.sh execute
```

### 📅 每周清理 (周日 02:00 执行)
```bash
# 完整清理 + 备份
0 2 * * 0 cd /path/to/digital-brain && ./scripts/backup-manager.sh full
0 2 * * 0 cd /path/to/digital-brain && ./scripts/auto-cleanup.sh execute
```

### 📊 每月清理 (1号 03:00 执行)
```bash
# 月度健康检查 + 归档
0 3 1 * * cd /path/to/digital-brain && ./scripts/project-health-monitor.sh daily
```

## 🚨 预警阈值

### 📈 监控指标
- **文档总数** > 15个 → 黄色预警
- **文档总数** > 20个 → 红色预警
- **临时文件** > 5个 → 立即清理
- **磁盘使用** > 100MB → 检查原因
- **备份数量** > 10个 → 清理旧备份

### 🔍 自动检测
```bash
# 实时监控 (开发时使用)
./scripts/project-health-monitor.sh check

# 持续监控 (调试时使用)
./scripts/project-health-monitor.sh monitor

# 每日检查 (生产使用)
./scripts/project-health-monitor.sh daily
```

## 📋 清理检查清单

### ✅ 每日自动检查
- [ ] 临时测试文件清理
- [ ] 旧日志文件清理
- [ ] 磁盘使用监控
- [ ] 健康状态报告

### ✅ 每周手动检查
- [ ] 文档总数统计
- [ ] 冗余文件检测
- [ ] 备份完整性验证
- [ ] 清理效果评估

### ✅ 每月深度检查
- [ ] 未使用依赖检测
- [ ] 文档归档整理
- [ ] 项目结构优化
- [ ] 清理策略调整

## 🛠️ 工具使用指南

### 快速清理检查
```bash
# 检查当前状态
./scripts/project-health-monitor.sh check

# 执行每日清理
./scripts/auto-cleanup.sh execute

# 创建完整备份
./scripts/backup-manager.sh full
```

### 手动维护命令
```bash
# 文档统计
find . -name "*.md" -not -path "./node_modules/*" | wc -l

# 临时文件统计
find . -name "test-*.js" -not -path "./node_modules/*" | wc -l

# 备份文件统计
find . -name "*.tar.gz" | wc -l
```

## 📊 清理效果追踪

### 历史记录
- **清理前**: 43个文档，180MB项目大小
- **清理后**: 7个核心文档，~700MB项目大小
- **改善**: 84%文档精简，核心信息100%保留

### 预期维护效果
- **文档冗余率**: < 20%
- **临时文件**: < 5个
- **查找效率**: < 30秒
- **维护时间**: < 5分钟/周

## 🎯 成功标准

### 量化目标
- **每日自动清理成功率**: 100%
- **健康检查通过率**: > 95%
- **备份可用性**: 100%
- **信息完整性**: 100%

### 质量标准
- **零信息丢失**
- **零功能影响**
- **零维护负担**
- **100%可回滚**

## 🔗 集成建议

### 开发工作流
1. **开发前**: 运行健康检查
2. **提交前**: 清理临时文件
3. **发布前**: 创建完整备份
4. **发布后**: 归档临时文档

### 团队协作
1. **共享清理规范**
2. **统一工具使用**
3. **定期健康评估**
4. **持续优化策略**

---

## 🚀 一键启动

### 完整清理流程
```bash
# 1. 健康检查
./scripts/project-health-monitor.sh check

# 2. 创建备份
./scripts/backup-manager.sh full

# 3. 执行清理
./scripts/auto-cleanup.sh execute

# 4. 验证结果
./scripts/project-health-monitor.sh daily
```

**记住：预防胜于治疗，定期清理胜于一次性大扫除！**