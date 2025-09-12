'use client';

import { useState } from 'react';
import EmptyState from './ui/EmptyState';
import { debug } from '@/lib/debug';

interface WeeklyReportData {
  summary: string;
  highlights: string[];
  insights: string[];
  recommendations: string[];
}

interface WeeklyReportProps {
  className?: string;
}

export default function WeeklyReport({ className = '' }: WeeklyReportProps) {
  const [report, setReport] = useState<WeeklyReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/weekly-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setReport(result.report);
      } else {
        setError(result.error || '生成周报失败');
      }
    } catch (err) {
      setError('网络请求失败');
      debug.error('周报生成错误:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-neutral-800">📊 综合智能周报</h2>
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? '生成中...' : '生成综合周报'}
        </button>
      </div>
      
      {/* 数据源说明 */}
      <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-700">
          🔗 <strong>数据源升级</strong>：现在整合了<span className="font-medium">工作记录</span>和<span className="font-medium">待办任务</span>两大数据源，提供更全面的工作分析
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md border border-error-200">
          ❌ {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <p className="mt-2 text-neutral-600">AI正在综合分析你的工作记录和任务完成情况...</p>
          <p className="text-sm text-neutral-500 mt-1">整合记录数据 + 待办任务 + 完成率分析</p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-4">
          {/* 总结 */}
          <div>
            <h3 className="text-lg font-medium text-neutral-800 mb-2">📋 本周概况</h3>
            <p className="text-neutral-700 bg-neutral-50 p-3 rounded-md">{report.summary}</p>
          </div>

          {/* 重点内容 */}
          {report.highlights.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">✨ 重点数据</h3>
              <ul className="space-y-1">
                {report.highlights.map((highlight, index) => (
                  <li key={index} className="text-neutral-700 flex items-start">
                    <span className="text-primary-500 mr-2">•</span>
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI洞察 */}
          {report.insights.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">🧠 AI分析</h3>
              <div className="space-y-2">
                {report.insights.map((insight, index) => (
                  <p key={index} className="text-neutral-700 bg-primary-50 p-3 rounded-md border-l-4 border-primary-400">
                    {insight}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* 建议 */}
          {report.recommendations.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-neutral-800 mb-2">💡 改进建议</h3>
              <ul className="space-y-2">
                {report.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-neutral-700 bg-success-50 p-3 rounded-md border-l-4 border-success-400">
                    <span className="text-success-600 mr-2">💡</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!report && !loading && !error && (
        <EmptyState 
          type="weekly-report"
          size="medium"
          title="暂无综合报告数据"
          description="添加工作记录和待办任务，AI将为您生成包含完成率分析的智能工作报告"
          action={{
            label: '生成综合周报',
            onClick: generateReport
          }}
        />
      )}
    </div>
  );
}