'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import { Brain, Settings, BarChart3, Code, FolderKanban } from 'lucide-react';
import { ChatLayout } from '@/components/agent';
import { ChatProvider } from '@/contexts/ChatContext';

export default function AgentPage() {
  const router = useRouter();

  // 导航按钮配置 - 排除自己（对话）
  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
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
                onClick={() => router.push(item.href)}
                className="group relative p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
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
