'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeTest: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div>加载中...</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold mb-4">🧪 主题切换测试</h2>
      
      {/* 当前状态显示 */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">当前状态:</h3>
        <div className="space-y-2 text-sm">
          <div>Context主题: <span className="font-mono px-2 py-1 rounded" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)'}}>{theme}</span></div>
        <div>DOM属性: <span className="font-mono px-2 py-1 rounded" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)'}}>{document.documentElement.getAttribute('data-theme')}</span></div>
        <div>localStorage: <span className="font-mono px-2 py-1 rounded" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)'}}>{localStorage.getItem('app-theme')}</span></div>
        </div>
      </div>

      {/* 快速切换按钮 */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">快速切换:</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              console.log('切换到warm主题');
              setTheme('warm');
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: theme === 'warm' ? 'var(--dynamic-primary)' : 'var(--card-glass, rgba(255, 255, 255, 0.1))',
              color: theme === 'warm' ? 'white' : 'var(--text-primary)',
              border: `1px solid ${theme === 'warm' ? 'var(--dynamic-primary)' : 'var(--card-border, rgba(255, 255, 255, 0.2))'}`
            }}
          >
            温暖主题
          </button>
          <button 
            onClick={() => {
              console.log('切换到cyber主题');
              setTheme('cyber');
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: theme === 'cyber' ? 'var(--dynamic-primary)' : 'var(--card-glass, rgba(255, 255, 255, 0.1))',
              color: theme === 'cyber' ? 'white' : 'var(--text-primary)',
              border: `1px solid ${theme === 'cyber' ? 'var(--dynamic-primary)' : 'var(--card-border, rgba(255, 255, 255, 0.2))'}`
            }}
          >
            科技主题
          </button>
          <button 
            onClick={() => {
              console.log('切换到forest主题');
              setTheme('forest');
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: theme === 'forest' ? 'var(--dynamic-primary)' : 'var(--card-glass, rgba(255, 255, 255, 0.1))',
              color: theme === 'forest' ? 'white' : 'var(--text-primary)',
              border: `1px solid ${theme === 'forest' ? 'var(--dynamic-primary)' : 'var(--card-border, rgba(255, 255, 255, 0.2))'}`
            }}
          >
            森林主题
          </button>
          <button 
            onClick={() => {
              console.log('切换到dopamine主题');
              setTheme('dopamine');
            }}
            className="px-4 py-2 rounded font-medium transition-colors"
            style={{
              backgroundColor: theme === 'dopamine' ? 'var(--dynamic-primary)' : 'var(--card-glass, rgba(255, 255, 255, 0.1))',
              color: theme === 'dopamine' ? 'white' : 'var(--text-primary)',
              border: `1px solid ${theme === 'dopamine' ? 'var(--dynamic-primary)' : 'var(--card-border, rgba(255, 255, 255, 0.2))'}`
            }}
          >
            多巴胺主题
          </button>
        </div>
      </div>

      {/* CSS变量测试 */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">CSS变量测试:</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">背景色 (--background):</div>
            <div 
              className="h-12 rounded border" 
              style={{background: 'var(--background)'}}
            ></div>
          </div>
          <div>
            <div className="text-sm mb-1">前景色 (--foreground):</div>
            <div 
              className="h-12 rounded border flex items-center justify-center" 
              style={{backgroundColor: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--foreground)'}}
            >
              文字
            </div>
          </div>
          <div>
            <div className="text-sm mb-1">主色 (--dynamic-primary):</div>
            <div 
              className="h-12 rounded border" 
              style={{backgroundColor: 'var(--dynamic-primary)'}}
            ></div>
          </div>
          <div>
            <div className="text-sm mb-1">次色 (--dynamic-secondary):</div>
            <div 
              className="h-12 rounded border" 
              style={{backgroundColor: 'var(--dynamic-secondary)'}}
            ></div>
          </div>
        </div>
      </div>

      {/* 主题特定内容 */}
      <div className="p-4 border rounded-lg">
        <h3 className="font-semibold mb-2">主题特定内容:</h3>
        {theme === 'warm' && (
          <div className="p-4 rounded bg-gradient-to-r" style={{backgroundImage: 'linear-gradient(to right, var(--flow-primary), var(--flow-secondary))', color: 'var(--text-on-primary)'}}>
            💖 温暖主题已激活！粉紫色系营造温馨氛围。
          </div>
        )}
        {theme === 'cyber' && (
          <div className="p-4 rounded bg-gradient-to-r" style={{backgroundImage: 'linear-gradient(to right, var(--flow-secondary), var(--flow-primary))', color: 'var(--text-on-primary)'}}>
            🚀 科技未来主题已激活！霓虹青色调营造科技感。
          </div>
        )}
        {theme === 'forest' && (
          <div className="p-4 rounded bg-gradient-to-r" style={{backgroundImage: 'linear-gradient(to right, #2f7f60, #6b8e62)', color: 'white'}}>
            🌲 森林绿主题已激活！自然绿色调营造专注环境。
          </div>
        )}
        {theme === 'dopamine' && (
          <div className="p-4 rounded bg-gradient-to-r" style={{backgroundImage: 'linear-gradient(to right, #FF6B47, #00D084)', color: 'white'}}>
            🎉 多巴胺主题已激活！充满活力的橙红色调激发创造力！
          </div>
        )}
      </div>
    </div>
  );
};

export default ThemeTest;