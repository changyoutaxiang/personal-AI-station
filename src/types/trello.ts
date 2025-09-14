// Trello完全重构的类型定义系统
// 基于真实Trello的三层架构：Board → List → Card

export interface TrelloCard {
  id: string;
  title: string;
  description?: string;
  listId: string;
  boardId: string;
  position: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;

  // 丰富的卡片功能
  labels: TrelloLabel[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  comments: Comment[];
  members: Member[];

  // 元数据
  priority: Priority;
  tags: string[];
  cover?: Cover;

  // 项目管理扩展字段
  plannedStartDate?: Date;
  plannedEndDate?: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  percentComplete?: number;
  taskType?: 'task' | 'milestone' | 'summary';
  predecessors?: string[]; // 前置任务ID
  successors?: string[]; // 后继任务ID
  assignedResources?: string[]; // 资源ID
  budget?: number;
  actualCost?: number;
}

export interface TrelloList {
  id: string;
  title: string;
  boardId: string;
  position: number;
  cards: TrelloCard[];
  createdAt: Date;
  updatedAt: Date;

  // 列表功能
  archived: boolean;
  wipLimit?: number;
  color?: string;
}

export interface TrelloBoard {
  id: string;
  title: string;
  description?: string;
  lists: TrelloList[];
  createdAt: Date;
  updatedAt: Date;

  // 面板功能
  starred: boolean;
  visibility: 'private' | 'workspace' | 'public';
  background?: BoardBackground;
  settings: BoardSettings;

  // 协作功能
  members: Member[];
  admins: Member[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  dueDate?: Date;
}

export interface TrelloLabel {
  id: string;
  name?: string;
  color: LabelColor;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link' | 'video';
  size?: number;
  uploadedAt: Date;
}

export interface Comment {
  id: string;
  text: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  initials: string;
}

export interface Cover {
  type: 'color' | 'image';
  value: string; // 颜色值或图片URL
  size: 'normal' | 'full';
}

export interface BoardBackground {
  type: 'color' | 'image' | 'gradient';
  value: string;
}

export interface BoardSettings {
  allowComments: boolean;
  allowInvitations: boolean;
  allowVoting: boolean;
  cardCover: boolean;
  selfJoin: boolean;
}



// 优先级
export type Priority = 'urgent' | 'high' | 'normal' | 'low';

// 标签颜色
export type LabelColor =
  | 'green' | 'yellow' | 'orange' | 'red' | 'purple'
  | 'blue' | 'sky' | 'lime' | 'pink' | 'black';

// 拖拽事件
export interface TrelloDragEvent {
  cardId: string;
  sourceListId: string;
  targetListId: string;
  newPosition: number;
}

// 快速操作
export interface QuickAction {
  type: 'add_card' | 'add_list' | 'archive_card' | 'duplicate_card';
  target: string; // 目标ID
  data?: unknown;
}

// Trello特色功能
export interface TrelloFeature {
  powerUps: PowerUp[];
  automation: AutomationRule[];
  templates: CardTemplate[];
}

export interface PowerUp {
  id: string;
  name: string;
  enabled: boolean;
  config?: Record<string, unknown>;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  enabled: boolean;
}

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  checklist: ChecklistItem[];
  labels: TrelloLabel[];
}

// 搜索和筛选
export interface TrelloFilter {
  query?: string;
  labels?: string[];
  members?: string[];
  dueDate?: DateRange;
  completed?: boolean;
  hasAttachment?: boolean;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

// 统计数据
export interface BoardStats {
  totalCards: number;
  completedCards: number;
  totalLists: number;
  totalMembers: number;
  recentActivity: number;
}

// 导入导出
export interface TrelloBoardExport {
  board: TrelloBoard;
  exportDate: Date;
  version: string;
}

// API 响应类型
export interface TrelloApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Webhook 事件
export interface TrelloWebhookEvent {
  type: 'card_created' | 'card_updated' | 'card_deleted' | 'list_created' | 'board_updated';
  data: unknown;
  timestamp: Date;
}