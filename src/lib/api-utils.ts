/**
 * 统一API调用工具
 * 提供标准化的API请求、错误处理和响应处理
 */

import { handleError, withLoadingAndError } from './error-handler';

export interface ApiOptions {
  showLoading?: boolean;
  showUserMessage?: boolean;
  context?: string;
  successMessage?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 通用API请求函数
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  apiOptions: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const {
    showUserMessage = true
  } = apiOptions;

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    if (showUserMessage) {
      // 这里需要传入setUserMessage，但我们没有这个函数
      // 在实际使用时，可以通过withErrorHandler包装
      console.error('API请求失败:', error);
    }
    throw error;
  }
}

/**
 * GET请求
 */
export async function apiGet<T = unknown>(
  endpoint: string,
  apiOptions: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'GET' }, apiOptions);
}

/**
 * POST请求
 */
export async function apiPost<T = unknown>(
  endpoint: string,
  data: unknown,
  apiOptions: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
    apiOptions
  );
}

/**
 * PUT请求
 */
export async function apiPut<T = unknown>(
  endpoint: string,
  data: unknown,
  apiOptions: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(
    endpoint,
    {
      method: 'PUT',
      body: JSON.stringify(data),
    },
    apiOptions
  );
}

/**
 * DELETE请求
 */
export async function apiDelete<T = unknown>(
  endpoint: string,
  apiOptions: ApiOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(endpoint, { method: 'DELETE' }, apiOptions);
}

/**
 * 创建带错误处理的API调用函数
 */
export function createApiCall<T = unknown>(
  apiFn: () => Promise<ApiResponse<T>>,
  setUserMessage: (message: string) => void,
  setLoading?: (loading: boolean) => void,
  options: ApiOptions = {}
): () => Promise<T | null> {
  const wrappedFn = async () => {
    const response = await apiFn();
    
    if (!response.success) {
      handleError(
        response.error || '操作失败',
        setUserMessage,
        { context: options.context }
      );
      return null;
    }
    
    if (options.successMessage) {
      setUserMessage(`✅ ${options.successMessage}`);
      setTimeout(() => setUserMessage(''), 3000);
    }
    
    return response.data || null;
  };

  if (setLoading) {
    return () => withLoadingAndError(
      wrappedFn,
      setLoading,
      setUserMessage,
      { context: options.context }
    );
  }

  return wrappedFn;
}

/**
 * 批量API请求
 */
export async function batchApiRequest<T = unknown>(
  requests: Array<{ endpoint: string; options?: RequestInit; apiOptions?: ApiOptions }>
): Promise<ApiResponse<T>[]> {
  const responses = await Promise.allSettled(
    requests.map(req => apiRequest<T>(req.endpoint, req.options || {}, req.apiOptions || {}))
  );

  return responses.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        success: false,
        error: `请求 ${index + 1} 失败: ${result.reason.message}`
      };
    }
  });
}

/**
 * API响应验证
 */
export function validateApiResponse<T>(
  response: ApiResponse<T>,
  requiredFields: (keyof T)[] = []
): { isValid: boolean; error?: string } {
  if (!response.success) {
    return { isValid: false, error: response.error };
  }

  if (!response.data) {
    return { isValid: false, error: '响应数据为空' };
  }

  for (const field of requiredFields) {
    if (response.data && typeof response.data === 'object' && !(field in response.data)) {
      return { isValid: false, error: `缺少必需字段: ${String(field)}` };
    }
  }

  return { isValid: true };
}

/**
 * 缓存API请求
 */
const apiCache = new Map<string, { data: ApiResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

export async function cachedApiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
  apiOptions: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const cacheKey = `${endpoint}_${JSON.stringify(options)}`;
  const cached = apiCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as ApiResponse<T>;
  }

  const response = await apiRequest<T>(endpoint, options, apiOptions);
  
  if (response.success) {
    apiCache.set(cacheKey, { data: response, timestamp: Date.now() });
  }

  return response;
}

/**
 * 清除API缓存
 */
export function clearApiCache(endpoint?: string): void {
  if (endpoint) {
    // 清除特定端点的缓存
    for (const [key] of apiCache) {
      if (key.startsWith(endpoint)) {
        apiCache.delete(key);
      }
    }
  } else {
    // 清除所有缓存
    apiCache.clear();
  }
}