'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Theme {
  id: string;
  name: string;
  background: string;
  description: string;
}

interface ThemeConfig {
  themes: Theme[];
  defaultTheme: string;
}

export function useTheme() {
  const [currentTheme, setCurrentTheme] = useState<string>('space');
  const [themes, setThemes] = useState<Theme[]>([
    {
      id: 'space',
      name: '星空',
      background: '/greg-rakozy-oMpAz-DN-9I-unsplash.jpg',
      description: '深邃的星空背景'
    },
    {
      id: 'universe',
      name: '宇宙',
      background: '/themes/backgrounds/1.jpg',
      description: '神秘的宇宙背景'
    },
    {
      id: 'Mars',
      name: '火星',
      background: '/themes/backgrounds/2.jpg',
      description: '火星的神秘景色'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化主题（从localStorage读取）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('homepage-theme') || 'space';
      console.log('Initializing theme from localStorage:', savedTheme);
      setCurrentTheme(savedTheme);
    }
  }, []);

  // 切换主题
  const switchTheme = useCallback((themeId: string) => {
    console.log('=== THEME SWITCH START ===');
    console.log('Switching theme from:', currentTheme, 'to:', themeId);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('homepage-theme', themeId);
      console.log('Theme saved to localStorage:', themeId);
    }
    
    setCurrentTheme(themeId);
    console.log('setCurrentTheme called with:', themeId);
    console.log('=== THEME SWITCH END ===');
  }, [currentTheme]);

  // 获取当前主题信息 - 使用useMemo确保响应式更新
  const currentThemeData = useMemo(() => {
    const theme = themes.find(theme => theme.id === currentTheme) || themes[0];
    console.log('Current theme data updated:', theme);
    return theme;
  }, [themes, currentTheme]);

  // 获取下一个主题（用于快速切换）
  const getNextTheme = () => {
    const currentIndex = themes.findIndex(theme => theme.id === currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    return themes[nextIndex];
  };

  return {
    currentTheme,
    themes,
    isLoading,
    switchTheme,
    currentThemeData,
    getNextTheme
  };
}