# Supabase MCP 服务器配置指南

本指南将帮助您为 Digital Brain 项目配置 Supabase MCP 服务器，以便在 Claude Code 中直接操作 Supabase 数据库。

## 📋 前提条件

1. **Node.js 和 npx**：确保已安装最新版本
2. **Supabase 账户**：需要访问项目管理面板
3. **个人访问令牌**：需要从 Supabase 获取

## 🔑 获取 Supabase 个人访问令牌

### 步骤 1：登录 Supabase
1. 访问 [Supabase 控制台](https://app.supabase.com)
2. 使用您的账户登录

### 步骤 2：生成个人访问令牌
1. 点击右上角的个人头像
2. 选择 **"Account Settings"** 或 **"账户设置"**
3. 在左侧菜单中点击 **"Access Tokens"** 或 **"访问令牌"**
4. 点击 **"Generate new token"** 或 **"生成新令牌"**
5. 给令牌起一个描述性名称，如 `Digital Brain MCP`
6. 复制生成的令牌（只会显示一次！）

## ⚙️ 配置 MCP 服务器

### 方法 1：环境变量配置（推荐）

1. **添加环境变量到 `.env.local`**：
```env
# Supabase MCP 配置
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

2. **更新 `mcp.json` 配置**：
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=aswbgrymrcanzhvofghr"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      }
    }
  }
}
```

### 方法 2：直接配置

直接在 `mcp.json` 中替换 `<YOUR_SUPABASE_PERSONAL_ACCESS_TOKEN>` 为您的实际访问令牌。

**⚠️ 安全提醒**：如果使用此方法，请确保不要将 `mcp.json` 文件提交到公共代码仓库。

## 📊 当前项目配置

- **项目引用 ID**：`aswbgrymrcanzhvofghr`
- **项目 URL**：`https://aswbgrymrcanzhvofghr.supabase.co`
- **配置模式**：`--read-only`（安全模式，防止意外修改）

## 🚀 验证配置

配置完成后，重启 Claude Code 以加载新的 MCP 服务器。您将能够：

### 可用功能
- 📊 **查询数据**：直接查询 Supabase 数据库表
- 🔍 **检查架构**：查看表结构和关系
- 📈 **分析数据**：获取数据统计和洞察
- 🛡️ **安全操作**：只读模式，无法修改数据

### 测试命令
```bash
# 测试 MCP 服务器是否正常工作
npx @supabase/mcp-server-supabase@latest --help
```

## 📚 数据库表结构

当前项目包含以下主要表：

### 核心表
- `entries` - 记录条目（内容、项目标签、重要度等）
- `todos` - 待办事项
- `ai_insights` - AI 洞察数据
- `work_patterns` - 工作模式分析
- `knowledge_base` - 知识库
- `user_behavior_events` - 用户行为事件

### 高级表
- `behavior_patterns` - 行为模式
- `cognitive_profiles` - 认知画像
- `recommendations` - 智能推荐
- `knowledge_relationships` - 知识关联

## 🔧 故障排除

### 常见问题

1. **"Access token not found" 错误**
   - 确认已正确设置 `SUPABASE_ACCESS_TOKEN` 环境变量
   - 检查令牌格式是否正确（应以 `sbp_` 开头）

2. **"Project not found" 错误**
   - 验证项目引用 ID：`aswbgrymrcanzhvofghr`
   - 确认您的账户有权访问此项目

3. **网络连接问题**
   - 检查网络连接
   - 确认能访问 `https://aswbgrymrcanzhvofghr.supabase.co`

### 调试技巧

1. **检查 MCP 服务器状态**：
```bash
npx @supabase/mcp-server-supabase@latest --project-ref=aswbgrymrcanzhvofghr --help
```

2. **验证环境变量**：
```bash
echo $SUPABASE_ACCESS_TOKEN
```

## 🔒 安全最佳实践

1. **只读模式**：配置中使用 `--read-only` 标志
2. **项目范围**：限制为特定项目 `--project-ref=aswbgrymrcanzhvofghr`
3. **令牌管理**：
   - 定期轮换访问令牌
   - 不要在代码中硬编码令牌
   - 使用环境变量存储敏感信息

4. **访问控制**：
   - 不要与最终用户共享 MCP 服务器
   - 避免在生产环境中使用

## 💡 使用示例

配置完成后，您可以在 Claude Code 中执行如下操作：

```markdown
# 查询最近的记录
请查询 entries 表中最近创建的 10 条记录

# 分析数据分布
分析一下 entries 表中 project_tag 的分布情况

# 检查表结构
显示 todos 表的完整结构和索引信息
```

## 📞 获取帮助

如果遇到问题：
1. 检查本文档的故障排除部分
2. 验证 Supabase 项目状态和令牌有效性
3. 查看 Claude Code 的错误日志
4. 参考 [Supabase MCP 官方文档](https://supabase.com/docs/guides/getting-started/mcp)

---

**配置完成后，记得重启 Claude Code 以加载新的 MCP 服务器配置！** 🚀