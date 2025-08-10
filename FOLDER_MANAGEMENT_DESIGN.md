# 文件夹分类管理功能设计文档

## 功能概述

在左侧聊天栏中添加文件夹功能，允许用户创建文件夹并通过拖拽操作将相同主题的对话归类管理，提升对话组织的效率和便利性。

## 功能需求分析

### 核心功能
1. **文件夹创建**: 用户可以创建新的文件夹并命名
2. **文件夹管理**: 重命名、删除、排序文件夹
3. **拖拽分类**: 将对话拖拽到文件夹中进行分类
4. **文件夹展开/折叠**: 点击文件夹查看其中的对话
5. **对话移动**: 在文件夹间移动对话，或从文件夹移出到根目录

### 扩展功能
1. **文件夹颜色标记**: 为文件夹设置不同颜色以便区分
2. **文件夹图标**: 为不同类型的文件夹设置图标
3. **智能分类建议**: 基于对话内容推荐文件夹分类
4. **文件夹统计**: 显示文件夹内对话数量、最后更新时间等
5. **批量操作**: 批量移动多个对话到文件夹

## 数据库设计

### 1. 新增文件夹表 `conversation_folders`
```sql
CREATE TABLE conversation_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6', -- 十六进制颜色代码
  icon VARCHAR(50) DEFAULT 'folder', -- 图标名称
  position INTEGER DEFAULT 0, -- 排序位置
  parent_id INTEGER REFERENCES conversation_folders(id), -- 支持嵌套文件夹
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 修改对话表 `conversations`
```sql
-- 添加文件夹关联字段
ALTER TABLE conversations ADD COLUMN folder_id INTEGER REFERENCES conversation_folders(id);
```

### 3. 创建索引
```sql
CREATE INDEX idx_conversations_folder_id ON conversations(folder_id);
CREATE INDEX idx_folders_parent_id ON conversation_folders(parent_id);
CREATE INDEX idx_folders_position ON conversation_folders(position);
```

## 前端组件架构

### 1. 核心组件结构
```
src/components/agent/folder/
├── FolderTree.tsx              # 文件夹树形结构组件
├── FolderItem.tsx              # 单个文件夹项组件  
├── FolderCreateDialog.tsx      # 创建文件夹对话框
├── FolderEditDialog.tsx        # 编辑文件夹对话框
├── FolderContextMenu.tsx       # 文件夹右键菜单
├── ConversationDragItem.tsx    # 可拖拽的对话项组件
└── types.ts                    # 文件夹相关类型定义
```

### 2. Hook 设计
```
src/hooks/
├── useFolderManagement.ts      # 文件夹管理状态和操作
├── useDragAndDrop.ts          # 拖拽功能实现
└── useFolderTree.ts           # 文件夹树形结构管理
```

## API 端点设计

### 文件夹管理 API
```
GET    /api/agent/folders           # 获取所有文件夹
POST   /api/agent/folders           # 创建新文件夹
PUT    /api/agent/folders/:id       # 更新文件夹信息
DELETE /api/agent/folders/:id       # 删除文件夹
POST   /api/agent/folders/reorder   # 重新排序文件夹
```

### 对话分类 API
```
PUT    /api/agent/conversations/:id/folder    # 移动对话到文件夹
POST   /api/agent/conversations/batch/folder  # 批量移动对话到文件夹
```

## 用户交互设计

### 1. 文件夹操作流程
1. **创建文件夹**:
   - 点击侧边栏顶部的"新建文件夹"按钮
   - 弹出对话框输入文件夹名称、选择颜色和图标
   - 确认创建后文件夹出现在侧边栏中

2. **管理文件夹**:
   - 右键文件夹显示上下文菜单：重命名、删除、更改颜色等
   - 拖拽文件夹可调整排序
   - 点击文件夹展开/折叠查看内部对话

3. **对话分类**:
   - 拖拽对话到文件夹上方即可移入
   - 拖拽文件夹内的对话到空白区域移出到根目录
   - 支持多选对话后批量拖拽到文件夹

### 2. 视觉设计要点
- **文件夹图标**: 使用折叠/展开状态不同的文件夹图标
- **拖拽反馈**: 拖拽时高亮目标文件夹，显示投放区域
- **层级缩进**: 文件夹内对话有适当缩进体现层级关系
- **统计信息**: 文件夹名旁显示包含对话数量
- **颜色标识**: 文件夹左侧有颜色条或图标颜色标识

## 技术实现要点

### 1. 拖拽功能实现
```typescript
// 使用 @dnd-kit 或原生 HTML5 Drag & Drop API
interface DragItem {
  id: number;
  type: 'conversation' | 'folder';
  data: Conversation | Folder;
}

interface DropTarget {
  id: number;
  type: 'folder' | 'root';
  accepts: ('conversation' | 'folder')[];
}
```

### 2. 状态管理设计
```typescript
interface FolderState {
  folders: Folder[];
  expandedFolders: Set<number>;
  draggedItem: DragItem | null;
  dropTarget: DropTarget | null;
}

interface FolderActions {
  createFolder: (folder: CreateFolderData) => Promise<void>;
  updateFolder: (id: number, updates: Partial<Folder>) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
  moveConversationToFolder: (conversationId: number, folderId: number | null) => Promise<void>;
  toggleFolderExpansion: (folderId: number) => void;
  reorderFolders: (folders: Folder[]) => Promise<void>;
}
```

### 3. 数据同步策略
- **实时同步**: 拖拽操作立即更新数据库
- **乐观更新**: UI 先更新，后台同步，失败时回滚
- **冲突处理**: 并发操作时的数据一致性保证

## 开发阶段规划

### 阶段1: 基础架构 (2-3天)
1. 数据库表结构设计和迁移
2. 基础 API 端点实现
3. 文件夹数据类型定义
4. 基础 Hook 实现

### 阶段2: 核心功能 (3-4天)
1. 文件夹 CRUD 操作
2. 文件夹树形结构展示
3. 基础拖拽功能实现
4. 对话分类功能

### 阶段3: 用户体验优化 (2-3天)
1. 拖拽视觉反馈优化
2. 文件夹展开/折叠动画
3. 右键上下文菜单
4. 文件夹颜色和图标系统

### 阶段4: 扩展功能 (2-3天)
1. 批量操作支持
2. 智能分类建议
3. 文件夹统计信息
4. 导入/导出文件夹结构

## 性能考虑

### 1. 前端优化
- **虚拟滚动**: 大量文件夹和对话时使用虚拟滚动
- **懒加载**: 文件夹内容按需加载
- **缓存策略**: 合理缓存文件夹结构和对话列表
- **防抖处理**: 拖拽和搜索操作使用防抖

### 2. 后端优化  
- **数据库索引**: 为常用查询字段建立索引
- **批量操作**: 支持批量移动操作减少网络请求
- **缓存机制**: 文件夹结构缓存在 Redis 中
- **分页查询**: 大量数据时使用分页加载

## 兼容性和迁移

### 1. 现有数据兼容
- 现有对话默认在根目录下 (folder_id = null)
- 提供数据迁移脚本处理历史数据
- 向后兼容现有 API 接口

### 2. 渐进式升级
- 文件夹功能作为可选功能逐步推出
- 保持现有用户操作习惯不变
- 提供功能介绍和使用指导

## 测试策略

### 1. 单元测试
- 文件夹 CRUD 操作测试
- 拖拽逻辑测试
- 数据同步测试

### 2. 集成测试
- API 接口测试
- 前后端数据一致性测试
- 并发操作测试

### 3. 用户体验测试
- 拖拽操作流畅度测试
- 大数据量下的性能测试
- 多设备兼容性测试

## 风险评估

### 1. 技术风险
- **拖拽兼容性**: 不同浏览器的拖拽API差异
- **性能问题**: 大量数据时的渲染性能
- **数据一致性**: 并发操作可能导致的数据不一致

### 2. 用户体验风险
- **学习成本**: 新功能的用户接受度
- **操作复杂性**: 过于复杂的交互可能影响使用体验
- **数据丢失**: 误操作可能导致对话分类丢失

### 3. 风险缓解措施
- 充分的兼容性测试和降级方案
- 操作确认和撤销机制
- 详细的操作日志和数据备份
- 渐进式功能推出和用户引导

## 总结

文件夹分类管理功能将显著提升用户的对话组织效率，通过直观的拖拽操作和清晰的层级结构，用户可以更好地管理大量对话。本设计注重用户体验和系统性能的平衡，采用渐进式开发和部署策略，确保功能稳定可靠。
