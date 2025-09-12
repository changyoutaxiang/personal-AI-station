// AI 模型配置常量
// ⚠️ 已弃用 - 请使用 ai-providers.ts 中的 getAllAvailableModels() 函数获取最新的模型列表
// 该文件为向后兼容而保留，新代码应使用统一的供应商配置

import { getAllAvailableModels } from './ai-providers';

// @deprecated 使用 getAllAvailableModels() 代替
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
// @deprecated 使用 ai-providers.ts 中的类型定义
export interface ModelOption {
  value: string;
  label: string;
}

// 新的统一数据源访问函数
// 推荐使用这个函数而不是 AVAILABLE_MODELS 常量
export function getAvailableModels() {
  return getAllAvailableModels();
}
