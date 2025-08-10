'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';

export default function ThemeTestPage() {
  const { theme, colorScheme } = useTheme();

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            Forest 主题测试
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            当前主题: <strong>{theme}</strong> | 颜色方案: <strong>{colorScheme}</strong>
          </p>
        </div>

        {/* 主题切换器 */}
        <ThemeToggle />

        {/* 测试卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 主要卡片 */}
          <div 
            className="p-6 rounded-xl border transition-all duration-300"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
              主要卡片
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              这是一个使用Forest主题颜色变量的测试卡片。Forest主题采用自然的森林绿色调，营造专注舒适的工作环境。
            </p>
            <div className="flex gap-2 mb-4">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: 'var(--dynamic-primary)' }}
                title="主色调"
              ></div>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: 'var(--dynamic-secondary)' }}
                title="次要色调"
              ></div>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: 'var(--dynamic-accent)' }}
                title="强调色"
              ></div>
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: 'var(--text-success)' }}
                title="成功色"
              ></div>
            </div>
            <button 
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                backgroundColor: 'var(--dynamic-primary)',
                color: 'var(--text-on-primary)'
              }}
            >
              主要按钮
            </button>
          </div>

          {/* 文本示例卡片 */}
          <div 
            className="p-6 rounded-xl border transition-all duration-300"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              文本层级示例
            </h3>
            <div className="space-y-3">
              <p style={{ color: 'var(--text-primary)' }}>
                主要文本 - 用于标题和重要内容
              </p>
              <p style={{ color: 'var(--text-secondary)' }}>
                次要文本 - 用于描述和辅助信息
              </p>
              <p style={{ color: 'var(--text-muted)' }}>
                静音文本 - 用于提示和不重要的信息
              </p>
              <p style={{ color: 'var(--text-accent)' }}>
                强调文本 - 用于链接和交互元素
              </p>
              <p style={{ color: 'var(--text-success)' }}>
                成功状态 - 用于成功消息
              </p>
              <p style={{ color: 'var(--text-warning)' }}>
                警告状态 - 用于警告消息
              </p>
              <p style={{ color: 'var(--text-error)' }}>
                错误状态 - 用于错误消息
              </p>
            </div>
          </div>
        </div>

        {/* Forest 主题特有展示 */}
        {theme === 'forest' && (
          <div 
            className="p-6 rounded-xl border-2"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--dynamic-primary)',
              boxShadow: '0 10px 15px -3px rgba(47, 127, 96, 0.2)'
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--dynamic-primary)' }}
              >
                <span className="text-xl">🌲</span>
              </div>
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Forest 主题已激活
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)' }} className="mb-4">
              Forest 主题使用自然的森林绿色调，创造了一个专注、平静的工作环境。
              这个主题特别适合长时间的文档编辑和知识管理工作。
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: '#2f7f60' }}
                ></div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>森林绿</span>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: '#6b8e62' }}
                ></div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>橄榄绿</span>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: '#a8e6cf' }}
                ></div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>薄荷绿</span>
              </div>
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg mx-auto mb-2"
                  style={{ backgroundColor: '#79cfa8' }}
                ></div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>翠绿</span>
              </div>
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div 
          className="p-6 rounded-xl border"
          style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--card-border)',
            boxShadow: 'var(--card-shadow)'
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Forest 主题使用说明
          </h3>
          <div className="space-y-2" style={{ color: 'var(--text-secondary)' }}>
            <p><strong>亮色模式:</strong> 在 HTML 或 body 设置 <code>data-theme="forest"</code></p>
            <p><strong>暗色模式:</strong> 同时设置 <code>data-color-scheme="dark"</code></p>
            <p><strong>示例:</strong></p>
            <div 
              className="mt-3 p-3 rounded bg-gray-100 dark:bg-gray-800"
              style={{ fontFamily: 'monospace' }}
            >
              <div>&lt;html data-theme="forest"&gt; {/* 亮色模式 */}</div>
              <div>&lt;html data-theme="forest" data-color-scheme="dark"&gt; {/* 暗色模式 */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
