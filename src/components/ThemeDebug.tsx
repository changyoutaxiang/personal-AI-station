'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeDebug: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [dataTheme, setDataTheme] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateDataTheme = () => {
      setDataTheme(document.documentElement.getAttribute('data-theme'));
    };
    updateDataTheme();
    
    // 监听主题变化
    const observer = new MutationObserver(updateDataTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="p-4 border rounded-lg backdrop-blur-sm" style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)'}}>
      <h3 className="text-lg font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
        🔍 主题调试信息
      </h3>
      
      <div className="space-y-2 text-sm">
        <div>
          <strong>当前主题:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{theme}</span>
        </div>
        
        <div>
          <strong>data-theme属性:</strong> 
          <span className="font-mono bg-gray-200 px-2 py-1 rounded ml-2">
            {isClient ? (dataTheme || '未设置') : '加载中...'}
          </span>
        </div>
        
        <div>
          <strong>客户端状态:</strong> 
          <span className="font-mono px-2 py-1 rounded ml-2" style={{
            backgroundColor: isClient ? 'var(--text-success)/20' : 'var(--text-warning)/20',
            color: isClient ? 'var(--text-success)' : 'var(--text-warning)'
          }}>
            {isClient ? '已加载' : '服务端渲染'}
          </span>
        </div>
        
        <div className="mt-4">
          <strong>CSS变量测试:</strong>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div 
              className="h-8 rounded border" 
              style={{backgroundColor: 'var(--dynamic-primary)', color: 'white'}}
              title="--dynamic-primary"
            >
              主色
            </div>
            <div 
              className="h-8 rounded border" 
              style={{backgroundColor: 'var(--dynamic-secondary)', color: 'white'}}
              title="--dynamic-secondary"
            >
              次色
            </div>
            <div 
              className="h-8 rounded border" 
              style={{backgroundColor: 'var(--dynamic-accent)', color: 'white'}}
              title="--dynamic-accent"
            >
              强调
            </div>
          </div>
        </div>
        
        
        <div className="mt-4">
          <strong>手动测试:</strong>
          <div className="flex gap-2 mt-2">
            <button 
              onClick={() => setTheme('warm')}
              className="px-3 py-1 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme === 'warm' ? 'var(--dynamic-primary)' : 'var(--card-glass)',
                color: theme === 'warm' ? 'white' : 'var(--text-primary)',
                border: `1px solid ${theme === 'warm' ? 'var(--dynamic-primary)' : 'var(--card-border)'}`
              }}
            >
              温暖
            </button>
            <button 
              onClick={() => setTheme('cyber')}
              className="px-3 py-1 rounded text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme === 'cyber' ? 'var(--dynamic-primary)' : 'var(--card-glass)',
                color: theme === 'cyber' ? 'white' : 'var(--text-primary)',
                border: `1px solid ${theme === 'cyber' ? 'var(--dynamic-primary)' : 'var(--card-border)'}`
              }}
            >
              科技
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDebug;