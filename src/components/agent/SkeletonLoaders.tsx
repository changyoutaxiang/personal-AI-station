'use client';

import React from 'react';

// 基础骨架屏组件
interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
}

function Skeleton({ 
  className = '', 
  style = {},
  animate = true 
}: SkeletonProps) {
  return (
    <div
      className={`
        ${animate ? 'animate-pulse' : ''}
        rounded
        ${className}
      `}
      style={{
        backgroundColor: 'var(--card-border)',
        ...style
      }}
    />
  );
}

// 消息列表骨架屏
export function MessageListSkeleton({ 
  count = 3,
  className = '' 
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-4 p-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4">
          {/* 用户消息 */}
          <div className="flex justify-end">
            <div className="max-w-[70%] space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
          
          {/* AI回复 */}
          <div className="flex justify-start">
            <div className="max-w-[70%] space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 会话列表骨架屏
export function ConversationListSkeleton({ 
  count = 5,
  className = '' 
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 p-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="p-3 space-y-2">
          {/* 标题 */}
          <Skeleton className="h-4 w-3/4" />
          
          {/* 日期和标签 */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

// 聊天输入区域骨架屏
export function ChatInputSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border-t ${className}`} style={{ borderColor: 'var(--card-border)' }}>
      <div className="flex gap-3 items-end">
        {/* 输入框区域 */}
        <div className="flex-1">
          <Skeleton className="h-11 w-full rounded-lg" />
        </div>
        
        {/* 发送按钮 */}
        <Skeleton className="h-11 w-20 rounded-lg" />
      </div>
      
      {/* 提示信息 */}
      <div className="flex items-center justify-between mt-2">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-6 w-12 rounded" />
          <Skeleton className="h-6 w-12 rounded" />
        </div>
      </div>
    </div>
  );
}

// 聊天头部骨架屏
export function ChatHeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 border-b ${className}`} style={{ borderColor: 'var(--card-border)' }}>
      <div className="flex items-center justify-between gap-4">
        {/* 左侧会话信息 */}
        <div className="flex-1">
          <Skeleton className="h-6 w-48 mb-2" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </div>
        </div>
        
        {/* 中间选择器 */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        
        {/* 右侧按钮 */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-16 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 侧边栏骨架屏
export function SidebarSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`w-80 border-r ${className}`} style={{ borderColor: 'var(--card-border)' }}>
      {/* 头部 */}
      <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      
      {/* 新对话按钮 */}
      <div className="p-4">
        <Skeleton className="h-12 w-full rounded-lg border-2 border-dashed" />
      </div>
      
      {/* 搜索框 */}
      <div className="px-4 pb-4">
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
      
      {/* 标签过滤 */}
      <div className="px-4 pb-4">
        <Skeleton className="h-4 w-16 mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      
      {/* 会话列表 */}
      <ConversationListSkeleton />
    </div>
  );
}

// 完整聊天界面骨架屏
export function ChatLayoutSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-screen flex ${className}`} style={{ background: 'var(--background)' }}>
      {/* 左侧边栏 */}
      <SidebarSkeleton />
      
      {/* 右侧主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <ChatHeaderSkeleton />
        
        {/* 消息区域 */}
        <div className="flex-1 relative overflow-hidden">
          <MessageListSkeleton />
        </div>
        
        {/* 输入区域 */}
        <ChatInputSkeleton />
        
        {/* 状态栏 */}
        <div className="border-t px-4 py-2" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-4 w-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// 流式输出占位骨架屏
export function StreamingMessageSkeleton({ 
  className = '',
  lines = 3 
}: { 
  className?: string;
  lines?: number;
}) {
  return (
    <div className={`flex justify-start ${className}`}>
      <div 
        className="max-w-[70%] rounded-2xl p-4 mr-4 space-y-2" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(14, 165, 233, 0.2)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton 
            key={index}
            className={`h-4 ${
              index === lines - 1 ? 'w-3/4' : 'w-full'
            }`}
          />
        ))}
        
        {/* 打字机光标 */}
        <div className="flex items-center">
          <Skeleton className="h-4 w-2/3" />
          <div 
            className="inline-block w-0.5 h-4 ml-2 rounded-full animate-pulse"
            style={{ backgroundColor: 'var(--flow-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}

// 卡片骨架屏 - 通用
export function CardSkeleton({ 
  className = '',
  hasHeader = true,
  hasFooter = false,
  contentLines = 3 
}: {
  className?: string;
  hasHeader?: boolean;
  hasFooter?: boolean;
  contentLines?: number;
}) {
  return (
    <div 
      className={`rounded-xl p-4 border ${className}`}
      style={{ 
        backgroundColor: 'var(--card-glass)',
        borderColor: 'var(--card-border)' 
      }}
    >
      {/* 头部 */}
      {hasHeader && (
        <div className="mb-4">
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      )}
      
      {/* 内容 */}
      <div className="space-y-3">
        {Array.from({ length: contentLines }).map((_, index) => (
          <Skeleton 
            key={index}
            className={`h-4 ${
              index === contentLines - 1 ? 'w-2/3' : 'w-full'
            }`}
          />
        ))}
      </div>
      
      {/* 底部 */}
      {hasFooter && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between" 
             style={{ borderColor: 'var(--card-border)' }}>
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}

export { Skeleton };
