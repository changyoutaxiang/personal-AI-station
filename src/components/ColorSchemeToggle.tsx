'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const ColorSchemeToggle: React.FC = () => {
  const { colorScheme, toggleColorScheme, setColorScheme } = useTheme();

  const getIcon = () => {
    switch (colorScheme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
    }
  };

  const getLabel = () => {
    switch (colorScheme) {
      case 'light':
        return '明亮模式';
      case 'dark':
        return '夜间模式';
      case 'auto':
        return '跟随系统';
    }
  };

  return (
    <div 
      className="p-6 rounded-lg shadow-sm transition-all duration-300" 
      style={{
        backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.95))',
        border: '1px solid var(--card-border, #e5e7eb)',
        boxShadow: 'var(--card-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1))'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{getIcon()}</span>
        <h3 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>颜色模式</h3>
      </div>
      
      <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
        选择适合当前环境的界面亮度，保护您的视力。
      </p>

      <div className="grid grid-cols-1 gap-4">
        {/* 明亮模式 */}
        <div 
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: colorScheme === 'light' ? 'var(--text-warning)' : 'var(--card-border)',
            background: colorScheme === 'light' ? 'linear-gradient(to right, var(--text-warning)/10, var(--text-warning)/20)' : 'var(--card-glass)',
            boxShadow: colorScheme === 'light' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onClick={() => setColorScheme('light')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(to right, var(--text-warning), var(--text-warning)/80)'
              }}></div>
              <div>
                <h4 className="font-medium" style={{color: 'var(--text-primary)'}}>明亮模式</h4>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>适合白天使用，清晰明亮的界面</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: colorScheme === 'light' ? 'var(--text-warning)' : 'var(--card-border)',
              backgroundColor: colorScheme === 'light' ? 'var(--text-warning)' : 'transparent'
            }}>
              {colorScheme === 'light' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
        </div>

        {/* 夜间模式 */}
        <div 
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: colorScheme === 'dark' ? 'var(--dynamic-primary)' : 'var(--card-border)',
            background: colorScheme === 'dark' ? 'linear-gradient(to right, var(--card-glass), var(--dynamic-primary)/30)' : 'var(--card-glass)',
            boxShadow: colorScheme === 'dark' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onClick={() => setColorScheme('dark')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(to right, var(--card-glass), var(--dynamic-primary))'
              }}></div>
              <div>
                <h4 className="font-medium" style={{
                  color: colorScheme === 'dark' ? '#ffffff' : 'var(--text-primary)'
                }}>夜间模式</h4>
                <p className="text-sm" style={{
                  color: colorScheme === 'dark' ? '#e2e8f0' : 'var(--text-secondary)'
                }}>保护眼睛，舒适的深色界面</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: colorScheme === 'dark' ? 'var(--dynamic-primary)' : 'var(--card-border)',
              backgroundColor: colorScheme === 'dark' ? 'var(--dynamic-primary)' : 'transparent'
            }}>
              {colorScheme === 'dark' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
        </div>

        {/* 跟随系统 */}
        <div 
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: colorScheme === 'auto' ? 'var(--flow-primary)' : 'var(--card-border)',
            background: colorScheme === 'auto' ? 'linear-gradient(to right, var(--flow-primary)/10, var(--flow-primary)/20)' : 'var(--card-glass)',
            boxShadow: colorScheme === 'auto' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onClick={() => setColorScheme('auto')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(to right, var(--flow-primary), var(--dynamic-secondary))'
              }}></div>
              <div>
                <h4 className="font-medium" style={{color: 'var(--text-primary)'}}>跟随系统</h4>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>自动匹配系统深色模式设置</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: colorScheme === 'auto' ? 'var(--flow-primary)' : 'var(--card-border)',
              backgroundColor: colorScheme === 'auto' ? 'var(--flow-primary)' : 'transparent'
            }}>
              {colorScheme === 'auto' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center">
        <button
          onClick={toggleColorScheme}
          className="px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
          style={{
            color: 'var(--text-on-primary, white)',
            background: 'linear-gradient(to right, var(--flow-primary), var(--dynamic-primary))',
            border: '1px solid var(--flow-primary)'
          }}
          title="快速切换模式"
        >
          <span>{getIcon()}</span>
          <span className="text-sm">{getLabel()}</span>
        </button>
      </div>

      <div className="mt-6 p-3 rounded-lg" style={{backgroundColor: 'var(--card-glass, rgba(59, 130, 246, 0.1))'}}>
        <div className="flex items-center gap-2" style={{color: 'var(--text-accent)'}}>
          <span className="text-sm">💡</span>
          <span className="text-sm font-medium">提示</span>
        </div>
        <p className="text-sm mt-1" style={{color: 'var(--text-accent)'}}>
          切换模式会立即生效，您的选择会自动保存到本地存储中。
        </p>
      </div>
    </div>
  );
};

export default ColorSchemeToggle;