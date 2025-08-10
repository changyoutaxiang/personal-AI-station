'use client';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import EntryForm from '@/components/EntryForm';
import EntryList from '@/components/EntryList';
import SearchBox from '@/components/SearchBox';
import SearchResults from '@/components/SearchResults';
import AIInsights from '@/components/AIInsights';
import TodoApp from '@/components/TodoApp';
import AIModelConfig from '@/components/AIModelConfig';
import PerformanceMonitor from '@/components/PerformanceMonitor';
import CacheMonitor from '@/components/CacheMonitor';
import ThemeToggle from '@/components/ThemeToggle';
import { Animated } from '@/components/animations';

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
import '@/lib/startup'; // 确保启动初始化被执行
import type { SearchResult } from '@/types/index';


export default function Home() {
  const [activeTab, setActiveTab] = useState('records');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [showCacheMonitor, setShowCacheMonitor] = useState(false);

  useEffect(() => {
    trackEvent.pageView('/');
  }, []);

  useEffect(() => {
    trackEvent.pageView(`/tab/${activeTab}`);
  }, [activeTab]);

  const handleSearchResults = (results: SearchResult) => {
    setSearchResults(results);
    setIsSearchMode(true);
    
    if (results.searchTerms.length > 0) {
      trackEvent.search(results.searchTerms.join(' '), results.totalCount);
    }
  };

  const handleClearSearch = () => {
    setIsSearchMode(false);
    setSearchResults(null);
  };

  const handleEntryDeleted = () => {
    // 如果在搜索模式下删除了条目，需要重新搜索以更新结果
    if (isSearchMode && searchResults) {
      // 这里可以触发重新搜索，但为了简单起见，我们清除搜索模式
      handleClearSearch();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{background: 'var(--background)'}}>
        {/* 平衡模式：简化背景装饰，保留品牌特色 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-16 h-16 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-12 h-12 bg-white rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-2 py-6 relative z-10">
          <header className="mb-8">
            {/* 页面标题 */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2" style={{color: 'var(--text-primary)'}}>
                数字大脑
              </h1>
            </div>
            
            {/* 功能切换标签 */}
            <div className="flex justify-center">
              <div className="rounded-2xl p-2 shadow-xl transition-all duration-300" style={{
                background: 'var(--card-glass)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)'
              }}>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveTab('records')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative overflow-hidden border ${
                      activeTab === 'records'
                        ? 'shadow-lg backdrop-blur-md transform scale-105'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'records' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-glass)',
                      borderColor: activeTab === 'records' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-border)',
                      color: activeTab === 'records' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    📝 记录
                  </button>
                  <button
                    onClick={() => setActiveTab('todos')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative overflow-hidden border ${
                      activeTab === 'todos'
                        ? 'shadow-lg backdrop-blur-md transform scale-105'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'todos' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-glass)',
                      borderColor: activeTab === 'todos' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-border)',
                      color: activeTab === 'todos' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    ✅ 待办
                  </button>
                  <button
                    onClick={() => window.location.href = '/agent'}
                    className="px-4 py-2 rounded-xl font-medium relative overflow-hidden border"
                    style={{
                      background: 'linear-gradient(135deg, var(--flow-primary), #10b981)',
                      borderColor: 'var(--flow-primary)',
                      color: 'white'
                    }}
                  >
                    🤖 智能体
                  </button>
                  <button
                    onClick={() => setActiveTab('ai-insights')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative overflow-hidden border ${
                      activeTab === 'ai-insights'
                        ? 'shadow-lg backdrop-blur-md transform scale-105'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'ai-insights' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-glass)',
                      borderColor: activeTab === 'ai-insights' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-border)',
                      color: activeTab === 'ai-insights' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    🧠 洞察
                  </button>
                  <button
                    onClick={() => setActiveTab('knowledge')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative overflow-hidden border ${
                      activeTab === 'knowledge'
                        ? 'shadow-lg backdrop-blur-md transform scale-105'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'knowledge' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-glass)',
                      borderColor: activeTab === 'knowledge' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-border)',
                      color: activeTab === 'knowledge' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    📚 知识库
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative overflow-hidden border ${
                      activeTab === 'export'
                        ? 'shadow-lg backdrop-blur-md transform scale-105'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'export' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-glass)',
                      borderColor: activeTab === 'export' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-border)',
                      color: activeTab === 'export' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    📊 导出
                  </button>
                  <button
                    onClick={() => setActiveTab('config')}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 relative overflow-hidden border ${
                      activeTab === 'config'
                        ? 'shadow-lg backdrop-blur-md transform scale-105'
                        : 'hover:opacity-80'
                    }`}
                    style={{
                      backgroundColor: activeTab === 'config' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-glass)',
                      borderColor: activeTab === 'config' 
                        ? 'var(--flow-primary, #0ea5e9)' 
                        : 'var(--card-border)',
                      color: activeTab === 'config' ? 'white' : 'var(--text-secondary)'
                    }}
                  >
                    ⚙️ 配置
                  </button>
                </div>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto">
            {/* 记录管理页面 */}
            {activeTab === 'records' && (
              <Animated animation="fadeIn" duration={400} className="max-w-6xl mx-auto">
                {/* 核心功能：快速记录区域（突出显示） */}
                {!isSearchMode && (
                  <div className="mb-8">
                    <div className="rounded-2xl p-6 border-2 border-[var(--flow-primary)]/40 shadow-xl" style={{
                      background: 'var(--card-glass)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15), 0 0 0 1px var(--flow-primary, #0ea5e9)/20'
                    }}>

                      <EntryForm />
                    </div>
                  </div>
                )}

                {/* 搜索与记录区域 */}
                <div className="space-y-6">
                  {/* 次要功能：搜索框区域（简化样式） */}
                  <div className="rounded-xl p-4 glass-border-soft" style={{
                    background: 'var(--card-glass)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <SearchBox 
                      onSearchResults={handleSearchResults}
                      onClearSearch={handleClearSearch}
                    />
                  </div>

                  {/* 内容显示区域 */}
                  <div className="rounded-xl p-4 shadow-lg glass-border-soft" style={{
                    background: 'var(--card-glass)',
                    backdropFilter: 'blur(15px)'
                  }}>
                    {isSearchMode && searchResults ? (
                      <SearchResults 
                        results={searchResults}
                        onEntryDeleted={handleEntryDeleted}
                      />
                    ) : (
                      <EntryList />
                    )}
                  </div>
                </div>
              </Animated>
            )}

            {/* 待办事项页面 */}
            {activeTab === 'todo' && (
              <Animated animation="fadeIn" duration={400}>
                <TodoApp />
              </Animated>
            )}

            {/* AI洞察页面 */}
            {activeTab === 'insights' && (
              <Animated animation="fadeIn" duration={400} className="space-y-6">
                <AIInsights />
                <Suspense fallback={<LoadingSpinner />}>
                  <WeeklyReport />
                </Suspense>
                {/* <BehaviorInsights /> */}
                <Suspense fallback={<LoadingSpinner />}>
                  <UserProfile />
                </Suspense>
              </Animated>
            )}

            {/* 知识库管理页面 */}
            {activeTab === 'knowledge' && (
              <Animated animation="fadeIn" duration={400}>
                <Suspense fallback={<LoadingSpinner />}>
                  <KnowledgeManager />
                </Suspense>
              </Animated>
            )}

            {/* 数据导出页面 */}
            {activeTab === 'export' && (
              <Animated animation="fadeIn" duration={400}>
                <Suspense fallback={<LoadingSpinner />}>
                  <DataExport />
                </Suspense>
              </Animated>
            )}

            {/* 配置页面 */}
            {activeTab === 'config' && (
              <Animated animation="fadeIn" duration={400} className="space-y-6">
                {/* 主题选择 */}
                <div className="rounded-xl p-6 shadow-lg glass-border-soft" style={{
                  background: 'var(--card-glass)',
                  backdropFilter: 'blur(15px)'
                }}>
                  <ThemeToggle />
                </div>
                
                {/* AI模型配置 */}
                <div className="rounded-xl p-6 shadow-lg glass-border-soft" style={{
                  background: 'var(--card-glass)',
                  backdropFilter: 'blur(15px)'
                }}>
                  <AIModelConfig />
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
          
          {/* 性能监控 */}
          <PerformanceMonitor />
          
          {/* AI缓存监控 */}
          <CacheMonitor 
            isVisible={showCacheMonitor}
            onToggle={() => setShowCacheMonitor(!showCacheMonitor)}
          />
        </div>
      </div>
  );
}
