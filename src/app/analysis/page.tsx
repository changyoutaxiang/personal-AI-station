'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, MessageCircle, CheckSquare, Code, Settings, FolderKanban, CalendarDays, BookOpen } from 'lucide-react';
import { fetchEntries, generateDailyReport } from '@/lib/actions';
import type { Entry } from '@/types/index';
import { debug } from '@/lib/debug';
import { Animated } from '@/components/animations';
// import EmptyState from '@/components/ui/EmptyState'; // TODO: 未使用，暂时注释

// 懒加载组件
const WeeklyReport = lazy(() => import('@/components/WeeklyReport'));

// 加载状态组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderBottomColor: 'var(--flow-primary)'}}></div>
    <span className="ml-3" style={{color: 'var(--text-secondary)'}}>加载中...</span>
  </div>
);

// 分析Tab定义（简化版）
const AnalysisTabs = {
  DAILY_REPORT: 'daily-report',
  WEEKLY_REPORT: 'weekly-report'
} as const;

type AnalysisTab = typeof AnalysisTabs[keyof typeof AnalysisTabs];

// 内部组件处理搜索参数
function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<AnalysisTab>(AnalysisTabs.DAILY_REPORT);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [dailyReport, setDailyReport] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);

  // 导航配置
  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      label: '对话',
      href: '/agent',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: CheckSquare,
      label: '待办',
      href: '/todos',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: FolderKanban,
      label: '项目',
      href: '/projects',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Code,
      label: 'HTML渲染',
      href: '/html-renderer',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  // Tab配置（简化版）
  const tabConfig = [
    {
      id: AnalysisTabs.DAILY_REPORT,
      label: '智能日报',
      icon: CalendarDays,
      description: '生成每日记录报告'
    },
    {
      id: AnalysisTabs.WEEKLY_REPORT,
      label: '智能周报',
      icon: BookOpen,
      description: 'AI分析周度工作总结'
    }
  ];

  // 处理URL参数
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && Object.values(AnalysisTabs).includes(tab as AnalysisTab)) {
      setActiveTab(tab as AnalysisTab);
    }
  }, [searchParams]);

  useEffect(() => {
    loadEntries();
  }, []);

  // Tab切换处理
  const handleTabChange = (tabId: AnalysisTab) => {
    setActiveTab(tabId);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', tabId);
    router.replace(url.toString());
  };

  const loadEntries = async () => {
    try {
      const result = await fetchEntries();
      if (result.success && result.data) {
        setEntries(result.data);
        debug.log('加载记录成功:', result.data.length);
      }
    } catch (error) {
      debug.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const result = await generateDailyReport();
      if (result.success && result.data) {
        // 处理新的返回格式
        if (typeof result.data === 'string') {
          // 向后兼容旧格式
          setDailyReport(result.data);
        } else if (result.data.type === 'simple' || result.data.type === 'fallback') {
          // 简单格式或回退格式
          setDailyReport(result.data.content || '报告内容为空');
        } else if (result.data.type === 'ai_enhanced' && result.data.analysis) {
          // AI增强格式 - 转换为可读文本
          const analysis = result.data.analysis;
          const reportText = `# ${analysis.date} AI智能日报

## 📊 执行总结
${analysis.executive_summary}

## 🎯 核心成就
${analysis.key_achievements.map((achievement: string, index: number) => `${index + 1}. ${achievement}`).join('\n')}

## 📈 效率分析
**完成率评估**: ${analysis.efficiency_analysis?.completion_rate_assessment || '暂无'}
**时间分配**: ${analysis.efficiency_analysis?.time_allocation || '暂无'}  
**精力管理**: ${analysis.efficiency_analysis?.energy_management || '暂无'}

## 💡 关键洞察
${analysis.insights.map((insight: string, index: number) => `${index + 1}. ${insight}`).join('\n')}

${analysis.bottlenecks && analysis.bottlenecks.length > 0 ? `## ⚠️ 发现瓶颈
${analysis.bottlenecks.map((bottleneck: string, index: number) => `${index + 1}. ${bottleneck}`).join('\n')}` : ''}

## 🚀 明日优化
**优先关注**: ${analysis.tomorrow_optimization?.priority_focus || '暂无'}
**方法建议**: ${analysis.tomorrow_optimization?.method_suggestions || '暂无'}
**习惯调整**: ${analysis.tomorrow_optimization?.habit_adjustments || '暂无'}

## ✅ 行动建议
${analysis.actionable_tips.map((tip: string, index: number) => `${index + 1}. ${tip}`).join('\n')}

---
*由AI智能分析生成 - ${new Date().toLocaleString('zh-CN')}*`;
          setDailyReport(reportText);
        } else {
          setDailyReport('未知的报告格式');
        }
        
        // 显示警告信息（如果有）
        if (typeof result.data === 'object' && result.data.warning) {
          debug.log('⚠️ 日报生成警告:', result.data.warning);
        }
      }
    } catch (error) {
      debug.error('生成日报失败:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const getEntriesForDate = (date: string) => {
    return entries.filter(entry => {
      if (!entry.created_at) return false;
      const entryDate = new Date(entry.created_at).toISOString().split('T')[0];
      return entryDate === date;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const generateReportForDate = async (date: string) => {
    setGeneratingReport(true);
    try {
      const dateEntries = getEntriesForDate(date);
      if (dateEntries.length === 0) {
        setDailyReport(`# ${formatDate(date)} 日报\n\n今天没有记录任何内容。`);
        return;
      }

      const reportContent = `# ${formatDate(date)} 日报\n\n## 今日记录 (${dateEntries.length}条)\n\n${dateEntries.map((entry, index) => 
        `### ${index + 1}. ${entry.daily_report_tag || '记录'}\n${entry.content}\n\n**标签**: ${entry.project_tag || '无'} | ${entry.effort_tag || '无'}\n---`
      ).join('\n\n')}`;

      setDailyReport(reportContent);
    } catch (error) {
      debug.error('生成日期报告失败:', error);
    } finally {
      setGeneratingReport(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('已复制到剪贴板');
    });
  };

  const getRecentDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = getEntriesForDate(today);
    const reportTags: Record<string, number> = {};
    const projectTags: Record<string, number> = {};
    
    entries.forEach(entry => {
      const tag = entry.daily_report_tag || '未分类';
      reportTags[tag] = (reportTags[tag] || 0) + 1;
      
      const project = entry.project_tag || '未分类';
      projectTags[project] = (projectTags[project] || 0) + 1;
    });

    return {
      totalEntries: entries.length,
      todayEntries: todayEntries.length,
      reportTags,
      projectTags,
      recentEntries: entries.slice(0, 10)
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4" style={{borderColor: 'var(--card-border)', borderTopColor: 'var(--flow-primary)'}}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs animate-pulse" style={{color: 'var(--text-secondary)'}}>📊</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--background)' }}>
      {/* 右上角导航 */}
      <nav className="absolute top-6 right-6 z-20">
        <div className="flex gap-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`group relative p-3 rounded-xl backdrop-blur-md border transition-all duration-300 hover:scale-105`}
                style={{
                  backgroundColor: 'var(--card-glass)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)'
                }}
                title={item.label}
              >
                <IconComponent className="w-5 h-5" />
                
                {/* 悬停提示 */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            📊 分析中心
          </h1>
          <p className="text-lg mb-6" style={{ color: 'var(--text-secondary)' }}>
            深度洞察你的记录数据，获得全方位分析报告
          </p>

          {/* Tab导航 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabConfig.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl backdrop-blur-sm border transition-all duration-300 ${
                    activeTab === tab.id 
                      ? 'shadow-lg scale-105' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.id 
                      ? 'var(--flow-primary)' 
                      : 'var(--card-glass)',
                    borderColor: activeTab === tab.id 
                      ? 'var(--flow-primary)' 
                      : 'var(--card-border)',
                    color: activeTab === tab.id 
                      ? 'white' 
                      : 'var(--text-primary)'
                  }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white/80"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab内容区域 */}
        <div className="space-y-6">
          {/* 智能日报 Tab */}
          {activeTab === AnalysisTabs.DAILY_REPORT && (
            <Animated animation="fadeIn" duration={400} className="space-y-6">
              <div className="rounded-xl p-8 backdrop-blur-sm" style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                      📋 智能日报
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      基于今日记录自动生成日报内容
                    </p>
                  </div>
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    style={{ 
                      backgroundColor: generatingReport ? 'var(--text-secondary)' : 'var(--flow-primary)',
                      color: 'white'
                    }}
                  >
                    {generatingReport ? '生成中...' : '生成日报'}
                  </button>
                </div>

                {/* 日期选择器 */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    选择日期：
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="date"
                      value={reportDate}
                      onChange={(e) => setReportDate(e.target.value)}
                      className="px-3 py-2 rounded-lg border"
                      style={{
                        backgroundColor: 'var(--card-background)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    <button
                      onClick={() => generateReportForDate(reportDate)}
                      disabled={generatingReport}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        backgroundColor: 'var(--card-background)',
                        borderColor: 'var(--card-border)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--card-border)'
                      }}
                    >
                      生成指定日期报告
                    </button>
                  </div>
                  
                  {/* 最近日期快速选择 */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {getRecentDates().map((date) => (
                      <button
                        key={date}
                        onClick={() => {
                          setReportDate(date);
                          generateReportForDate(date);
                        }}
                        disabled={generatingReport}
                        className="px-3 py-1 rounded-lg text-xs font-medium transition-colors hover:scale-105"
                        style={{
                          backgroundColor: date === reportDate ? 'var(--flow-primary)' : 'var(--card-background)',
                          color: date === reportDate ? 'white' : 'var(--text-primary)',
                          border: '1px solid var(--card-border)'
                        }}
                      >
                        {formatDate(date).split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 日报内容显示 */}
                {dailyReport && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                        生成结果
                      </h3>
                      <button
                        onClick={() => copyToClipboard(dailyReport)}
                        className="px-3 py-1 rounded-lg text-sm font-medium transition-colors hover:scale-105"
                        style={{
                          backgroundColor: 'var(--card-background)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--card-border)'
                        }}
                      >
                        复制到剪贴板
                      </button>
                    </div>
                    <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
                      <pre className="whitespace-pre-wrap text-sm" style={{ color: 'var(--text-primary)' }}>
                        {dailyReport}
                      </pre>
                    </div>
                  </div>
                )}

                {/* 统计信息 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--flow-primary)' }}>
                      {stats.totalEntries}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      总记录数
                    </div>
                  </div>
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--flow-primary)' }}>
                      {stats.todayEntries}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      今日记录
                    </div>
                  </div>
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--flow-primary)' }}>
                      {Object.keys(stats.projectTags).length}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      项目标签
                    </div>
                  </div>
                  <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'var(--card-background)', border: '1px solid var(--card-border)' }}>
                    <div className="text-2xl font-bold" style={{ color: 'var(--flow-primary)' }}>
                      {Object.keys(stats.reportTags).length}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      报告标签
                    </div>
                  </div>
                </div>
              </div>
            </Animated>
          )}

          {/* 智能周报 Tab */}
          {activeTab === AnalysisTabs.WEEKLY_REPORT && (
            <Animated animation="fadeIn" duration={400} className="space-y-6">
              <Suspense fallback={<LoadingSpinner />}>
                <WeeklyReport />
              </Suspense>
            </Animated>
          )}
        </div>
      </div>
    </div>
  );
}

// 主导出组件，包装在Suspense中
export default function AnalysisPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <AnalysisContent />
    </Suspense>
  );
}