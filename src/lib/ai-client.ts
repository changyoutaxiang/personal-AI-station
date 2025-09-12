/**
 * 统一AI客户端
 * 支持多供应商（OpenRouter、智谱GLM、DeepSeek）的AI调用
 */

import { getProviderAndModelById, getProviderById } from './ai-providers';
import { getAIProvider } from './db';
import { debug } from './debug';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRequest {
  model: string;
  messages: AIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface AIResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
      reasoning?: string; // 某些模型（如deepseek-r1）的思维链字段
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  error?: {
    message: string;
    type: string;
    code: string;
  };
}

export interface AIClientOptions {
  timeout?: number; // 超时时间（毫秒）
  maxRetries?: number; // 最大重试次数
  retryDelay?: number; // 重试延迟（毫秒）
}

/**
 * 统一AI客户端类
 */
export class AIClient {
  private defaultOptions: AIClientOptions = {
    timeout: 30000, // 30秒超时
    maxRetries: 3,
    retryDelay: 1000
  };

  constructor(private options: AIClientOptions = {}) {
    this.options = { ...this.defaultOptions, ...options };
  }

  /**
   * 发送AI请求
   */
  async chat(request: AIRequest): Promise<AIResponse> {
    const { model, messages, ...otherParams } = request;
    
    // 根据模型ID获取供应商信息
    const providerInfo = getProviderAndModelById(model);
    if (!providerInfo) {
      throw new Error(`未找到模型 ${model} 对应的供应商配置`);
    }

    const { provider, model: modelInfo } = providerInfo;
    
    // 从数据库获取供应商配置（API密钥等）
    const dbProviderConfig = getAIProvider(provider.id);
    if (!dbProviderConfig || !dbProviderConfig.is_enabled) {
      throw new Error(`供应商 ${provider.name} 未启用或配置不存在`);
    }

    // 获取API密钥
    const apiKey = this.getApiKey(provider.apiKeyEnvVar, dbProviderConfig.api_key);
    if (!apiKey) {
      throw new Error(`供应商 ${provider.name} 的API密钥未配置`);
    }

    // 使用自定义端点或默认端点
    const apiEndpoint = dbProviderConfig.api_endpoint || provider.apiEndpoint;

    // 构建请求体
    const requestBody = this.buildRequestBody(provider.id, model, messages, otherParams);

    // 构建请求头
    const headers = this.buildHeaders(provider.id, apiKey);

    // 发送请求
    return this.sendRequest(apiEndpoint, headers, requestBody);
  }

  /**
   * 获取API密钥
   */
  private getApiKey(envVarName: string, dbApiKey?: string): string | undefined {
    // 优先使用数据库中的API密钥，如果没有则使用环境变量
    return dbApiKey || process.env[envVarName];
  }

  /**
   * 构建请求体
   */
  private buildRequestBody(providerId: string, model: string, messages: AIMessage[], otherParams: any): any {
    const baseBody = {
      model,
      messages,
      ...otherParams
    };

    // 根据不同供应商调整请求格式
    switch (providerId) {
      case 'zhipu':
        // 智谱GLM的特殊处理
        return {
          ...baseBody,
          // 智谱GLM可能需要特殊的参数格式
        };
      
      case 'deepseek':
        // DeepSeek的特殊处理
        return {
          ...baseBody,
          // DeepSeek可能需要特殊的参数格式
        };
      
      case 'openrouter':
      default:
        // OpenRouter和默认格式
        return baseBody;
    }
  }

  /**
   * 构建请求头
   */
  private buildHeaders(providerId: string, apiKey: string): Record<string, string> {
    const baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };

    // 根据不同供应商添加特殊头部
    switch (providerId) {
      case 'openrouter':
        return {
          ...baseHeaders,
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': 'Digital Brain'
        };
      
      case 'zhipu':
        return {
          ...baseHeaders,
          // 智谱GLM可能需要特殊的头部
        };
      
      case 'deepseek':
        return {
          ...baseHeaders,
          // DeepSeek可能需要特殊的头部
        };
      
      default:
        return baseHeaders;
    }
  }

  /**
   * 发送HTTP请求
   */
  private async sendRequest(url: string, headers: Record<string, string>, body: any): Promise<AIResponse> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < (this.options.maxRetries || 3); attempt++) {
      try {
        debug.log(`🚀 发送AI请求到: ${url}`);
        debug.log(`🚀 请求头:`, headers);
        debug.log(`🚀 请求体:`, JSON.stringify(body, null, 2).slice(0, 500));
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.options.timeout || 30000);

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          debug.error(`❌ API请求失败: ${response.status} ${response.statusText}`);
          debug.error(`❌ 错误响应内容:`, errorText.slice(0, 500));
          throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText.slice(0, 200)}`);
        }

        const responseText = await response.text();
        debug.log(`✅ API响应状态: ${response.status}`);
        debug.log(`✅ 响应内容预览:`, responseText.slice(0, 200));
        
        let data: AIResponse;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          debug.error(`❌ JSON解析失败:`, parseError);
          debug.error(`❌ 原始响应:`, responseText);
          throw new Error(`API返回格式错误，不是有效的JSON: ${responseText.slice(0, 200)}`);
        }

        if (data.error) {
          throw new Error(data.error.message);
        }

        if (!data.choices || data.choices.length === 0) {
          throw new Error('API返回数据格式错误');
        }

        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        debug.error(`AI请求失败 (尝试 ${attempt + 1}/${this.options.maxRetries}):`, lastError);
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < (this.options.maxRetries || 3) - 1) {
          await new Promise(resolve => setTimeout(resolve, this.options.retryDelay || 1000));
        }
      }
    }

    throw lastError || new Error('AI请求失败');
  }
}

// 创建默认客户端实例
export const aiClient = new AIClient();

/**
 * 便捷的聊天完成函数
 */
export async function chatCompletion(opts: {
  messages: AIMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}): Promise<{ success: boolean; content?: string; tokensUsed?: number; error?: string }> {
  try {
    const { model = 'moonshotai/kimi-k2', messages, ...otherParams } = opts;
    
    const response = await aiClient.chat({
      model,
      messages,
      ...otherParams
    });

    // 获取响应内容，优先使用content，如果为空则尝试reasoning
    let responseText = response.choices[0].message.content.trim();
    
    if (!responseText && response.choices[0].message.reasoning) {
      responseText = response.choices[0].message.reasoning.trim();
    }

    return {
      success: true,
      content: responseText,
      tokensUsed: response.usage?.total_tokens
    };

  } catch (error) {
    debug.error('Chat completion 失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Chat completion 服务暂时不可用'
    };
  }
}

/**
 * 获取模型的供应商信息
 */
export function getModelProvider(modelId: string) {
  return getProviderAndModelById(modelId);
}

/**
 * 检查模型是否可用
 */
export async function isModelAvailable(modelId: string): Promise<boolean> {
  try {
    const providerInfo = getProviderAndModelById(modelId);
    if (!providerInfo) {
      return false;
    }

    const { provider } = providerInfo;
    const dbProviderConfig = getAIProvider(provider.id);
    
    return !!(dbProviderConfig && dbProviderConfig.is_enabled);
  } catch (error) {
    debug.error('检查模型可用性失败:', error);
    return false;
  }
}