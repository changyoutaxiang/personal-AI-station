'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from '@/types/todo';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  getThemeColors: () => {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    darkBackground: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes = {
  sunset: {
    primary: 'from-orange-300 to-pink-400',
    secondary: 'from-pink-300 to-rose-300',
    accent: 'from-yellow-300 to-orange-400',
    background: 'from-pink-50 via-purple-25 to-indigo-50',
    darkBackground: 'from-orange-300 via-pink-300 to-purple-400'
  },
  ocean: {
    primary: 'from-blue-300 to-cyan-400',
    secondary: 'from-cyan-300 to-teal-300',
    accent: 'from-indigo-300 to-blue-400',
    background: 'from-blue-50 via-cyan-25 to-teal-50',
    darkBackground: 'from-blue-300 via-cyan-300 to-teal-400'
  },
  forest: {
    primary: 'from-green-300 to-emerald-400',
    secondary: 'from-emerald-300 to-teal-300',
    accent: 'from-lime-300 to-green-400',
    background: 'from-green-50 via-emerald-25 to-teal-50',
    darkBackground: 'from-green-300 via-emerald-300 to-teal-400'
  },
  galaxy: {
    primary: 'from-purple-300 to-indigo-400',
    secondary: 'from-indigo-300 to-purple-300',
    accent: 'from-violet-300 to-purple-400',
    background: 'from-purple-50 via-indigo-25 to-violet-50',
    darkBackground: 'from-purple-300 via-indigo-300 to-violet-400'
  },
  candy: {
    primary: 'from-pink-300 to-purple-400',
    secondary: 'from-purple-300 to-pink-300',
    accent: 'from-fuchsia-300 to-pink-400',
    background: 'from-pink-50 via-fuchsia-25 to-purple-50',
    darkBackground: 'from-pink-300 via-fuchsia-300 to-purple-400'
  }
};

interface ThemeProviderProps {
  children: ReactNode;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export function ThemeProvider({ children, theme, setTheme }: ThemeProviderProps) {
  const getThemeColors = () => {
    return themes[theme] || themes.sunset; // 默认使用sunset主题
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, getThemeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}