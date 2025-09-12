# Supabase 云数据库迁移指南

本指南将帮助您将数字大脑应用从本地 SQLite 数据库迁移到 Supabase 云数据库。

## 前提条件

1. 已安装 Node.js 和 npm
2. 拥有 Supabase 账户和项目
3. 获取了 Supabase 项目的 URL 和 API 密钥

## 迁移步骤

### 1. 环境配置

环境变量已配置在 `.env.local` 文件中：

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aswbgrymrcanzhvofghr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration
DATABASE_TYPE=sqlite  # 默认使用 SQLite，迁移后改为 supabase
```

### 2. 创建 Supabase 数据库表结构

在 Supabase 控制台的 SQL 编辑器中执行 `supabase-schema.sql` 文件中的 SQL 语句：

1. 登录 [Supabase 控制台](https://app.supabase.com)
2. 选择您的项目
3. 进入 "SQL Editor"
4. 复制并执行 `supabase-schema.sql` 中的所有 SQL 语句

### 3. 数据迁移

运行迁移脚本将现有数据从 SQLite 迁移到 Supabase：

```bash
# 安装依赖（如果还没有安装）
npm install @supabase/supabase-js

# 运行迁移脚本
node migrate-to-supabase.js
```

迁移脚本将：
- 自动备份现有的 SQLite 数据库
- 将所有表的数据迁移到 Supabase
- 显示迁移进度和结果

### 4. 切换到云数据库

数据迁移完成后，修改 `.env.local` 文件：

```env
# Database Configuration
DATABASE_TYPE=supabase  # 从 sqlite 改为 supabase
```

### 5. 重启应用

```bash
npm run dev
```

## 验证迁移

1. 启动应用后，检查所有功能是否正常工作
2. 验证数据是否完整迁移
3. 测试创建、编辑、删除操作
4. 检查搜索功能是否正常

## 回滚方案

如果需要回滚到本地数据库：

1. 修改 `.env.local` 文件：
   ```env
   DATABASE_TYPE=sqlite
   ```

2. 重启应用

3. 如果需要，可以从 `backup/` 目录恢复备份的数据库文件

## 数据库架构对比

### SQLite vs Supabase

| 特性 | SQLite | Supabase |
|------|--------|----------|
| 存储位置 | 本地文件 | 云端 PostgreSQL |
| 并发访问 | 有限 | 高并发支持 |
| 备份 | 手动文件备份 | 自动备份 |
| 扩展性 | 有限 | 高扩展性 |
| 实时功能 | 无 | 支持实时订阅 |
| 全文搜索 | 基础 | 高级全文搜索 |

## 新增功能

迁移到 Supabase 后，您可以利用以下新功能：

1. **实时数据同步**：多设备间数据实时同步
2. **高级搜索**：PostgreSQL 全文搜索功能
3. **数据安全**：Row Level Security (RLS) 保护
4. **自动备份**：Supabase 提供自动备份服务
5. **API 访问**：RESTful API 和 GraphQL 支持

## 故障排除

### 常见问题

1. **连接失败**
   - 检查网络连接
   - 验证 Supabase URL 和 API 密钥
   - 确认 Supabase 项目状态

2. **数据迁移失败**
   - 检查 SQLite 数据库文件是否存在
   - 验证 Supabase 表结构是否正确创建
   - 查看迁移脚本的错误日志

3. **性能问题**
   - 检查网络延迟
   - 考虑添加数据库索引
   - 优化查询语句

### 日志和调试

应用包含详细的日志记录，可以帮助诊断问题：

```bash
# 查看应用日志
npm run dev

# 检查迁移日志
node migrate-to-supabase.js
```

## 支持

如果遇到问题，请：

1. 检查本文档的故障排除部分
2. 查看应用和迁移脚本的日志输出
3. 验证 Supabase 项目配置
4. 确保网络连接正常

## 注意事项

1. **数据备份**：迁移前会自动创建备份，建议额外手动备份重要数据
2. **网络依赖**：云数据库需要稳定的网络连接
3. **成本考虑**：Supabase 有免费额度，超出后需要付费
4. **隐私**：数据将存储在 Supabase 云端，请确保符合您的隐私要求