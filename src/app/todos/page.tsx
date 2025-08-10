'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedTodayView } from '@/components/EnhancedTodayView';
import { EnhancedWeekView } from '@/components/EnhancedWeekView';
import { KeyboardShortcuts } from '@/components/KeyboardShortcuts';
import { Keyboard, Sparkles } from 'lucide-react';

export default function EnhancedTodosPage() {
  const [activeView, setActiveView] = useState<'today' | 'week'>('today');
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + / 显示快捷键帮助
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setShowShortcuts(true);
      }
      
      // Cmd/Ctrl + 1 切换到今日视图
      if ((e.metaKey || e.ctrlKey) && e.key === '1') {
        e.preventDefault();
        setActiveView('today');
      }
      
      // Cmd/Ctrl + 2 切换到周视图
      if ((e.metaKey || e.ctrlKey) && e.key === '2') {
        e.preventDefault();
        setActiveView('week');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 页面标题和导航 */}
        <div className="glassmorphism-card p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-color-primary" />
                <span>增强版任务管理</span>
              </h1>
              <p className="text-sm text-text-muted mt-1">
                使用搜索、筛选和键盘导航来高效管理任务
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1 p-1 rounded-lg bg-background-elevated border border-border">
                <button
                  onClick={() => setActiveView('today')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-normal ${
                    activeView === 'today'
                      ? 'bg-background text-color-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  今日视图
                </button>
                <button
                  onClick={() => setActiveView('week')}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-normal ${
                    activeView === 'week'
                      ? 'bg-background text-color-primary shadow-sm'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  本周视图
                </button>
              </div>
              
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-2 text-text-secondary hover:text-color-primary transition-colors"
                title="键盘快捷键 (⌘/Ctrl + /)"
              >
                <Keyboard className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mt-4 text-xs text-text-muted bg-background-subtle p-3 rounded-lg">
            <div className="flex items-center space-x-4">
              <span>快捷键提示：</span>
              <span>⌘/Ctrl+K: 搜索</span>
              <span>⌘/Ctrl+F: 筛选</span>
              <span>⌘/Ctrl+/: 帮助</span>
              <span>⌘/Ctrl+1: 今日视图</span>
              <span>⌘/Ctrl+2: 周视图</span>
            </div>
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="glassmorphism-card p-6">
          {activeView === 'today' ? (
            <EnhancedTodayView />
          ) : (
            <EnhancedWeekView />
          )}
        </div>

        {/* 键盘快捷键帮助 */}
        <KeyboardShortcuts 
          isOpen={showShortcuts} 
          onClose={() => setShowShortcuts(false)} 
        />
      </div>
    </div>
  );
}