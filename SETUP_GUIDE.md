# 🚀 Digital Brain 设置指南

一站式配置指南，涵盖开发环境、数据库迁移和MCP服务器设置。

## 📋 目录
- [快速开始](#快速开始)
- [环境配置](#环境配置)
- [Supabase 云数据库配置](#supabase-云数据库配置)
- [MCP 服务器配置](#mcp-服务器配置)
- [文档管理规范](#文档管理规范)

## 🎯 快速开始

### 前提条件
1. **Node.js 18+** 和 npm
2. **Supabase 账户**（可选，用于云数据库）
3. **Claude Code CLI**（用于MCP功能）

### 基础安装
```bash
# 克隆项目
git clone <repository-url>
cd digital-brain

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## ⚙️ 环境配置

创建 `.env.local` 文件：

```env
# OpenRouter AI 配置（推荐）
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

# Supabase 云数据库（可选）
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 开发模式配置
NODE_ENV=development
```

## 📊 Supabase 云数据库配置

### 1. 获取 Supabase 访问凭据

1. 访问 [Supabase 控制台](https://app.supabase.com)
2. 创建新项目或选择现有项目
3. 在 **Settings > API** 中获取：
   - Project URL
   - anon public key
   - service_role key（仅后端使用）

### 2. 数据库迁移

```bash
# 执行数据库架构迁移
npm run migrate

# 验证数据完整性
npm run data:safe

# 如需从 SQLite 迁移数据
node migrate-to-supabase.js
```

### 3. 表结构说明

项目使用以下主要数据表：
- `entries` - 知识条目
- `todos` - 任务管理
- `chat_conversations` - AI 对话记录

## 🔧 MCP 服务器配置

### Supabase MCP 设置

1. **获取个人访问令牌**
   - 登录 Supabase 控制台
   - 进入 **Account Settings > Access Tokens**
   - 点击 **Generate New Token**
   - 复制生成的令牌

2. **配置 Claude Code MCP**
```bash
# 添加 Supabase MCP 服务器
claude mcp add supabase --scope user

# 设置访问令牌
claude config set SUPABASE_ACCESS_TOKEN="your_access_token"
```

3. **验证配置**
```bash
# 测试连接
node verify-supabase-mcp.js
```

### 可用的 MCP 工具

配置完成后，可以在 Claude Code 中直接使用：
- `supabase_execute_sql` - 执行 SQL 查询
- `supabase_get_projects` - 列出项目
- `supabase_get_tables` - 查看表结构
- 更多工具请参考 [MCP 文档]

## 📁 文档管理规范

### 目录结构
```
docs/
├── SETUP_GUIDE.md         # 本指南（核心）
├── CLAUDE.md              # 开发指导
├── README.md              # 项目概览
└── archive/               # 归档文档
```

### 文档分类
- **🔴 核心文档**：SETUP_GUIDE.md, CLAUDE.md, README.md
- **🟡 专题文档**：技术实现、主题系统等
- **🟢 归档文档**：已过期或历史版本

## 🔍 故障排除

### 常见问题

**端口冲突**
```bash
# 使用其他端口启动
PORT=4000 npm run dev
```

**依赖问题**
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

**数据库连接问题**
```bash
# 检查环境变量
node validate-system.js

# 验证 Supabase 连接
npm run test:api
```

### 开发命令

```bash
# 质量检查
npm run lint              # ESLint 检查
npm run typecheck         # TypeScript 检查
npm run build             # 生产构建

# 数据管理
npm run backup            # 数据备份
npm run backup:verify     # 验证备份完整性

# 测试
npm run test:e2e          # 端到端测试
npm run validate          # 系统验证
```

## 📞 支持

- **项目文档**: 查看 `/docs` 目录下的详细文档
- **开发指导**: 参考 `CLAUDE.md`
- **Issues**: 在项目仓库提交问题

---

*最后更新: 2025-01-05*
*版本: v1.0*