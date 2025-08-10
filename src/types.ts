// 对话相关接口
export interface Conversation {
  id: number;
  title: string;
  model_name: string;
  system_prompt?: string;
  created_at: string;
  updated_at: string;
}

// 聊天消息接口
export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokens_used?: number;
  created_at: string;
}

// 提示模板接口
export interface PromptTemplate {
  id: number;
  name: string;
  content: string;
  description?: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// 标签接口
export interface Tag {
  id: number;
  name: string;
  created_at: string;
}
