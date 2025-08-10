'use client';

import { useState, useEffect } from 'react';
import { getWorkAnalysisAction, generateIntelligentWeeklyReportAction, getProductivityInsightsAction } from '@/lib/actions';
import type { WorkAnalysis } from '@/types/index';


interface ProductivityInsights extends WorkAnalysis {
  weeklyStats: {
    thisWeek: number;
    lastWeek: number;
    growth: number;
  };
  totalEntries: number;
  averageImportance: number;
}

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState<'analysis' | 'report' | 'insights'>('analysis');
  const [workAnalysis, setWorkAnalysis] = useState<WorkAnalysis | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<string>('');
  const [insights, setInsights] = useState<ProductivityInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // 加载工作分析
  const loadWorkAnalysis = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getWorkAnalysisAction();
      if (result.success) {
        setWorkAnalysis(result.data);
      } else {
        setError(result.error || '加载分析失败');
      }
    } catch {
      setError('加载分析失败');
    } finally {
      setLoading(false);
    }
  };

  // 生成智能周报
  const generateReport = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateIntelligentWeeklyReportAction();
      if (result.success) {
        setWeeklyReport(result.report || '');
      } else {
        setError(result.error || '生成周报失败');
      }
    } catch {
      setError('生成周报失败');
    } finally {
      setLoading(false);
    }
  };

  // 加载综合洞察
  const loadInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getProductivityInsightsAction();
      if (result.success) {
        setInsights(result.data);
      } else {
        setError(result.error || '加载洞察失败');
      }
    } catch {
      setError('加载洞察失败');
    } finally {
      setLoading(false);
    }
  };

  // 根据活动tab加载数据
  useEffect(() => {
    switch (activeTab) {
      case 'analysis':
        if (!workAnalysis) loadWorkAnalysis();
        break;
      case 'report':
        if (!weeklyReport) generateReport();
        break;
      case 'insights':
        if (!insights) loadInsights();
        break;
    }
  }, [activeTab, workAnalysis, weeklyReport, insights]);

  const TabButton = ({ id, label, isActive }: { id: 'analysis' | 'report' | 'insights'; label: string; isActive: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">🧠 AI智能洞察</h2>
        <div className="flex gap-2">
          <TabButton id="analysis" label="工作分析" isActive={activeTab === 'analysis'} />
          <TabButton id="report" label="智能周报" isActive={activeTab === 'report'} />
          <TabButton id="insights" label="效率洞察" isActive={activeTab === 'insights'} />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">AI正在分析中...</span>
        </div>
      )}

      {/* 工作模式分析 */}
      {activeTab === 'analysis' && workAnalysis && !loading && (
        <div className="space-y-6">
          {/* 生产力洞察 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">💡 生产力洞察</h3>
            <ul className="space-y-1">
              {workAnalysis.productivity_insights.map((insight, index) => (
                <li key={index} className="text-blue-800 text-sm">• {insight}</li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 活跃时间分析 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">⏰ 活跃时间分布</h3>
              <div className="space-y-2">
                {workAnalysis.peakHours.slice(0, 5).map((hour) => (
                  <div key={hour.hour} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{hour.hour}:00 - {hour.hour + 1}:00</span>
                    <div className="flex items-center">
                      <div className="bg-blue-200 rounded-full h-2 mr-2" style={{ width: `${(hour.count / workAnalysis.peakHours[0].count) * 40}px` }}></div>
                      <span className="text-sm font-medium">{hour.count}次</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 项目分布 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">📊 项目关注度</h3>
              <div className="space-y-2">
                {workAnalysis.projectDistribution.slice(0, 5).map((project) => (
                  <div key={project.project} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">{project.project}</span>
                    <div className="flex items-center">
                      <div className="bg-green-200 rounded-full h-2 mr-2" style={{ width: `${project.percentage}px` }}></div>
                      <span className="text-sm font-medium">{project.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 重要度分布 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">⭐ 重要度分布</h3>
              <div className="space-y-2">
                {workAnalysis.importanceDistribution.map((importance) => (
                  <div key={importance.importance} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{'★'.repeat(importance.importance)} ({importance.importance}星)</span>
                    <div className="flex items-center">
                      <div className="bg-yellow-200 rounded-full h-2 mr-2" style={{ width: `${importance.percentage}px` }}></div>
                      <span className="text-sm font-medium">{importance.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 周模式 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">📅 工作日模式</h3>
              <div className="space-y-2">
                {workAnalysis.weeklyPattern.map((day) => (
                  <div key={day.day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.day}</span>
                    <div className="flex items-center">
                      <div className="bg-purple-200 rounded-full h-2 mr-2" style={{ width: `${(day.count / Math.max(...workAnalysis.weeklyPattern.map(d => d.count))) * 40}px` }}></div>
                      <span className="text-sm font-medium">{day.count}次</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 智能周报 */}
      {activeTab === 'report' && !loading && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">本周智能分析报告</h3>
            <button
              onClick={generateReport}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              🔄 重新生成
            </button>
          </div>

          {weeklyReport ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{weeklyReport}</pre>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              点击上方按钮生成本周智能报告
            </div>
          )}
        </div>
      )}

      {/* 效率洞察 */}
      {activeTab === 'insights' && insights && !loading && (
        <div className="space-y-6">
          {/* 关键指标 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{insights.totalEntries}</div>
              <div className="text-sm text-blue-800">总记录数</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{insights.weeklyStats.thisWeek}</div>
              <div className="text-sm text-green-800">本周记录</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{insights.averageImportance}</div>
              <div className="text-sm text-yellow-800">平均重要度</div>
            </div>
            <div className={`rounded-lg p-4 text-center ${insights.weeklyStats.growth >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className={`text-2xl font-bold ${insights.weeklyStats.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {insights.weeklyStats.growth > 0 ? '+' : ''}{insights.weeklyStats.growth}%
              </div>
              <div className={`text-sm ${insights.weeklyStats.growth >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                周增长率
              </div>
            </div>
          </div>

          {/* 生产力洞察 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
            <h3 className="font-medium text-purple-900 mb-3">🎯 个人效率分析</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-purple-800 mb-2">工作特点</h4>
                <ul className="space-y-1 text-sm text-purple-700">
                  {insights.productivity_insights.slice(0, 3).map((insight, index) => (
                    <li key={index}>• {insight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-purple-800 mb-2">优化建议</h4>
                <ul className="space-y-1 text-sm text-purple-700">
                  <li>• 充分利用{insights.peakHours[0]?.hour || '高效'}时段处理重要任务</li>
                  <li>• 保持{insights.weeklyStats.growth >= 0 ? '良好' : '稳定'}的记录习惯</li>
                  <li>• 适当调整重要度标记，提升优先级管理</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}