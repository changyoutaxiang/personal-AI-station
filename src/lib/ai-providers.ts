/**
 * AI供应商配置
 * 定义不同AI供应商的配置信息和可用模型
 */

export interface AIProvider {
  id: string;
  name: string;
  description: string;
  apiEndpoint: string;
  requiresApiKey: boolean;
  apiKeyEnvVar: string;
  models: AIModel[];
}

export interface AIModel {
  id: string;
  name: string;
  description?: string;
  maxTokens?: number;
  supportsFunctions?: boolean;
  costPer1kTokens?: number;
}

// OpenRouter 供应商配置
const OPENROUTER_PROVIDER: AIProvider = {
  id: 'openrouter',
  name: 'OpenRouter',
  description: '通过OpenRouter访问多种AI模型',
  apiEndpoint: 'https://openrouter.ai/api/v1/chat/completions',
  requiresApiKey: true,
  apiKeyEnvVar: 'OPENROUTER_API_KEY',
  models: [
    {
      id: 'openai/gpt-5-chat',
      name: 'GPT-5 Chat',
      description: 'OpenAI GPT-5聊天模型',
      maxTokens: 4000,
      supportsFunctions: true
    },
    {
      id: 'anthropic/claude-sonnet-4',
      name: 'Claude Sonnet 4',
      description: 'Anthropic Claude Sonnet 4模型',
      maxTokens: 8000,
      supportsFunctions: true
    },
    {
      id: 'google/gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Google Gemini 2.5 Flash模型',
      maxTokens: 8000,
      supportsFunctions: true
    },
    {
      id: 'google/gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Google Gemini 2.5 Pro模型',
      maxTokens: 8000,
      supportsFunctions: true
    },
    {
      id: 'x-ai/grok-4',
      name: 'Grok 4',
      description: 'xAI Grok 4模型',
      maxTokens: 4000,
      supportsFunctions: false
    },
    {
      id: 'moonshotai/kimi-k2',
      name: 'Kimi K2',
      description: 'Moonshot AI Kimi K2模型',
      maxTokens: 8000,
      supportsFunctions: true
    }
  ]
};


// 简化：只使用OpenRouter作为AI供应商
export const AI_PROVIDERS: AIProvider[] = [
  OPENROUTER_PROVIDER
];

// 根据供应商ID获取供应商配置
export function getProviderById(providerId: string): AIProvider | undefined {
  return AI_PROVIDERS.find(provider => provider.id === providerId);
}

// 根据模型ID获取供应商和模型信息
export function getProviderAndModelById(modelId: string): { provider: AIProvider; model: AIModel } | undefined {
  for (const provider of AI_PROVIDERS) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) {
      return { provider, model };
    }
  }
  return undefined;
}

// 获取所有可用模型（简化显示，不显示供应商名称）
export function getAllAvailableModels(): Array<{ value: string; label: string; provider: string }> {
  const models: Array<{ value: string; label: string; provider: string }> = [];
  
  // 只有OpenRouter一个供应商，直接显示模型名称
  const provider = OPENROUTER_PROVIDER;
  for (const model of provider.models) {
    models.push({
      value: model.id,
      label: model.name, // 简化：不显示供应商名称
      provider: provider.id
    });
  }
  
  return models;
}

// 默认供应商配置
export const DEFAULT_PROVIDER_CONFIG = {
  defaultProvider: 'openrouter',
  fallbackProvider: 'openrouter'
};