'use client';

import { useState, useEffect } from 'react';

export interface PomodoroConfig {
  // 功能开关
  enableAnimations: boolean;
  enableSound: boolean;
  
  // 时间设置
  workDuration: number;        // 工作时间（分钟）
  breakDuration: number;       // 休息时间（分钟）
  
  // 界面偏好
  showProgress: boolean;       // 显示进度条
  showStats: boolean;         // 显示统计信息
}

const defaultConfig: PomodoroConfig = {
  enableAnimations: true,
  enableSound: true,
  workDuration: 25,
  breakDuration: 5,
  showProgress: true,
  showStats: false
};

export function usePomodoroConfig() {
  const [config, setConfig] = useState<PomodoroConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('pomodoro-config');
        if (saved) {
          const parsed = JSON.parse(saved);
          return { ...defaultConfig, ...parsed };
        }
      } catch (error) {
        console.error('加载番茄钟配置失败:', error);
      }
    }
    return defaultConfig;
  });

  const updateConfig = (updates: Partial<PomodoroConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('pomodoro-config', JSON.stringify(newConfig));
      } catch (error) {
        console.error('保存番茄钟配置失败:', error);
      }
    }
  };

  const resetConfig = () => {
    setConfig(defaultConfig);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('pomodoro-config');
      } catch (error) {
        console.error('重置番茄钟配置失败:', error);
      }
    }
  };

  return {
    config,
    updateConfig,
    resetConfig
  };
}