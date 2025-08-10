'use client';

import React from 'react';
import { Animated } from '../animations';

export interface LoadingStateProps {
  type?: 'spinner' | 'dots' | 'pulse' | 'bars';
  size?: 'small' | 'medium' | 'large';
  text?: string;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  centered?: boolean;
}

// 加载状态配置
const loadingConfig = {
  spinner: {
    icon: '🌀',
    animation: 'animate-spin',
    sizes: {
      small: 'text-2xl',
      medium: 'text-4xl',
      large: 'text-6xl'
    }
  },
  dots: {
    icon: '💭',
    animation: 'animate-pulse',
    sizes: {
      small: 'text-xl',
      medium: 'text-3xl',
      large: 'text-5xl'
    }
  },
  pulse: {
    icon: '⚡',
    animation: 'animate-pulse',
    sizes: {
      small: 'text-2xl',
      medium: 'text-4xl',
      large: 'text-6xl'
    }
  },
  bars: {
    icon: '📊',
    animation: 'animate-bounce',
    sizes: {
      small: 'text-xl',
      medium: 'text-3xl',
      large: 'text-5xl'
    }
  }
};

const sizeMap = {
  small: {
    container: 'p-4',
    text: 'text-sm',
    gap: 'gap-2'
  },
  medium: {
    container: 'p-8',
    text: 'text-base',
    gap: 'gap-4'
  },
  large: {
    container: 'p-12',
    text: 'text-lg',
    gap: 'gap-6'
  }
};

export default function LoadingState({
  type = 'spinner',
  size = 'medium',
  text = '加载中...',
  className = '',
  theme = 'auto',
  centered = true
}: LoadingStateProps) {
  const config = loadingConfig[type];
  const sizes = sizeMap[size];
  
  // 检测当前主题
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    const checkTheme = () => {
      if (theme === 'auto') {
        const isDarkMode = document.documentElement.classList.contains('dark') || 
                         document.documentElement.getAttribute('data-color-scheme') === 'dark' ||
                         window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDark(isDarkMode);
      } else {
        setIsDark(theme === 'dark');
      }
    };
    
    checkTheme();
    window.addEventListener('themechange', checkTheme);
    return () => window.removeEventListener('themechange', checkTheme);
  }, [theme]);

  const textColor = isDark ? 'text-gray-300' : 'text-gray-600';
  const iconColor = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className={`
      ${sizes.container}
      ${sizes.gap}
      flex flex-col items-center justify-center
      ${centered ? 'w-full h-full' : ''}
      ${className}
    `}>
      {/* 动画图标 */}
      <div className="relative">
        <Animated animation="fadeIn" duration={300}>
          <div className={`
            ${config.sizes[size]}
            ${config.animation}
            ${iconColor}
            inline-block
          `}>
            {config.icon}
          </div>
        </Animated>
        
        {/* 图标光晕效果 */}
        {type === 'spinner' && (
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
        )}
      </div>

      {/* 加载文本 */}
      {text && (
        <Animated animation="fadeIn" duration={300} delay={150}>
          <p className={`
            ${sizes.text}
            ${textColor}
            font-medium
            text-center
          `}>
            {text}
          </p>
        </Animated>
      )}

      {/* 动态加载指示器 */}
      <div className="flex items-center gap-1 mt-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              w-1.5 h-1.5 
              bg-current 
              rounded-full 
              animate-bounce
              opacity-40
              ${textColor}
            `}
            style={{
              animationDelay: `${i * 150}ms`,
              width: size === 'small' ? '4px' : size === 'medium' ? '6px' : '8px',
              height: size === 'small' ? '4px' : size === 'medium' ? '6px' : '8px'
            }}
          />
        ))}
      </div>

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        .animate-bounce {
          animation: bounce 1s ease-in-out infinite;
        }
        
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}