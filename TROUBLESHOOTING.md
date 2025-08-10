# 🛠️ Digital Brain 问题解决记录

**文档目的**: 记录开发过程中遇到的问题和解决方案，为未来维护提供参考

---

## 🐛 已解决问题列表

### 1. Server Actions 异步调用错误
**时间**: 2025-07-28  
**问题描述**: 在 Server Actions 中对同步数据库函数使用了 `await` 关键字，导致 500 内部服务器错误
**错误表现**: 
- 浏览器控制台显示 "An unexpected response was received from the server"
- 保存记录功能完全无法使用
- 服务器返回 500 状态码

**根本原因**: 
```javascript
// 错误写法
const entry = await createEntry(data); // createEntry 是同步函数

// 正确写法  
const entry = createEntry(data);
```

**解决方案**:
1. 检查 `src/lib/db.ts` 中所有数据库函数的定义
2. 移除 `src/lib/actions.ts` 中所有不必要的 `await` 关键字
3. 保持 Server Actions 函数为 `async`，但内部调用同步函数时不使用 `await`

**预防措施**: 在 TypeScript 中明确标记同步/异步函数类型

---

### 2. 页面刷新体验问题
**时间**: 2025-07-28  
**问题描述**: 表单提交后使用 `window.location.reload()` 导致页面闪烁，用户体验差
**错误表现**:
- 保存记录后整个页面重新加载
- 用户输入焦点丢失
- 加载过程中页面闪烁

**解决方案**:
1. 移除 `window.location.reload()` 调用
2. 使用 `CustomEvent` 进行组件间通信
3. 在 EntryForm 中分发 'entryAdded' 事件
4. 在 EntryList 中监听事件并重新加载数据

**代码实现**:
```javascript
// EntryForm.tsx
window.dispatchEvent(new CustomEvent('entryAdded'));

// EntryList.tsx  
useEffect(() => {
  const handleEntryAdded = () => loadEntries();
  window.addEventListener('entryAdded', handleEntryAdded);
  return () => window.removeEventListener('entryAdded', handleEntryAdded);
}, []);
```

---

### 3. Favicon 500 错误
**时间**: 2025-07-28  
**问题描述**: 浏览器请求 favicon.ico 时返回 500 错误
**错误表现**:
- 浏览器控制台显示 favicon.ico 500 错误
- 不影响功能但影响开发体验

**解决方案**:
1. 在 `src/app/layout.tsx` 的 metadata 中明确指定 favicon 路径
2. 改善应用的 title 和 description
3. 设置正确的语言属性为 `zh-CN`

**代码实现**:
```javascript
export const metadata: Metadata = {
  title: "Digital Brain - 个人知识管理系统",
  description: "从信息捕获到洞察生成的完整闭环",
  icons: {
    icon: '/favicon.ico',
  },
};
```

---

### 4. 端口访问问题
**时间**: 2025-07-28  
**问题描述**: 默认端口 3000 和 3001 无法正常访问，curl 返回连接拒绝
**错误表现**:
- `curl: (7) Failed to connect to localhost port 3001`
- 服务器显示启动成功但实际无法连接
- `lsof` 显示端口未被监听

**根本原因**: 
- 端口 3000 被其他进程占用
- 网络配置可能存在问题
- hostname 绑定问题

**解决方案**:
1. 使用不同端口 (4000)
2. 显式指定 hostname 为 `0.0.0.0`
3. 清理 Next.js 缓存 (`rm -rf .next`)
4. 使用标准 Next.js 而非 Turbopack 模式

**最终启动命令**:
```bash
npx next dev --port 4000 --hostname 0.0.0.0
```

---

### 5. 数据库初始化时机问题
**时间**: 2025-07-28  
**问题描述**: 应用启动时可能出现数据库未初始化的情况
**解决方案**: 在主页面组件中添加数据库初始化调用（已后来移除，改为手动初始化）

---

## 🔧 调试技巧

### 1. 服务器日志监控
- 使用后台启动: `npm run dev > server.log 2>&1 &`
- 实时查看日志: `tail -f server.log`
- 检查端口监听: `lsof -i :4000`

### 2. 数据库调试
- 检查数据库健康: `node -e "require('./src/lib/db.ts').checkDatabaseHealth()"`
- 查看表结构: `sqlite3 data/digital-brain.db ".schema"`
- 查看数据: `sqlite3 data/digital-brain.db "SELECT * FROM entries;"`

### 3. 进程管理
- 查找端口占用: `lsof -i :3000`
- 强制杀死进程: `kill -9 <PID>`
- 清理相关进程: `pkill -f "next-server"`

---

## 📋 预防清单

### 开发前检查
- [ ] 确认 Node.js 版本 >= 24
- [ ] 检查端口是否被占用
- [ ] 确保数据目录权限正确
- [ ] 清理 `.next` 缓存

### 部署前检查  
- [ ] 运行 `npm run build` 确认构建成功
- [ ] 运行 `npm run lint` 确认代码质量
- [ ] 检查数据库文件是否存在
- [ ] 验证所有环境变量

### 代码质量检查
- [ ] 同步函数不使用 `await`
- [ ] Server Actions 错误处理完整
- [ ] TypeScript 类型定义准确
- [ ] 用户体验优化到位

---

## 🚨 紧急问题处理流程

1. **服务无法启动**
   - 检查端口占用: `lsof -i :4000`
   - 清理缓存: `rm -rf .next`
   - 重启应用: `npx next dev --port 4000 --hostname 0.0.0.0`

2. **数据库错误**
   - 备份数据库: `cp data/digital-brain.db data/backup.db`
   - 重新初始化: `node -e "require('./src/lib/init-db.ts').initDB()"`
   - 恢复数据: 从备份文件恢复

3. **功能异常**
   - 检查浏览器控制台错误
   - 查看 server.log 服务器日志  
   - 对比 PROGRESS_BACKUP.md 中的正常状态

---

**维护者**: Claude Code  
**最后更新**: 2025-07-28  
**版本**: v1.0