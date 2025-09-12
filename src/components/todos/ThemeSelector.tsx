'use client';

import React, { useState } from 'react';
import { Palette, Settings, Timer } from 'lucide-react';
import { Theme } from '@/types/todo';
import { useTheme } from './ThemeProvider';
import { PomodoroSettings } from './PomodoroSettings';

const themes: { value: Theme; label: string; colors: string[] }[] = [
  { value: 'sunset', label: '日落', colors: ['#fb7185', '#f97316', '#fbbf24'] },
  { value: 'ocean', label: '海洋', colors: ['#60a5fa', '#06b6d4', '#10b981'] },
  { value: 'forest', label: '森林', colors: ['#34d399', '#10b981', '#059669'] },
  { value: 'galaxy', label: '星系', colors: ['#a78bfa', '#8b5cf6', '#7c3aed'] },
  { value: 'candy', label: '糖果', colors: ['#f472b6', '#a855f7', '#ec4899'] }
];

interface ThemeSelectorProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function ThemeSelector({ isOpen, onToggle }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'theme' | 'pomodoro'>('theme');

  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="p-3 text-gray-600 hover:text-gray-800 transition-colors duration-200 hover:bg-gray-100 rounded-lg"
        title="主题与番茄钟设置"
      >
        <Palette className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 w-80 z-50">
          {/* 标签切换 */}
          <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('theme')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'theme'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>主题</span>
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'pomodoro'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>番茄钟</span>
            </button>
          </div>

          {/* 内容区域 */}
          {activeTab === 'theme' ? (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">选择主题</h3>
              {themes.map(themeOption => (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    // onToggle(); // 注释掉自动关闭，让用户可以继续切换标签
                  }}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    theme === themeOption.value
                      ? 'bg-purple-50 border-2 border-purple-200'
                      : 'hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <div className="flex space-x-1">
                    {themeOption.colors.map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-gray-700">{themeOption.label}</span>
                  {theme === themeOption.value && (
                    <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <PomodoroSettings />
          )}
        </div>
      )}
    </div>
  );
}