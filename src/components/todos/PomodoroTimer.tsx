'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Maximize, Minimize, X } from 'lucide-react';
import { usePomodoro } from '@/hooks/todos/usePomodoro';
import { useTheme } from './ThemeProvider';
import { usePomodoroConfig } from '@/hooks/todos/usePomodoroConfig';


interface PomodoroTimerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export function PomodoroTimer({ isVisible, onToggle }: PomodoroTimerProps) {
  const { config } = usePomodoroConfig();
  const { timeLeft, isActive, isBreak, start, pause, reset, formatTime } = usePomodoro(config);
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // ESC键退出全屏
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown);
      // 防止页面滚动
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isFullscreen]);

  if (!isVisible) {
    return null;
  }

  // 全屏模式
  if (isFullscreen) {
    // 使用主题调色板的深色背景
    const backgroundClass = `bg-gradient-to-br ${colors.darkBackground || 'from-gray-900 to-gray-800'}`;

    return (
      <div className={`fixed inset-0 ${backgroundClass} z-[9999] flex items-center justify-center`}>
        {/* 背景动画效果 */}
        {config.enableAnimations && (
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute w-80 h-80 rounded-full mix-blend-multiply filter blur-xl bg-gradient-to-r ${colors.primary} opacity-30 animate-pulse`}
              style={{
                top: '10%',
                left: '10%',
              }}
            />
            <div className={`absolute w-80 h-80 rounded-full mix-blend-multiply filter blur-xl bg-gradient-to-r ${colors.secondary} opacity-30 animate-pulse`}
              style={{
                top: '60%',
                right: '10%',
                animationDelay: '2s'
              }}
            />
            <div className={`absolute w-80 h-80 rounded-full mix-blend-multiply filter blur-xl bg-gradient-to-r ${colors.accent} opacity-30 animate-pulse`}
              style={{
                bottom: '10%',
                left: '50%',
                animationDelay: '4s'
              }}
            />
          </div>
        )}

        {/* 退出全屏按钮 - 响应式位置 */}
        <button
          onClick={() => setIsFullscreen(false)}
          className="absolute top-16 right-4 md:top-20 md:right-6 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm text-white rounded-full transition-all duration-300 transform hover:scale-110 hover:bg-white/30 shadow-2xl flex items-center justify-center"
          title="退出全屏 (ESC)"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* 主要内容 */}
        <div className="relative z-10 text-center text-white">

          {/* 番茄钟图标 */}
          <div className="mb-8">
            <div className="text-8xl mb-4 animate-bounce">
              {isBreak ? '🌱' : '🍅'}
            </div>
          </div>

          {/* 超大时间显示 - 响应式优化 */}
          <div className="mb-8 md:mb-12 px-4">
            <div className="text-5xl sm:text-7xl md:text-9xl font-mono font-bold mb-4 text-white drop-shadow-2xl" style={{ textShadow: '0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)' }}>
               {formatTime()}
             </div>
            
            {/* 进度条 - 响应式宽度 */}
            {config.showProgress && (
              <div className="w-72 sm:w-80 md:w-96 h-3 bg-white/20 rounded-full mx-auto mb-6 md:mb-8 overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${colors.primary} rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${((isBreak ? config.breakDuration * 60 : config.workDuration * 60) - timeLeft) / (isBreak ? config.breakDuration * 60 : config.workDuration * 60) * 100}%` 
                  }}
                ></div>
              </div>
            )}
          </div>

          {/* 控制按钮 - 响应式优化 */}
          <div className="flex justify-center space-x-4 md:space-x-8 px-4">
            <button
              onClick={isActive ? pause : start}
              className={`flex items-center space-x-2 md:space-x-3 px-6 py-4 md:px-12 md:py-6 bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl`}
            >
              {isActive ? <Pause className="w-6 h-6 md:w-8 md:h-8" /> : <Play className="w-6 h-6 md:w-8 md:h-8" />}
              <span className="hidden sm:inline">{isActive ? '暂停' : '开始'}</span>
            </button>
            
            <button
              onClick={reset}
              className={`flex items-center space-x-2 md:space-x-3 px-6 py-4 md:px-12 md:py-6 bg-black/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-110 hover:bg-black/20 shadow-2xl`}
            >
              <RotateCcw className="w-6 h-6 md:w-8 md:h-8" />
              <span className="hidden sm:inline">重置</span>
            </button>
          </div>

          
        </div>
      </div>
    );
  }

  // 普通浮动窗口模式 - 响应式优化
  return (
    <div className="fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl shadow-2xl p-4 md:p-6 w-72 md:w-80 z-50 mx-4">
      <div className="text-center">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {isBreak ? '🌱 休息时间' : '🍅 专注时间'}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsFullscreen(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1"
              title="全屏模式"
            >
              <Maximize className="w-4 h-4" />
            </button>
            <button
              onClick={onToggle}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>

        <div className={`text-4xl font-mono font-bold mb-6 bg-gradient-to-r ${colors.primary} text-white px-4 py-2 rounded-xl shadow-lg`}>
           {formatTime()}
         </div>

        <div className="flex justify-center space-x-3 md:space-x-4 mb-4">
          <button
            onClick={isActive ? pause : start}
            className={`flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r ${colors.primary} text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm md:text-base`}
          >
            {isActive ? <Pause className="w-4 h-4 md:w-5 md:h-5" /> : <Play className="w-4 h-4 md:w-5 md:h-5" />}
            <span className="hidden sm:inline">{isActive ? '暂停' : '开始'}</span>
          </button>
          
          <button
            onClick={reset}
            className="flex items-center space-x-1 md:space-x-2 px-4 md:px-6 py-2 md:py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-medium transition-all duration-200 hover:border-gray-300 text-sm md:text-base"
          >
            <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">重置</span>
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {isBreak ? '享受短暂的休息时光' : '保持专注，你可以的！'}
        </div>
      </div>
    </div>
  );
}