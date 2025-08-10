'use client';

import { useState, useEffect } from 'react';
import { aiCache, CacheStats } from '@/lib/ai-cache';

interface CacheMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const CacheMonitor = ({ isVisible = false, onToggle }: CacheMonitorProps) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (isVisible) {
      // 每秒更新一次统计信息
      const interval = setInterval(() => {
        setStats(aiCache.getStats());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 70) return 'text-green-400';
    if (hitRate >= 50) return 'text-yellow-400';
    if (hitRate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getHitRateStatus = (hitRate: number) => {
    if (hitRate >= 70) return { status: '优秀', bg: 'bg-green-500/20' };
    if (hitRate >= 50) return { status: '良好', bg: 'bg-yellow-500/20' };
    if (hitRate >= 30) return { status: '一般', bg: 'bg-orange-500/20' };
    return { status: '较差', bg: 'bg-red-500/20' };
  };

  
  const handleClearCache = () => {
    aiCache.clear();
    setStats(aiCache.getStats());
  };

  const handleResetStats = () => {
    aiCache.resetStats();
    setStats(aiCache.getStats());
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-20 right-4 backdrop-blur-sm p-2 rounded-full transition-all duration-200 z-40"
        style={{ backgroundColor: 'var(--tag-purple-bg)', color: 'var(--tag-purple-text)', border: '1px solid var(--tag-purple-border)' }}
        title="显示AI缓存监控"
      >
        🧠
      </button>
    );
  }

  if (!stats) return null;

  const hitRateStatus = getHitRateStatus(stats.hitRate);

  return (
    <div className="fixed bottom-20 right-4 backdrop-blur-md p-4 rounded-xl shadow-xl z-40 min-w-[320px] max-w-[400px]" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)', border: '1px solid var(--card-border)'}}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          🧠 AI缓存监控
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs hover:opacity-80" style={{color: 'var(--text-secondary)'}}
            title={expanded ? '收起' : '展开'}
          >
            {expanded ? '−' : '+'}
          </button>
          <button
            onClick={onToggle}
            className="text-sm hover:opacity-80" style={{color: 'var(--text-secondary)'}}
          >
            ✕
          </button>
        </div>
      </div>

      {/* 核心统计 */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="rounded-lg p-2" style={{backgroundColor: 'var(--card-glass)'}}>
            <div className="text-xs" style={{color: 'var(--text-muted)'}}>缓存命中率</div>
          <div className="flex items-center gap-1">
            <span className={`text-sm font-medium ${getHitRateColor(stats.hitRate)}`}>
              {stats.hitRate.toFixed(1)}%
            </span>
            <span className={`text-xs px-1 py-0.5 rounded ${hitRateStatus.bg} ${getHitRateColor(stats.hitRate)}`}>
              {hitRateStatus.status}
            </span>
          </div>
        </div>

        <div className="rounded-lg p-2" style={{backgroundColor: 'var(--card-glass)'}}>
            <div className="text-xs" style={{color: 'var(--text-muted)'}}>缓存大小</div>
          <div className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
            {stats.size} 项
          </div>
        </div>

        <div className="rounded-lg p-2" style={{backgroundColor: 'var(--card-glass)'}}>
          <div className="text-xs" style={{color: 'var(--text-muted)'}}>总请求数</div>
          <div className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>
            {stats.totalRequests}
          </div>
        </div>

        <div className="rounded-lg p-2" style={{backgroundColor: 'var(--card-glass)'}}>
          <div className="text-xs" style={{color: 'var(--text-muted)'}}>命中/未命中</div>
          <div className="text-xs">
            <span style={{color: 'var(--tag-green-text)'}}>{stats.hits}</span>
            <span style={{color: 'var(--text-muted)'}}> / </span>
            <span style={{color: 'var(--tag-red-text)'}}>{stats.misses}</span>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      {expanded && (
        <div className="space-y-3 border-t pt-3" style={{borderColor: 'var(--card-border)'}}>
          {/* 性能指标 */}
          <div className="rounded-lg p-3" style={{backgroundColor: 'var(--tag-blue-bg)', border: '1px solid var(--tag-blue-border)'}}>
            <div className="text-xs mb-2" style={{color: 'var(--tag-blue-text)'}}>📊 性能指标</div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span style={{color: 'var(--text-muted)'}}>预估节省时间:</span>
                <span className="text-green-300">
                  ~{(stats.hits * 2).toFixed(0)}秒
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{color: 'var(--text-muted)'}}>预估节省成本:</span>
                <span className="text-yellow-300">
                  ~${(stats.hits * 0.002).toFixed(3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{color: 'var(--text-muted)'}}>平均响应提升:</span>
                <span className="text-purple-300">
                  {stats.totalRequests > 0 ? ((stats.hitRate / 100) * 80).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 缓存建议 */}
          <div className="rounded-lg p-3" style={{backgroundColor: 'var(--tag-green-bg)', border: '1px solid var(--tag-green-border)'}}>
            <div className="text-xs mb-2" style={{color: 'var(--tag-green-text)'}}>💡 优化建议</div>
            <div className="text-xs text-green-200/80 space-y-1">
              {stats.hitRate >= 70 && (
                <div>✅ 缓存效果优秀，继续保持</div>
              )}
              {stats.hitRate >= 50 && stats.hitRate < 70 && (
                <div>⚠️ 缓存效果良好，可适当调整TTL</div>
              )}
              {stats.hitRate < 50 && (
                <div>🔧 缓存命中率偏低，建议检查缓存策略</div>
              )}
              {stats.size > 800 && (
                <div>📦 缓存接近上限，将自动清理</div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <button
              onClick={handleClearCache}
              className="flex-1 text-xs py-2 px-3 rounded transition-colors"
              style={{backgroundColor: 'var(--tag-red-bg)', color: 'var(--tag-red-text)', border: '1px solid var(--tag-red-border)'}}
            >
              清空缓存
            </button>
            <button
              onClick={handleResetStats}
              className="flex-1 text-xs py-2 px-3 rounded transition-colors"
              style={{backgroundColor: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-border)'}}
            >
              重置统计
            </button>
          </div>
        </div>
      )}

      {/* 状态指示器 */}
      <div className="mt-3 pt-3 border-t" style={{borderColor: 'var(--card-border)'}}>
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{color: 'var(--text-muted)'}}>缓存状态:</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              stats.hitRate >= 50 ? 'bg-green-400' : 
              stats.hitRate >= 30 ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            <span className="text-xs">
              {stats.hitRate >= 50 ? '高效运行' : 
               stats.hitRate >= 30 ? '正常运行' : '需要优化'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheMonitor;