'use client';

import React from 'react';
import { Animated } from '../animations';

export interface ErrorStateProps {
  type?: 'network' | 'database' | 'permission' | 'general' | 'timeout';
  title?: string;
  description?: string;
  error?: Error | string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
  size?: 'small' | 'medium' | 'large';
  theme?: 'light' | 'dark' | 'auto';
  showDetails?: boolean;
}

// 错误状态配置
const errorConfig = {
  network: {
    icon: '🌐',
    title: '网络连接错误',
    description: '无法连接到服务器，请检查您的网络连接',
    color: 'orange',
    animation: 'pulse'
  },
  database: {
    icon: '🗄️',
    title: '数据库错误',
    description: '无法访问数据库，请联系技术支持',
    color: 'red',
    animation: 'shake'
  },
  permission: {
    icon: '🔒',
    title: '权限不足',
    description: '您没有权限访问此功能，请联系管理员',
    color: 'yellow',
    animation: 'fadeIn'
  },
  timeout: {
    icon: '⏰',
    title: '请求超时',
    description: '服务器响应时间过长，请稍后重试',
    color: 'amber',
    animation: 'bounce'
  },
  general: {
    icon: '⚠️',
    title: '发生错误',
    description: '出现了一些问题，请稍后重试',
    color: 'gray',
    animation: 'fadeIn'
  }
};

// 颜色映射 - 使用CSS变量
const getColorStyles = (colorType: string) => {
  const baseStyles = {
    orange: {
      bg: { backgroundColor: 'var(--warning-color, #f97316)' },
      border: { borderColor: 'var(--warning-color, #f97316)' },
      text: { color: 'var(--warning-color, #f97316)' },
      icon: { color: 'var(--warning-color, #f97316)' },
      button: { backgroundColor: 'var(--warning-color, #f97316)', color: 'var(--text-on-primary, white)' },
      secondaryButton: { backgroundColor: 'var(--card-glass, rgba(249, 115, 22, 0.1))', color: 'var(--warning-color, #f97316)' }
    },
    red: {
      bg: { backgroundColor: 'var(--error-color, #ef4444)' },
      border: { borderColor: 'var(--error-color, #ef4444)' },
      text: { color: 'var(--error-color, #ef4444)' },
      icon: { color: 'var(--error-color, #ef4444)' },
      button: { backgroundColor: 'var(--error-color, #ef4444)', color: 'var(--text-on-primary, white)' },
      secondaryButton: { backgroundColor: 'var(--card-glass, rgba(239, 68, 68, 0.1))', color: 'var(--error-color, #ef4444)' }
    },
    yellow: {
      bg: { backgroundColor: 'var(--warning-color, #eab308)' },
      border: { borderColor: 'var(--warning-color, #eab308)' },
      text: { color: 'var(--warning-color, #eab308)' },
      icon: { color: 'var(--warning-color, #eab308)' },
      button: { backgroundColor: 'var(--warning-color, #eab308)', color: 'var(--text-on-primary, white)' },
      secondaryButton: { backgroundColor: 'var(--card-glass, rgba(234, 179, 8, 0.1))', color: 'var(--warning-color, #eab308)' }
    },
    amber: {
      bg: { backgroundColor: 'var(--warning-color, #f59e0b)' },
      border: { borderColor: 'var(--warning-color, #f59e0b)' },
      text: { color: 'var(--warning-color, #f59e0b)' },
      icon: { color: 'var(--warning-color, #f59e0b)' },
      button: { backgroundColor: 'var(--warning-color, #f59e0b)', color: 'var(--text-on-primary, white)' },
      secondaryButton: { backgroundColor: 'var(--card-glass, rgba(245, 158, 11, 0.1))', color: 'var(--warning-color, #f59e0b)' }
    },
    gray: {
      bg: { backgroundColor: 'var(--card-glass, rgba(107, 114, 128, 0.1))' },
      border: { borderColor: 'var(--card-border, rgba(107, 114, 128, 0.2))' },
      text: { color: 'var(--text-secondary, #6b7280)' },
      icon: { color: 'var(--text-muted, #9ca3af)' },
      button: { backgroundColor: 'var(--text-secondary, #6b7280)', color: 'var(--text-on-primary, white)' },
      secondaryButton: { backgroundColor: 'var(--card-glass, rgba(107, 114, 128, 0.1))', color: 'var(--text-secondary, #6b7280)' }
    }
  };
  
  return baseStyles[colorType as keyof typeof baseStyles] || baseStyles.gray;
};

const sizeMap = {
  small: {
    icon: 'text-4xl',
    title: 'text-lg',
    description: 'text-sm',
    padding: 'py-6',
    gap: 'gap-3'
  },
  medium: {
    icon: 'text-6xl',
    title: 'text-xl',
    description: 'text-base',
    padding: 'py-10',
    gap: 'gap-4'
  },
  large: {
    icon: 'text-8xl',
    title: 'text-2xl',
    description: 'text-lg',
    padding: 'py-14',
    gap: 'gap-6'
  }
};

export default function ErrorState({
  type = 'general',
  title,
  description,
  error,
  action,
  secondaryAction,
  className = '',
  size = 'medium',
  theme = 'auto',
  showDetails = false
}: ErrorStateProps) {
  const config = errorConfig[type];
  const colorStyles = getColorStyles(config.color);
  const sizes = sizeMap[size];
  
  // 检测当前主题
  const [isDark, setIsDark] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  
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

  const getAnimation = () => {
    switch (config.animation) {
      case 'pulse':
        return 'animate-pulse';
      case 'shake':
        return 'animate-shake';
      case 'bounce':
        return 'animate-bounce';
      default:
        return 'animate-fadeIn';
    }
  };

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div 
      className={`
        border-2 border-dashed rounded-2xl 
        ${sizes.padding} 
        ${sizes.gap}
        flex flex-col items-center justify-center
        text-center
        relative
        overflow-hidden
        transition-all duration-300
        hover:shadow-lg
        ${className}
      `}
      style={{
        ...colorStyles.bg,
        ...colorStyles.border
      }}
    >
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(to bottom right, color-mix(in oklab, var(--foreground) 10%, transparent), transparent)'}}></div>
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br from-red-400 to-orange-400 opacity-20 rounded-full blur-xl pointer-events-none"></div>

      {/* 动画图标 */}
      <div className="relative z-10">
        <Animated animation="fadeIn" duration={500}>
          <div className={`
            ${sizes.icon} 
            ${getAnimation()}
            mb-4
            relative
            inline-block
          `}>
            {config.icon}
            {/* 图标光晕效果 */}
            <div className={`
              absolute inset-0 
              bg-gradient-to-br from-red-400 to-orange-400 
              opacity-30 rounded-full blur-2xl
              -z-10
            `}></div>
          </div>
        </Animated>
      </div>

      {/* 标题 */}
      <Animated animation="fadeIn" duration={500} delay={100}>
        <h3 
          className={`
            ${sizes.title} 
            font-bold 
            mb-2
            relative
          `}
          style={colorStyles.text}
        >
          {title || config.title}
          {/* 标题下划线装饰 */}
          <div className={`
            absolute -bottom-1 left-1/2 transform -translate-x-1/2 
            w-16 h-0.5 bg-gradient-to-r from-red-400 to-orange-400 rounded-full
          `}></div>
        </h3>
      </Animated>

      {/* 描述 */}
      <Animated animation="fadeIn" duration={500} delay={200}>
        <p 
          className={`
            ${sizes.description} 
            mb-6
            max-w-md
            leading-relaxed
          `}
          style={colorStyles.text}
        >
          {description || config.description}
        </p>
      </Animated>

      {/* 错误详情 */}
      {showDetails && errorMessage && (
        <Animated animation="fadeIn" duration={500} delay={300}>
          <div className="mb-6 w-full max-w-md">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-2 text-sm font-medium text-current mb-2 hover:opacity-80 transition-opacity"
            >
              <span>{expanded ? '收起' : '查看'}错误详情</span>
              <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
              {expanded && (
              <div className="rounded-lg p-3 text-left font-mono text-xs overflow-auto max-h-40 border" style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)'}}>
                <div className="font-semibold mb-1">错误信息：</div>
                <div className="mb-2">{errorMessage}</div>
                {errorStack && (
                  <div>
                    <div className="font-semibold mb-1">堆栈跟踪：</div>
                    <div className="whitespace-pre-wrap opacity-75">{errorStack}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Animated>
      )}

      {/* 操作按钮 */}
      {(action || secondaryAction) && (
        <Animated animation="fadeIn" duration={500} delay={400}>
          <div className="flex flex-col sm:flex-row gap-3 z-10">
            {action && (
              <button
                onClick={action.onClick}
                className={`
                  px-6 py-3 
                  rounded-xl 
                  font-medium 
                  transition-all duration-200 
                  transform hover:scale-105 
                  shadow-lg 
                  hover:shadow-xl
                  flex items-center gap-2
                  min-w-[120px]
                  justify-center
                `}
                style={colorStyles.button}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            )}
            
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className={`
                  px-6 py-3 
                  rounded-xl 
                  font-medium 
                  transition-all duration-200 
                  transform hover:scale-105 
                  flex items-center gap-2
                  min-w-[120px]
                  justify-center
                `}
                style={colorStyles.secondaryButton}
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </div>
        </Animated>
      )}

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-shake {
          animation: shake 2s ease-in-out infinite;
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
      `}</style>
    </div>
  );
}