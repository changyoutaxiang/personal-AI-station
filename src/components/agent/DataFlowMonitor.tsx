'use client';

import React, { useState, useEffect } from 'react';
import { Monitor, ChevronDown, ChevronUp, Database, MessageSquare, Tag, FileText } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

interface DataFlowMonitorProps {
  show?: boolean;
}

// 开发模式下显示的数据流监控器
export default function DataFlowMonitor({ show = process.env.NODE_ENV === 'development' }: DataFlowMonitorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const chatState = useChatContext();

  // 监听状态变化
  useEffect(() => {
    setLastUpdate(Date.now());
  }, [
    chatState.currentConversationId,
    chatState.messages.length,
    chatState.conversations.length,
    chatState.loading,
    chatState.error
  ]);

  if (!show) return null;

  const statusItems = [
    {
      icon: Database,
      label: '会话',
      value: `${chatState.conversations.length} 个`,
      active: chatState.conversationsLoading,
    },
    {
      icon: MessageSquare,
      label: '消息',
      value: `${chatState.messages.length} 条`,
      active: chatState.currentConversationId !== null,
    },
    {
      icon: Tag,
      label: '标签',
      value: `${chatState.tags.length} 个`,
      active: chatState.selectedTags.length > 0,
    },
    {
      icon: FileText,
      label: '模板',
      value: `${chatState.templates.length} 个`,
      active: chatState.selectedTemplate !== null,
    },
  ];

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 max-w-sm"
      style={{ 
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: '8px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* 头部 */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Monitor size={16} style={{ color: 'var(--primary)' }} />
          <span 
            className="text-sm font-medium"
            style={{ color: 'var(--text-primary)' }}
          >
            数据流监控
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {chatState.loading && (
            <div 
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: 'var(--warning-text)' }}
            />
          )}
          
          {chatState.error && (
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--destructive-text)' }}
            />
          )}
          
          {!chatState.loading && !chatState.error && (
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--success-text)' }}
            />
          )}
          
          {isExpanded ? (
            <ChevronUp size={16} style={{ color: 'var(--text-secondary)' }} />
          ) : (
            <ChevronDown size={16} style={{ color: 'var(--text-secondary)' }} />
          )}
        </div>
      </div>
      
      {/* 展开内容 */}
      {isExpanded && (
        <div 
          className="border-t p-3 space-y-3"
          style={{ borderColor: 'var(--card-border)' }}
        >
          {/* 状态项 */}
          <div className="space-y-2">
            {statusItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon 
                      size={14} 
                      style={{ 
                        color: item.active ? 'var(--primary)' : 'var(--text-secondary)' 
                      }}
                    />
                    <span 
                      className="text-xs"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {item.label}
                    </span>
                  </div>
                  <span 
                    className="text-xs font-mono"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
          
          {/* 当前状态 */}
          <div 
            className="pt-2 border-t text-xs space-y-1"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
          >
            <div className="flex justify-between">
              <span>当前会话:</span>
              <span className="font-mono">
                {chatState.currentConversationId || 'None'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>选中模型:</span>
              <span className="font-mono truncate max-w-24" title={chatState.selectedModel}>
                {chatState.selectedModel}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span>最后更新:</span>
              <span className="font-mono">
                {new Date(lastUpdate).toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            </div>
          </div>
          
          {/* 错误信息 */}
          {chatState.error && (
            <div 
              className="p-2 rounded text-xs break-words"
              style={{ 
                backgroundColor: 'var(--destructive-bg)',
                color: 'var(--destructive-text)',
                border: '1px solid var(--destructive-border)',
              }}
            >
              {chatState.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
