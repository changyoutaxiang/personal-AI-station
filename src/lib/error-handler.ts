/**
 * 统一错误处理工具
 * 提供标准化的错误处理、日志记录和用户反馈
 */

import { debug } from './debug';

export interface ErrorHandlerOptions {
  showUserMessage?: boolean;
  logToConsole?: boolean;
  duration?: number;
  context?: string;
}

export interface ErrorMessage {
  title: string;
  description: string;
  type: 'error' | 'warning' | 'info' | 'success';
}

/**
 * 标准化错误处理函数
 */
export function handleError(
  error: Error | string,
  setUserMessage: (message: string) => void,
  options: ErrorHandlerOptions = {}
): void {
  const {
    showUserMessage = true,
    logToConsole = true,
    duration = 3000,
    context = ''
  } = options;

  // 标准化错误信息
  const errorMessage = error instanceof Error ? error.message : error;
  const fullContext = context ? `[${context}] ` : '';

  // 记录错误日志
  if (logToConsole) {
    debug.error(`${fullContext}错误:`, error);
  }

  // 显示用户友好的错误信息
  if (showUserMessage) {
    const userMessage = getFriendlyErrorMessage(errorMessage);
    setUserMessage(`❌ ${userMessage}`);
    
    // 自动清除消息
    setTimeout(() => {
      setUserMessage('');
    }, duration);
  }
}

/**
 * 处理API响应错误
 */
export function handleApiError(
  response: { success: boolean; error?: string },
  setUserMessage: (message: string) => void,
  options: ErrorHandlerOptions = {}
): void {
  if (!response.success) {
    handleError(
      response.error || '操作失败，请重试',
      setUserMessage,
      options
    );
  }
}

/**
 * 显示成功消息
 */
export function showSuccessMessage(
  message: string,
  setUserMessage: (message: string) => void,
  duration: number = 3000
): void {
  setUserMessage(`✅ ${message}`);
  setTimeout(() => {
    setUserMessage('');
  }, duration);
}

/**
 * 显示警告消息
 */
export function showWarningMessage(
  message: string,
  setUserMessage: (message: string) => void,
  duration: number = 3000
): void {
  setUserMessage(`⚠️ ${message}`);
  setTimeout(() => {
    setUserMessage('');
  }, duration);
}

/**
 * 显示信息消息
 */
export function showInfoMessage(
  message: string,
  setUserMessage: (message: string) => void,
  duration: number = 3000
): void {
  setUserMessage(`ℹ️ ${message}`);
  setTimeout(() => {
    setUserMessage('');
  }, duration);
}

/**
 * 获取用户友好的错误信息
 */
function getFriendlyErrorMessage(error: string): string {
  // 常见错误映射
  const errorMap: Record<string, string> = {
    'Network Error': '网络连接失败，请检查网络设置',
    'Failed to fetch': '网络请求失败，请稍后重试',
    'Timeout': '请求超时，请检查网络连接',
    'Unauthorized': '登录已过期，请重新登录',
    'Forbidden': '权限不足，无法执行此操作',
    'Not Found': '请求的资源不存在',
    'Internal Server Error': '服务器内部错误，请稍后重试',
    'Bad Request': '请求参数错误，请检查输入',
    'validation failed': '输入数据验证失败，请检查格式',
    'duplicate entry': '数据已存在，请勿重复添加',
    'foreign key constraint': '关联数据不存在，请检查选择'
  };

  // 查找匹配的错误信息
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // 默认错误信息
  return '操作失败，请重试';
}

/**
 * 创建错误处理包装器
 */
export function withErrorHandler<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  setUserMessage: (message: string) => void,
  options: ErrorHandlerOptions = {}
): (...args: T) => Promise<R | null> {
  return async (...args: T): Promise<R | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)), setUserMessage, options);
      return null;
    }
  };
}

/**
 * 异步操作包装器，包含加载状态和错误处理
 */
export async function withLoadingAndError<T>(
  asyncFn: () => Promise<T>,
  setLoading: (loading: boolean) => void,
  setUserMessage: (message: string) => void,
  options: ErrorHandlerOptions & { successMessage?: string } = {}
): Promise<T | null> {
  setLoading(true);
  
  try {
    const result = await asyncFn();
    
    if (options.successMessage) {
      showSuccessMessage(options.successMessage, setUserMessage);
    }
    
    return result;
  } catch (error) {
    handleError(error instanceof Error ? error : new Error(String(error)), setUserMessage, options);
    return null;
  } finally {
    setLoading(false);
  }
}

/**
 * 表单验证错误处理
 */
export function handleValidationError(
  errors: Record<string, string>,
  setUserMessage: (message: string) => void
): void {
  const firstError = Object.values(errors)[0];
  if (firstError) {
    showWarningMessage(firstError, setUserMessage);
  }
}

/**
 * 网络状态检查
 */
export function checkNetworkStatus(): boolean {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return false;
  }
  return true;
}

/**
 * 重试机制
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError!;
}