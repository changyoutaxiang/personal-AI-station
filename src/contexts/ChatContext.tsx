'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { trackEvent } from '@/lib/client-tracker';
import { useChatState, ChatState, ChatActions } from '@/hooks/useChatState';

// 创建上下文
const ChatContext = createContext<(ChatState & ChatActions) | undefined>(undefined);

// Provider 组件
interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const chatState = useChatState();
  
  // 初始化数据流
  useEffect(() => {
    // 页面访问追踪
    trackEvent.pageView('/agent');
    
    // 初始化加载
    const initializeData = async () => {
      // 并行加载基础数据
      await Promise.all([
        chatState.loadConversations(),
        chatState.loadTemplates(),
        chatState.loadFolders(),
      ]);
    };
    
    initializeData().catch(error => {
      console.error('初始化数据加载失败:', error);
    });
  }, []);
  
  return (
    <ChatContext.Provider value={chatState}>
      {children}
    </ChatContext.Provider>
  );
}

// 自定义 Hook 来使用 Chat Context
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext 必须在 ChatProvider 内部使用');
  }
  return context;
}

// 导出类型
export type { ChatState, ChatActions };
