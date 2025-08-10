'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'warm' | 'cyber' | 'forest' | 'dopamine';
export type ColorScheme = 'light' | 'dark' | 'auto';

// 可选主题列表
export const AVAILABLE_THEMES: Array<{ value: Theme; label: string }> = [
  { value: 'warm', label: '温暖粉色' },
  { value: 'cyber', label: '科技未来' },
  { value: 'forest', label: '森林绿' },
  { value: 'dopamine', label: '多巴胺' },
];

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('warm');
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>('auto');

  // 从localStorage加载设置
  useEffect(() => {
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    const savedScheme = localStorage.getItem('app-color-scheme') as ColorScheme;
    
    if (savedTheme && AVAILABLE_THEMES.some(t => t.value === savedTheme)) {
      setThemeState(savedTheme);
    }
    if (savedScheme && ['light', 'dark', 'auto'].includes(savedScheme)) {
      setColorSchemeState(savedScheme);
    }
  }, []);

  // 应用主题和颜色方案到document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    
    const actualScheme = colorScheme === 'auto' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : colorScheme;
    
    document.documentElement.setAttribute('data-color-scheme', actualScheme);
  }, [theme, colorScheme]);

  // 监听系统主题变化
  useEffect(() => {
    if (colorScheme !== 'auto') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const newScheme = mediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-color-scheme', newScheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [colorScheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('app-theme', newTheme);
  };

  const setColorScheme = (newScheme: ColorScheme) => {
    setColorSchemeState(newScheme);
    localStorage.setItem('app-color-scheme', newScheme);
  };

  const toggleTheme = () => {
    const themes: Theme[] = AVAILABLE_THEMES.map(t => t.value);
    const currentIndex = themes.indexOf(theme);
    const newTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(newTheme);
  };

  const toggleColorScheme = () => {
    const schemes: ColorScheme[] = ['light', 'dark', 'auto'];
    const currentIndex = schemes.indexOf(colorScheme);
    const newScheme = schemes[(currentIndex + 1) % schemes.length];
    setColorScheme(newScheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      colorScheme, 
      toggleTheme, 
      setTheme, 
      setColorScheme, 
      toggleColorScheme 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};