# Vercel 部署配置指南

## 快速部署命令

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录并部署
```bash
# 登录 Vercel
vercel login

# 在项目根目录执行部署
vercel

# 设置环境变量（逐个执行）
vercel env add OPENROUTER_API_KEY production
vercel env add NEXT_PUBLIC_SITE_URL production  
vercel env add NEXT_SERVER_ACTIONS_ENCRYPTION_KEY production
vercel env add DATABASE_TYPE production

# 如果使用 Supabase
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_ACCESS_TOKEN production

# 重新部署以应用环境变量
vercel --prod
```

## 重要配置说明

### 环境变量值参考
- `OPENROUTER_API_KEY`: 您的 OpenRouter API 密钥
- `NEXT_PUBLIC_SITE_URL`: https://your-app-name.vercel.app
- `DATABASE_TYPE`: sqlite (推荐) 或 supabase
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`: 保持现有值或生成新的32字节密钥

### 部署后验证
1. 访问部署的 URL
2. 测试 AI 功能是否正常工作
3. 检查控制台是否有环境变量相关错误
4. 验证主题切换和基本功能

## 故障排除
- 如果部署失败，检查构建日志中的环境变量错误
- 确保 `NEXT_PUBLIC_SITE_URL` 设置为正确的 Vercel 域名
- OpenRouter API Key 格式应为 `sk-or-v1-...`