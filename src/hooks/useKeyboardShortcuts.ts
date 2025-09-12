'use client';

import { useEffect, useCallback } from 'react';

interface KeyboardShortcut {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    const isCmd = event.metaKey; // MacOS Cmd键
    const isCtrl = event.ctrlKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    // 构建快捷键字符串
    let shortcut = '';
    if (isCmd) shortcut += 'cmd+';
    if (isCtrl) shortcut += 'ctrl+';
    if (isShift) shortcut += 'shift+';
    if (isAlt) shortcut += 'alt+';
    
    // 处理特殊键
    if (key === ' ') {
      shortcut += 'space';
    } else if (key === 'arrowleft') {
      shortcut += 'arrowleft';
    } else if (key === 'arrowright') {
      shortcut += 'arrowright';
    } else if (key === 'arrowup') {
      shortcut += 'arrowup';
    } else if (key === 'arrowdown') {
      shortcut += 'arrowdown';
    } else if (key === 'enter') {
      shortcut += 'enter';
    } else if (key === 'escape') {
      shortcut += 'escape';
    } else if (key === 'backspace') {
      shortcut += 'backspace';
    } else if (key === 'delete') {
      shortcut += 'delete';
    } else if (key === 'tab') {
      shortcut += 'tab';
    } else {
      shortcut += key;
    }

    // 移除末尾的加号
    shortcut = shortcut.replace(/\+$/, '');

    // 检查是否有匹配的快捷键
    if (shortcuts[shortcut]) {
      event.preventDefault();
      shortcuts[shortcut]();
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}