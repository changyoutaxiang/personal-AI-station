'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Check, X, RotateCcw, History } from 'lucide-react';
import { InlineLoading } from './LoadingStates';
import type { Message, MessageEditHistory } from './types';

interface MessageEditorProps {
  message: Message;
  onSave: (messageId: number, newContent: string, editReason?: string) => Promise<void>;
  onCancel: () => void;
  onShowHistory?: (messageId: number) => void;
  loading?: boolean;
  className?: string;
}

export default function MessageEditor({
  message,
  onSave,
  onCancel,
  onShowHistory,
  loading = false,
  className = ''
}: MessageEditorProps) {
  const [editContent, setEditContent] = useState(message.content);
  const [editReason, setEditReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const reasonInputRef = useRef<HTMLInputElement>(null);

  // 聚焦到文本框并选择所有内容
  useEffect(() => {
    if (textareaRef.current && !loading) {
      textareaRef.current.focus();
      textareaRef.current.select();
      adjustTextareaHeight();
    }
  }, [loading]);

  // 聚焦到原因输入框
  useEffect(() => {
    if (showReasonInput && reasonInputRef.current) {
      reasonInputRef.current.focus();
    }
  }, [showReasonInput]);

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 300; // 最大高度限制
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  // 处理内容变化
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    adjustTextareaHeight();
  };

  // 处理保存
  const handleSave = async () => {
    const trimmedContent = editContent.trim();
    
    // 检查内容是否有变化
    if (trimmedContent === message.content.trim()) {
      onCancel();
      return;
    }

    // 检查内容是否为空
    if (!trimmedContent) {
      alert('消息内容不能为空');
      return;
    }

    // 如果显示原因输入，但没有输入原因，要求输入
    if (showReasonInput && !editReason.trim()) {
      alert('请输入编辑原因');
      reasonInputRef.current?.focus();
      return;
    }

    try {
      await onSave(message.id, trimmedContent, editReason.trim() || undefined);
    } catch (error) {
      console.error('保存消息编辑失败:', error);
      alert('保存失败，请重试');
    }
  };

  // 处理取消
  const handleCancel = () => {
    setEditContent(message.content);
    setEditReason('');
    setShowReasonInput(false);
    onCancel();
  };

  // 处理恢复原始内容
  const handleRestore = () => {
    const originalContent = message.originalContent || message.content;
    setEditContent(originalContent);
    adjustTextareaHeight();
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const hasChanges = editContent.trim() !== message.content.trim();
  const hasEditHistory = message.editHistory && message.editHistory.length > 0;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 编辑提示 */}
      <div 
        className="flex items-center gap-2 text-xs px-2 py-1 rounded-full"
        style={{ 
          backgroundColor: 'var(--flow-primary)/10',
          color: 'var(--flow-primary)',
          border: '1px solid var(--flow-primary)/20'
        }}
      >
        <span>✏️</span>
        <span>编辑模式</span>
        <div className="ml-auto flex items-center gap-1 text-xs opacity-75">
          <span>Ctrl+Enter 保存</span>
          <span>•</span>
          <span>Esc 取消</span>
        </div>
      </div>

      {/* 主编辑区域 */}
      <div 
        className="relative rounded-lg border-2 transition-colors"
        style={{ 
          borderColor: hasChanges ? 'var(--flow-primary)' : 'var(--card-border)',
          backgroundColor: 'var(--background)'
        }}
      >
        <textarea
          ref={textareaRef}
          value={editContent}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          className="w-full p-3 bg-transparent resize-none focus:outline-none"
          style={{ color: 'var(--text-primary)' }}
          placeholder="输入消息内容..."
          disabled={loading}
          rows={3}
        />
        
        {/* 字符计数 */}
        <div 
          className="absolute bottom-2 right-2 text-xs pointer-events-none"
          style={{ color: 'var(--text-secondary)' }}
        >
          {editContent.length} 字符
        </div>
      </div>

      {/* 编辑原因输入 */}
      {showReasonInput && (
        <div className="space-y-2">
          <label 
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            编辑原因 (可选):
          </label>
          <input
            ref={reasonInputRef}
            type="text"
            value={editReason}
            onChange={(e) => setEditReason(e.target.value)}
            placeholder="简要说明编辑原因..."
            className="w-full p-2 rounded border"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--background)',
              color: 'var(--text-primary)'
            }}
            disabled={loading}
          />
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* 恢复原始内容 */}
          {hasChanges && (
            <button
              onClick={handleRestore}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="恢复原始内容"
            >
              <RotateCcw size={12} />
              恢复
            </button>
          )}

          {/* 查看编辑历史 */}
          {hasEditHistory && onShowHistory && (
            <button
              onClick={() => onShowHistory(message.id)}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              title="查看编辑历史"
            >
              <History size={12} />
              历史 ({message.editHistory?.length})
            </button>
          )}

          {/* 编辑原因开关 */}
          <button
            onClick={() => setShowReasonInput(!showReasonInput)}
            disabled={loading}
            className={`text-xs px-2 py-1 rounded transition-colors ${
              showReasonInput 
                ? 'text-white' 
                : 'hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: showReasonInput ? 'var(--flow-primary)' : 'transparent',
              color: showReasonInput ? 'white' : 'var(--text-secondary)'
            }}
          >
            {showReasonInput ? '收起原因' : '添加原因'}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* 取消按钮 */}
          <button
            onClick={handleCancel}
            disabled={loading}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm rounded-lg border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{ 
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={14} />
            取消
          </button>

          {/* 保存按钮 */}
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            style={{
              backgroundColor: (!hasChanges || loading) ? 'var(--text-secondary)' : 'var(--flow-primary)',
              color: 'white',
              boxShadow: (!hasChanges || loading) ? 'none' : '0 4px 15px rgba(14, 165, 233, 0.3)'
            }}
          >
            {loading ? (
              <InlineLoading 
                type="processing" 
                size="sm" 
                text="保存中" 
                className="text-white"
              />
            ) : (
              <>
                <Check size={14} />
                保存编辑
              </>
            )}
          </button>
        </div>
      </div>

      {/* 变更预览 */}
      {hasChanges && (
        <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex items-center gap-2">
            <span>📝</span>
            <span>内容已修改</span>
            {editContent.length !== message.content.length && (
              <span className="px-1.5 py-0.5 rounded-full text-xs" 
                    style={{ 
                      backgroundColor: editContent.length > message.content.length 
                        ? 'var(--success-bg)' 
                        : 'var(--warning-bg)',
                      color: editContent.length > message.content.length 
                        ? 'var(--success-text)' 
                        : 'var(--warning-text)'
                    }}>
                {editContent.length > message.content.length ? '+' : ''}
                {editContent.length - message.content.length} 字符
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
