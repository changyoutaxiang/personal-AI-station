# 测试执行指南

## 快速开始

### 1. 环境准备
```bash
# 确保已安装依赖
npm install

# 配置环境变量（必需）
export OPENROUTER_API_KEY="your-api-key-here"

# 启动开发服务器（在另一个终端）
npm run dev
```

### 2. 执行端到端测试
```bash
# 运行完整的E2E测试
npm run test:e2e

# 或者直接运行测试脚本
node test-e2e.js
```

### 3. 查看测试结果
测试完成后会生成：
- 控制台输出：实时测试状态和结果摘要
- `test-results.json`：详细的测试报告文件

## 测试内容概览

### ✅ 功能验收测试
- **基础连接**: 页面访问、API连接性
- **环境配置**: API密钥、数据库、模型可用性
- **聊天功能**: 消息发送、AI回复、上下文管理
- **会话管理**: 创建、重命名、删除、导出会话
- **模型切换**: 不同AI模型的调用验证
- **标签管理**: 标签的增删查功能

### ⚠️ 异常场景测试
- 空消息和超长消息处理
- 无效模型名称处理
- API密钥缺失或无效的处理
- 网络异常和超时处理

### 🚀 性能测试
- API响应时间测量
- 基础性能指标验证

## 预期测试结果

### 成功指标
- ✅ 通过率 ≥ 90%：系统准备就绪
- ⚠️ 通过率 70-89%：大部分功能正常，需关注警告
- ❌ 通过率 < 70%：存在严重问题，需要修复

### 常见问题排查

#### 1. API密钥问题
```bash
# 检查环境变量
echo $OPENROUTER_API_KEY

# 如果为空，设置API密钥
export OPENROUTER_API_KEY="sk-or-v1-xxx"
```

#### 2. 服务器未启动
```bash
# 确保开发服务器运行在localhost:3000
curl http://localhost:3000/agent
```

#### 3. 数据库问题
```bash
# 检查数据库文件
ls -la data/digital-brain.db

# 如果不存在，启动应用会自动创建
npm run dev
```

#### 4. 依赖问题
```bash
# 重新安装依赖
rm -rf node_modules package-lock.json
npm install
```

## 测试报告解读

### 测试报告格式
```json
{
  "timestamp": "2025-01-XX",
  "summary": {
    "total": 35,
    "passed": 32,
    "failed": 1,
    "warnings": 2,
    "passRate": 91.4
  },
  "tests": [...],
  "environment": {
    "nodeVersion": "v18.x.x",
    "baseUrl": "http://localhost:3000",
    "hasApiKey": true
  }
}
```

### 关键指标
- `total`: 总测试数量
- `passed`: 通过的测试数量
- `failed`: 失败的测试数量
- `warnings`: 警告的测试数量（非致命问题）
- `passRate`: 通过率百分比

## 手动测试补充

除了自动化测试，还需要进行以下手动测试：

### 用户界面测试
1. 访问 http://localhost:3000/agent
2. 测试响应式设计和交互效果
3. 验证主题切换功能
4. 测试键盘快捷键

### 浏览器兼容性
- Chrome/Edge (最新版)
- Firefox (最新版)
- Safari (最新版)

### 移动设备测试
- iOS Safari
- Android Chrome
- 响应式布局验证

## CI/CD集成

### GitHub Actions示例
```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - run: npm run start &
      - run: sleep 10
      - run: npm run test:e2e:ci
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
```

## 问题反馈

如果测试发现问题，请记录：
1. 具体的错误信息
2. 复现步骤
3. 环境信息（Node版本、操作系统等）
4. test-results.json报告内容

---

💡 **提示**: 首次运行测试前，请确保已完成环境配置，特别是OPENROUTER_API_KEY的设置。
