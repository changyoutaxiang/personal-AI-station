'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, CheckSquare, Brain, Settings, BarChart3, Code, FolderKanban, Timer, Search, Menu, X } from 'lucide-react';
import SearchComponent from '@/components/ui/animated-glowing-search-bar';
import ThemeController from '@/components/ThemeController';
import { PomodoroTimer } from '@/components/todos/PomodoroTimer';
import { ThemeProvider } from '@/components/todos/ThemeProvider';
import { useLocalStorage } from '@/hooks/todos/useLocalStorage';
import { Theme } from '@/types/todo';


export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'sunset');
  const router = useRouter();

  // HTML代码识别函数
  const isHtmlCode = (text: string): boolean => {
    const trimmed = text.trim();
    // 检查是否包含HTML标签
    const hasHtmlTags = /<[^>]+>/g.test(trimmed);
    // 检查是否以HTML文档开头
    const startsWithDoctype = /^<!DOCTYPE\s+html/i.test(trimmed);
    const startsWithHtml = /^<html/i.test(trimmed);
    // 检查是否包含常见HTML结构
    const hasHtmlStructure = /<(html|head|body|div|p|span|h[1-6]|ul|ol|li|table|tr|td|form|input|button)/i.test(trimmed);
    
    return (hasHtmlTags && (startsWithDoctype || startsWithHtml || hasHtmlStructure)) || 
           (trimmed.length > 50 && hasHtmlTags); // 长文本且包含HTML标签
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    
    // 🎯 暗号功能：HTML代码识别
    if (isHtmlCode(query)) {
      try {
        // 直接使用btoa进行base64编码，处理Unicode字符
        const base64Html = btoa(unescape(encodeURIComponent(query)));
        router.push(`/html-renderer?html=${encodeURIComponent(base64Html)}&encoding=base64`);
        return;
      } catch (error) {
        console.error('Base64编码失败，使用传统方法:', error);
        // 回退到传统方法，但使用更好的错误处理
        router.push(`/html-renderer?html=${encodeURIComponent(query)}`);
        return;
      }
    }
    
    // 硬匹配导航逻辑
    if (query.startsWith('记录')) {
      const content = query.slice(2).trim(); // 去除"记录"前缀
      router.push(`/records?content=${encodeURIComponent(content)}`);
      return;
    }
    
    if (query.startsWith('待办')) {
      const content = query.slice(2).trim(); // 去除"待办"前缀
      router.push(`/todos?action=create&content=${encodeURIComponent(content)}`);
      return;
    }
    
    if (query.startsWith('提问')) {
      const content = query.slice(2).trim(); // 去除"提问"前缀
      router.push(`/agent?message=${encodeURIComponent(content)}`);
      return;
    }
    
    // 默认行为：搜索记录
    router.push(`/records?search=${encodeURIComponent(query)}`);
  };

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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 默认背景图片 */}
      <div 
        id="hero-bg"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: 'url(/greg-rakozy-oMpAz-DN-9I-unsplash.jpg)',
        }}
      >
      </div>

      {/* 右上角导航 - 响应式优化 */}
      <nav className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        {/* 移动端：汉堡菜单 */}
        <div className="md:hidden">
          <button 
            className="group relative p-3 rounded-xl bg-black/30 backdrop-blur-md border-2 border-white/50 hover:bg-black/50 hover:border-white/80 transition-all duration-300 shadow-lg"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6 text-white drop-shadow-lg" /> : <Menu className="w-6 h-6 text-white drop-shadow-lg" />}
          </button>
        </div>
        
        {/* 桌面端：完整导航 */}
        <div className="hidden md:flex gap-3">
          {/* 背景图切换按钮 */}
          <ThemeController mode="compact" showBackgroundSwitcher={true} iconColor="white" />
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={item.onClick || (() => router.push(item.href))}
                className={`group relative p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 ${item.label === '番茄钟' && showPomodoro ? 'bg-white/30' : ''}`}
                title={item.label}
              >
                <IconComponent className="w-5 h-5 text-white" />
                
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

      {/* 移动端导航菜单 */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-16 right-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4 min-w-[200px]">
          <div className="grid grid-cols-2 gap-3">
            {/* 背景图切换按钮 */}
            <div className="col-span-2 mb-2">
              <ThemeController mode="compact" showBackgroundSwitcher={true} iconColor="black" />
            </div>
            
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      router.push(item.href);
                    }
                    setShowMobileMenu(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 ${item.label === '番茄钟' && showPomodoro ? 'bg-gray-100' : ''}`}
                >
                  <IconComponent className="w-5 h-5 text-gray-700" />
                  <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 番茄钟组件 - 响应式位置 */}
      <div className="absolute top-16 right-4 md:top-20 md:right-6 z-30">
        <ThemeProvider theme={theme} setTheme={setTheme}>
          <PomodoroTimer isVisible={showPomodoro} onToggle={() => setShowPomodoro(!showPomodoro)} />
        </ThemeProvider>
      </div>

      {/* 主要内容 - 响应式优化 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-6 -mt-16">
        {/* Slogan - 响应式字号调整 */}
        <div className="text-center mb-6 md:mb-5 w-full" style={{ maxWidth: "calc(100% - 2rem)" }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
            May the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI</span> be with you
          </h1>
        </div>

        {/* 搜索对话框 - 响应式边距 */}
        <div className="w-full max-w-3xl mx-auto px-2 md:px-[5px]">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <SearchComponent 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder=""
              />
            </div>
            
            {/* 搜索建议 - 响应式优化 */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/3 backdrop-blur-none border-2 border-white/30 rounded-xl overflow-hidden shadow-lg shadow-white/10 mx-2 md:mx-0">
                {/* 如果检测到HTML代码，显示特殊提示 */}
                {isHtmlCode(searchQuery) ? (
                  <button
                    type="submit"
                    className="w-full px-3 md:px-4 py-2 md:py-3 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-3 bg-gradient-to-r from-pink-500/20 to-rose-500/20 text-sm md:text-base"
                  >
                    <Code className="w-4 h-4 flex-shrink-0" />
                    <span>🎯 检测到HTML代码，直接渲染</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="submit"
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-3 text-sm md:text-base"
                    >
                      <Search className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">搜索 &ldquo;{searchQuery}&rdquo;</span>
                    </button>
                    <button
                      onClick={() => router.push(`/agent?message=${encodeURIComponent(searchQuery)}`)}
                      className="w-full px-3 md:px-4 py-2 md:py-3 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center gap-3 text-sm md:text-base"
                    >
                      <MessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">与AI对话 &ldquo;{searchQuery}&rdquo;</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </form>
        </div>

      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </div>
  );
}
