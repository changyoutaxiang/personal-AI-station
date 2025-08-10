'use client';

import React, { useState } from 'react';
import { Animated } from '@/components/animations';
import { LoadingSpinner, StreamingCursor } from './LoadingStates';
import { StreamingMessageSkeleton } from './SkeletonLoaders';
import MessageEditor from './MessageEditor';
import BatchOperationBar from './BatchOperationBar';
import { useMultiSelect } from '@/hooks/useMultiSelect';
import { toast } from 'react-hot-toast';
import type { Message, Conversation } from './types';

interface ChatMessagesProps {
  messages: Message[];
  loading: boolean;
  currentConversation: Conversation | null;
  onDeleteMessage: (messageId: number) => void;
  onRegenerateResponse: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  // 编辑相关
  onEditMessage?: (messageId: number, newContent: string, editReason?: string) => Promise<void>;
  onStartEdit?: (messageId: number) => void;
  onCancelEdit?: (messageId: number) => void;
  editingMessageId?: number | null;
  editLoading?: boolean;
  // 多选操作相关
  enableMultiSelect?: boolean;
  onBatchDelete?: (messageIds: number[]) => Promise<void>;
  // 分页相关属性
  hasMoreMessages?: boolean;
  loadingMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
}

export default function ChatMessages({
  messages,
  loading,
  currentConversation,
  onDeleteMessage,
  onRegenerateResponse,
  messagesEndRef,
  // 编辑相关
  onEditMessage,
  onStartEdit,
  onCancelEdit,
  editingMessageId,
  editLoading = false,
  // 多选操作相关
  enableMultiSelect = true,
  onBatchDelete,
  hasMoreMessages = false,
  loadingMoreMessages = false,
  onLoadMoreMessages
}: ChatMessagesProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  
  // 复制消息内容
  const copyMessage = async (content: string, messageId: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast.success('复制成功');
      // 2秒后恢复原始图标
      setTimeout(() => {
        setCopiedMessageId(null);
      }, 2000);
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败');
    }
  };

  // 确认删除消息
  const confirmDeleteMessage = (messageId: number, content: string) => {
    const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
    if (window.confirm(`确定要删除这条消息吗？\n\n"${preview}"`)) {
      onDeleteMessage(messageId);
    }
  };

  // 检查是否可以重新生成（最后一条消息是助手回复）
  const canRegenerate = messages.length > 0 && messages[messages.length - 1].role === 'assistant';

  // 处理开始编辑
  const handleStartEdit = (message: Message) => {
    if (onStartEdit) {
      onStartEdit(message.id);
    }
  };

  // 处理取消编辑
  const handleCancelEdit = (messageId: number) => {
    if (onCancelEdit) {
      onCancelEdit(messageId);
    }
  };

  // 处理保存编辑
  const handleSaveEdit = async (messageId: number, newContent: string, editReason?: string) => {
    if (onEditMessage) {
      await onEditMessage(messageId, newContent, editReason);
    }
  };

  // 多选功能
  const multiSelect = useMultiSelect<Message>(messages, {
    maxSelections: 50, // 限制最多选戵50条消息
    onSelectionChange: (selectedIds) => {
      console.log('选中消息 ID:', selectedIds);
    },
    onMaxReached: () => {
      toast.error('最多只能选择50条消息');
    }
  });

  // 处理长按进入多选模式
  const handleLongPress = (message: Message) => {
    if (!enableMultiSelect) return;
    
    multiSelect.enterMultiSelectMode();
    multiSelect.selectItem(message);
    toast.success('已进入多选模式');
  };

  // 处理消息点击
  const handleMessageClick = (message: Message) => {
    if (multiSelect.isMultiSelectMode) {
      multiSelect.toggleItem(message);
    }
  };

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (!onBatchDelete || multiSelect.selectedCount === 0) return;
    
    try {
      await onBatchDelete(multiSelect.selectedIds);
      multiSelect.exitMultiSelectMode();
      toast.success(`成功删除 ${multiSelect.selectedCount} 条消息`);
    } catch (error) {
      console.error('批量删除失败:', error);
      toast.error('批量删除失败');
    }
  };



  // 处理长按事件
  const handleMouseDown = (message: Message) => {
    if (!enableMultiSelect || multiSelect.isMultiSelectMode) return;
    
    const timer = setTimeout(() => {
      handleLongPress(message);
    }, 500); // 500ms 长按
    
    setLongPressTimer(timer);
  };

  const handleMouseUp = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      {messages.length === 0 && !currentConversation ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl mx-auto">
            {/* 主Logo */}
            <div className="relative mb-8">
              <div 
                className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent animate-pulse"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--flow-blue), var(--flow-indigo), var(--flow-cyan))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1'
                }}
              >
                May the AI
              </div>
              <div 
                className="text-7xl md:text-8xl font-bold bg-clip-text text-transparent animate-pulse"
                style={{
                  backgroundImage: 'linear-gradient(90deg, var(--flow-cyan), var(--flow-blue), var(--flow-indigo))',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.02em',
                  lineHeight: '1.1',
                  animationDelay: '0.5s'
                }}
              >
                be with U
              </div>
            </div>
            

            

          </div>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {messages.map((message, index) => (
            <Animated key={message.id} animation="slideIn" delay={index * 50}>
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`group relative max-w-[75%] p-3 transition-all duration-200 cursor-pointer ${
                    message.role === 'user' 
                      ? 'ml-4 user-message-bubble' 
                      : 'mr-4 glass-card-deep surface-highlight card-micro-interaction enhanced-backdrop optimized-text'
                  } ${
                    multiSelect.isSelected(message.id) 
                      ? 'ring-2 ring-offset-2' 
                      : ''
                  }`}
                  style={{
                    color: message.role === 'user' ? 'var(--text-on-primary, white)' : 'var(--text-primary)',
                    boxShadow: multiSelect.isSelected(message.id) ? '0 0 0 2px var(--flow-primary), 0 0 0 6px rgba(0,0,0,0)' : undefined,
                    background: multiSelect.isSelected(message.id)
                      ? (message.role === 'user' 
                          ? 'linear-gradient(135deg, var(--flow-primary), var(--flow-secondary))' 
                          : 'var(--card-glass)')
                      : undefined,
                    outlineColor: 'var(--flow-primary)'
                  }}
                  onClick={() => handleMessageClick(message)}
                  onMouseDown={() => handleMouseDown(message)}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                >
                  {/* 多选指示器 */}
                  {(multiSelect.isMultiSelectMode || multiSelect.isSelected(message.id)) && (
                    <div className="absolute -top-2 -left-2 z-10">
                      <div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          multiSelect.isSelected(message.id)
                            ? 'text-white'
                            : ''
                        }`}
                      style={{
                        background: multiSelect.isSelected(message.id) ? 'var(--flow-primary)' : 'white',
                        borderColor: multiSelect.isSelected(message.id) ? 'var(--flow-primary)' : 'rgba(156,163,175,1)'
                      }}
                      >
                        {multiSelect.isSelected(message.id) && (
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                  {/* 消息内容或编辑器 */}
                  {editingMessageId === message.id ? (
                    <MessageEditor
                      message={message}
                      onSave={handleSaveEdit}
                      onCancel={() => handleCancelEdit(message.id)}
                      loading={editLoading}
                      className="-m-1"
                    />
                  ) : (
                    <div className="whitespace-pre-wrap break-words">
                      {typeof message.content === 'string' ? message.content : ''}
                      {/* 优化的流式输出打字机效果 */}
                      {message.isStreaming && (
                        <StreamingCursor 
                          visible={true}
                          color={message.role === 'user' 
                            ? 'rgba(255,255,255,0.9)' 
                            : 'var(--flow-primary)'}
                          size="md"
                        />
                      )}
                    </div>
                  )}
                  
                  {/* 消息元信息 */}
                  <div className="flex items-center justify-between mt-3 pt-2 border-t" 
                       style={{ 
                         borderColor: message.role === 'user' 
                           ? 'rgba(255,255,255,0.2)' 
                           : 'var(--card-border)' 
                       }}>
                    <div className="text-xs opacity-70">
                      {new Date(message.created_at).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {message.tokens_used && (
                        <span className="ml-2">• {message.tokens_used} tokens</span>
                      )}
                    </div>
                    
                    {/* 消息操作按钮 */}
                    {editingMessageId !== message.id && (
                      <div className="opacity-100 flex items-center gap-1">
                        <button
                          onClick={() => copyMessage(message.content, message.id)}
                          className="p-1 text-xs rounded transition-all duration-200"
                          title={copiedMessageId === message.id ? "复制成功" : "复制消息"}
                          style={{ color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}
                        >
                          {copiedMessageId === message.id ? '✅' : '📋'}
                        </button>
                        
                        {/* 编辑按钮（仅用户消息可编辑） */}
                        {message.role === 'user' && onStartEdit && (
                          <button
                            onClick={() => handleStartEdit(message)}
                            className="p-1 text-xs rounded"
                            title="编辑消息"
                            style={{ color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}
                          >
                            ✏️
                          </button>
                        )}
                        
                        <button
                          onClick={() => confirmDeleteMessage(message.id, message.content)}
                          className="p-1 text-xs rounded"
                          title="删除消息"
                          style={{ color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)' }}
                        >
                          🗑️
                        </button>
                        
                        {/* 重新生成按钮（仅对最后一条助手回复显示） */}
                        {message.role === 'assistant' && 
                         index === messages.length - 1 && 
                         !loading && (
                          <button
                            onClick={onRegenerateResponse}
                            className="p-1 text-xs rounded"
                            title="重新生成回复"
                            style={{ color: 'var(--text-secondary)' }}
                          >
                            🔄
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Animated>
          ))}
          
          {/* 优化的加载状态 */}
          {loading && (
            <Animated animation="fadeIn">
              <div className="flex justify-start">
                <LoadingSpinner
                  type="thinking"
                  size="lg"
                  showDescription={true}
                  className="max-w-[70%] mr-4"
                />
              </div>
            </Animated>
          )}
          
          {/* 滚动锚点 */}
          <div ref={messagesEndRef} />
        </div>
      )}
      
      {/* 批量操作工具栏 */}
      {multiSelect.isMultiSelectMode && multiSelect.selectedCount > 0 && (
        <BatchOperationBar
          target="messages"
          selectedCount={multiSelect.selectedCount}
          totalCount={messages.length}
          isAllSelected={multiSelect.isAllSelected}
          selectedItems={multiSelect.selectedItems}
          onSelectAll={() => multiSelect.toggleAll(messages)}
          onClearSelection={multiSelect.clearSelection}
          onBatchDelete={handleBatchDelete}

          onClose={multiSelect.exitMultiSelectMode}
        />
      )}
    </div>
  );
}
