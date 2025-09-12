'use client';

import React from 'react';
import { List, Flame, Tag, Calendar } from 'lucide-react';
import { useTheme } from './ThemeProvider';

type WeekViewType = 'list' | 'priority' | 'tag' | 'calendar';

interface ViewSwitcherProps {
  activeView: WeekViewType;
  onViewChange: (view: WeekViewType) => void;
  activeTab: 'today' | 'week';
}

const viewOptions = [
  { value: 'list' as const, label: '列表视图', icon: List },
  { value: 'priority' as const, label: '优先度视图', icon: Flame },
  { value: 'tag' as const, label: '标签视图', icon: Tag },
  { value: 'calendar' as const, label: '日历视图', icon: Calendar },
];

export function ViewSwitcher({ activeView, onViewChange, activeTab }: ViewSwitcherProps) {
  const { getThemeColors } = useTheme();
  const colors = getThemeColors();

  // 今日任务只显示列表视图，不显示视图切换器
  if (activeTab === 'today') {
    return null;
  }

  // 本周任务显示所有视图选项
  return (
    <div className="flex justify-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-purple-100">
        <div className="grid grid-cols-4 gap-1">
          {viewOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => onViewChange(value)}
              className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm min-w-[100px] ${
                activeView === value
                  ? 'bg-purple-500 text-white shadow-md transform scale-105'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}