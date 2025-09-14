'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Search, MessageCircle, CheckSquare, Brain, Settings, BarChart3, Code, FolderKanban, Timer } from 'lucide-react';
import EntryForm from '@/components/EntryForm';
import MultiViewEntryList from '@/components/MultiViewEntryList';

import AIProviderConfig from '@/components/AIProviderConfig';
import EnergyModeToggle from '@/components/EnergyModeToggle';
import ThemeController from '@/components/ThemeController';
import { Animated } from '@/components/animations';
import { PomodoroTimer } from '@/components/todos/PomodoroTimer';
import { ThemeProvider } from '@/components/todos/ThemeProvider';
import { useLocalStorage } from '@/hooks/todos/useLocalStorage';
import { Theme } from '@/types/todo';
// 移除局部返回按钮，统一使用全局按钮


// 懒加载大型组件
const KnowledgeManager = lazy(() => import('@/components/KnowledgeManager'));
const DataExport = lazy(() => import('@/components/DataExport'));
const WeeklyReport = lazy(() => import('@/components/WeeklyReport'));
const UserProfile = lazy(() => import('@/components/UserProfile'));

// 加载状态组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{borderBottomColor: 'var(--flow-primary)'}}></div>
    <span className="ml-3" style={{color: 'var(--text-secondary)'}}>加载中...</span>
  </div>
);
import { trackEvent } from '@/lib/client-tracker';

import { HomeTabs, type HomeTab } from '@/types/index';


function RecordsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<HomeTab>(HomeTabs.RECORDS);

  const [currentViewMode, setCurrentViewMode] = useState<'today' | 'week' | 'history'>('today');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'sunset');

  const navigationItems = [
    {
      icon: Brain,
      label: '首页',
      href: '/',
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
      icon: BarChart3,
      label: '分析',
      href: '/analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    },
    {
      icon: Timer,
      label: '番茄钟',
      href: '#',
      color: 'from-red-500 to-orange-600',
      onClick: () => setShowPomodoro(!showPomodoro)
    }
  ];

  // 处理URL参数
  useEffect(() => {
    const tab = searchParams.get('tab');
    const search = searchParams.get('search');
    const content = searchParams.get('content');
    
    if (tab === 'config') {
      setActiveTab(HomeTabs.CONFIG);
    } else if (tab === 'knowledge') {
      setActiveTab(HomeTabs.KNOWLEDGE);
    } else if (tab === 'export') {
      setActiveTab(HomeTabs.EXPORT);
    } else if (tab === 'records' || !tab) {
      setActiveTab(HomeTabs.RECORDS);
    }
    

  }, [searchParams]);

  useEffect(() => {
    trackEvent.pageView('/records');
  }, []);

  useEffect(() => {
    trackEvent.pageView(`/records/tab/${activeTab}`);
  }, [activeTab]);


  const handleEntryDeleted = () => {
    // 处理条目删除后的逻辑
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--background)'}}>
        {/* 平衡模式：简化背景装饰，保留品牌特色 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-16 h-16 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-12 h-12 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* 右上角导航 - 响应式优化 */}
        <nav className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
          {/* 移动端：简化导航 */}
          <div className="md:hidden">
            <button 
              className={`group relative p-3 rounded-xl backdrop-blur-md border transition-all duration-300`}
              style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)'
              }}
              onClick={() => setShowPomodoro(!showPomodoro)}
              title="更多功能"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
          
          {/* 桌面端：完整导航 */}
          <div className="hidden md:flex gap-3">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={item.onClick || (() => router.push(item.href))}
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
                    <div className="px-2 py-1 rounded whitespace-nowrap text-xs" style={{
                      backgroundColor: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}>
                      {item.label}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </nav>
        
        <div className="max-w-7xl mx-auto px-3 md:px-2 pt-16 md:pt-20 pb-6 relative z-10">
          <header className="mb-8">
            {/* 全局返回按钮已覆盖，无需局部按钮 */}
            {/* 页面标题 - 已移除“数字大脑”以保持极简风格 */}
            {/* <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                数字大脑
              </h1>
            </div> */}
            

          </header>

          <div className="max-w-7xl mx-auto">
            {/* 记录管理页面 */}
            {activeTab === HomeTabs.RECORDS && (
              <Animated animation="fadeIn" duration={400} className="max-w-6xl mx-auto">
                {/* 核心功能：快速记录区域（突出显示） - 响应式优化 */}
                {(
                  <div className="mb-6 md:mb-8">
                    {/* Slogan - 响应式字号 */}
                    <div className="text-center mb-8 md:mb-10 px-2">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 leading-tight" style={{ color: 'var(--text-primary)' }}>
                        May the <span className="bg-gradient-to-r from-[var(--flow-primary)] to-[var(--flow-secondary)] bg-clip-text text-transparent">AI</span> be with you
                      </h2>
                    </div>
                    
                    <div className="rounded-2xl p-4 md:p-6 border-2 border-[var(--flow-primary)]/40 shadow-xl" style={{
                      background: 'var(--card-glass)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px var(--flow-primary, #0ea5e9)/20'
                    }}>

                      <EntryForm initialContent={searchParams.get('content') || ''} />
                    </div>
                  </div>
                )}

                {/* 搜索与记录区域 */}
                <div className="space-y-6">
                  {/* 内容显示区域 */}
                  <div className="rounded-xl p-4 shadow-lg glass-border-soft" style={{
                    background: 'var(--card-glass)',
                    backdropFilter: 'blur(15px)'
                  }}>
                    <MultiViewEntryList 
                      onViewModeChange={setCurrentViewMode}
                    />
                  </div>
                </div>
              </Animated>
            )}


            {/* 知识库管理页面 */}
            {activeTab === HomeTabs.KNOWLEDGE && (
              <Animated animation="fadeIn" duration={400}>
                <Suspense fallback={<LoadingSpinner />}>
                  <KnowledgeManager />
                </Suspense>
              </Animated>
            )}

            {/* 数据导出页面 */}
            {activeTab === HomeTabs.EXPORT && (
              <Animated animation="fadeIn" duration={400}>
                <Suspense fallback={<LoadingSpinner />}>
                  <DataExport />
                </Suspense>
              </Animated>
            )}

            {/* 配置页面 */}
            {activeTab === HomeTabs.CONFIG && (
              <Animated animation="fadeIn" duration={400} className="space-y-6">
                {/* 主题选择 */}
                <div className="rounded-xl p-6 shadow-lg glass-border-soft" style={{
                  background: 'var(--card-glass)',
                  backdropFilter: 'blur(15px)'
                }}>
                  <ThemeController />
                </div>
                
                {/* 节能选项 */}
                <div className="rounded-xl p-6 shadow-lg glass-border-soft" style={{
                  background: 'var(--card-glass)',
                  backdropFilter: 'blur(15px)'
                }}>
                  <EnergyModeToggle />
                </div>
                
                {/* AI配置管理 */}
                <div className="rounded-xl p-6 shadow-lg glass-border-soft" style={{
                  background: 'var(--card-glass)',
                  backdropFilter: 'blur(15px)'
                }}>
                  <AIProviderConfig />
                </div>
              </Animated>
            )}
          </div>
          
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--card-glass)',
                color: 'var(--text-primary)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--card-border)',
              },
            }}
          />
          
        </div>

        {/* 番茄钟组件 */}
        <div className="absolute top-20 right-6 z-30">
          <ThemeProvider theme={theme} setTheme={setTheme}>
            <PomodoroTimer isVisible={showPomodoro} onToggle={() => setShowPomodoro(!showPomodoro)} />
          </ThemeProvider>
        </div>
      </div>
  );
}

export default function RecordsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    }>
      <RecordsPageContent />
    </Suspense>
  );
}
