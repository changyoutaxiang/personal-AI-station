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

// 智谱GLM 供应商配置
const ZHIPU_GLM_PROVIDER: AIProvider = {
  id: 'zhipu',
  name: '智谱GLM',
  description: '智谱AI官方GLM模型服务',
  apiEndpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  requiresApiKey: true,
  apiKeyEnvVar: 'ZHIPU_API_KEY',
  models: [
    {
      id: 'glm-4.5',
      name: 'GLM-4.5',
      description: '智谱最新GLM-4.5模型，性能全面升级',
      maxTokens: 8000,
      supportsFunctions: true
    },
    {
      id: 'glm-4.5-air',
      name: 'GLM-4.5 Air',
      description: '智谱GLM-4.5轻量版本，速度更快',
      maxTokens: 8000,
      supportsFunctions: true
    }
  ]
};

// DeepSeek 供应商配置
const DEEPSEEK_PROVIDER: AIProvider = {
  id: 'deepseek',
  name: 'DeepSeek',
  description: 'DeepSeek官方AI模型服务 - V3.1最新版本',
  apiEndpoint: 'https://api.deepseek.com/chat/completions',
  requiresApiKey: true,
  apiKeyEnvVar: 'DEEPSEEK_API_KEY',
  models: [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek V3.1 Chat',
      description: 'DeepSeek V3.1对话模型，支持128K上下文',
      maxTokens: 128000,
      supportsFunctions: true
    },
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek V3.1 Reasoner',
      description: 'DeepSeek V3.1推理模型，具备深度思维链能力',
      maxTokens: 128000,
      supportsFunctions: true
    }
  ]
};

// 所有可用的AI供应商
export const AI_PROVIDERS: AIProvider[] = [
  OPENROUTER_PROVIDER,
  ZHIPU_GLM_PROVIDER,
  DEEPSEEK_PROVIDER
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

// 获取所有可用模型（扁平化列表，用于向后兼容）
export function getAllAvailableModels(): Array<{ value: string; label: string; provider: string }> {
  const models: Array<{ value: string; label: string; provider: string }> = [];
  
  for (const provider of AI_PROVIDERS) {
    for (const model of provider.models) {
      models.push({
        value: model.id,
        label: `${model.name} (${provider.name})`,
        provider: provider.id
      });
    }
  }
  
  return models;
}

// 默认供应商配置
export const DEFAULT_PROVIDER_CONFIG = {
  defaultProvider: 'openrouter',
  fallbackProvider: 'openrouter'
};