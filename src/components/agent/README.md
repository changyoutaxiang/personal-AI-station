# 聊天主界面与交互组件

本模块实现了完整的AI聊天对话系统，包含以下功能组件：

## 组件架构

```
ChatLayout（主容器）
├── ChatSidebar（左侧边栏）
│   ├── 会话列表
│   ├── 搜索功能
│   └── 标签过滤
├── ChatHeader（顶部工具栏）
│   ├── ModelSelector（模型选择器）
│   ├── PromptTemplateSelector（提示模板选择器）

│   └── 操作按钮（新建、重命名、导出）
├── ChatMessages（消息展示区）
│   ├── 消息列表展示
│   ├── 用户/助手消息区分
│   └── 消息操作（复制、删除、重新生成）
└── ChatInput（输入区域）
    ├── 多行文本输入
    ├── 发送按钮
    └── 快速输入建议
```

## 主要功能特性

### 1. 会话管理
- ✅ 创建新会话
- ✅ 重命名会话
- ✅ 删除会话
- ✅ 会话列表展示
- ✅ 会话搜索与过滤

### 2. 模型配置
- ✅ 多模型支持（基于 src/lib/models.ts）
- ✅ 动态模型切换
- ✅ 模型选择器 UI

### 3. 提示模板系统
- ✅ 模板列表加载
- ✅ 模板选择应用
- ✅ 模板创建与编辑
- ✅ 系统提示词注入

### 4. 标签系统
- ✅ 会话标签绑定/解绑
- ✅ 标签搜索与创建
- ✅ 标签过滤会话

### 5. 消息交互
- ✅ 实时消息发送
- ✅ 上下文记忆（默认20条）
- ✅ 消息复制功能
- ✅ 消息删除功能
- ✅ 重新生成回复
- ✅ 自动滚动到底部

### 6. 输入体验
- ✅ 多行文本输入
- ✅ Enter 发送 / Shift+Enter 换行
- ✅ 字符计数（5000字符限制）
- ✅ 发送状态提示
- ✅ 快速输入建议

## API 接口

### 会话 API
- `GET /api/agent/conversations` - 获取会话列表
- `POST /api/agent/conversations` - 创建新会话
- `GET /api/agent/conversations/[id]` - 获取单个会话
- `PATCH /api/agent/conversations/[id]` - 更新会话
- `DELETE /api/agent/conversations/[id]` - 删除会话

### 消息 API
- `GET /api/agent/messages?conversationId=[id]` - 获取会话消息
- `POST /api/agent/chat` - 发送消息并获取AI回复
- `DELETE /api/agent/messages/[id]` - 删除单条消息

### 提示模板 API
- `GET /api/agent/prompts` - 获取模板列表
- `POST /api/agent/prompts` - 创建新模板
- `PATCH /api/agent/prompts/[id]` - 更新模板
- `DELETE /api/agent/prompts/[id]` - 删除模板

### 标签 API
- `GET /api/agent/tags` - 获取标签列表
- `POST /api/agent/tags` - 创建新标签
- `POST /api/agent/conversations/[id]/tags` - 绑定标签
- `DELETE /api/agent/conversations/[id]/tags` - 解绑标签

## 使用方式

```tsx
import { ChatLayout } from '@/components/agent';

export default function AgentPage() {
  return <ChatLayout />;
}
```

## 数据流

1. **初始化**：加载会话列表、标签列表、提示模板
2. **选择会话**：加载历史消息，更新UI状态
3. **发送消息**：
   - 添加临时消息到UI
   - 调用聊天API（附带模型、模板、上下文）
   - 更新真实消息列表
   - 滚动到底部
4. **错误处理**：移除临时消息，显示错误提示

## 技术特点

- **响应式设计**：支持移动端和桌面端
- **实时更新**：消息发送状态实时反馈
- **性能优化**：虚拟滚动、防抖搜索
- **用户体验**：动画效果、键盘快捷键
- **错误处理**：完善的错误提示和重试机制
- **类型安全**：完整的 TypeScript 类型定义

## 样式系统

使用 CSS 变量实现主题适配：
- `var(--background)` - 背景色
- `var(--card-glass)` - 卡片背景
- `var(--card-border)` - 边框色
- `var(--text-primary)` - 主要文字
- `var(--text-secondary)` - 次要文字
- `var(--flow-primary)` - 主题色

## 配置项

- **历史消息限制**：默认20条，可在UI中调整
- **字符限制**：单条消息最多5000字符
- **模型列表**：基于 `src/lib/models.ts` 配置
- **默认模板**：数据库初始化时创建

## 未来扩展

- [ ] 消息导入/导出功能
- [ ] 会话模板功能
- [ ] 更丰富的消息类型（图片、文件）
- [ ] 实时协作功能
- [ ] 消息搜索功能
- [ ] 会话归档功能
