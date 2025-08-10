/**
 * 通用API调用Hook
 * 提供标准化的API请求、错误处理和状态管理
 */

import { useState, useCallback } from 'react';
import { useMessage } from './useMessage';
import { handleError } from '@/lib/error-handler';
import type { ApiResponse } from '@/lib/api-utils';

export interface UseApiOptions {
  showLoading?: boolean;
  showUserMessage?: boolean;
  context?: string;
  successMessage?: string;
  immediate?: boolean;
}

export interface UseApiState<T> {
  data: T | null | undefined;
  loading: boolean;
  error: string | null;
}

/**
 * 通用API调用Hook
 */
export function useApi<T = unknown>(
  apiFn: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const {
    showLoading = true,
    showUserMessage = true,
    context = '',
    successMessage,
    immediate = false
  } = options;

  const { showError, showSuccess } = useMessage();
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (): Promise<T | null> => {
    if (showLoading) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      const response = await apiFn();

      if (!response.success) {
        throw new Error(response.error || '操作失败');
      }

      setState(prev => ({
        ...prev,
        data: response.data,
        loading: false,
        error: null
      }));

      if (showUserMessage && successMessage) {
        showSuccess(successMessage);
      }

      return response.data || null;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      if (showUserMessage) {
        handleError(error instanceof Error ? error : new Error(String(error)), showError, { context });
      }

      return null;
    }
  }, [apiFn, showLoading, showUserMessage, context, successMessage, showError, showSuccess]);

  // 立即执行
  if (immediate) {
    execute();
  }

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null })
  };
}

/**
 * 创建API调用Hook
 */
export function createApiHook<T = unknown>(
  apiFn: () => Promise<ApiResponse<T>>,
  defaultOptions: UseApiOptions = {}
) {
  return (options: UseApiOptions = {}) => {
    return useApi<T>(apiFn, { ...defaultOptions, ...options });
  };
}

/**
 * 多个API并行调用Hook
 */
export function useParallelApi<T = unknown>(
  apiFns: Array<() => Promise<ApiResponse<T>>>,
  options: UseApiOptions = {}
) {
  const {
    showLoading = true,
    showUserMessage = true,
    context = '',
    successMessage
  } = options;

  const { showError, showSuccess } = useMessage();
  const [state, setState] = useState<{
    data: (T | null)[];
    loading: boolean;
    errors: (string | null)[];
  }>({
    data: new Array(apiFns.length).fill(null),
    loading: false,
    errors: new Array(apiFns.length).fill(null)
  });

  const execute = useCallback(async (): Promise<(T | null)[]> => {
    if (showLoading) {
      setState(prev => ({
        ...prev,
        loading: true,
        errors: new Array(apiFns.length).fill(null)
      }));
    }

    try {
      const promises = apiFns.map(fn => fn());
      const responses = await Promise.allSettled(promises);

      const data: (T | null)[] = [];
      const errors: (string | null)[] = [];

      responses.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          const response = result.value;
          if (response.success) {
            data[index] = response.data || null;
            errors[index] = null;
          } else {
            data[index] = null;
            errors[index] = response.error || '操作失败';
          }
        } else {
          data[index] = null;
          errors[index] = result.reason.message || '操作失败';
        }
      });

      setState(prev => ({
        ...prev,
        data,
        loading: false,
        errors
      }));

      const hasErrors = errors.some(error => error !== null);
      if (hasErrors && showUserMessage) {
        const errorMessages = errors.filter(e => e !== null).join(', ');
        showError(`部分操作失败: ${errorMessages}`);
      } else if (!hasErrors && showUserMessage && successMessage) {
        showSuccess(successMessage);
      }

      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '操作失败';
      
      setState(prev => ({
        ...prev,
        loading: false,
        errors: new Array(apiFns.length).fill(errorMessage)
      }));

      if (showUserMessage) {
        handleError(error instanceof Error ? error : new Error(String(error)), showError, { context });
      }

      return new Array(apiFns.length).fill(null);
    }
  }, [apiFns, showLoading, showUserMessage, context, successMessage, showError, showSuccess]);

  return {
    ...state,
    execute,
    reset: () => setState({
      data: new Array(apiFns.length).fill(null),
      loading: false,
      errors: new Array(apiFns.length).fill(null)
    })
  };
}

/**
 * 顺序API调用Hook（前一个成功后调用下一个）
 */
export function useSequentialApi<T = unknown>(
  apiFns: Array<() => Promise<ApiResponse<T>>>,
  options: UseApiOptions = {}
) {
  const {
    showLoading = true,
    showUserMessage = true,
    context = '',
    successMessage
  } = options;

  const { showError, showSuccess } = useMessage();
  const [state, setState] = useState<{
    data: (T | null)[];
    loading: boolean;
    errors: (string | null)[];
    currentIndex: number;
  }>({
    data: new Array(apiFns.length).fill(null),
    loading: false,
    errors: new Array(apiFns.length).fill(null),
    currentIndex: 0
  });

  const execute = useCallback(async (): Promise<(T | null)[]> => {
    if (showLoading) {
      setState(prev => ({
        ...prev,
        loading: true,
        currentIndex: 0,
        errors: new Array(apiFns.length).fill(null)
      }));
    }

    const data: (T | null)[] = [];
    const errors: (string | null)[] = [];

    for (let i = 0; i < apiFns.length; i++) {
      try {
        setState(prev => ({ ...prev, currentIndex: i }));
        
        const response = await apiFns[i]();
        
        if (response.success) {
          data[i] = response.data || null;
          errors[i] = null;
        } else {
          data[i] = null;
          errors[i] = response.error || '操作失败';
          break; // 遇到错误停止执行
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '操作失败';
        data[i] = null;
        errors[i] = errorMessage;
        break; // 遇到错误停止执行
      }
    }

    setState(prev => ({
      ...prev,
      data,
      loading: false,
      errors,
      currentIndex: data.length
    }));

    const hasErrors = errors.some(error => error !== null);
    if (hasErrors && showUserMessage) {
      const errorMessages = errors.filter(e => e !== null).join(', ');
      showError(`操作失败: ${errorMessages}`);
    } else if (!hasErrors && showUserMessage && successMessage) {
      showSuccess(successMessage);
    }

    return data;
  }, [apiFns, showLoading, showUserMessage, successMessage, showError, showSuccess]);

  return {
    ...state,
    execute,
    reset: () => setState({
      data: new Array(apiFns.length).fill(null),
      loading: false,
      errors: new Array(apiFns.length).fill(null),
      currentIndex: 0
    })
  };
}