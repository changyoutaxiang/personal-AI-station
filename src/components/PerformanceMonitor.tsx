'use client';

import { useState, useEffect } from 'react';
import { useEnergyMode } from '@/hooks/useEnergyMode';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  animationCount: number;
  renderTime: number;
}

const PerformanceMonitor = () => {
  const { isEcoMode } = useEnergyMode();
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    memoryUsage: 0,
    animationCount: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measurePerformance = () => {
      const currentTime = performance.now();
      frameCount++;

      // 每秒更新一次指标
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        // 获取内存使用情况（如果支持）
        let memoryUsage = 0;
        if ('memory' in performance) {
          const memory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
          memoryUsage = Math.round(memory.usedJSHeapSize / 1024 / 1024); // MB
        }

        // 计算活跃动画数量
        const animatedElements = document.querySelectorAll('[style*="animation"], .animate-');
        const animationCount = animatedElements.length;

        // 估算渲染时间
        const renderTime = Math.round(currentTime - lastTime);

        setMetrics({
          fps,
          memoryUsage,
          animationCount,
          renderTime
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(measurePerformance);
    };

    measurePerformance();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  const getPerformanceStatus = () => {
    if (metrics.fps >= 55) return { status: '优秀', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (metrics.fps >= 45) return { status: '良好', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (metrics.fps >= 30) return { status: '一般', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { status: '较差', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const performanceStatus = getPerformanceStatus();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 backdrop-blur-sm p-2 rounded-full hover:opacity-80 transition-all duration-200 z-50"
        style={{backgroundColor: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-border)'}}
        title="显示性能监控"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 backdrop-blur-md p-4 rounded-xl shadow-xl z-50 min-w-[280px]" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)', border: '1px solid var(--card-border)'}}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2">
          📊 性能监控
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-sm hover:opacity-80" style={{color: 'var(--text-secondary)'}}
        >
          ✕
        </button>
      </div>

      <div className="space-y-3">
        {/* 当前模式 */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{color: 'var(--text-muted)'}}>当前模式:</span>
          <span className="text-xs px-2 py-1 rounded-full" style={{
            backgroundColor: isEcoMode ? 'var(--tag-green-bg)' : 'var(--tag-blue-bg)',
            color: isEcoMode ? 'var(--tag-green-text)' : 'var(--tag-blue-text)',
            border: `1px solid ${isEcoMode ? 'var(--tag-green-border)' : 'var(--tag-blue-border)'}`
          }}>
            {isEcoMode ? '🌱 节能' : '⚡ 标准'}
          </span>
        </div>

        {/* FPS */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{color: 'var(--text-muted)'}}>帧率 (FPS):</span>
          <div className="flex items-center gap-2">
            <span className={`text-xs`} style={{color: 'var(--text-primary)'}}>
              {metrics.fps}
            </span>
            <span className={`text-xs px-1 py-0.5 rounded`} style={{
              backgroundColor: performanceStatus.status === '优秀' ? 'var(--tag-green-bg)' : performanceStatus.status === '良好' ? 'var(--tag-yellow-bg)' : performanceStatus.status === '一般' ? 'var(--tag-orange-bg)' : 'var(--tag-red-bg)',
              color: performanceStatus.status === '优秀' ? 'var(--tag-green-text)' : performanceStatus.status === '良好' ? 'var(--tag-yellow-text)' : performanceStatus.status === '一般' ? 'var(--tag-orange-text)' : 'var(--tag-red-text)',
              border: `1px solid ${performanceStatus.status === '优秀' ? 'var(--tag-green-border)' : performanceStatus.status === '良好' ? 'var(--tag-yellow-border)' : performanceStatus.status === '一般' ? 'var(--tag-orange-border)' : 'var(--tag-red-border)'}`
            }}>
              {performanceStatus.status}
            </span>
          </div>
        </div>

        {/* 内存使用 */}
        {metrics.memoryUsage > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{color: 'var(--text-muted)'}}>内存使用:</span>
        <span className="text-xs" style={{color: 'var(--text-primary)'}}>
              {metrics.memoryUsage} MB
            </span>
          </div>
        )}

        {/* 动画数量 */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{color: 'var(--text-muted)'}}>活跃动画:</span>
          <span className={`text-xs ${
            metrics.animationCount > 10 ? 'text-orange-400' : 'text-green-400'
          }`}>
            {metrics.animationCount}
          </span>
        </div>

        {/* 能耗估算 */}
        <div className="mt-3 pt-3 border-t" style={{borderColor: 'var(--card-border)'}}>
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{color: 'var(--text-muted)'}}>能耗估算:</span>
            <span className={`text-xs ${
              isEcoMode ? 'text-green-400' : 
              metrics.fps > 50 && metrics.animationCount > 8 ? 'text-red-400' :
              metrics.fps > 40 ? 'text-yellow-400' : 'text-green-400'
            }`}>
              {isEcoMode ? '低' : 
               metrics.fps > 50 && metrics.animationCount > 8 ? '高' :
               metrics.fps > 40 ? '中' : '低'}
            </span>
          </div>
        </div>

        {/* 优化建议 */}
        {!isEcoMode && (metrics.fps < 45 || metrics.animationCount > 10) && (
          <div className="mt-3 p-2 rounded text-xs" style={{backgroundColor: 'var(--tag-yellow-bg)', border: '1px solid var(--tag-yellow-border)'}}>
            <div className="text-yellow-300 mb-1">💡 优化建议:</div>
            <div className="text-yellow-200/80">
              {metrics.fps < 45 && '• 帧率较低，建议启用节能模式'}
              {metrics.animationCount > 10 && '• 动画过多，可能影响性能'}
            </div>
          </div>
        )}

        {/* 节能模式效果 */}
        {isEcoMode && (
          <div className="mt-3 p-2 rounded text-xs" style={{backgroundColor: 'var(--tag-green-bg)', border: '1px solid var(--tag-green-border)'}}>
            <div className="mb-1" style={{color: 'var(--tag-green-text)'}}>✅ 节能效果:</div>
            <div style={{color: 'var(--text-primary)'}}>
              • 动画简化，减少GPU负担<br/>
              • 模糊效果降低，节省渲染资源<br/>
              • 交互效果优化，延长电池续航
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;