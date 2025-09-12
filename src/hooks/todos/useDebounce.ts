import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

// 防抖API调用Hook
export function useDebouncedApi<T>(
  apiCall: () => Promise<T>,
  delay: number = 300
) {
  const [loading, setLoading] = useState(false);
  const debouncedCall = useDebounceCallback(async () => {
    try {
      setLoading(true);
      await apiCall();
    } finally {
      setLoading(false);
    }
  }, delay);

  return { debouncedCall, loading };
}