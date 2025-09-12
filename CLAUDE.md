# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🌏 语言设置
- **全程中文沟通** - 根据用户的全局配置要求，所有交互都使用中文
- **教育导向** - 提供实现思路和知识洞察，边做边学

## 🏗️ 项目架构

这是一个"超级助理"AI 辅助工作流程平台，采用主应用 + 子模块的架构：

```
超级助理/
├── digital-brain/        # 主应用：个人认知带宽扩展系统 (Next.js 15)
├── .mcp.json            # MCP 服务器配置（Supabase 集成）
├── GIT-WORKFLOW.md      # 自然语言 Git 操作规范
└── 开发思路草稿.md      # 产品规划文档
```

### 核心应用：Digital Brain v3.1
- **技术栈**: Next.js 15 + TypeScript + Tailwind CSS v4 + SQLite
- **功能**: 知识管理 + 任务待办 + AI 智能功能 + 4套主题系统
- **状态**: ✅ 生产就绪，功能 100% 完成

## 🚀 开发命令

### 主应用开发 (digital-brain/)
```bash
# 推荐启动方式（解决端口冲突）
cd digital-brain
npx next dev --port 4000 --hostname 0.0.0.0

# 标准开发启动
npm run dev

# 质量检查
npm run lint                # ESLint 检查
npm run typecheck           # TypeScript 检查
npm run build              # 生产构建

# 数据管理
npm run backup             # 数据备份
npm run data:safe          # 安全数据检查
npm run migrate            # 数据库迁移

# 测试验证
npm run test:e2e           # 端到端测试
npm run validate           # 系统验证
```

### 数据库操作
```bash
# SQLite 数据库检查
sqlite3 digital-brain/data/digital-brain.db "SELECT COUNT(*) FROM entries;"

# 查看备份
ls -la digital-brain/data/backups/

# 脚本执行
./digital-brain/scripts/auto-backup.sh
./digital-brain/scripts/verify-data-integrity.sh
```

## 🏛️ 代码架构层次

### Digital Brain 应用结构
```
src/
├── app/                  # Next.js 页面路由系统
├── components/           # React 组件库（主题化，14个核心组件）
│   ├── EntryForm.tsx     # 智能输入表单 + AI功能
│   ├── TodoList.tsx      # 三维时间管理 + 拖拽重排
│   ├── AIQuestions.tsx   # AI 犀利提问功能
│   └── ThemeToggle.tsx   # 4套主题切换系统
├── lib/                  # 核心业务逻辑层
│   ├── actions.ts        # Server Actions API
│   ├── db.ts            # SQLite 数据库操作层
│   └── backup.ts        # 自动备份系统
├── hooks/               # 自定义 React Hooks
├── contexts/            # 全局状态管理（主题系统）
├── types/               # TypeScript 类型定义
└── data/                # SQLite 数据库存储
```

### 关键架构特点
- **模块化设计**: 单一职责原则，组件可复用
- **主题系统**: 4套主题（温暖粉色、科技未来、森林绿、多巴胺），支持亮暗模式切换
- **AI集成**: OpenRouter API + Claude 模型，智能提问和文本润色
- **数据安全**: 自动备份机制，30分钟间隔备份
- **性能优化**: 乐观更新 + 防抖机制 + 组件缓存

## 🔧 技术配置

### MCP 服务器集成
项目配置了 Supabase MCP 服务器（.mcp.json），支持云数据库操作：
- 项目引用: `aswbgrymrcanzhvofghr`
- 支持 SQL 执行、表查询、数据迁移等操作

### 开发环境要求
- **Node.js 18+** 和 npm
- **SQLite** 数据库支持
- **OpenRouter API Key**（AI功能）
- **Supabase 账户**（可选，云数据库）

### 环境变量配置 (.env.local)
```env
OPENROUTER_API_KEY=your_key
NEXT_PUBLIC_OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 📋 Git 工作流程

### 自然语言 Git 操作规范
项目定义了 AI-First 开发模式，开发者使用自然语言表达意图，Claude 自动执行技术操作：

- **"请同步到 git"** → 智能提交所有更改并推送到 GitHub
- **"查看修改了什么"** → 显示文件变更状态和具体修改内容
- **"撤销刚才的修改"** → 恢复工作区到上次提交状态
- **"创建新功能分支"** → 基于当前代码创建 feature 分支

详细规范参考：`GIT-WORKFLOW.md`

## 🎯 开发重点

### 专为 MacBook Pro 优化
- **无响应式设计** - 专注桌面体验，移除移动端适配
- **性能优先** - 针对桌面端优化交互和动画效果

### 关键开发原则
1. **类型安全** - 使用 TypeScript 严格模式，完整类型定义
2. **组件化** - 遵循单一职责原则，组件可复用
3. **主题一致性** - 所有组件支持4套主题切换，避免硬编码颜色
4. **数据安全** - 所有重要操作前自动备份，支持数据恢复
5. **AI集成** - 智能功能贯穿整个应用，提升用户体验

### 常见开发任务
- 运行 `npm run lint && npm run typecheck` 确保代码质量
- 新增组件时参考现有的主题系统集成方式
- 数据库操作前运行 `npm run data:safe` 确保数据安全
- 使用 `./scripts/` 下的脚本进行数据管理和验证

## 🔍 故障排除

### 端口冲突
```bash
# 检查端口占用
lsof -i :4000
# 清理进程
pkill -f "next-server"
# 使用其他端口
PORT=4000 npm run dev
```

### 数据库问题
```bash
# 验证数据库完整性
npm run validate
# 执行备份
npm run backup:verify
# 紧急恢复
./scripts/emergency-restore.sh
```

---

*专注于 MacBook Pro 的 AI 辅助工作流程平台 | 最后更新: 2025-01-13*
- 按照/Users/wangdong/Desktop/超级助理/GIT-WORKFLOW.md 文档里的规则进行 Git 管理
