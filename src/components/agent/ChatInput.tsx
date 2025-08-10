'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { InlineLoading } from './LoadingStates';
import ModelSelector from './ModelSelector';
import PromptTemplateSelector from './PromptTemplateSelector';
import type { PromptTemplate } from './types';

interface ChatInputProps {
  loading: boolean;
  selectedModel: string;
  selectedTemplate: PromptTemplate | null;
  templates: PromptTemplate[];
  onSendMessage: (message: string) => void;
  onModelChange: (model: string) => void;
  onTemplateChange: (template: PromptTemplate | null) => void;
}

export default function ChatInput({ 
  loading, 
  selectedModel,
  selectedTemplate,
  templates,
  onSendMessage, 
  onModelChange,
  onTemplateChange 
}: ChatInputProps) {
  const [inputMessage, setInputMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整文本框高度
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 128; // max-h-32 = 8rem = 128px
      textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  };

  // 当输入内容变化时调整高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // 处理发送消息
  const handleSendMessage = () => {
    const trimmedMessage = inputMessage.trim();
    
    // 发送节流：在上次请求完成前禁止再次发送
    if (loading) {
      toast.error('请等待上一条消息处理完成');
      return;
    }
    
    // 检查消息是否为空
    if (!trimmedMessage) {
      toast.error('请输入消息内容');
      return;
    }
    
    // 前端文本长度限制：5000字符
    if (trimmedMessage.length > 5000) {
      toast.error('消息长度不能超过5000字符，请缩短内容');
      return;
    }
    
    // 发送消息
    onSendMessage(trimmedMessage);
    setInputMessage('');
    
    // 重置文本框高度
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }, 0);
  };

  // 处理键盘事件
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
  };

  return (
    <div 
      className="p-4" 
      style={{ 
        background: 'transparent'
      }}
    >
      {/* 模型和模板选择器 - 移到输入框上方 */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-48">
          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={onModelChange}
            disabled={loading}
          />
        </div>
        <div className="w-48">
          <PromptTemplateSelector
            templates={templates}
            selectedTemplate={selectedTemplate}
            onTemplateChange={onTemplateChange}
            disabled={loading}
          />
        </div>
      </div>
      
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="输入您的问题... (按回车发送)"
          className="w-full resize-none enhanced-input focus-enhanced keyboard-navigable optimized-text scroll-optimized min-h-[44px] max-h-32"
          style={{
            color: 'var(--text-primary)'
          }}
          disabled={loading}
          rows={1}
        />
        
        {/* 字符计数 */}
        <div 
          className="absolute bottom-2 right-3 text-xs pointer-events-none"
          style={{ color: 'var(--text-secondary)' }}
        >
          {inputMessage.length > 0 && (
            <span className={inputMessage.length > 5000 ? 'text-red-500' : ''}>
              {inputMessage.length}/5000
            </span>
          )}
        </div>
        

      </div>
      
      {/* 提示信息 */}
      <div className="flex items-center justify-between mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <div className="flex items-center gap-4">
          {inputMessage.length > 4000 && (
            <span className={inputMessage.length > 5000 ? 'text-red-500' : 'text-yellow-500'}>
              {inputMessage.length > 5000 ? '内容过长，请缩减文本' : '内容较长，建议精简'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
