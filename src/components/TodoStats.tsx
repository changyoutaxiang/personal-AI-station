'use client';

import type { TodoStats as TodoStatsType } from '@/types/index';

interface TodoStatsProps {
  stats: TodoStatsType;
  timeScope: 'daily' | 'weekly' | 'monthly';
}

export default function TodoStatsComponent({ stats, timeScope }: TodoStatsProps) {
  if (!stats) return null;

  const timeScopeConfig = {
    daily: { label: '今日', icon: '📅' },
    weekly: { label: '本周', icon: '📊' },
    monthly: { label: '本月', icon: '🗓️' }
  };

  const config = timeScopeConfig[timeScope];
  const completionRate = Math.round(stats.completion_rate);

  // 圆环进度条计算
  const circumference = 2 * Math.PI * 28; // 半径28
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="glass-card p-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">{config.icon}</span>
        <h3 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          📊 {config.label}统计
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        {/* 完成率圆环图 */}
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 64 64">
              {/* 背景圆环 */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-gray-200"
              />
              {/* 进度圆环 */}
              <circle
                cx="32"
                cy="32"
                r="28"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`transition-all duration-1000 ease-out ${
                  completionRate >= 80 ? 'text-green-500' :
                  completionRate >= 50 ? 'text-blue-500' :
                  completionRate >= 25 ? 'text-orange-500' : 'text-red-500'
                }`}
                strokeLinecap="round"
              />
            </svg>
            {/* 百分比文字 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                {completionRate}%
              </span>
            </div>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>完成率</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {stats.completed}/{stats.total}
          </p>
        </div>

        {/* 任务总数 */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)' }}>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--flow-blue)' }}>{stats.total}</div>
            </div>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>总任务</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            全部任务数量
          </p>
        </div>

        {/* 进行中任务 */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)' }}>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-warning)' }}>{stats.in_progress}</div>
            </div>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>进行中</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            🚀 正在执行
          </p>
        </div>

        {/* 待处理任务 */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(100, 116, 139, 0.1)' }}>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>{stats.pending}</div>
            </div>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>待处理</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            ⏳ 等待开始
          </p>
        </div>

        {/* 已完成任务 */}
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-success)' }}>{stats.completed}</div>
            </div>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>已完成</p>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            ✅ 圆满完成
          </p>
        </div>
      </div>

      {/* 优先级分布 */}
      <div className="mt-8 pt-6 border-t" style={{ borderTopColor: 'var(--card-border)' }}>
        <h4 className="text-sm font-semibold mb-4 flex items-center" style={{ color: 'var(--text-secondary)' }}>
          <span className="mr-2">🎯</span>
          优先级分布
        </h4>
        
        <div className="space-y-3">
          {/* 高优先级 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
              <span className="text-sm flex items-center" style={{ color: 'var(--text-secondary)' }}>
                <span className="mr-1">🔥</span>
                高优先级
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-primary)' }}>
                {stats.by_priority.high}
              </span>
              <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--text-error)',
                    width: stats.total > 0 ? `${(stats.by_priority.high / stats.total) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* 中优先级 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
              <span className="text-sm flex items-center" style={{ color: 'var(--text-secondary)' }}>
                <span className="mr-1">⚡</span>
                中优先级
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-primary)' }}>
                {stats.by_priority.medium}
              </span>
              <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--text-warning)',
                    width: stats.total > 0 ? `${(stats.by_priority.medium / stats.total) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* 低优先级 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <span className="text-sm flex items-center" style={{ color: 'var(--text-secondary)' }}>
                <span className="mr-1">🌱</span>
                低优先级
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-primary)' }}>
                {stats.by_priority.low}
              </span>
              <div className="w-20 rounded-full h-2" style={{ backgroundColor: 'rgba(100, 116, 139, 0.2)' }}>
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    backgroundColor: 'var(--text-success)',
                    width: stats.total > 0 ? `${(stats.by_priority.low / stats.total) * 100}%` : '0%' 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 效率提示 */}
      <div className="mt-6 pt-4 border-t" style={{ borderTopColor: 'var(--card-border)' }}>
        <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.05), rgba(99, 102, 241, 0.05))' }}>
          <div className="flex items-start">
            <span className="text-lg mr-3">💡</span>
            <div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>效率提示</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {completionRate >= 80 && '🎉 完成率很高！继续保持这种高效状态。'}
                {completionRate >= 50 && completionRate < 80 && '👍 进展不错！可以考虑优先处理高优先级任务。'}
                {completionRate >= 25 && completionRate < 50 && '⚡ 需要加把劲！建议专注于进行中的任务。'}
                {completionRate < 25 && '🚀 刚刚开始！建议先完成一些简单的任务建立节奏。'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}