'use client';

import React from 'react';
import { Animated } from '../animations';

export interface EmptyStateProps {
  type: 'entries' | 'search' | 'behavior' | 'ai-analysis' | 'todos' | 'projects' | 'insights' | 'data-export' | 'weekly-report' | 'batch-operations' | 'generic' | 'loading' | 'error' | 'network-error' | 'database-error' | 'permission-denied' | 'partial-data';
  title?: string;
  description?: string;
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
  children?: React.ReactNode;
}

// 空状态类型配置
const emptyStateConfig = {
  entries: {
    icon: '💭',
    title: '思维的画布还是空白的',
    description: '每一个伟大的想法都始于第一笔',
    color: 'blue',
    animation: 'thoughtBubble',
    gradient: 'from-blue-400 to-cyan-400'
  },
  search: {
    icon: '🔍',
    title: '没有找到匹配的记录',
    description: '尝试使用不同的关键词或检查拼写',
    color: 'yellow',
    animation: 'pulse',
    gradient: 'from-yellow-400 to-orange-400'
  },
  behavior: {
    icon: '📊',
    title: '暂无行为数据',
    description: '开始使用系统，我们将为您生成个性化的行为洞察',
    color: 'purple',
    animation: 'fadeIn',
    gradient: 'from-purple-400 to-pink-400'
  },
  'ai-analysis': {
    icon: '🤖',
    title: 'AI分析需要更多数据',
    description: '继续记录内容，AI将为您提供更深入的智能分析',
    color: 'indigo',
    animation: 'bounce',
    gradient: 'from-indigo-400 to-blue-400'
  },
  todos: {
    icon: '✅',
    title: '暂无待办事项',
    description: '添加一些任务来开始您的高效之旅',
    color: 'green',
    animation: 'shake',
    gradient: 'from-green-400 to-emerald-400'
  },
  projects: {
    icon: '📁',
    title: '还没有项目',
    description: '创建您的第一个项目来组织工作',
    color: 'orange',
    animation: 'spin',
    gradient: 'from-orange-400 to-red-400'
  },
  insights: {
    icon: '💡',
    title: '暂无洞察',
    description: '随着数据积累，这里将显示有价值的洞察',
    color: 'pink',
    animation: 'glow',
    gradient: 'from-pink-400 to-rose-400'
  },
  'data-export': {
    icon: '📤',
    title: '暂无数据可导出',
    description: '先添加一些记录，然后就可以导出您的数据了',
    color: 'teal',
    animation: 'fadeIn',
    gradient: 'from-teal-400 to-cyan-400'
  },
  'weekly-report': {
    icon: '📈',
    title: '暂无周报数据',
    description: '继续记录内容，下周就能生成您的专属周报',
    color: 'violet',
    animation: 'bounce',
    gradient: 'from-violet-400 to-purple-400'
  },
  'batch-operations': {
    icon: '🎯',
    title: '没有可操作的项目',
    description: '选择一些项目来进行批量操作',
    color: 'amber',
    animation: 'pulse',
    gradient: 'from-amber-400 to-yellow-400'
  },
  generic: {
    icon: '📝',
    title: '暂无数据',
    description: '数据加载中或暂无内容',
    color: 'gray',
    animation: 'fadeIn',
    gradient: 'from-gray-400 to-slate-400'
  },
  loading: {
    icon: '🌀',
    title: '正在加载',
    description: '请稍候，数据正在加载中',
    color: 'blue',
    animation: 'spin',
    gradient: 'from-blue-400 to-cyan-400'
  },
  error: {
    icon: '⚠️',
    title: '发生错误',
    description: '加载过程中出现问题，请稍后重试',
    color: 'red',
    animation: 'shake',
    gradient: 'from-red-400 to-orange-400'
  },
  'network-error': {
    icon: '🌐',
    title: '网络连接错误',
    description: '无法连接到服务器，请检查网络连接',
    color: 'orange',
    animation: 'pulse',
    gradient: 'from-orange-400 to-red-400'
  },
  'database-error': {
    icon: '🗄️',
    title: '数据库错误',
    description: '无法访问数据库，请联系技术支持',
    color: 'red',
    animation: 'shake',
    gradient: 'from-red-400 to-pink-400'
  },
  'permission-denied': {
    icon: '🔒',
    title: '权限不足',
    description: '您没有权限访问此功能，请联系管理员',
    color: 'yellow',
    animation: 'fadeIn',
    gradient: 'from-yellow-400 to-amber-400'
  },
  'partial-data': {
    icon: '📊',
    title: '数据不完整',
    description: '部分数据加载失败，显示可用内容',
    color: 'amber',
    animation: 'bounce',
    gradient: 'from-amber-400 to-yellow-400'
  }
};

// 颜色映射
const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    icon: 'text-blue-500',
    button: 'bg-blue-500 hover:bg-blue-600',
    secondaryButton: 'bg-blue-100 hover:bg-blue-200 text-blue-700',
    dark: {
      bg: 'bg-blue-900/20',
      border: 'border-blue-700/30',
      text: 'text-blue-300',
      icon: 'text-blue-400',
      button: 'bg-blue-600 hover:bg-blue-700',
      secondaryButton: 'bg-blue-800/50 hover:bg-blue-700/50 text-blue-300'
    }
  },
  yellow: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    icon: 'text-yellow-500',
    button: 'bg-yellow-500 hover:bg-yellow-600',
    secondaryButton: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700',
    dark: {
      bg: 'bg-yellow-900/20',
      border: 'border-yellow-700/30',
      text: 'text-yellow-300',
      icon: 'text-yellow-400',
      button: 'bg-yellow-600 hover:bg-yellow-700',
      secondaryButton: 'bg-yellow-800/50 hover:bg-yellow-700/50 text-yellow-300'
    }
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    icon: 'text-purple-500',
    button: 'bg-purple-500 hover:bg-purple-600',
    secondaryButton: 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    dark: {
      bg: 'bg-purple-900/20',
      border: 'border-purple-700/30',
      text: 'text-purple-300',
      icon: 'text-purple-400',
      button: 'bg-purple-600 hover:bg-purple-700',
      secondaryButton: 'bg-purple-800/50 hover:bg-purple-700/50 text-purple-300'
    }
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    text: 'text-indigo-600',
    icon: 'text-indigo-500',
    button: 'bg-indigo-500 hover:bg-indigo-600',
    secondaryButton: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700',
    dark: {
      bg: 'bg-indigo-900/20',
      border: 'border-indigo-700/30',
      text: 'text-indigo-300',
      icon: 'text-indigo-400',
      button: 'bg-indigo-600 hover:bg-indigo-700',
      secondaryButton: 'bg-indigo-800/50 hover:bg-indigo-700/50 text-indigo-300'
    }
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    icon: 'text-green-500',
    button: 'bg-green-500 hover:bg-green-600',
    secondaryButton: 'bg-green-100 hover:bg-green-200 text-green-700',
    dark: {
      bg: 'bg-green-900/20',
      border: 'border-green-700/30',
      text: 'text-green-300',
      icon: 'text-green-400',
      button: 'bg-green-600 hover:bg-green-700',
      secondaryButton: 'bg-green-800/50 hover:bg-green-700/50 text-green-300'
    }
  },
  orange: {
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    icon: 'text-orange-500',
    button: 'bg-orange-500 hover:bg-orange-600',
    secondaryButton: 'bg-orange-100 hover:bg-orange-200 text-orange-700',
    dark: {
      bg: 'bg-orange-900/20',
      border: 'border-orange-700/30',
      text: 'text-orange-300',
      icon: 'text-orange-400',
      button: 'bg-orange-600 hover:bg-orange-700',
      secondaryButton: 'bg-orange-800/50 hover:bg-orange-700/50 text-orange-300'
    }
  },
  pink: {
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-600',
    icon: 'text-pink-500',
    button: 'bg-pink-500 hover:bg-pink-600',
    secondaryButton: 'bg-pink-100 hover:bg-pink-200 text-pink-700',
    dark: {
      bg: 'bg-pink-900/20',
      border: 'border-pink-700/30',
      text: 'text-pink-300',
      icon: 'text-pink-400',
      button: 'bg-pink-600 hover:bg-pink-700',
      secondaryButton: 'bg-pink-800/50 hover:bg-pink-700/50 text-pink-300'
    }
  },
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-600',
    icon: 'text-teal-500',
    button: 'bg-teal-500 hover:bg-teal-600',
    secondaryButton: 'bg-teal-100 hover:bg-teal-200 text-teal-700',
    dark: {
      bg: 'bg-teal-900/20',
      border: 'border-teal-700/30',
      text: 'text-teal-300',
      icon: 'text-teal-400',
      button: 'bg-teal-600 hover:bg-teal-700',
      secondaryButton: 'bg-teal-800/50 hover:bg-teal-700/50 text-teal-300'
    }
  },
  violet: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-600',
    icon: 'text-violet-500',
    button: 'bg-violet-500 hover:bg-violet-600',
    secondaryButton: 'bg-violet-100 hover:bg-violet-200 text-violet-700',
    dark: {
      bg: 'bg-violet-900/20',
      border: 'border-violet-700/30',
      text: 'text-violet-300',
      icon: 'text-violet-400',
      button: 'bg-violet-600 hover:bg-violet-700',
      secondaryButton: 'bg-violet-800/50 hover:bg-violet-700/50 text-violet-300'
    }
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-600',
    icon: 'text-amber-500',
    button: 'bg-amber-500 hover:bg-amber-600',
    secondaryButton: 'bg-amber-100 hover:bg-amber-200 text-amber-700',
    dark: {
      bg: 'bg-amber-900/20',
      border: 'border-amber-700/30',
      text: 'text-amber-300',
      icon: 'text-amber-400',
      button: 'bg-amber-600 hover:bg-amber-700',
      secondaryButton: 'bg-amber-800/50 hover:bg-amber-700/50 text-amber-300'
    }
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    icon: 'text-gray-500',
    button: 'bg-gray-500 hover:bg-gray-600',
    secondaryButton: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    dark: {
      bg: 'bg-gray-800/20',
      border: 'border-gray-600/30',
      text: 'text-gray-300',
      icon: 'text-gray-400',
      button: 'bg-gray-600 hover:bg-gray-700',
      secondaryButton: 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300'
    }
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    icon: 'text-red-500',
    button: 'bg-red-500 hover:bg-red-600',
    secondaryButton: 'bg-red-100 hover:bg-red-200 text-red-700',
    dark: {
      bg: 'bg-red-900/20',
      border: 'border-red-700/30',
      text: 'text-red-300',
      icon: 'text-red-400',
      button: 'bg-red-600 hover:bg-red-700',
      secondaryButton: 'bg-red-800/50 hover:bg-red-700/50 text-red-300'
    }
  },
  cyan: {
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    text: 'text-cyan-600',
    icon: 'text-cyan-500',
    button: 'bg-cyan-500 hover:bg-cyan-600',
    secondaryButton: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-700',
    dark: {
      bg: 'bg-cyan-900/20',
      border: 'border-cyan-700/30',
      text: 'text-cyan-300',
      icon: 'text-cyan-400',
      button: 'bg-cyan-600 hover:bg-cyan-700',
      secondaryButton: 'bg-cyan-800/50 hover:bg-cyan-700/50 text-cyan-300'
    }
  },
  slate: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    icon: 'text-slate-500',
    button: 'bg-slate-500 hover:bg-slate-600',
    secondaryButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
    dark: {
      bg: 'bg-slate-800/20',
      border: 'border-slate-600/30',
      text: 'text-slate-300',
      icon: 'text-slate-400',
      button: 'bg-slate-600 hover:bg-slate-700',
      secondaryButton: 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
    }
  }
};

// 尺寸映射
const sizeMap = {
  small: {
    icon: 'text-4xl',
    title: 'text-lg',
    description: 'text-sm',
    padding: 'py-8',
    gap: 'gap-3'
  },
  medium: {
    icon: 'text-6xl',
    title: 'text-xl',
    description: 'text-base',
    padding: 'py-12',
    gap: 'gap-4'
  },
  large: {
    icon: 'text-8xl',
    title: 'text-2xl',
    description: 'text-lg',
    padding: 'py-16',
    gap: 'gap-6'
  }
};

export default function EmptyState({
  type,
  title,
  description,
  action,
  secondaryAction,
  className = '',
  size = 'medium',
  theme = 'auto',
  children
}: EmptyStateProps) {
  const config = emptyStateConfig[type];
  const colors = colorMap[config.color as keyof typeof colorMap];
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
  
  const currentColors = isDark ? colors.dark : colors;

  const getAnimation = () => {
    switch (config.animation) {
      case 'thoughtBubble':
        return 'animate-thoughtBubble';
      case 'pulse':
        return 'animate-pulse';
      case 'bounce':
        return 'animate-bounce';
      case 'shake':
        return 'animate-shake';
      case 'spin':
        return 'animate-spin';
      case 'glow':
        return 'animate-glow';
      default:
        return 'animate-fadeIn';
    }
  };

  return (
    <div className={`
      ${currentColors.bg} 
      ${currentColors.border} 
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
    `}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 pointer-events-none" style={{background: 'linear-gradient(to bottom right, color-mix(in oklab, var(--foreground) 10%, transparent), transparent)'}}></div>
      <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-br ${config.gradient} opacity-20 rounded-full blur-xl pointer-events-none"></div>
      <div className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-br ${config.gradient} opacity-30 rounded-full blur-lg pointer-events-none"></div>

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
              bg-gradient-to-br ${config.gradient} 
              opacity-30 rounded-full blur-2xl
              -z-10
            `}></div>
          </div>
        </Animated>
      </div>

      {/* 标题 */}
      <Animated animation="fadeIn" duration={500} delay={100}>
        <h3 className={`
          ${sizes.title} 
          font-bold 
          ${currentColors.text} 
          mb-2
          relative
        `}>
          {title || config.title}
          {/* 标题下划线装饰 */}
          <div className={`
            absolute -bottom-1 left-1/2 transform -translate-x-1/2 
            w-16 h-0.5 bg-gradient-to-r ${config.gradient} rounded-full
          `}></div>
        </h3>
      </Animated>

      {/* 描述 */}
      <Animated animation="fadeIn" duration={500} delay={200}>
        <p className={`
          ${sizes.description} 
          ${currentColors.text.replace('600', '500')} 
          mb-6
          max-w-md
          leading-relaxed
        `}>
          {description || config.description}
        </p>
      </Animated>

      {/* 操作按钮 */}
      {(action || secondaryAction) && (
        <Animated animation="fadeIn" duration={500} delay={300}>
          <div className="flex flex-col sm:flex-row gap-3 z-10">
            {action && (
              <button
                onClick={action.onClick}
                className={`
                  ${currentColors.button} 
                  text-white 
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
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            )}
            
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                className={`
                  ${currentColors.secondaryButton} 
                  px-6 py-3 
                  rounded-xl 
                  font-medium 
                  transition-all duration-200 
                  transform hover:scale-105 
                  flex items-center gap-2
                  min-w-[120px]
                  justify-center
                `}
              >
                {secondaryAction.icon}
                <span>{secondaryAction.label}</span>
              </button>
            )}
          </div>
        </Animated>
      )}

      {/* 装饰性动画元素 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-1">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`
              w-2 h-2 
              bg-gradient-to-br ${config.gradient} 
              rounded-full 
              animate-bounce
              opacity-40
            `}
            style={{
              animationDelay: `${i * 150}ms`
            }}
          />
        ))}
      </div>

      {/* 子元素 */}
      {children && (
        <div className="mt-6 w-full">
          {children}
        </div>
      )}

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes thoughtBubble {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        @keyframes glow {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-thoughtBubble {
          animation: thoughtBubble 4s ease-in-out infinite;
        }
        
        .animate-shake {
          animation: shake 2s ease-in-out infinite;
        }
        
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        .animate-spin {
          animation: spin 2s linear infinite;
        }
      `}</style>
    </div>
  );
}