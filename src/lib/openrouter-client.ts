/**
 * OpenRouter API客户端
 * 提供超时控制、重试策略和错误处理
 */

import { debug } from './debug';

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string[];
}

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
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

export interface OpenRouterOptions {
  timeout?: number; // 超时时间（毫秒）
  maxRetries?: number; // 最大重试次数
  retryDelay?: number; // 重试延迟（毫秒）
  retryBackoff?: boolean; // 是否使用指数退避
}

export class OpenRouterClient {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  private defaultOptions: Required<OpenRouterOptions>;

  constructor(apiKey: string, options: OpenRouterOptions = {}) {
    this.apiKey = apiKey;
    this.defaultOptions = {
      timeout: 30000, // 30秒默认超时
      maxRetries: 3, // 默认重试3次
      retryDelay: 1000, // 默认延迟1秒
      retryBackoff: true // 默认使用指数退避
    };
    
    // 合并用户选项
    Object.assign(this.defaultOptions, options);
  }

  /**
   * 发送聊天完成请求
   */
  async chatCompletion(
    request: OpenRouterRequest,
    options: OpenRouterOptions = {}
  ): Promise<{ content: string; tokensUsed: number }> {
    const mergedOptions = { ...this.defaultOptions, ...options };
    
    let lastError: Error = new Error('未知错误');
    let attempt = 0;
    
    while (attempt <= mergedOptions.maxRetries) {
      try {
        const result = await this.makeRequest(request, mergedOptions, attempt);
        
        // 解析响应
        const choice = result.choices?.[0];
        if (!choice || !choice.message) {
          throw new Error('AI返回数据格式错误');
        }
        
        return {
          content: choice.message.content,
          tokensUsed: result.usage?.total_tokens || 0
        };
        
      } catch (error) {
        lastError = error as Error;
        
        // 检查是否应该重试
        if (!this.shouldRetry(error as Error, attempt, mergedOptions.maxRetries)) {
          break;
        }
        
        // 计算延迟时间
        const delay = this.calculateDelay(attempt, mergedOptions);
        debug.warn(`OpenRouter请求失败，${delay}ms后重试 (${attempt + 1}/${mergedOptions.maxRetries + 1}):`, error);
        
        await this.sleep(delay);
        attempt++;
      }
    }
    
    // 所有重试都失败了
    throw new Error(`OpenRouter请求失败: ${lastError.message}`);
  }

  /**
   * 发送HTTP请求
   */
  private async makeRequest(
    request: OpenRouterRequest,
    options: Required<OpenRouterOptions>,
    attempt: number
  ): Promise<OpenRouterResponse> {
    // 创建取消控制器
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, options.timeout);
    
    try {
      // 请求头
      const headers = {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'Digital Brain AI Assistant'
      };
      
      // 发送请求
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // 检查HTTP状态
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // 忽略JSON解析错误，使用HTTP状态信息
        }
        
        throw new Error(errorMessage);
      }
      
      // 解析响应
      const data: OpenRouterResponse = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      
      return data;
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      const err = error as Error;
      
      // 处理不同类型的错误
      if (err.name === 'AbortError') {
        throw new Error(`请求超时 (${options.timeout}ms)`);
      }
      
      if (err instanceof TypeError && err.message.includes('fetch')) {
        throw new Error('网络连接失败');
      }
      
      throw error;
    }
  }

  /**
   * 判断是否应该重试
   */
  private shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) {
      return false;
    }
    
    // 不重试的错误类型
    const nonRetriableErrors = [
      '未授权', 'unauthorized', '401',
      '禁止', 'forbidden', '403',
      '不存在', 'not found', '404',
      '请求过大', 'too large', '413',
      '请求频率', 'rate limit', '429'
    ];
    
    const errorMessage = error.message.toLowerCase();
    for (const nonRetriable of nonRetriableErrors) {
      if (errorMessage.includes(nonRetriable)) {
        return false;
      }
    }
    
    // 重试的错误类型
    const retriableErrors = [
      '超时', 'timeout',
      '网络', 'network',
      '服务器', 'server', '500', '502', '503', '504',
      '连接', 'connection'
    ];
    
    for (const retriable of retriableErrors) {
      if (errorMessage.includes(retriable)) {
        return true;
      }
    }
    
    // 默认重试
    return true;
  }

  /**
   * 计算重试延迟时间
   */
  private calculateDelay(attempt: number, options: Required<OpenRouterOptions>): number {
    if (!options.retryBackoff) {
      return options.retryDelay;
    }
    
    // 指数退避：每次重试延迟时间翻倍，加上随机抖动
    const baseDelay = options.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * 0.1 * baseDelay; // 10%的随机抖动
    
    return Math.min(baseDelay + jitter, 30000); // 最大30秒
  }

  /**
   * 睡眠函数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 验证模型名称
   */
  static validateModel(model: string): boolean {
    // 基本的模型名称格式验证
    const validFormat = /^[a-zA-Z0-9_\-\/]+$/;
    return validFormat.test(model) && model.length > 0 && model.length < 100;
  }

  /**
   * 清理和验证消息内容
   */
  static sanitizeMessages(messages: OpenRouterMessage[]): OpenRouterMessage[] {
    return messages.map(message => ({
      ...message,
      content: message.content.trim().substring(0, 10000) // 限制单条消息长度
    })).filter(message => message.content.length > 0); // 过滤空消息
  }

  /**
   * 估算token数量（粗略估算）
   */
  static estimateTokens(text: string): number {
    // 中文：1个字符约等于1个token
    // 英文：1个单词约等于1-2个token
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    const others = text.length - chineseChars - englishWords;
    
    return chineseChars + englishWords * 1.5 + others * 0.5;
  }
}

/**
 * 创建默认的OpenRouter客户端实例
 */
export function createOpenRouterClient(options?: OpenRouterOptions): OpenRouterClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY环境变量未设置');
  }
  
  return new OpenRouterClient(apiKey, options);
}

/**
 * 便捷的聊天完成函数
 */
export async function simpleChatCompletion(
  model: string,
  messages: OpenRouterMessage[],
  options?: Partial<OpenRouterRequest & OpenRouterOptions>
): Promise<{ content: string; tokensUsed: number }> {
  const client = createOpenRouterClient({
    timeout: options?.timeout,
    maxRetries: options?.maxRetries,
    retryDelay: options?.retryDelay,
    retryBackoff: options?.retryBackoff
  });

  // 验证和清理输入
  if (!OpenRouterClient.validateModel(model)) {
    throw new Error('无效的模型名称');
  }
  
  const cleanMessages = OpenRouterClient.sanitizeMessages(messages);
  if (cleanMessages.length === 0) {
    throw new Error('消息列表不能为空');
  }

  const request: OpenRouterRequest = {
    model,
    messages: cleanMessages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.max_tokens || 2000,
    top_p: options?.top_p,
    frequency_penalty: options?.frequency_penalty,
    presence_penalty: options?.presence_penalty,
    stop: options?.stop
  };

  return client.chatCompletion(request, options);
}

/**
 * 流式聊天完成函数
 */
export async function streamChatCompletion(
  model: string,
  messages: OpenRouterMessage[],
  onChunk: (chunk: string, done: boolean) => void,
  options?: Partial<OpenRouterRequest & OpenRouterOptions>
): Promise<{ totalTokens: number }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY环境变量未设置');
  }

  // 验证和清理输入
  if (!OpenRouterClient.validateModel(model)) {
    throw new Error('无效的模型名称');
  }
  
  const cleanMessages = OpenRouterClient.sanitizeMessages(messages);
  if (cleanMessages.length === 0) {
    throw new Error('消息列表不能为空');
  }

  const requestBody = {
    model,
    messages: cleanMessages,
    temperature: options?.temperature || 0.7,
    max_tokens: options?.max_tokens || 2000,
    stream: true, // 关键：启用流式输出
    top_p: options?.top_p,
    frequency_penalty: options?.frequency_penalty,
    presence_penalty: options?.presence_penalty,
    stop: options?.stop
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Digital Brain AI Assistant'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  if (!response.body) {
    throw new Error('响应中没有流数据');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let totalTokens = 0;
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        onChunk('', true); // 通知完成
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 保留最后一行（可能不完整）

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        
        const data = trimmed.slice(6); // 移除 'data: ' 前缀
        if (data === '[DONE]') {
          onChunk('', true);
          return { totalTokens };
        }

        try {
          const parsed = JSON.parse(data);
          
          // 提取内容
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content, false);
          }
          
          // 提取 token 信息
          if (parsed.usage?.total_tokens) {
            totalTokens = parsed.usage.total_tokens;
          }
        } catch (error) {
          // 忽略解析错误，继续处理下一个数据块
          console.warn('解析流数据失败:', error);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return { totalTokens };
}
