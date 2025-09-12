// 聊天相关类型定义

export interface Conversation {
  id: number;
  title: string;
  model_name: string;
  system_prompt?: string;
  tags?: Tag[];
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens_used?: number;
  isStreaming?: boolean; // 支持流式输出
  // 编辑相关字段
  isEditing?: boolean; // 是否正在编辑
  originalContent?: string; // 原始内容（用于取消编辑时恢复）
  [key: string]: unknown; // 索引签名，满足SelectableItem约束
  editHistory?: MessageEditHistory[]; // 编辑历史
}

// 消息编辑历史
export interface MessageEditHistory {
  id: number;
  message_id: number;
  original_content: string;
  edited_content: string;
  edited_at: string;
  edit_reason?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface PromptTemplate {
  id: number;
  name: string;
  content: string;
  description?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatResponse {
  success: boolean;
  conversationId: number;
  assistant: {
    content: string;
    tokensUsed: number;
  };
  error?: string;
}

export interface ConversationsResponse {
  success: boolean;
  conversations: Conversation[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
  error?: string;
}

export interface MessagesResponse {
  success: boolean;
  messages: Message[];
  pagination: {
    conversationId: number;
    limit: number;
    offset: number;
    count: number;
  };
  error?: string;
}

export interface TagsResponse {
  success: boolean;
  tags: Tag[];
  error?: string;
}

export interface PromptTemplatesResponse {
  success: boolean;
  templates: PromptTemplate[];
  error?: string;
}
