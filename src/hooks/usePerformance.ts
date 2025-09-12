import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export function useCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  const get = useCallback((cacheKey: string): T | null => {
    const entry = cache.get(cacheKey);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      cache.delete(cacheKey);
      setCache(new Map(cache));
      return null;
    }

    return entry.data;
  }, [cache]);

  const set = useCallback((cacheKey: string, data: T, customTtl?: number) => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: customTtl || ttl,
    };
    
    const newCache = new Map(cache);
    newCache.set(cacheKey, entry);
    setCache(newCache);
  }, [cache, ttl]);

  const invalidate = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      const newCache = new Map(cache);
      newCache.delete(cacheKey);
      setCache(newCache);
    } else {
      setCache(new Map());
    }
  }, [cache]);

  return { get, set, invalidate };
}

// 防抖钩子
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

// 懒加载钩子
export function useLazyLoader<T>(
  loadFn: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [loadFn]);

  useEffect(() => {
    load();
  }, dependencies);

  return { data, loading, error, reload: load };
}

// 虚拟滚动钩子
export function useVirtualScroll<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}