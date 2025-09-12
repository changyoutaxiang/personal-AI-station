'use client';

import React from 'react';
import { Settings, RotateCcw, Timer, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { usePomodoroConfig, PomodoroConfig } from '@/hooks/todos/usePomodoroConfig';

interface PomodoroSettingsProps {
  onClose?: () => void;
}

export function PomodoroSettings({ onClose }: PomodoroSettingsProps) {
  const { config, updateConfig, resetConfig } = usePomodoroConfig();

  const handleConfigChange = <K extends keyof PomodoroConfig>(
    key: K,
    value: PomodoroConfig[K]
  ) => {
    updateConfig({ [key]: value });
  };

  return (
    <div className="space-y-6">
      {/* 标题和重置按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800">番茄钟设置</h3>
        </div>
        <button
          onClick={resetConfig}
          className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="重置为默认设置"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重置</span>
        </button>
      </div>



      {/* 功能开关 */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Timer className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">功能设置</label>
        </div>

        <div className="space-y-3">


          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">背景动画效果</span>
                <p className="text-xs text-gray-500">全屏模式下的动态背景球</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableAnimations}
                onChange={(e) => handleConfigChange('enableAnimations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {config.enableSound ? (
                <Volume2 className="w-4 h-4 text-gray-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-gray-600" />
              )}
              <div>
                <span className="text-sm font-medium text-gray-800">提示音</span>
                <p className="text-xs text-gray-500">计时结束时的声音提醒</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableSound}
                onChange={(e) => handleConfigChange('enableSound', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {config.showProgress ? (
                <Eye className="w-4 h-4 text-gray-600" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-600" />
              )}
              <div>
                <span className="text-sm font-medium text-gray-800">显示进度条</span>
                <p className="text-xs text-gray-500">在界面上显示进度指示器</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.showProgress}
                onChange={(e) => handleConfigChange('showProgress', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 时间设置 */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Timer className="w-4 h-4 text-gray-600" />
          <label className="text-sm font-medium text-gray-700">时间设置</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-600">专注时长（分钟）</label>
            <input
              type="number"
              min="1"
              max="60"
              value={config.workDuration}
              onChange={(e) => handleConfigChange('workDuration', parseInt(e.target.value) || 25)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-600">休息时长（分钟）</label>
            <input
              type="number"
              min="1"
              max="30"
              value={config.breakDuration}
              onChange={(e) => handleConfigChange('breakDuration', parseInt(e.target.value) || 5)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 保存提示 */}
      <div className="text-xs text-gray-500 text-center p-3 bg-gray-50 rounded-lg">
        💡 设置会自动保存到本地存储
      </div>
    </div>
  );
}