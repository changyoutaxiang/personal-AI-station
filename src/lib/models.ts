// AI 模型配置常量
// 该文件独立于数据库层，可安全用于前端组件

export const AVAILABLE_MODELS = [
  { value: 'openai/o3', label: 'OpenAI O3' },
  { value: 'openai/gpt-5-chat', label: 'GPT-5 Chat' },
  { value: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4' },
  { value: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'x-ai/grok-4', label: 'Grok 4' },
  { value: 'deepseek/deepseek-r1-0528', label: 'DeepSeek R1' },
  { value: 'deepseek/deepseek-chat-v3-0324', label: 'DeepSeek Chat V3' },
  { value: 'moonshotai/kimi-k2', label: 'Kimi K2' },
  { value: 'anthropic/claude-3-haiku', label: 'Claude 3 Haiku' }
];

// 模型类型定义
export interface ModelOption {
  value: string;
  label: string;
}
