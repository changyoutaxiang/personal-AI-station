'use client';

import { useEffect, useRef } from 'react';
import ChatSidebar from './ChatSidebar';

import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ErrorState from './ErrorState';


import { useChatContext } from '@/contexts/ChatContext';
import { useDataFlow } from '@/hooks/useDataFlow';
import { trackEvent } from '@/lib/client-tracker';
import { toast } from 'react-hot-toast';

export default function ChatLayout() {
  const chatState = useChatContext();
  const dataFlow = useDataFlow(chatState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 当前会话对象
  const currentConversation = chatState.conversations.find(
    c => c.id === chatState.currentConversationId
  ) || null;

  // 初始化数据流
  useEffect(() => {
    dataFlow.initialize();
  }, []);

  // 当消息更新时，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [chatState.messages]);

  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* 错误状态显示 */}
      {chatState.error && (
        <ErrorState
          error={chatState.error}
          onRetry={() => dataFlow.refreshData()}
          onClearError={chatState.clearError}
          onRecoverFromError={() => dataFlow.recoverFromError()}
          showRecovery={true}
        />
      )}
      
      <div className="flex h-screen gap-2 p-2">
        {/* 左侧边栏 - 无边框卡片 */}
        <div className="h-full m-2 rounded-2xl overflow-hidden" 
             style={{
               backgroundColor: 'var(--background)',
               border: 'none',
               background: 'linear-gradient(135deg, var(--background), color-mix(in oklab, var(--background) 97%, var(--card-border)))',
               backdropFilter: 'blur(10px)',
               WebkitBackdropFilter: 'blur(10px)'
             }}>
          <ChatSidebar
          conversations={chatState.conversations}
          currentConversation={currentConversation}
          searchKeyword={chatState.searchKeyword}
          conversationsLoading={chatState.conversationsLoading}
          sidebarCollapsed={chatState.sidebarCollapsed}
          folders={chatState.folders}
          selectedFolderId={chatState.selectedFolderId}
          onSelectConversation={chatState.selectConversation}
          onCreateNewConversation={chatState.createNewConversation}
          onDeleteConversation={chatState.deleteConversation}
          onSearchChange={chatState.setSearchKeyword}
          onToggleCollapsed={() => chatState.setSidebarCollapsed(!chatState.sidebarCollapsed)}
          onCreateFolder={chatState.createFolder}
          onDeleteFolder={chatState.deleteFolder}
          onRenameFolder={chatState.renameFolder}
          onSelectFolder={chatState.selectFolder}
          onMoveConversationToFolder={chatState.moveConversationToFolder}
        />
        </div>

        {/* 右侧主内容区 - 无边框透明 */}
        <div className="flex-1 h-full flex flex-col overflow-hidden m-2" 
             style={{
               backgroundColor: 'transparent',
               border: 'none',
               boxShadow: 'none',
               background: 'transparent'
             }}>


          {/* 消息区域 - 无边框卡片 */}
          <div className="flex-1 mb-2 rounded-2xl overflow-hidden" 
               style={{
                 backgroundColor: 'var(--background)',
                 border: 'none',
                 background: 'linear-gradient(135deg, var(--background), color-mix(in oklab, var(--background) 97%, var(--card-border)))',
                 backdropFilter: 'blur(10px)',
                 WebkitBackdropFilter: 'blur(10px)'
               }}>
            <ChatMessages
              messages={chatState.messages}
              loading={chatState.loading}
              currentConversation={currentConversation}
              onDeleteMessage={chatState.deleteMessage}
              onRegenerateResponse={chatState.regenerateLastResponse}
              messagesEndRef={messagesEndRef}
              onBatchDelete={chatState.batchDeleteMessages}

            />
          </div>

          {/* 输入区域 - 无边框卡片 */}
          <div className="mt-2 rounded-2xl overflow-visible" 
               style={{
                 backgroundColor: 'var(--background)',
                 border: 'none',
                 background: 'linear-gradient(135deg, var(--background), color-mix(in oklab, var(--background) 97%, var(--card-border)))',
                 backdropFilter: 'blur(10px)',
                 WebkitBackdropFilter: 'blur(10px)'
               }}>
            <ChatInput
              loading={chatState.loading}
              selectedModel={chatState.selectedModel}
              selectedTemplate={chatState.selectedTemplate}
              templates={chatState.templates}
              onSendMessage={chatState.sendMessage}
              onModelChange={chatState.setSelectedModel}
              onTemplateChange={chatState.setSelectedTemplate}
            />
           </div>

        </div>
      </div>
      

    </div>
  );
}
