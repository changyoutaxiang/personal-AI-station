'use client';

import { useState } from 'react';
import { LoadingSpinner } from './LoadingStates';
import { ConversationListSkeleton } from './SkeletonLoaders';
import type { Conversation } from './types';

// 文件夹接口定义（临时，直到从types导入）
interface ConversationFolder {
  id: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
  position: number;
  parent_id?: number;
  created_at: string;
  updated_at: string;
  children?: ConversationFolder[];
}

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  searchKeyword: string;
  conversationsLoading: boolean;
  sidebarCollapsed: boolean;
  folders?: ConversationFolder[];
  selectedFolderId?: number | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateNewConversation: () => void;
  onDeleteConversation: (conversationId: number) => void;
  onSearchChange: (keyword: string) => void;
  onToggleCollapsed: () => void;
  // 文件夹相关回调
  onCreateFolder?: (name: string, description?: string, color?: string) => void;
  onDeleteFolder?: (folderId: number) => void;
  onRenameFolder?: (folderId: number, newName: string) => void;
  onSelectFolder?: (folderId: number | null) => void;
  onMoveConversationToFolder?: (conversationId: number, folderId: number | null) => void;
}

export default function ChatSidebar({
  conversations,
  currentConversation,
  searchKeyword,
  conversationsLoading,
  sidebarCollapsed,
  folders,
  selectedFolderId,
  onSelectConversation,
  onCreateNewConversation,
  onDeleteConversation,
  onSearchChange,
  onToggleCollapsed,
  onCreateFolder,
  onDeleteFolder,
  onRenameFolder,
  onSelectFolder,
  onMoveConversationToFolder
}: ChatSidebarProps) {

  
  // 文件夹状态管理
  const [showCreateFolderInput, setShowCreateFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFolderColor, setSelectedFolderColor] = useState('#3B82F6');
  
  // 文件夹重命名状态
  const [renamingFolderId, setRenamingFolderId] = useState<number | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  
  // 拖拽状态
  const [draggingConversationId, setDraggingConversationId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  
  // 拖拽处理函数
  const handleDragStart = (e: React.DragEvent, conversationId: number) => {
    setDraggingConversationId(conversationId);
    e.dataTransfer.setData('text/plain', conversationId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragEnd = () => {
    setDraggingConversationId(null);
    setDragOverFolderId(null);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDragEnter = (e: React.DragEvent, folderId: number | null) => {
    e.preventDefault();
    setDragOverFolderId(folderId);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // 只有当离开整个文件夹区域时才清除高亮
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverFolderId(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent, folderId: number | null) => {
    e.preventDefault();
    const conversationId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    
    if (conversationId && draggingConversationId === conversationId) {
      onMoveConversationToFolder?.(conversationId, folderId);
    }
    
    setDraggingConversationId(null);
    setDragOverFolderId(null);
  };





  // 确认删除会话
  const confirmDelete = (conversation: Conversation) => {
    if (window.confirm(`确定要删除对话"${conversation.title}"吗？此操作不可撤销。`)) {
      onDeleteConversation(conversation.id);
    }
  };
  
  // 文件夹管理函数
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder?.(newFolderName.trim(), newFolderDescription.trim() || undefined, selectedFolderColor);
      // 重置表单
      setNewFolderName('');
      setNewFolderDescription('');
      setSelectedFolderColor('#3B82F6');
      setShowCreateFolderInput(false);
    }
  };
  
  const cancelCreateFolder = () => {
    setNewFolderName('');
    setNewFolderDescription('');
    setSelectedFolderColor('#3B82F6');
    setShowCreateFolderInput(false);
  };
  
  const handleCreateFolderKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      cancelCreateFolder();
    }
  };
  
  // 文件夹重命名管理函数
  const startRenameFolder = (folder: ConversationFolder) => {
    setRenamingFolderId(folder.id);
    setRenameFolderName(folder.name);
  };
  
  const confirmRenameFolder = () => {
    if (renamingFolderId && renameFolderName.trim()) {
      onRenameFolder?.(renamingFolderId, renameFolderName.trim());
      setRenamingFolderId(null);
      setRenameFolderName('');
    }
  };
  
  const cancelRenameFolder = () => {
    setRenamingFolderId(null);
    setRenameFolderName('');
  };
  
  const handleRenameFolderKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      confirmRenameFolder();
    } else if (e.key === 'Escape') {
      cancelRenameFolder();
    }
  };
  
  // 预设颜色选项
  const folderColors = [
    '#3B82F6', // 蓝色
    '#10B981', // 绿色
    '#F59E0B', // 黄色
    '#EF4444', // 红色
    '#8B5CF6', // 紫色
    '#06B6D4', // 青色
    '#F97316', // 橙色
    '#EC4899', // 粉色
  ];

  return (
    <div className={`${sidebarCollapsed ? 'w-16' : 'w-80 md:w-80 sm:w-64'} transition-all duration-300 md:relative fixed md:translate-x-0 z-20 h-full rounded-xl`} 
         style={{ background: 'transparent' }}>
      
      {/* 侧边栏头部 */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 active:scale-95 group"
                style={{
                  borderColor: 'var(--card-border)',
                  backgroundColor: 'var(--card-glass)',
                  color: 'var(--text-secondary)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                title="返回首页"
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className=""
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9,22 9,12 15,12 15,22"/>
                </svg>
                <span className="text-sm font-medium">首页</span>
              </button>
              <h1 className="text-xl font-bold ml-2" style={{ color: 'var(--text-primary)' }}>
                智能体
              </h1>
            </div>
          )}
          <button
            onClick={onToggleCollapsed}
            className="p-3 rounded-xl border group ml-auto"
            style={{
              borderColor: 'var(--card-border)',
              backgroundColor: 'var(--card-glass)',
              color: 'var(--text-secondary)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            title={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
          >
            <svg 
              className={`w-4 h-4 ${
                sidebarCollapsed ? 'rotate-180' : ''
              }`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 19l-7-7 7-7" 
              />
            </svg>
          </button>
        </div>
      </div>

      {!sidebarCollapsed && (
        <>
          {/* 新对话按钮 */}
          <div className="px-4 pt-3 pb-4">
            <button
              onClick={onCreateNewConversation}
              className="w-full p-3 rounded-lg border-2 border-dashed transition-colors"
              style={{
                borderColor: 'var(--flow-primary)',
                backgroundColor: 'var(--flow-primary)/10',
                color: 'var(--flow-primary)'
              }}
            >
              ＋ 新对话
            </button>
          </div>

          {/* 搜索框 */}
          <div className="px-4 pb-4">
            <input
              type="text"
              placeholder="搜索会话..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* 文件夹管理区域 */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 
                className={`text-sm font-medium cursor-pointer rounded p-1 transition-colors ${
                  dragOverFolderId === null && draggingConversationId
                    ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400'
                    : ''
                }`}
                style={{ color: 'var(--text-secondary)' }}
                onDragOver={handleDragOver}
                onDragEnter={(e) => handleDragEnter(e, null)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, null)}
                onClick={() => onSelectFolder?.(null)}
                title="全部对话 - 拖拽到此处移出文件夹"
              >
                📁 文件夹 {selectedFolderId === null ? '(当前)' : ''}
              </h3>
              <button
                onClick={() => setShowCreateFolderInput(!showCreateFolderInput)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                title="创建文件夹"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={showCreateFolderInput ? "M6 18L18 6M6 6l12 12" : "M12 6v6m0 0v6m0-6h6m-6 0H6"}
                  />
                </svg>
              </button>
            </div>
            
            {/* 创建文件夹表单 */}
            {showCreateFolderInput && (
              <div className="mb-3 p-3 rounded-lg border-2 border-dashed" 
                   style={{ 
                     borderColor: 'var(--flow-primary)', 
                     backgroundColor: 'var(--flow-primary)/5' 
                   }}>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="文件夹名称..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={handleCreateFolderKeyPress}
                    className="w-full px-3 py-2 text-sm rounded-lg border transition-colors"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-primary)'
                    }}
                    autoFocus
                  />
                  
                  <textarea
                    placeholder="描述（可选）..."
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border transition-colors resize-none"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-primary)'
                    }}
                    rows={2}
                  />
                  
                  {/* 颜色选择 */}
                  <div>
                    <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>选择颜色：</div>
                    <div className="flex flex-wrap gap-2">
                      {folderColors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedFolderColor(color)}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedFolderColor === color ? 'ring-2 ring-offset-1' : ''
                          }`}
                          style={{ 
                            backgroundColor: color,
                            borderColor: selectedFolderColor === color ? color : 'transparent'
                          }}
                          title={`选择${color}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim()}
                      className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      创建
                    </button>
                    <button
                      onClick={cancelCreateFolder}
                      className="px-3 py-2 text-sm bg-gray-500 text-white rounded-lg"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 文件夹列表 */}
            <div className="space-y-1">
              {folders && folders.length > 0 ? (
                folders.map(folder => (
                  <div
                    key={folder.id}
                    className={`group rounded-lg transition-all duration-200 ${
                      selectedFolderId === folder.id ? 'bg-black/10 dark:bg-white/10' : ''
                    }`}
                  >
                    {renamingFolderId === folder.id ? (
                      /* 重命名模式 */
                      <div className="flex items-center gap-2 p-2" onClick={e => e.stopPropagation()}>
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: folder.color }}
                        />
                        <input
                          type="text"
                          value={renameFolderName}
                          onChange={(e) => setRenameFolderName(e.target.value)}
                          onKeyDown={handleRenameFolderKeyPress}
                          className="flex-1 px-2 py-1 text-sm border rounded"
                          style={{
                            borderColor: 'var(--card-border)',
                            backgroundColor: 'var(--background)',
                            color: 'var(--text-primary)'
                          }}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={confirmRenameFolder}
                            className="p-1 text-xs bg-green-500 text-white rounded"
                            title="确认"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelRenameFolder}
                            className="p-1 text-xs bg-gray-500 text-white rounded"
                            title="取消"
                          >
                            ✗
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* 正常显示模式 */
                      <div
                        onClick={() => onSelectFolder?.(folder.id)}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, folder.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, folder.id)}
                        className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg transition-colors ${
                          dragOverFolderId === folder.id && draggingConversationId
                            ? 'bg-blue-100 dark:bg-blue-900/30 ring-2 ring-blue-400'
                            : ''
                        }`}
                      >
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0" 
                          style={{ backgroundColor: folder.color }}
                        />
                        <span 
                          className="flex-1 text-sm truncate" 
                          style={{ color: 'var(--text-primary)' }}
                          title={folder.name}
                        >
                          {folder.name}
                        </span>
                        
                        {/* 悬浮操作按钮 */}
                        <div className="flex gap-1 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startRenameFolder(folder);
                            }}
                            className="p-1 rounded transition-colors"
                            title="重命名文件夹"
                          >
                            <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`确定要删除文件夹“${folder.name}”吗？`)) {
                                onDeleteFolder?.(folder.id);
                              }
                            }}
                            className="p-1 rounded transition-colors"
                            title="删除文件夹"
                          >
                            <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs text-center py-2" style={{ color: 'var(--text-secondary)' }}>
                  暂无文件夹
                </div>
              )}
            </div>
          </div>



          {/* 会话列表 */}
          <div className="flex-1 overflow-y-auto">
            {conversationsLoading ? (
              <ConversationListSkeleton count={5} />
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-4xl mb-2 animate-bounce">💬</div>
                <p className="font-medium mb-1">暂无会话</p>
                <p className="text-xs opacity-75">点击上方按钮开始新对话</p>
              </div>
            ) : (
              conversations.map(conversation => (
                <div
                  key={conversation.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, conversation.id)}
                  onDragEnd={handleDragEnd}
                  className={`group relative border-l-4 ${
                    currentConversation?.id === conversation.id
                      ? 'border-l-[var(--flow-primary)] bg-[var(--flow-primary)]/10'
                      : 'border-l-transparent'
                  } ${
                    draggingConversationId === conversation.id ? 'opacity-50 cursor-move' : 'cursor-pointer'
                  }`}
                >
                  <div
                    className="w-full p-3 text-left cursor-pointer"
                    onClick={() => onSelectConversation(conversation)}
                  >
                    <>
                      <div className="font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                        {conversation.title}
                      </div>
                      <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        {new Date(conversation.updated_at).toLocaleDateString()}
                      </div>
                      {conversation.tags && conversation.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {conversation.tags.map(tag => (
                            <span
                              key={tag.id}
                              className="px-1 py-0.5 text-xs rounded"
                              style={{
                                backgroundColor: 'var(--card-glass)',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--card-border)'
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </>
                  </div>

                  {/* 操作按钮 */}
                  <div className="absolute right-2 top-2">
                    <div className="flex gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(conversation);
                        }}
                        className="p-1 text-xs rounded"
                        style={{ color: 'var(--text-secondary)' }}
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
