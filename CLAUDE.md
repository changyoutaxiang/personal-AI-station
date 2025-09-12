# CLAUDE.md

Claude Code 开发指导文档 - Digital Brain v3.1

## 🎯 沟通原则
- **全程中文沟通**
- **教育导向**：边做边学，提供实现思路

## 🚀 核心命令
```bash
# 开发启动
npm run dev                    # 启动开发服务器
npx next dev --port 4000       # 解决端口冲突

# 质量检查  
npm run lint                   # ESLint检查
npm run typecheck              # TypeScript检查
npm run build                  # 生产构建

# 数据管理
sqlite3 data/digital-brain.db "SELECT COUNT(*) FROM entries;"
ls -la data/backups/           # 查看备份
```

## 📁 快速导航
```
src/
├── app/           # Next.js页面路由
├── components/    # React组件（主题化）
├── lib/          # 核心业务逻辑
├── hooks/        # 自定义React Hooks
└── data/         # SQLite数据库
```

## 🏗️ 技术栈
- **框架**: Next.js 15 + TypeScript严格模式
- **样式**: Tailwind CSS v4 + 4套主题系统
- **数据**: SQLite + 自动备份
- **AI**: OpenRouter API + Claude模型

## 🎨 当前状态
✅ **v3.1 生产就绪** - 所有功能100%完成
✅ **主题系统** - 4套主题(含多巴胺主题)
✅ **任务管理** - 拖拽重排 + 批量操作

## 📋 开发提示
- **乐观更新**: UI立即响应，后台同步
- **防抖机制**: 控制API调用频率
- **组件化**: 单一职责，可复用设计

---
*精简版指导文档 - 聚焦核心开发需求*