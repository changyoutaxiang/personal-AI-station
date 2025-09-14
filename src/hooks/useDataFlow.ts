'use client';

import { useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { trackEvent } from '@/lib/client-tracker';
import type { ChatState, ChatActions } from './useChatState';

// 数据流操作状态
interface DataFlowState {
  isInitialized: boolean;
  pendingOperations: Set<string>;
  lastSyncTime: number;
}

// 数据流操作
export interface DataFlowActions {
  // 初始化数据流
  initialize: () => Promise<void>;
  
  // 同步状态
  syncConversationState: () => Promise<void>;
  syncMessageState: (conversationId: number) => Promise<void>;
  
  // 批量操作
  batchDeleteConversations: (conversationIds: number[]) => Promise<void>;
  
  // 缓存管理
  invalidateCache: (type: 'conversations' | 'messages' | 'templates') => void;
  refreshData: () => Promise<void>;
  
  // 错误恢复
  recoverFromError: () => Promise<void>;
  
  // 状态持久化
  saveStateToStorage: () => void;
  loadStateFromStorage: () => void;
}

export function useDataFlow(chatState: ChatState & ChatActions): DataFlowActions {
  const dataFlowState = useRef<DataFlowState>({
    isInitialized: false,
    pendingOperations: new Set(),
    lastSyncTime: 0,
  });
  
  const { current: state } = dataFlowState;
  
  // 添加待处理操作
  const addPendingOperation = useCallback((operation: string) => {
    state.pendingOperations.add(operation);
  }, [state]);
  
  // 移除待处理操作
  const removePendingOperation = useCallback((operation: string) => {
    state.pendingOperations.delete(operation);
  }, [state]);
  
  // 检查是否有待处理操作
  const hasPendingOperation = useCallback((operation: string) => {
    return state.pendingOperations.has(operation);
  }, [state]);
  
  // 保存状态到本地存储
  const saveStateToStorage = useCallback(() => {
    try {
      const stateToSave = {
        selectedModel: chatState.selectedModel,
        selectedTemplate: chatState.selectedTemplate,
        historyLimit: chatState.historyLimit,
        lastSyncTime: state.lastSyncTime,
      };
      
      localStorage.setItem('chat_state', JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('保存状态到存储失败:', error);
    }
  }, [chatState, state]);
  
  // 从本地存储加载状态
  const loadStateFromStorage = useCallback(() => {
    try {
      const savedState = localStorage.getItem('chat_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // 恢复状态
        if (parsedState.selectedModel) {
          chatState.setSelectedModel(parsedState.selectedModel);
        }
        if (parsedState.selectedTemplate) {
          chatState.setSelectedTemplate(parsedState.selectedTemplate);
        }


        if (parsedState.historyLimit) {
          chatState.setHistoryLimit(parsedState.historyLimit);
        }
        
        state.lastSyncTime = parsedState.lastSyncTime || 0;
      }
    } catch (error) {
      console.warn('从存储加载状态失败:', error);
    }
  }, [chatState, state]);
  
  // 初始化数据流
  const initialize = useCallback(async () => {
    if (state.isInitialized) return;
    
    try {
      addPendingOperation('initialize');
      
      // 从存储中恢复状态
      loadStateFromStorage();
      
      // 并行初始化数据
      const initPromises = [
        chatState.loadConversations(),
        chatState.loadTemplates(),
      ];
      
      await Promise.allSettled(initPromises);
      
      state.isInitialized = true;
      state.lastSyncTime = Date.now();
      
      // 保存初始状态到存储
      saveStateToStorage();
      
      trackEvent.aiInteraction('data_flow_initialized', {
        conversations_count: chatState.conversations.length,
        templates_count: chatState.templates.length,
      });
      
    } catch (error) {
      console.error('数据流初始化失败:', error);
      toast.error('数据初始化失败，请刷新页面重试');
    } finally {
      removePendingOperation('initialize');
    }
  }, [state, chatState, addPendingOperation, removePendingOperation, loadStateFromStorage, saveStateToStorage]);
  
  // 同步会话状态
  const syncConversationState = useCallback(async () => {
    if (hasPendingOperation('sync_conversations')) return;
    
    try {
      addPendingOperation('sync_conversations');
      await chatState.loadConversations();
      
      trackEvent.aiInteraction('conversations_synced', {
        count: chatState.conversations.length
      });
    } catch (error) {
      console.error('会话状态同步失败:', error);
      toast.error('会话列表同步失败');
    } finally {
      removePendingOperation('sync_conversations');
    }
  }, [chatState, hasPendingOperation, addPendingOperation, removePendingOperation]);
  
  // 同步消息状态
  const syncMessageState = useCallback(async (conversationId: number) => {
    const operationKey = `sync_messages_${conversationId}`;
    if (hasPendingOperation(operationKey)) return;
    
    try {
      addPendingOperation(operationKey);
      await chatState.loadMessages(conversationId);
      
      trackEvent.aiInteraction('messages_synced', {
        conversation_id: conversationId,
        messages_count: chatState.messages.length
      });
    } catch (error) {
      console.error('消息状态同步失败:', error);
      toast.error('消息同步失败');
    } finally {
      removePendingOperation(operationKey);
    }
  }, [chatState, hasPendingOperation, addPendingOperation, removePendingOperation]);
  
  // 批量更新标签
  
  // 批量删除会话
  const batchDeleteConversations = useCallback(async (conversationIds: number[]) => {
    if (hasPendingOperation('batch_delete_conversations')) return;
    
    try {
      addPendingOperation('batch_delete_conversations');
      
      const deletePromises = conversationIds.map(async (conversationId) => {
        const response = await fetch(`/api/agent/conversations/${conversationId}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error(`删除会话 ${conversationId} 失败`);
        }
        
        return response.json();
      });
      
      await Promise.all(deletePromises);
      
      // 如果当前会话被删除，清除当前会话
      if (chatState.currentConversationId && conversationIds.includes(chatState.currentConversationId)) {
        chatState.createNewConversation();
      }
      
      // 重新同步会话状态
      await syncConversationState();
      
      toast.success(`成功删除 ${conversationIds.length} 个会话`);
      
      trackEvent.aiInteraction('batch_conversations_deleted', {
        count: conversationIds.length
      });
      
    } catch (error) {
      console.error('批量删除会话失败:', error);
      toast.error('批量删除会话失败');
    } finally {
      removePendingOperation('batch_delete_conversations');
    }
  }, [chatState, hasPendingOperation, addPendingOperation, removePendingOperation, syncConversationState]);
  
  // 失效缓存
  const invalidateCache = useCallback((type: 'conversations' | 'messages' | 'tags' | 'templates') => {
    // 在实际应用中，这里可以清除相关的缓存
    console.log(`缓存失效: ${type}`);
    
    // 触发重新加载
    switch (type) {
      case 'conversations':
        chatState.loadConversations();
        break;
      case 'messages':
        if (chatState.currentConversationId && chatState.currentConversationId > 0) {
          chatState.loadMessages(chatState.currentConversationId);
        }
        break;

      case 'templates':
        chatState.loadTemplates();
        break;
    }
  }, [chatState]);
  
  // 刷新所有数据
  const refreshData = useCallback(async () => {
    if (hasPendingOperation('refresh_all')) return;
    
    try {
      addPendingOperation('refresh_all');
      
      await Promise.all([
        chatState.loadConversations(),
        chatState.loadTemplates(),
      ]);
      
      if (chatState.currentConversationId && chatState.currentConversationId > 0) {
        await chatState.loadMessages(chatState.currentConversationId);
      }
      
      state.lastSyncTime = Date.now();
      saveStateToStorage();
      
      toast.success('数据刷新完成');
      
    } catch (error) {
      console.error('数据刷新失败:', error);
      toast.error('数据刷新失败');
    } finally {
      removePendingOperation('refresh_all');
    }
  }, [chatState, state, hasPendingOperation, addPendingOperation, removePendingOperation, saveStateToStorage]);
  
  // 错误恢复
  const recoverFromError = useCallback(async () => {
    try {
      // 清除所有待处理操作
      state.pendingOperations.clear();
      
      // 清除错误状态
      chatState.clearError();
      
      // 重新初始化
      await initialize();
      
      toast.success('已从错误中恢复');
      
    } catch (error) {
      console.error('错误恢复失败:', error);
      toast.error('错误恢复失败，请刷新页面');
    }
  }, [state, chatState, initialize]);
  
  // 自动保存状态
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.isInitialized) {
        saveStateToStorage();
      }
    }, 30000); // 每30秒自动保存一次
    
    return () => clearInterval(interval);
  }, [state.isInitialized, saveStateToStorage]);
  
  return {
    initialize,
    syncConversationState,
    syncMessageState,
    batchDeleteConversations,
    invalidateCache,
    refreshData,
    recoverFromError,
    saveStateToStorage,
    loadStateFromStorage,
  };
}
