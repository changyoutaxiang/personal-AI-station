'use client';

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { trackEvent } from '@/lib/client-tracker';

export interface StreamMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  tokens_used?: number;
  isStreaming?: boolean;
}

export interface StreamChatState {
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
}

export interface StreamChatActions {
  sendStreamMessage: (
    conversationId: number | null,
    message: string,
    model: string,
    systemPrompt: string,
    historyLimit: number,
    onMessageUpdate: (userMessage: StreamMessage, assistantMessage?: StreamMessage) => void,
    onConversationCreated?: (conversationId: number) => void
  ) => Promise<void>;
  stopStreaming: () => void;
  clearError: () => void;
}

export function useStreamChat(): StreamChatState & StreamChatActions {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setStreamingContent('');
  }, []);

  const sendStreamMessage = useCallback(async (
    conversationId: number | null,
    message: string,
    model: string,
    systemPrompt: string,
    historyLimit: number,
    onMessageUpdate: (userMessage: StreamMessage, assistantMessage?: StreamMessage) => void,
    onConversationCreated?: (conversationId: number) => void
  ) => {
    if (!message.trim() || isStreaming) return;

    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    // 创建新的 AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let currentConversationId = conversationId;
    let userMessage: StreamMessage | null = null;
    let assistantMessage: StreamMessage | null = null;

    try {
      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          message: message.trim(),
          model,
          systemPrompt,
          historyLimit
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('响应中没有流数据');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          const data = trimmed.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);

            switch (parsed.type) {
              case 'init':
                // 初始化：获取会话ID和用户消息
                currentConversationId = parsed.conversationId;
                userMessage = {
                  id: parsed.userMessage.id,
                  conversation_id: currentConversationId,
                  role: 'user',
                  content: parsed.userMessage.content,
                  created_at: parsed.userMessage.created_at
                };

                // 创建流式助手消息占位符
                assistantMessage = {
                  id: Date.now(), // 临时ID
                  conversation_id: currentConversationId,
                  role: 'assistant',
                  content: '',
                  created_at: new Date().toISOString(),
                  isStreaming: true
                };

                // 通知会话创建
                if (!conversationId && onConversationCreated) {
                  onConversationCreated(currentConversationId);
                }

                // 更新消息
                onMessageUpdate(userMessage, assistantMessage);
                break;

              case 'chunk':
                // 内容块：更新流式内容
                if (parsed.content && assistantMessage) {
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                  
                  // 更新助手消息内容
                  const updatedAssistantMessage = {
                    ...assistantMessage,
                    content: fullContent
                  };
                  onMessageUpdate(userMessage!, updatedAssistantMessage);
                }
                break;

              case 'final':
                // 最终：完成流式输出
                if (assistantMessage) {
                  const finalAssistantMessage = {
                    ...assistantMessage,
                    id: parsed.assistant.id,
                    content: parsed.assistant.content,
                    tokens_used: parsed.assistant.tokensUsed,
                    created_at: parsed.assistant.created_at,
                    isStreaming: false
                  };
                  onMessageUpdate(userMessage!, finalAssistantMessage);
                }

                // 追踪成功事件
                trackEvent.aiInteraction('stream_message_success', {
                  conversation_id: currentConversationId,
                  model_name: model,
                  message_length: message.trim().length,
                  has_system_prompt: !!systemPrompt,
                  is_new_conversation: !conversationId,
                  content_length: fullContent.length,
                  tokens_used: parsed.assistant?.tokensUsed
                });
                break;

              case 'error':
                throw new Error(parsed.error);

              case 'done':
                // 流式完成
                break;
            }
          } catch (parseError) {
            console.warn('解析流数据失败:', parseError);
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('流式请求被取消');
        return;
      }

      console.error('流式消息发送失败:', error);
      const errorMsg = error instanceof Error ? error.message : '未知错误';
      setError(`发送消息失败: ${errorMsg}`);
      toast.error(`发送消息失败: ${errorMsg}`, { duration: 5000 });
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
      abortControllerRef.current = null;
    }
  }, [isStreaming]);

  return {
    isStreaming,
    streamingContent,
    error,
    sendStreamMessage,
    stopStreaming,
    clearError,
  };
}
