'use client';

import { useState, useEffect } from 'react';
import { CognitiveProfile, PerformanceMetrics } from '@/types/behavior';
import { debug } from '@/lib/debug';

export default function UserProfile() {
  const [profile, setProfile] = useState<CognitiveProfile | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user-profile');
      const result = await response.json();
      
      if (result.success) {
        setProfile(result.data.profile);
        setMetrics(result.data.metrics);
      }
    } catch (error) {
      debug.error('加载用户画像失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-neutral-600">生成用户画像中...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-neutral-800 mb-4">👤 个人画像</h3>
        <div className="text-center py-8">
          <div className="text-neutral-400 text-6xl mb-4">🎯</div>
          <p className="text-neutral-600 mb-4">需要更多使用数据来生成您的个人画像</p>
          <button
            onClick={loadProfile}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm"
          >
            重新生成画像
          </button>
        </div>
      </div>
    );
  }

  const { work_patterns, information_processing, decision_making, interest_evolution, cognitive_load } = profile.profile_data;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-neutral-800">👤 个人认知画像</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-neutral-500">
            置信度: {Math.round(profile.confidence_score * 100)}%
          </span>
          <button
            onClick={loadProfile}
            disabled={loading}
            className="px-3 py-1 text-xs bg-neutral-100 text-neutral-600 rounded hover:bg-neutral-200 disabled:opacity-50"
          >
            更新
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 工作模式 */}
        <div className="space-y-4">
          <h4 className="font-medium text-neutral-800 flex items-center">
            ⏰ 工作模式
          </h4>
          
          <div className="bg-primary-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600">高峰时段</div>
                <div className="font-medium">
                  {work_patterns.peak_hours.map(h => `${h}:00`).join(', ')}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">偏好会话时长</div>
                <div className="font-medium">{work_patterns.preferred_session_length} 分钟</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">休息频率</div>
                <div className="font-medium">每 {Math.round(60 / work_patterns.break_frequency)} 分钟</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">多任务倾向</div>
                <div className={`font-medium ${
                  work_patterns.multitasking_tendency > 0.7 ? 'text-error-600' :
                  work_patterns.multitasking_tendency > 0.3 ? 'text-warning-600' : 'text-success-600'
                }`}>
                  {work_patterns.multitasking_tendency > 0.7 ? '高' :
                   work_patterns.multitasking_tendency > 0.3 ? '中' : '低'} 
                  ({Math.round(work_patterns.multitasking_tendency * 100)}%)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 信息处理偏好 */}
        <div className="space-y-4">
          <h4 className="font-medium text-neutral-800 flex items-center">
            📚 信息处理偏好
          </h4>
          
          <div className="bg-success-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600">阅读速度</div>
                <div className="font-medium">{information_processing.reading_speed} 字/分钟</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">偏好内容长度</div>
                <div className="font-medium">{information_processing.preferred_content_length} 字</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">视觉偏好</div>
                <div className="font-medium">
                  {information_processing.visual_vs_text_preference > 0.2 ? '偏视觉' :
                   information_processing.visual_vs_text_preference < -0.2 ? '偏文本' : '均衡'}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">细节导向</div>
                <div className={`font-medium ${
                  information_processing.detail_orientation > 0.7 ? 'text-primary-600' :
                  information_processing.detail_orientation > 0.3 ? 'text-neutral-600' : 'text-error-600'
                }`}>
                  {information_processing.detail_orientation > 0.7 ? '高度细致' :
                   information_processing.detail_orientation > 0.3 ? '适度关注' : '大局观'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 决策风格 */}
        <div className="space-y-4">
          <h4 className="font-medium text-neutral-800 flex items-center">
            🎯 决策风格
          </h4>
          
          <div className="bg-accent-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-neutral-600">决策速度</div>
                <div className="font-medium">
                  {decision_making.decision_speed === 'fast' ? '快速决策' :
                   decision_making.decision_speed === 'deliberate' ? '深思熟虑' : '灵活变通'}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">信息寻求</div>
                <div className="font-medium">
                  {Math.round(decision_making.information_seeking * 100)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">风险承受</div>
                <div className={`font-medium ${
                  decision_making.risk_tolerance > 0.7 ? 'text-error-600' :
                  decision_making.risk_tolerance > 0.3 ? 'text-warning-600' : 'text-success-600'
                }`}>
                  {decision_making.risk_tolerance > 0.7 ? '偏好冒险' :
                   decision_making.risk_tolerance > 0.3 ? '适度风险' : '谨慎保守'}
                </div>
              </div>
              <div>
                <div className="text-sm text-neutral-600">协作倾向</div>
                <div className="font-medium">
                  {Math.round(decision_making.collaboration_preference * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 兴趣分析 */}
        <div className="space-y-4">
          <h4 className="font-medium text-neutral-800 flex items-center">
            🌟 兴趣分析
          </h4>
          
          <div className="bg-warning-50 rounded-lg p-4">
            <div className="space-y-3">
              <div>
                <div className="text-sm text-neutral-600 mb-2">当前主要关注</div>
                <div className="flex flex-wrap gap-2">
                  {interest_evolution.current_topics.slice(0, 3).map((topic, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-warning-200 text-warning-800 rounded-full text-xs"
                    >
                      {topic.topic} ({Math.round(topic.interest_level * 100)}%)
                    </span>
                  ))}
                </div>
              </div>
              
              {interest_evolution.emerging_interests.length > 0 && (
                <div>
                  <div className="text-sm text-neutral-600 mb-2">新兴兴趣</div>
                  <div className="flex flex-wrap gap-2">
                    {interest_evolution.emerging_interests.slice(0, 2).map((interest, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-success-200 text-success-800 rounded-full text-xs"
                      >
                        📈 {interest}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <div className="text-sm text-neutral-600">兴趣稳定性</div>
                <div className="flex items-center">
                  <div className="flex-1 bg-neutral-200 rounded-full h-2 mr-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${interest_evolution.stability_score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {Math.round(interest_evolution.stability_score * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 认知负荷分析 */}
      <div className="mt-6 bg-neutral-50 rounded-lg p-4">
        <h4 className="font-medium text-neutral-800 mb-3 flex items-center">
          🧠 认知负荷分析
        </h4>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">
              {cognitive_load.average_daily_entries}
            </div>
            <div className="text-xs text-neutral-600">日均记录</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">
              {Math.round(cognitive_load.information_density_preference * 100)}%
            </div>
            <div className="text-xs text-neutral-600">信息密度偏好</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-error-600">
              {Math.round(cognitive_load.context_switching_frequency * 100)}%
            </div>
            <div className="text-xs text-neutral-600">上下文切换频率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent-600">
              {Math.round(cognitive_load.optimal_complexity_level * 100)}%
            </div>
            <div className="text-xs text-neutral-600">最佳复杂度</div>
          </div>
        </div>
      </div>

      {/* 性能指标 */}
      {metrics && (
        <div className="mt-6 bg-accent-50 rounded-lg p-4">
          <h4 className="font-medium text-neutral-800 mb-3 flex items-center">
            📈 近期表现指标
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold text-accent-600">
                {Math.round(metrics.metrics.productivity_score * 100)}%
              </div>
              <div className="text-xs text-neutral-600">生产力评分</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-primary-600">
                {Math.round(metrics.metrics.focus_ratio * 100)}%
              </div>
              <div className="text-xs text-neutral-600">专注比例</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-success-600">
                {Math.round(metrics.metrics.creativity_indicators * 100)}%
              </div>
              <div className="text-xs text-neutral-600">创造力指标</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-error-600">
                {Math.round(metrics.metrics.stress_indicators * 100)}%
              </div>
              <div className="text-xs text-neutral-600">压力指标</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 text-xs text-neutral-500 text-center">
        画像基于最近30天的使用数据生成 • 最后更新: {new Date(profile.last_updated).toLocaleString('zh-CN')}
      </div>
    </div>
  );
}