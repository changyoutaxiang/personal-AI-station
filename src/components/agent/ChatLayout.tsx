'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, CheckSquare, BarChart3, Code, Settings, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import ErrorState from '../ui/ErrorState';
import { useChatContext } from '@/contexts/ChatContext';
import { useDataFlow } from '@/hooks/useDataFlow';
import { trackEvent } from '@/lib/client-tracker';
import { toast } from 'react-hot-toast';

export default function ChatLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatState = useChatContext();
  const dataFlow = useDataFlow(chatState);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialMessage, setInitialMessage] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  // 当前会话对象
  const currentConversation = chatState.conversations.find(
    c => c.id === chatState.currentConversationId
  ) || null;

  // 导航项配置（不包含随机背景图标）
  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: CheckSquare,
      label: '待办',
      href: '/todos',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: Code,
      label: 'HTML渲染',
      href: '/html-renderer',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: BarChart3,
      label: '分析',
      href: '/analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  // 初始化数据流
  useEffect(() => {
    dataFlow.initialize();
  }, []);

  // 处理URL参数中的message
  useEffect(() => {
    const message = searchParams.get('message');
    if (message) {
      setInitialMessage(decodeURIComponent(message));
      // 清除URL参数
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('message');
      router.replace(newUrl.pathname + newUrl.search);
    }
  }, [searchParams, router]);

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
          action={{
            label: "重试",
            onClick: () => dataFlow.refreshData()
          }}
          secondaryAction={{
            label: "清除错误",
            onClick: chatState.clearError
          }}
          showDetails={true}
        />
      )}
      
      <div className="flex gap-2 p-2 pt-20" style={{ height: 'calc(100vh - 2rem)' }}>
        {/* 侧边栏切换按钮 */}
        <div className="relative">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="absolute top-4 z-20 p-2 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-lg"
            style={{
              left: sidebarCollapsed ? '12px' : '340px',
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              border: '1px solid',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(10px)',
              boxShadow: sidebarCollapsed ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)'
            }}
            title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
          
          {/* 左侧边栏 - 无边框卡片 */}
          <div 
            className={`h-full rounded-2xl overflow-hidden transition-all duration-300 ${
              sidebarCollapsed ? 'w-0 opacity-0 ml-0' : 'w-80 opacity-100 ml-2'
            }`}
            style={{
              backgroundColor: 'var(--background)',
              border: 'none',
              background: 'linear-gradient(135deg, var(--background), color-mix(in oklab, var(--background) 97%, var(--card-border)))',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              marginRight: '8px',
              transform: sidebarCollapsed ? 'translateX(-100%)' : 'translateX(0)',
            }}>
            <ChatSidebar
          conversations={chatState.conversations}
          currentConversation={currentConversation}

          conversationsLoading={chatState.conversationsLoading}
          folders={chatState.folders}
          selectedFolderId={chatState.selectedFolderId}
          onSelectConversation={chatState.selectConversation}
          onCreateNewConversation={chatState.createNewConversation}
          onDeleteConversation={chatState.deleteConversation}

          onCreateFolder={chatState.createFolder}
          onDeleteFolder={chatState.deleteFolder}
          onRenameFolder={chatState.renameFolder}
          onSelectFolder={chatState.selectFolder}
          onMoveConversationToFolder={chatState.moveConversationToFolder}
        />
          </div>
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
              initialMessage={initialMessage}
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
