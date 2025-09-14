'use client';

import { useState } from 'react';
import { LoadingSpinner } from './LoadingStates';
import { ConversationListSkeleton } from './SkeletonLoaders';
import type { Conversation } from './types';
import type { AgentFolder } from '@/lib/supabase';
import ConfirmDialog from '../ui/ConfirmDialog';

interface ChatSidebarProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;

  conversationsLoading: boolean;
  folders?: AgentFolder[];
  selectedFolderId?: string | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateNewConversation: () => void;
  onDeleteConversation: (conversationId: number) => void;

  // 文件夹相关回调
  onCreateFolder?: (name: string, description?: string, color?: string) => void;
  onDeleteFolder?: (folderId: string) => void;
  onRenameFolder?: (folderId: string, newName: string) => void;
  onSelectFolder?: (folderId: string | null) => void;
  onMoveConversationToFolder?: (conversationId: number, folderId: string | null) => void;
}

export default function ChatSidebar({
  conversations,
  currentConversation,

  conversationsLoading,
  folders,
  selectedFolderId,
  onSelectConversation,
  onCreateNewConversation,
  onDeleteConversation,

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
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameFolderName, setRenameFolderName] = useState('');
  






  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<Conversation | null>(null);
  const [showDeleteFolderConfirm, setShowDeleteFolderConfirm] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<AgentFolder | null>(null);
  
  // 拖拽状态
  const [draggedConversation, setDraggedConversation] = useState<Conversation | null>(null);
  const [dragOverFolder, setDragOverFolder] = useState<string | number | null>(null);

  // 确认删除会话
  const confirmDelete = (conversation: Conversation) => {
    setConversationToDelete(conversation);
    setShowDeleteConfirm(true);
  };

  // 处理删除确认
  const handleDeleteConfirm = () => {
    if (conversationToDelete) {
      onDeleteConversation(conversationToDelete.id);
      setShowDeleteConfirm(false);
      setConversationToDelete(null);
    }
  };

  // 取消删除
  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
    setConversationToDelete(null);
  };

  // 确认删除文件夹
  const confirmDeleteFolder = (folder: AgentFolder) => {
    setFolderToDelete(folder);
    setShowDeleteFolderConfirm(true);
  };

  // 处理文件夹删除确认
  const handleDeleteFolderConfirm = () => {
    if (folderToDelete) {
      onDeleteFolder?.(folderToDelete.id);
      setShowDeleteFolderConfirm(false);
      setFolderToDelete(null);
    }
  };

  // 取消删除文件夹
  const handleDeleteFolderCancel = () => {
    setShowDeleteFolderConfirm(false);
    setFolderToDelete(null);
  };

  // 拖拽事件处理
  const handleDragStart = (e: React.DragEvent, conversation: Conversation) => {
    setDraggedConversation(conversation);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', conversation.id.toString());
  };

  const handleDragEnd = () => {
    setDraggedConversation(null);
    setDragOverFolder(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnterFolder = (folderId: string) => {
    setDragOverFolder(folderId);
  };

  const handleDragLeaveFolder = () => {
    setDragOverFolder(null);
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    if (draggedConversation && onMoveConversationToFolder) {
      onMoveConversationToFolder(draggedConversation.id, folderId);
    }
    setDraggedConversation(null);
    setDragOverFolder(null);
  };

  const handleDropOnAllConversations = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedConversation && onMoveConversationToFolder) {
      onMoveConversationToFolder(draggedConversation.id, null);
    }
    setDraggedConversation(null);
    setDragOverFolder(null);
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
  const startRenameFolder = (folder: AgentFolder) => {
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
    <>
      <div className="w-80 h-full rounded-xl" 
           style={{ background: 'transparent' }}>
      
      {/* 侧边栏头部 */}
      <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            智能体
          </h1>
        </div>
      </div>

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

          </div>

          {/* 文件夹管理区域 */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 
                className={`text-sm font-medium cursor-pointer rounded p-1 transition-colors ${
                  dragOverFolder === -1 ? 'bg-blue-100 border-2 border-blue-300 border-dashed' : ''
                }`}
                style={{ color: 'var(--text-secondary)' }}
                onClick={() => onSelectFolder?.(null)}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverFolder(-1)}
                onDragLeave={handleDragLeaveFolder}
                onDrop={handleDropOnAllConversations}
                title="全部对话 - 拖拽对话到这里移出文件夹"
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
                        className={`flex items-center gap-2 p-2 cursor-pointer rounded-lg transition-colors ${
                          dragOverFolder === folder.id 
                            ? 'bg-blue-100 border-2 border-blue-300 border-dashed' 
                            : ''
                        }`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => handleDragEnterFolder(folder.id)}
                        onDragLeave={handleDragLeaveFolder}
                        onDrop={(e) => handleDropOnFolder(e, folder.id)}
                        title={`${folder.name} - 拖拽对话到这里移入文件夹`}
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
                              confirmDeleteFolder(folder);
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
                  className={`group relative border-l-4 cursor-pointer ${
                    currentConversation?.id === conversation.id
                      ? 'border-l-[var(--flow-primary)] bg-[var(--flow-primary)]/10'
                      : 'border-l-transparent'
                  }`}
                >
                  <div
                    className={`w-full p-3 text-left cursor-pointer transition-opacity ${
                      draggedConversation?.id === conversation.id ? 'opacity-50' : ''
                    }`}
                    onClick={() => onSelectConversation(conversation)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, conversation)}
                    onDragEnd={handleDragEnd}
                    title="拖拽此对话到文件夹中"
                  >
                    <>
                      <div className="font-medium truncate mb-1" style={{ color: 'var(--text-primary)' }}>
                        {conversation.title}
                      </div>
                      <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                        对话 #{conversation.id}
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
    </div>

    {/* 删除确认对话框 */}
    <ConfirmDialog
      open={showDeleteConfirm && !!conversationToDelete}
      title="确认删除"
      description={conversationToDelete ? `确定要删除对话"${conversationToDelete.title}"吗？此操作不可撤销。` : '确定要删除该对话吗？此操作不可撤销。'}
      cancelText="取消"
      confirmText="确认删除"
      onCancel={handleDeleteCancel}
      onConfirm={handleDeleteConfirm}
      danger
    />

    {/* 文件夹删除确认对话框 */}
    <ConfirmDialog
      open={showDeleteFolderConfirm && !!folderToDelete}
      title="确认删除文件夹"
      description={folderToDelete ? `确定要删除文件夹"${folderToDelete.name}"吗？此操作不可撤销。` : '确定要删除该文件夹吗？此操作不可撤销。'}
      cancelText="取消"
      confirmText="确认删除"
      onCancel={handleDeleteFolderCancel}
      onConfirm={handleDeleteFolderConfirm}
      danger
    />
  </>
  );
}
