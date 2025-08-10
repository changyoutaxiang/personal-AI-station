'use client';

import React, { useState, useEffect } from 'react';
import { X, Keyboard, Search, Filter, ArrowUp, ArrowDown, Command } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  isOpen,
  onClose
}) => {
  const shortcuts = [
    {
      category: '搜索与筛选',
      items: [
        {
          keys: ['Ctrl', 'K'],
          description: '聚焦搜索框',
          macKeys: ['⌘', 'K']
        },
        {
          keys: ['Ctrl', 'F'],
          description: '切换筛选器面板',
          macKeys: ['⌘', 'F']
        },
        {
          keys: ['Esc'],
          description: '关闭所有弹窗'
        }
      ]
    },
    {
      category: '导航与选择',
      items: [
        {
          keys: ['↑', '↓'],
          description: '在搜索历史中导航',
          macKeys: ['↑', '↓']
        },
        {
          keys: ['Enter'],
          description: '选择搜索历史项',
          macKeys: ['↵']
        }
      ]
    },
    {
      category: '任务操作',
      items: [
        {
          keys: ['Click'],
          description: '编辑任务'
        },
        {
          keys: ['Space'],
          description: '切换任务完成状态'
        }
      ]
    }
  ];

  const isMac = typeof window !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glassmorphism-card p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-5 h-5 text-color-primary" />
            <h3 className="text-lg font-semibold text-text-primary">键盘快捷键</h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-semibold text-text-primary mb-3">
                {category.category}
              </h4>
              <div className="space-y-2">
                {category.items.map((item) => {
                  const displayKeys = isMac && item.macKeys ? item.macKeys : item.keys;
                  return (
                    <div key={item.description} className="flex items-center justify-between">
                      <span className="text-sm text-text-secondary">{item.description}</span>
                      <div className="flex items-center space-x-1">
                        {displayKeys.map((key, index) => (
                          <React.Fragment key={key}>
                            <kbd className="px-2 py-1 text-xs bg-background-elevated border border-border rounded-md"
                            >
                              {key === 'Command' || key === '⌘' ? <Command className="w-3 h-3" /> : key}
                            </kbd>
                            {index < displayKeys.length - 1 && (
                              <span className="text-text-muted">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <p className="text-xs text-text-muted text-center">
            提示：按 Esc 键可以快速关闭此帮助窗口
          </p>
        </div>
      </div>
    </div>
  );
};