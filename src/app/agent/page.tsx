'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Brain, CheckSquare, Settings, BarChart3, Code, FolderKanban, Timer } from 'lucide-react';
import { ChatLayout } from '@/components/agent';
import { ChatProvider } from '@/contexts/ChatContext';
import { PomodoroTimer } from '@/components/todos/PomodoroTimer';
import { ThemeProvider } from '@/components/todos/ThemeProvider';
import { useLocalStorage } from '@/hooks/todos/useLocalStorage';
import { Theme } from '@/types/todo';

export default function AgentPage() {
  const router = useRouter();
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'sunset');

  // 导航按钮配置 - 排除自己（对话）
  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
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
    <ChatProvider>
      {/* 右上角导航按钮 */}
      <nav className="absolute top-6 right-6 z-50">
        <div className="flex gap-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={item.onClick || (() => router.push(item.href))}
                className={`group relative p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 ${item.label === '番茄钟' && showPomodoro ? 'bg-white/30' : ''}`}
                title={item.label}
              >
                <IconComponent className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
                
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

      {/* 番茄钟组件 */}
      <div className="absolute top-20 right-6 z-50">
        <ThemeProvider theme={theme} setTheme={setTheme}>
          <PomodoroTimer isVisible={showPomodoro} onToggle={() => setShowPomodoro(!showPomodoro)} />
        </ThemeProvider>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ChatLayout />
      </Suspense>

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
    </ChatProvider>
  );
}
