'use client';

import React from 'react';
import { Loader2, MessageCircle, Send, Database, Wifi, Brain } from 'lucide-react';

// 加载状态类型定义
export type LoadingType = 
  | 'default'           // 默认加载
  | 'message'          // 消息发送中
  | 'thinking'         // AI思考中
  | 'streaming'        // 流式输出中
  | 'conversation'     // 会话加载中
  | 'upload'           // 文件上传中
  | 'connection'       // 连接中
  | 'processing';      // 数据处理中

// 基础配置类型
interface BaseLoadingConfig {
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  text: string;
  description: string;
  color: string;
  bgColor: string;
  animation: 'spin' | 'pulse' | 'bounce';
}

// 扩展配置类型（带进度功能）
interface ProgressLoadingConfig extends BaseLoadingConfig {
  showProgress: boolean;
}

// 联合类型
type LoadingConfig = BaseLoadingConfig | ProgressLoadingConfig;

// 加载状态配置
const loadingConfigs: Record<LoadingType, LoadingConfig> = {
  default: {
    icon: Loader2,
    text: '加载中...',
    description: '正在处理您的请求',
    color: 'var(--flow-primary)',
    bgColor: 'rgba(14, 165, 233, 0.1)',
    animation: 'spin'
  },
  message: {
    icon: Send,
    text: '发送中...',
    description: '正在发送您的消息',
    color: 'var(--flow-secondary)',
    bgColor: 'rgba(6, 182, 212, 0.1)',
    animation: 'pulse'
  },
  thinking: {
    icon: Brain,
    text: 'AI正在思考',
    description: '正在分析和理解您的问题',
    color: 'var(--flow-accent)',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    animation: 'bounce'
  },
  streaming: {
    icon: MessageCircle,
    text: '实时回复中',
    description: 'AI正在生成回复内容',
    color: 'var(--flow-teal)',
    bgColor: 'rgba(20, 184, 166, 0.1)',
    animation: 'pulse'
  },
  conversation: {
    icon: Database,
    text: '加载会话',
    description: '正在获取会话列表',
    color: 'var(--flow-orange)',
    bgColor: 'rgba(255, 159, 67, 0.1)',
    animation: 'spin'
  },
  upload: {
    icon: Loader2,
    text: '上传中...',
    description: '正在上传您的文件',
    color: 'var(--flow-rose)',
    bgColor: 'rgba(255, 107, 157, 0.1)',
    animation: 'spin',
    showProgress: true
  },
  connection: {
    icon: Wifi,
    text: '连接中...',
    description: '正在建立连接',
    color: 'var(--flow-indigo)',
    bgColor: 'rgba(99, 102, 241, 0.1)',
    animation: 'pulse'
  },
  processing: {
    icon: Loader2,
    text: '处理中...',
    description: '正在处理数据',
    color: 'var(--text-secondary)',
    bgColor: 'rgba(100, 116, 139, 0.1)',
    animation: 'spin'
  }
};

// 动画样式
const animations = {
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce'
};

// 主要加载组件接口
interface LoadingSpinnerProps {
  type?: LoadingType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  description?: string;
  progress?: number; // 0-100
  showText?: boolean;
  showDescription?: boolean;
  className?: string;
  inline?: boolean;
}

// 尺寸配置
const sizeConfigs = {
  sm: {
    iconSize: 16,
    textSize: 'text-xs',
    padding: 'p-2',
    gap: 'gap-2'
  },
  md: {
    iconSize: 20,
    textSize: 'text-sm',
    padding: 'p-3',
    gap: 'gap-2'
  },
  lg: {
    iconSize: 24,
    textSize: 'text-base',
    padding: 'p-4',
    gap: 'gap-3'
  },
  xl: {
    iconSize: 32,
    textSize: 'text-lg',
    padding: 'p-6',
    gap: 'gap-4'
  }
};

/**
 * 统一加载指示器组件
 */
export function LoadingSpinner({
  type = 'default',
  size = 'md',
  text,
  description,
  progress,
  showText = true,
  showDescription = false,
  className = '',
  inline = false
}: LoadingSpinnerProps) {
  const config = loadingConfigs[type];
  const sizeConfig = sizeConfigs[size];
  const Icon = config.icon;
  
  const displayText = text || config.text;
  const displayDescription = description || config.description;
  const animationClass = animations[config.animation as keyof typeof animations];
  
  // 类型保护函数
  const hasShowProgress = (cfg: LoadingConfig): cfg is ProgressLoadingConfig => {
    return 'showProgress' in cfg && cfg.showProgress === true;
  };

  return (
    <div 
      className={`
        ${inline ? 'inline-flex' : 'flex'} 
        items-center 
        ${sizeConfig.gap} 
        ${sizeConfig.padding} 
        rounded-lg
        ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        border: `1px solid ${config.color}20`
      }}
    >
      {/* 图标 */}
      <div className="relative">
        <Icon 
          size={sizeConfig.iconSize}
          className={animationClass}
          style={{ color: config.color }}
        />
        
        {/* 进度环 (仅上传类型) */}
        {hasShowProgress(config) && typeof progress === 'number' && (
          <svg
            className="absolute inset-0 transform -rotate-90"
            width={sizeConfig.iconSize}
            height={sizeConfig.iconSize}
          >
            <circle
              cx={sizeConfig.iconSize / 2}
              cy={sizeConfig.iconSize / 2}
              r={sizeConfig.iconSize / 2 - 2}
              stroke={config.color}
              strokeWidth="2"
              fill="none"
              strokeDasharray={`${progress * 2.83} 283`}
              className="transition-all duration-300"
            />
          </svg>
        )}
      </div>
      
      {/* 文本内容 */}
      {(showText || showDescription) && (
        <div className="flex flex-col min-w-0">
          {showText && (
            <span 
              className={`font-medium ${sizeConfig.textSize}`}
              style={{ color: 'var(--text-primary)' }}
            >
              {displayText}
            </span>
          )}
          
          {showDescription && (
            <span 
              className={`${sizeConfig.textSize} opacity-75 truncate`}
              style={{ color: 'var(--text-secondary)' }}
            >
              {displayDescription}
            </span>
          )}
          
          {/* 进度百分比 */}
          {hasShowProgress(config) && typeof progress === 'number' && (
            <span 
              className="text-xs font-mono opacity-75"
              style={{ color: config.color }}
            >
              {progress}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * 内联加载指示器 - 用于按钮等场景
 */
export function InlineLoading({ 
  type = 'default', 
  size = 'sm', 
  text = '',
  className = ''
}: {
  type?: LoadingType;
  size?: 'sm' | 'md';
  text?: string;
  className?: string;
}) {
  return (
    <LoadingSpinner
      type={type}
      size={size}
      text={text}
      showDescription={false}
      inline
      className={className}
    />
  );
}

/**
 * 点状加载指示器 - 用于简单场景
 */
export function DotLoading({ 
  size = 'md',
  color = 'var(--flow-primary)',
  className = ''
}: {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}) {
  const dotSizes = {
    sm: 'w-1 h-1',
    md: 'w-2 h-2', 
    lg: 'w-3 h-3'
  };
  
  const dotSize = dotSizes[size];

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`${dotSize} rounded-full animate-pulse`}
          style={{ 
            backgroundColor: color,
            animationDelay: `${index * 200}ms`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );
}

/**
 * 脉冲加载指示器 - 用于内容占位
 */
export function PulseLoading({ 
  width = 'w-full',
  height = 'h-4',
  rounded = 'rounded',
  className = ''
}: {
  width?: string;
  height?: string;
  rounded?: string;
  className?: string;
}) {
  return (
    <div 
      className={`animate-pulse ${rounded} ${width} ${height} ${className}`}
      style={{ backgroundColor: 'var(--card-border)' }}
    />
  );
}

/**
 * 流式文本加载指示器 - 专门用于打字机效果
 */
export function StreamingCursor({ 
  visible = true,
  color = 'var(--flow-primary)',
  size = 'md'
}: {
  visible?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const heights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5'
  };

  if (!visible) return null;

  return (
    <span 
      className={`inline-block w-0.5 ${heights[size]} ml-1 rounded-full animate-pulse`}
      style={{ 
        backgroundColor: color,
        animationDuration: '1s'
      }}
    />
  );
}

// 导出所有组件
export {
  loadingConfigs,
  sizeConfigs
};
