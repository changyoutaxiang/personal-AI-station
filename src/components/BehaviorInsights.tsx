'use client';

import { useState, useEffect } from 'react';
import { getBehaviorStats } from '@/lib/behavior-tracker';
import { BehaviorPattern, Insight } from '@/types/behavior';
import { debug } from '@/lib/debug';
import EmptyState from './ui/EmptyState';

export default function BehaviorInsights() {
  const [stats, setStats] = useState<{
    totalEvents: number;
    eventsByType: { [key: string]: number };
    dailyActivity: { [date: string]: number };
    mostActiveHour: number;
  } | null>(null);
  const [patterns, setPatterns] = useState<BehaviorPattern[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const behaviorStats = await getBehaviorStats(); // 获取行为统计数据
      setPatterns(behaviorStats.patterns);
      setInsights(behaviorStats.insights);
      // 设置默认统计数据
      setStats({
        totalEvents: 0,
        eventsByType: {},
        dailyActivity: {},
        mostActiveHour: 9
      });
    } catch (error) {
      debug.error('加载行为统计失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalysis = async () => {
    setAnalysisLoading(true);
    try {
      const response = await fetch('/api/behavior-analysis');
      const result = await response.json();
      
      if (result.success) {
        setPatterns(result.data.patterns || []);
        setInsights(result.data.insights || []);
      }
    } catch (error) {
      debug.error('加载行为分析失败:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadAnalysis();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-neutral-600">加载行为数据中...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">📊 行为洞察</h3>
        <EmptyState 
          type="behavior"
          size="medium"
          description="开始使用系统，我们将为您生成个性化的行为洞察"
          action={{
            label: '开始使用',
            onClick: () => {
              // 导航到记录管理页面
              const recordsTab = document.querySelector('[data-tab="records"]');
              if (recordsTab) {
                (recordsTab as HTMLElement).click();
              }
            },
            icon: '🚀'
          }}
        />
      </div>
    );
  }

  // 事件类型的中文映射
  const eventTypeNames: { [key: string]: string } = {
    'page_view': '页面访问',
    'content_create': '内容创建',
    'content_edit': '内容编辑',

    'ai_interaction': 'AI交互',
    'tag_usage': '标签使用',
    'focus_session': '专注会话'
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-neutral-800 mb-6">📊 行为洞察（最近7天）</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* 总事件数 */}
        <div className="bg-primary-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-primary-600">{stats.totalEvents}</div>
          <div className="text-sm text-primary-700">总交互次数</div>
        </div>

        {/* 最活跃时段 */}
        <div className="bg-success-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-success-600">{stats.mostActiveHour}:00</div>
          <div className="text-sm text-success-700">最活跃时段</div>
        </div>

        {/* 活跃天数 */}
        <div className="bg-warning-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-warning-600">
            {Object.keys(stats.dailyActivity).length}
          </div>
          <div className="text-sm text-warning-700">活跃天数</div>
        </div>

        {/* 交互类型数 */}
        <div className="bg-accent-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-accent-600">
            {Object.keys(stats.eventsByType).length}
          </div>
          <div className="text-sm text-accent-700">功能使用种类</div>
        </div>
      </div>

      {/* 事件类型分布 */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-neutral-700 mb-3">功能使用分布</h4>
        <div className="space-y-2">
          {Object.entries(stats.eventsByType)
            .sort(([,a], [,b]) => b - a) // 按数量排序
            .slice(0, 6) // 只显示前6个
            .map(([type, count]) => {
              const percentage = Math.round((count / stats.totalEvents) * 100);
              return (
                <div key={type} className="flex items-center">
                  <div className="w-20 text-sm text-neutral-600">
                    {eventTypeNames[type] || type}
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-neutral-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-12 text-sm text-neutral-500 text-right">
                    {count}次
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 每日活动趋势 */}
      <div>
        <h4 className="text-md font-semibold text-neutral-700 mb-3">每日活动趋势</h4>
        <div className="flex items-end justify-between space-x-1 h-20">
          {Object.entries(stats.dailyActivity)
            .sort(([a], [b]) => a.localeCompare(b)) // 按日期排序
            .slice(-7) // 最近7天
            .map(([date, count]) => {
              const maxCount = Math.max(...Object.values(stats.dailyActivity));
              const height = Math.max(1, (count / maxCount) * 100);
              return (
                <div key={date} className="flex flex-col items-center flex-1">
                  <div 
                    className="bg-primary-600 rounded-t w-full min-h-[4px] transition-all duration-300"
                    style={{ height: `${height}%` }}
                    title={`${date}: ${count}次活动`}
                  ></div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {date.split('-')[2]}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 行为模式分析 */}
      {patterns.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-neutral-700 mb-3">发现的行为模式</h4>
          <div className="space-y-3">
            {patterns.slice(0, 3).map((pattern) => (
              <div key={pattern.id} className="bg-neutral-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-neutral-800">{pattern.pattern_name}</h5>
                    <p className="text-sm text-neutral-600 mt-1">{pattern.pattern_data.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-primary-600">
                        置信度: {Math.round(pattern.pattern_data.confidence * 100)}%
                      </span>
                      <span className="text-xs text-success-600">
                        强度: {Math.round(pattern.strength * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      pattern.pattern_type === 'temporal' ? 'bg-primary-100 text-primary-700' :
                      pattern.pattern_type === 'content' ? 'bg-success-100 text-success-700' :
                      'bg-accent-100 text-accent-700'
                    }`}>
                      {pattern.pattern_type === 'temporal' ? '时间' :
                       pattern.pattern_type === 'content' ? '内容' : '交互'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 智能洞察 */}
      {insights.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-semibold text-neutral-700 mb-3">智能洞察</h4>
          <div className="space-y-3">
            {insights.slice(0, 2).map((insight) => (
              <div key={insight.id} className="border-l-4 border-primary-500 bg-primary-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-neutral-800 flex items-center">
                      {insight.insight_type === 'pattern' && '🔍'}
                      {insight.insight_type === 'trend' && '📈'}
                      {insight.insight_type === 'warning' && '⚠️'}
                      {insight.insight_type === 'opportunity' && '💡'}
                      <span className="ml-2">{insight.title}</span>
                    </h5>
                    <p className="text-sm text-neutral-700 mt-1">{insight.description}</p>
                    {insight.suggested_actions && insight.suggested_actions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-neutral-600 mb-1">建议行动:</p>
                        <ul className="text-xs text-neutral-600 space-y-1">
                          {insight.suggested_actions.slice(0, 2).map((action, index) => (
                            <li key={index} className="flex items-start">
                              <span className="mr-1">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      insight.impact_level === 'high' ? 'bg-error-100 text-error-700' :
                      insight.impact_level === 'medium' ? 'bg-warning-100 text-warning-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {insight.impact_level === 'high' ? '高影响' :
                       insight.impact_level === 'medium' ? '中影响' : '低影响'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 刷新按钮 */}
      <div className="mt-6 text-center space-x-3">
        <button
          onClick={loadStats}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 text-sm"
        >
          {loading ? '刷新中...' : '刷新数据'}
        </button>
        <button
          onClick={loadAnalysis}
          disabled={analysisLoading}
          className="px-4 py-2 bg-success-600 text-white rounded-lg hover:bg-success-700 disabled:opacity-50 text-sm"
        >
          {analysisLoading ? '分析中...' : '深度分析'}
        </button>
      </div>
    </div>
  );
}