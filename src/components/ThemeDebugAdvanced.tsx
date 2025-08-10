'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ThemeDebugAdvanced: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [domTheme, setDomTheme] = useState<string>('');
  const [localStorageTheme, setLocalStorageTheme] = useState<string>('');
  const [computedStyles, setComputedStyles] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  const updateDebugInfo = () => {
    if (typeof window !== 'undefined') {
      const docTheme = document.documentElement.getAttribute('data-theme') || 'none';
      const localTheme = localStorage.getItem('app-theme') || 'none';
      
      setDomTheme(docTheme);
      setLocalStorageTheme(localTheme);
      
      // 获取计算后的CSS变量
      const computedStyle = getComputedStyle(document.documentElement);
      setComputedStyles({
        background: computedStyle.getPropertyValue('--background'),
        dynamicPrimary: computedStyle.getPropertyValue('--dynamic-primary'),
        dynamicSecondary: computedStyle.getPropertyValue('--dynamic-secondary'),
        textPrimary: computedStyle.getPropertyValue('--text-primary'),
      });
    }
  };

  useEffect(() => {
    setMounted(true);
    updateDebugInfo();
    
    // 监听DOM变化
    const observer = new MutationObserver(updateDebugInfo);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
    
    // 监听storage变化
    const handleStorage = () => updateDebugInfo();
    window.addEventListener('storage', handleStorage);
    
    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useEffect(() => {
    updateDebugInfo();
  }, [theme]);

  if (!mounted) {
    return <div>加载中...</div>;
  }

  const testThemeChange = (newTheme: 'warm' | 'cyber') => {
    console.log(`🎨 测试主题切换: ${theme} -> ${newTheme}`);
    console.log('切换前 DOM data-theme:', document.documentElement.getAttribute('data-theme'));
    console.log('切换前 localStorage:', localStorage.getItem('app-theme'));
    
    setTheme(newTheme);
    
    // 等待一帧后检查结果
    requestAnimationFrame(() => {
      console.log('切换后 DOM data-theme:', document.documentElement.getAttribute('data-theme'));
      console.log('切换后 localStorage:', localStorage.getItem('app-theme'));
      console.log('Context theme:', newTheme);
      updateDebugInfo();
    });
  };

  return (
    <div className="p-6 border-2 rounded-lg backdrop-blur-sm" style={{
      borderColor: 'var(--text-error)',
      backgroundColor: 'var(--card-glass)'
    }}>
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--text-error)' }}>🔧 高级主题调试</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <h3 className="font-semibold">状态信息</h3>
          <div className="text-sm space-y-1">
            <div>Context主题: <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--card-glass)' }}>{theme}</code></div>
            <div>DOM data-theme: <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--card-glass)' }}>{domTheme}</code></div>
            <div>localStorage: <code className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--card-glass)' }}>{localStorageTheme}</code></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold">计算后的CSS变量</h3>
          <div className="text-sm space-y-1">
            <div>--background: <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--card-glass)' }}>{computedStyles.background}</code></div>
            <div>--dynamic-primary: <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--card-glass)' }}>{computedStyles.dynamicPrimary}</code></div>
            <div>--text-primary: <code className="px-2 py-1 rounded text-xs" style={{ backgroundColor: 'var(--card-glass)' }}>{computedStyles.textPrimary}</code></div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">测试按钮（带详细日志）</h3>
        <div className="flex gap-2">
          <button 
            onClick={() => testThemeChange('warm')}
            className="px-4 py-2 text-white rounded transition-colors"
            style={{
              backgroundColor: 'var(--dynamic-primary)',
              border: '1px solid var(--dynamic-primary)'
            }}
          >
            测试温暖色
          </button>
          <button 
            onClick={() => testThemeChange('cyber')}
            className="px-4 py-2 text-white rounded transition-colors"
            style={{
              backgroundColor: 'var(--dynamic-secondary)',
              border: '1px solid var(--dynamic-secondary)'
            }}
          >
            测试科技风格
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold mb-2">视觉测试区域</h3>
        <div className="space-y-2">
          <div 
            className="h-16 rounded border-2 flex items-center justify-center font-bold"
            style={{
              background: 'var(--background)',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
              color: 'var(--text-primary)'
            }}
          >
            背景色测试 (var(--background))
          </div>
          <div 
            className="h-12 rounded border-2 flex items-center justify-center font-bold"
            style={{
              backgroundColor: 'var(--dynamic-primary)',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
              color: 'var(--text-on-primary, white)'
            }}
          >
            主色调测试 (var(--dynamic-primary))
          </div>
        </div>
      </div>

      <div className="p-3 border rounded" style={{
        backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.1))',
        borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))'
      }}>
        <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
          <strong>调试提示：</strong> 
          如果主题切换后视觉测试区域的颜色没有变化，说明CSS变量没有正确应用。
          请检查浏览器开发者工具中的Elements面板，确认data-theme属性和CSS变量值。
        </p>
      </div>
    </div>
  );
};

export default ThemeDebugAdvanced;