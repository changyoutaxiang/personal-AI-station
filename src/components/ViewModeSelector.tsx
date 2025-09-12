'use client';

import { useState } from 'react';
import { Calendar, CalendarDays, Archive } from 'lucide-react';

export type ViewMode = 'today' | 'week' | 'history';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  className?: string;
}

const VIEW_MODES = [
  {
    key: 'today' as ViewMode,
    label: '今日记录',
    icon: Calendar,
    description: '当天记录，瀑布流双排展示'
  },
  {
    key: 'week' as ViewMode,
    label: '本周记录',
    icon: CalendarDays,
    description: '本周记录，单排展示'
  },
  {
    key: 'history' as ViewMode,
    label: '历史记录',
    icon: Archive,
    description: '所有历史记录，单排展示'
  }
];

export default function ViewModeSelector({ 
  currentMode, 
  onModeChange, 
  className = '' 
}: ViewModeSelectorProps) {
  return (
    <div 
      className={`flex rounded-lg p-1 shadow-sm border ${className}`}
      style={{
        backgroundColor: 'var(--card-glass)',
        borderColor: 'var(--card-border)'
      }}
    >
      {VIEW_MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.key;
        
        return (
          <button
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
            className="flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 shadow-sm"
            style={{
              backgroundColor: isActive ? 'var(--flow-primary)' : 'transparent',
              color: isActive ? 'var(--text-on-primary)' : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'var(--card-glass-hover)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
            title={mode.description}
          >
            <Icon size={16} />
            <span className="text-sm font-medium">{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
}