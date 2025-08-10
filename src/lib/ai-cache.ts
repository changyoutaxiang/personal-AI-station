/**
 * AI响应缓存服务
 * 用于缓存AI API调用结果，减少重复请求，提升响应速度和降低成本
 */

import { debug } from '@/lib/debug';

interface CacheEntry {
  content: unknown;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  hash: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  size: number;
}

class AICacheService {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    size: 0
  };
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24小时默认缓存时间
  private readonly MAX_CACHE_SIZE = 1000; // 最大缓存条目数
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1小时清理一次过期缓存

  constructor() {
    // 启动定期清理任务
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    
    // 监听内存压力，在必要时清理缓存
    if (typeof window !== 'undefined') {
      window.addEventListener('memorypressure', () => {
        this.cleanup(true);
      });
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(functionName: string, content: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : '';
    const combined = `${functionName}:${content}:${paramString}`;
    
    // 使用简单的哈希算法生成键
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    
    return `ai:${functionName}:${Math.abs(hash)}`;
  }

  /**
   * 计算内容哈希值（用于去重）
   */
  private calculateHash(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString();
  }

  /**
   * 获取缓存数据
   */
  get<T>(functionName: string, content: string, params?: Record<string, unknown>): T | null {
    const key = this.generateCacheKey(functionName, content, params);
    const entry = this.cache.get(key);
    
    this.stats.totalRequests++;
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    this.stats.hits++;
    this.updateHitRate();
    
    debug.log(`AI缓存命中: ${functionName}, 键: ${key.substring(0, 50)}...`);
    return entry.content as T;
  }

  /**
   * 设置缓存数据
   */
  set<T>(
    functionName: string, 
    content: string, 
    response: T, 
    params?: Record<string, unknown>,
    customTTL?: number
  ): void {
    const key = this.generateCacheKey(functionName, content, params);
    const ttl = customTTL || this.DEFAULT_TTL;
    const hash = this.calculateHash(content);
    
    // 检查缓存大小限制
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictLRU();
    }
    
    const entry: CacheEntry = {
      content: response,
      timestamp: Date.now(),
      ttl,
      hash
    };
    
    this.cache.set(key, entry);
    this.stats.size = this.cache.size;
    
    debug.log(`AI缓存设置: ${functionName}, 键: ${key.substring(0, 50)}..., TTL: ${ttl / 1000 / 60}分钟`);
  }

  /**
   * 删除缓存数据
   */
  delete(functionName: string, content: string, params?: Record<string, unknown>): boolean {
    const key = this.generateCacheKey(functionName, content, params);
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.size = this.cache.size;
    }
    return deleted;
  }

  /**
   * 清理过期缓存
   */
  cleanup(force = false): number {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (force || now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    this.stats.size = this.cache.size;
    
    if (cleanedCount > 0) {
      debug.log(`AI缓存清理: 删除了 ${cleanedCount} 个过期条目`);
    }
    
    return cleanedCount;
  }

  /**
   * LRU淘汰策略
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
      debug.log('AI缓存LRU淘汰: 删除最旧的条目');
    }
  }

  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      size: this.cache.size
    };
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    debug.log('AI缓存已清空');
  }

  /**
   * 预热缓存（用于常用功能）
   */
  warmup(): void {
    // 这里可以添加一些常用的缓存项预加载
    debug.log('AI缓存预热完成');
  }

  /**
   * 获取缓存内容相似项（用于相似内容去重）
   */
  getSimilarContent(targetContent: string, threshold = 0.8): Array<{ content: string; similarity: number }> {
    const targetHash = this.calculateHash(targetContent);
    const similar: Array<{ content: string; similarity: number }> = [];
    
    for (const entry of this.cache.values()) {
      // 简单的哈希相似度比较
      const hashSimilarity = this.calculateHashSimilarity(targetHash, entry.hash);
      if (hashSimilarity >= threshold) {
        similar.push({
          content: entry.content as string,
          similarity: hashSimilarity
        });
      }
    }
    
    return similar.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * 计算哈希相似度（简化版本）
   */
  private calculateHashSimilarity(hash1: string, hash2: string): number {
    if (hash1 === hash2) return 1.0;
    
    // 简单的字符串相似度算法
    const len1 = hash1.length;
    const len2 = hash2.length;
    const maxLength = Math.max(len1, len2);
    
    let distance = 0;
    for (let i = 0; i < maxLength; i++) {
      if (hash1[i] !== hash2[i]) {
        distance++;
      }
    }
    
    return 1 - (distance / maxLength);
  }
}

// 创建全局缓存实例
const aiCache = new AICacheService();

// 导出缓存服务
export { aiCache, AICacheService };

// 导出类型
export type { CacheStats, CacheEntry };