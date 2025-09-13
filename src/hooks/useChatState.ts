'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { trackEvent } from '@/lib/client-tracker';
import { useStreamChat, type StreamMessage } from './useStreamChat';
import type { 
  Conversation, 
  Message, 
  PromptTemplate, 
  ChatResponse,
  Tag 
} from '@/components/agent/types';
import type { AgentFolder } from '@/lib/supabase';

// 状态接口定义
export interface ChatState {
  // 核心状态
  currentConversationId: number | null;
  messages: Message[];
  selectedModel: string;
  selectedTemplate: PromptTemplate | null;
  systemPrompt: string;
  
  // 列表数据
  conversations: Conversation[];
  templates: PromptTemplate[];
  folders: AgentFolder[];

  // 文件夹相关状态
  selectedFolderId: string | null;
  foldersLoading: boolean;
  
  // UI 状态
  loading: boolean;
  conversationsLoading: boolean;
  error: string | null;
  
  // 搜索和过滤
  searchKeyword: string;
  historyLimit: number;
  
  // 标签相关
  tags: Tag[];
  selectedTags: number[];
}

// 状态操作接口
export interface ChatActions {
  // 会话操作
  selectConversation: (conversation: Conversation) => void;
  createNewConversation: () => void;

  deleteConversation: (conversationId: number) => Promise<void>;
  
  // 消息操作
  sendMessage: (message: string) => Promise<void>;
  deleteMessage: (messageId: number) => Promise<void>;
  regenerateLastResponse: () => Promise<void>;
  
  // 批量操作
  batchDeleteMessages: (messageIds: number[]) => Promise<void>;

  
  // 设置操作
  setSelectedModel: (model: string) => void;
  setSelectedTemplate: (template: PromptTemplate | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setHistoryLimit: (limit: number) => void;
  
  // 数据加载
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: number) => Promise<void>;
  loadTemplates: () => Promise<void>;
  loadFolders: () => Promise<void>;
  
  // 文件夹操作
  selectFolder: (folderId: string | null) => void;
  createFolder: (name: string, description?: string, color?: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  moveConversationToFolder: (conversationId: number, folderId: string | null) => Promise<void>;
  

  
  // 错误处理
  clearError: () => void;
}

// 解析错误信息，提取OpenRouter等具体错误信息
function parseErrorMessage(error: string): string {
  // 如果是OpenRouter的错误信息
  if (error.includes('AI请求失败:') || error.includes('AI返回数据格式错误')) {
    return error;
  }
  
  // 尝试解析JSON错误信息
  try {
    const errorObj = JSON.parse(error);
    if (errorObj.error?.message) {
      return `AI服务错误: ${errorObj.error.message}`;
    }
    if (errorObj.message) {
      return errorObj.message;
    }
  } catch {
    // 如果不是JSON，直接返回原始错误
  }
  
  // 检查常见错误类型
  if (error.includes('rate limit') || error.includes('频率限制')) {
    return '请求过于频繁，请稍后再试';
  }
  
  if (error.includes('insufficient credits') || error.includes('余额不足')) {
    return 'AI服务余额不足，请联系管理员';
  }
  
  if (error.includes('model not found') || error.includes('模型不存在')) {
    return '所选模型不可用，请尝试其他模型';
  }
  
  if (error.includes('timeout') || error.includes('超时')) {
    return '请求超时，请检查网络连接或稍后再试';
  }
  
  return error || '未知错误';
}

// 初始状态
const initialState: ChatState = {
  currentConversationId: null,
  messages: [],
  selectedModel: 'moonshotai/kimi-k2',
  selectedTemplate: null,
  systemPrompt: '',
  conversations: [],
  templates: [],
  folders: [],
  selectedFolderId: null,
  loading: false,
  conversationsLoading: true,
  foldersLoading: false,
  error: null,
  searchKeyword: '',
  historyLimit: 20,
  tags: [],
  selectedTags: [],
};

export function useChatState(): ChatState & ChatActions {
  // 状态管理
  const [state, setState] = useState<ChatState>(initialState);
  
  // 流式聊天 Hook
  const streamChat = useStreamChat();
  
  // 当前会话对象 - 添加安全检查
  const currentConversation = (state.conversations || []).find(c => c.id === state.currentConversationId) || null;
  
  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<ChatState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);
  
  // 设置错误状态
  const setError = useCallback((error: string | null) => {
    updateState({ error });
  }, [updateState]);
  
  // 清除错误
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);
  
  // 数据加载函数
  const loadConversations = useCallback(async () => {
    try {
      updateState({ conversationsLoading: true, error: null });
      const params = new URLSearchParams();
      
      if (state.searchKeyword) {
        params.append('keyword', state.searchKeyword);
      }
      
      // 添加文件夹过滤参数
      if (state.selectedFolderId !== null) {
        params.append('folderId', state.selectedFolderId);
      } else {
        // 当selectedFolderId为null时，表示"全部对话"，只显示未分配到文件夹的对话
        params.append('folderId', 'null');
      }
      
      const response = await fetch(`/api/agent/conversations?${params}`);
      const data = await response.json();
      
      if (data.success) {
        updateState({ conversations: data.data || [] });
      } else {
        setError(`加载会话失败: ${data.error}`);
        toast.error(`加载会话失败: ${data.error}`);
      }
    } catch (error) {
      console.error('加载会话失败:', error);
      setError('加载会话失败');
      toast.error('加载会话失败');
    } finally {
      updateState({ conversationsLoading: false });
    }
  }, [state.searchKeyword, state.selectedTags, state.selectedFolderId, updateState, setError]);
  
  const loadMessages = useCallback(async (conversationId: number) => {
    // 防止无效的 conversationId
    if (!conversationId || conversationId <= 0) {
      console.warn('loadMessages: 无效的 conversationId:', conversationId);
      return;
    }
    
    try {
      updateState({ error: null });
      const response = await fetch(`/api/agent/messages?conversationId=${conversationId}`);
      const data = await response.json();
      
      if (data.success) {
        updateState({ messages: data.messages });
      } else {
        setError(`加载消息失败: ${data.error}`);
        toast.error(`加载消息失败: ${data.error}`);
      }
    } catch (error) {
      console.error('加载消息失败:', error);
      setError('加载消息失败');
      toast.error('加载消息失败');
    }
  }, [updateState, setError]);
  

  
  const loadTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/agent/prompts');
      const data = await response.json();
      
      if (data.success) {
        updateState({ templates: data.data || [] });
      } else {
        console.warn('加载提示模板失败:', data.error);
      }
    } catch (error) {
      console.error('加载提示模板失败:', error);
    }
  }, [updateState]);
  
  const loadFolders = useCallback(async () => {
    try {
      updateState({ foldersLoading: true });
      const response = await fetch('/api/agent/folders');
      const data = await response.json();
      
      if (data.success) {
        updateState({ folders: data.data || [] });
      } else {
        console.warn('加载文件夹失败:', data.error);
        toast.error(`加载文件夹失败: ${data.error}`);
      }
    } catch (error) {
      console.error('加载文件夹失败:', error);
      toast.error('加载文件夹失败');
    } finally {
      updateState({ foldersLoading: false });
    }
  }, [updateState]);
  
  // 会话操作
  const selectConversation = useCallback((conversation: Conversation) => {
    updateState({
      currentConversationId: conversation.id,
      messages: []
    });
    
    // 追踪会话选择事件
    trackEvent.aiInteraction('select_conversation', {
      conversation_id: conversation.id,
      conversation_title: conversation.title,
      model_name: conversation.model_name
    });
    
    // 加载选中会话的消息
    loadMessages(conversation.id);
  }, [updateState, loadMessages]);
  const createNewConversation = useCallback(() => {
    updateState({
      currentConversationId: null,
      messages: [],
      systemPrompt: state.selectedTemplate?.content || '',
    });
    
    // 追踪新会话创建事件
    trackEvent.aiInteraction('create_new_conversation', {
      selected_model: state.selectedModel,
      has_template: !!state.selectedTemplate,
      template_name: state.selectedTemplate?.name
    });
  }, [updateState, state.selectedTemplate, state.selectedModel]);
  

  
  const deleteConversation = useCallback(async (conversationId: number) => {
    try {
      const response = await fetch(`/api/agent/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        await loadConversations();
        if (state.currentConversationId === conversationId) {
          updateState({
            currentConversationId: null,
            messages: [],
          });
        }
        toast.success('会话删除成功');
      } else {
        setError(`删除失败: ${data.error}`);
        toast.error(`删除失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除失败:', error);
      setError('删除失败');
      toast.error('删除失败');
    }
  }, [loadConversations, state.currentConversationId, updateState, setError]);
  
  // 消息操作（流式版本）
  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || state.loading || streamChat.isStreaming) return;

    updateState({ loading: true, error: null });

    // 流式发送消息
    await streamChat.sendStreamMessage(
      state.currentConversationId,
      message.trim(),
      state.selectedModel,
      state.systemPrompt,
      state.historyLimit,
      // 消息更新回调
      (userMessage: StreamMessage, assistantMessage?: StreamMessage) => {
        const messages = [...state.messages];
        
        // 更新用户消息
        const userMsgIndex = messages.findIndex(m => m.role === 'user' && m.content === userMessage.content);
        if (userMsgIndex >= 0) {
          messages[userMsgIndex] = userMessage;
        } else {
          messages.push(userMessage);
        }
        
        // 更新助手消息
        if (assistantMessage) {
          const assistantMsgIndex = messages.findIndex(m => 
            m.role === 'assistant' && 
            m.conversation_id === assistantMessage.conversation_id &&
            (m.id === assistantMessage.id || m.isStreaming)
          );
          
          if (assistantMsgIndex >= 0) {
            messages[assistantMsgIndex] = assistantMessage;
          } else {
            messages.push(assistantMessage);
          }
        }
        
        updateState({ messages });
      },
      // 会话创建回调
      (conversationId: number) => {
        if (!state.currentConversationId) {
          updateState({ currentConversationId: conversationId });
          // 重新加载会话列表
          loadConversations();
        }
      }
    );

    updateState({ loading: false });

    // 无论是新会话还是已有会话，都刷新会话列表
    // 这样可以更新会话的最后消息时间和标题
    await loadConversations();
  }, [
    state.loading,
    streamChat.isStreaming,
    state.currentConversationId, 
    state.messages, 
    state.selectedModel, 
    state.systemPrompt, 
    state.historyLimit, 
    updateState,
    streamChat.sendStreamMessage,
    loadConversations
  ]);
  
  const deleteMessage = useCallback(async (messageId: number) => {
    try {
      const response = await fetch(`/api/agent/messages/${messageId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        updateState({ 
          messages: state.messages.filter(msg => msg.id !== messageId) 
        });
        toast.success('消息删除成功');
      } else {
        setError(`删除消息失败: ${data.error}`);
        toast.error(`删除消息失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除消息失败:', error);
      setError('删除消息失败');
      toast.error('删除消息失败');
    }
  }, [state.messages, updateState, setError]);
  
  const regenerateLastResponse = useCallback(async () => {
    if (!currentConversation || state.messages.length === 0) return;

    // 找到最后一条用户消息
    const lastUserMessage = state.messages.filter(msg => msg.role === 'user').pop();
    if (!lastUserMessage) return;

    // 删除最后一条助手回复（如果有）
    const lastAssistantMessage = state.messages.filter(msg => msg.role === 'assistant').pop();
    if (lastAssistantMessage && lastAssistantMessage.id > lastUserMessage.id) {
      await deleteMessage(lastAssistantMessage.id);
    }

    // 重新发送最后一条用户消息
    await sendMessage(lastUserMessage.content);
  }, [currentConversation, state.messages, deleteMessage, sendMessage]);
  
  // 设置操作
  const setSelectedModel = useCallback((model: string) => {
    // 追踪模型切换事件
    trackEvent.aiInteraction('change_model', {
      from_model: state.selectedModel,
      to_model: model,
      conversation_id: state.currentConversationId
    });
    
    updateState({ selectedModel: model });
  }, [updateState, state.selectedModel, state.currentConversationId]);
  
  const setSelectedTemplate = useCallback((template: PromptTemplate | null) => {
    // 追踪模板切换事件
    trackEvent.aiInteraction('change_template', {
      from_template: state.selectedTemplate?.name,
      to_template: template?.name,
      conversation_id: state.currentConversationId
    });
    
    updateState({ 
      selectedTemplate: template,
      systemPrompt: template?.content || '',
    });
  }, [updateState, state.selectedTemplate, state.currentConversationId]);
  
  
  const setSearchKeyword = useCallback((keyword: string) => {
    updateState({ searchKeyword: keyword });
  }, [updateState]);
  
  const setHistoryLimit = useCallback((limit: number) => {
    updateState({ historyLimit: limit });
  }, [updateState]);
  

  

  
  // 批量操作
  const batchDeleteMessages = useCallback(async (messageIds: number[]) => {
    if (messageIds.length === 0) return;
    
    try {
      const response = await fetch('/api/agent/messages/batch', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds })
      });
      
      const data = await response.json();
      if (data.success) {
        // 从当前消息列表中移除已删除的消息
        updateState({ 
          messages: state.messages.filter(msg => !messageIds.includes(msg.id)) 
        });
        toast.success(`成功删除 ${messageIds.length} 条消息`);
      } else {
        setError(`批量删除失败: ${data.error}`);
        toast.error(`批量删除失败: ${data.error}`);
      }
    } catch (error) {
      console.error('批量删除消息失败:', error);
      setError('批量删除消息失败');
      toast.error('批量删除消息失败');
    }
  }, [state.messages, updateState, setError]);
  

  
  // 文件夹操作函数
  const selectFolder = useCallback((folderId: string | null) => {
    updateState({ selectedFolderId: folderId });
  }, [updateState]);
  
  const createFolder = useCallback(async (name: string, description?: string, color?: string) => {
    try {
      const response = await fetch('/api/agent/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, color })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`文件夹 "${name}" 创建成功！`);
        // 刷新文件夹列表
        await loadFolders();
      } else {
        toast.error(data.error || '创建文件夹失败');
      }
    } catch (error) {
      console.error('创建文件夹失败:', error);
      toast.error('创建文件夹失败，请稍后重试');
    }
  }, [loadFolders]);
  
  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      const response = await fetch(`/api/agent/folders/${folderId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('文件夹删除成功');
        // 刷新文件夹列表
        await loadFolders();
        // 如果删除的是当前选中的文件夹，清除选中状态
        if (state.selectedFolderId === folderId) {
          updateState({ selectedFolderId: null });
        }
      } else {
        toast.error(data.error || '删除文件夹失败');
      }
    } catch (error) {
      console.error('删除文件夹失败:', error);
      toast.error('删除文件夹失败');
    }
  }, [loadFolders, state.selectedFolderId, updateState]);
  
  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    try {
      const response = await fetch(`/api/agent/folders/${folderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('文件夹重命名成功');
        // 刷新文件夹列表
        await loadFolders();
      } else {
        toast.error(data.error || '重命名文件夹失败');
      }
    } catch (error) {
      console.error('重命名文件夹失败:', error);
      toast.error('重命名文件夹失败');
    }
  }, [loadFolders]);
  
  const moveConversationToFolder = useCallback(async (conversationId: number, folderId: string | null) => {
    try {
      // 根据是否有folderId选择不同的API路径
      const url = folderId 
        ? `/api/agent/folders/${folderId}/conversations`
        : `/api/agent/conversations/${conversationId}/folder`;
      
      const method = folderId ? 'POST' : 'DELETE';
      const body = folderId 
        ? JSON.stringify({ conversationIds: [conversationId] })
        : undefined;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(body && { body })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('会话移动成功');
        // 刷新会话列表
        await loadConversations();
      } else {
        toast.error(data.error || '移动会话失败');
      }
    } catch (error) {
      console.error('移动会话失败:', error);
      toast.error('移动会话失败');
    }
  }, [loadConversations]);
  
  // 副作用：监听选中标签、搜索关键词和文件夹选择变化
  useEffect(() => {
    loadConversations();
  }, [state.selectedTags, state.searchKeyword, state.selectedFolderId, loadConversations]);
  
  // 副作用：当模板变化时更新系统提示
  useEffect(() => {
    if (state.selectedTemplate) {
      updateState({ systemPrompt: state.selectedTemplate.content });
    }
  }, [state.selectedTemplate, updateState]);
  
  // 返回状态和操作
  return {
    ...state,
    selectConversation,
    createNewConversation,
    deleteConversation,
    sendMessage,
    deleteMessage,
    regenerateLastResponse,
    batchDeleteMessages,
    setSelectedModel,
    setSelectedTemplate,
    setSearchKeyword,
    setHistoryLimit,
    loadConversations,
    loadMessages,
    loadTemplates,
    loadFolders,
    clearError,
    selectFolder,
    createFolder,
    deleteFolder,
    renameFolder,
    moveConversationToFolder,
  };
}
