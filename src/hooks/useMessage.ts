/**
 * 统一消息管理Hook
 * 提供标准化的消息显示、清除和管理功能
 */

import { useState, useCallback, useRef } from 'react';

export interface MessageOptions {
  duration?: number;
  persistent?: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export interface Message {
  id: string;
  content: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: number;
  duration?: number;
  persistent?: boolean;
}

/**
 * 统一消息管理Hook
 */
export function useMessage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messageQueue = useRef<Message[]>([]);
  const isProcessing = useRef(false);

  /**
   * 添加消息
   */
  const addMessage = useCallback((content: string, options: MessageOptions = {}) => {
    const {
      duration = 3000,
      persistent = false,
      type = 'info'
    } = options;

    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      content,
      type,
      timestamp: Date.now(),
      duration,
      persistent
    };

    messageQueue.current.push(message);
    processMessageQueue();
  }, []);

  /**
   * 处理消息队列
   */
  const processMessageQueue = useCallback(() => {
    if (isProcessing.current || messageQueue.current.length === 0) {
      return;
    }

    isProcessing.current = true;
    const message = messageQueue.current.shift()!;

    setMessages(prev => [...prev, message]);

    if (!message.persistent && message.duration) {
      setTimeout(() => {
        removeMessage(message.id);
      }, message.duration);
    }

    isProcessing.current = false;
    
    // 处理下一条消息
    if (messageQueue.current.length > 0) {
      setTimeout(processMessageQueue, 100);
    }
  }, []);

  /**
   * 移除消息
   */
  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  /**
   * 清除所有消息
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    messageQueue.current = [];
  }, []);

  /**
   * 显示成功消息
   */
  const showSuccess = useCallback((content: string, options: Omit<MessageOptions, 'type'> = {}) => {
    addMessage(content, { ...options, type: 'success' });
  }, [addMessage]);

  /**
   * 显示错误消息
   */
  const showError = useCallback((content: string, options: Omit<MessageOptions, 'type'> = {}) => {
    addMessage(content, { ...options, type: 'error' });
  }, [addMessage]);

  /**
   * 显示警告消息
   */
  const showWarning = useCallback((content: string, options: Omit<MessageOptions, 'type'> = {}) => {
    addMessage(content, { ...options, type: 'warning' });
  }, [addMessage]);

  /**
   * 显示信息消息
   */
  const showInfo = useCallback((content: string, options: Omit<MessageOptions, 'type'> = {}) => {
    addMessage(content, { ...options, type: 'info' });
  }, [addMessage]);

  /**
   * 显示持久消息（需要手动关闭）
   */
  const showPersistent = useCallback((content: string, type: Message['type'] = 'info') => {
    addMessage(content, { type, persistent: true });
  }, [addMessage]);

  /**
   * 获取最新消息（用于兼容旧的单一消息模式）
   */
  const getLatestMessage = useCallback(() => {
    if (messages.length === 0) return '';
    return messages[messages.length - 1].content;
  }, [messages]);

  /**
   * 设置消息（用于兼容旧的单一消息模式）
   */
  const setMessage = useCallback((content: string) => {
    if (content) {
      clearMessages();
      addMessage(content.replace(/^[✅❌⚠️ℹ️]\s*/, ''), {
        duration: 3000,
        type: content.startsWith('✅') ? 'success' : 
              content.startsWith('❌') ? 'error' :
              content.startsWith('⚠️') ? 'warning' : 'info'
      });
    } else {
      clearMessages();
    }
  }, [addMessage, clearMessages]);

  return {
    messages,
    addMessage,
    removeMessage,
    clearMessages,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showPersistent,
    getLatestMessage,
    setMessage
  };
}

/**
 * 兼容旧版单一消息模式的Hook
 */
export function useSingleMessage() {
  const { setMessage, getLatestMessage } = useMessage();
  
  return {
    message: getLatestMessage(),
    setMessage
  };
}