'use client';

import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Archive
} from 'lucide-react';
import { InlineLoading } from './LoadingStates';
import type { Message, Conversation } from './types';
import ConfirmDialog from '../ui/ConfirmDialog';

export type BatchOperationType = 'delete' | 'archive';
export type BatchOperationTarget = 'messages' | 'conversations';

interface BatchOperationBarProps {
  target: BatchOperationTarget;
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  loading?: boolean;
  className?: string;
  
  // 操作回调
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBatchDelete: () => Promise<void>;

  onBatchArchive?: () => Promise<void>;
  onClose: () => void;
  
  // 选择的项目数据（用于显示详细信息）
  selectedItems?: (Message | Conversation)[];
}

export default function BatchOperationBar({
  target,
  selectedCount,
  totalCount,
  isAllSelected,
  loading = false,
  className = '',
  onSelectAll,
  onClearSelection,
  onBatchDelete,

  onBatchArchive,
  onClose,
  selectedItems = []
}: BatchOperationBarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  // 处理批量删除
  const handleBatchDelete = async () => {
    if (selectedCount === 0) return;
    
    setOperationLoading('delete');
    try {
      await onBatchDelete();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('批量删除失败:', error);
    } finally {
      setOperationLoading(null);
    }
  };



  // 处理批量归档
  const handleBatchArchive = async () => {
    if (selectedCount === 0 || !onBatchArchive) return;
    
    setOperationLoading('archive');
    try {
      await onBatchArchive();
    } catch (error) {
      console.error('批量归档失败:', error);
    } finally {
      setOperationLoading(null);
    }
  };

  // 获取目标类型的显示文本
  const getTargetText = () => {
    switch (target) {
      case 'messages':
        return selectedCount === 1 ? '条消息' : '条消息';
      case 'conversations':
        return selectedCount === 1 ? '个会话' : '个会话';
      default:
        return '个条目';
    }
  };

  // 获取选择统计信息
  const getSelectionStats = () => {
    if (target === 'messages' && selectedItems.length > 0) {
      const messages = selectedItems as Message[];
      const userMessages = messages.filter(m => m.role === 'user').length;
      const assistantMessages = messages.filter(m => m.role === 'assistant').length;
      const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
      
      return (
        <div className="text-xs opacity-75 ml-2">
          用户消息: {userMessages} | AI回复: {assistantMessages} | 总字符: {totalChars}
        </div>
      );
    }
    
    if (target === 'conversations' && selectedItems.length > 0) {
      const conversations = selectedItems as Conversation[];
      const models = new Set(conversations.map(c => c.model_name));
      
      return (
        <div className="text-xs opacity-75 ml-2">
          涉及模型: {Array.from(models).join(', ')}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 right-0 
        border-t shadow-lg backdrop-blur-md
        transition-all duration-300 ease-out
        ${loading ? 'pointer-events-none opacity-75' : ''}
        ${className}
      `}
      style={{
        backgroundColor: 'rgba(14, 165, 233, 0.95)',
        borderColor: 'rgba(14, 165, 233, 0.3)',
        zIndex: 1000
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 左侧：选择信息 */}
          <div className="flex items-center gap-4">
            {/* 全选/取消全选按钮 */}
            <button
              onClick={isAllSelected ? onClearSelection : onSelectAll}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition-colors"
              disabled={loading}
            >
              {isAllSelected ? (
                <CheckSquare size={16} className="text-white" />
              ) : (
                <Square size={16} className="text-white" />
              )}
              <span className="text-white text-sm font-medium">
                {isAllSelected ? '取消全选' : '全选'}
              </span>
            </button>

            {/* 选择统计 */}
            <div className="text-white">
              <div className="flex items-center gap-2">
                <span className="font-semibold">
                  已选择 {selectedCount} / {totalCount} {getTargetText()}
                </span>
                {getSelectionStats()}
              </div>
            </div>
          </div>

          {/* 右侧：操作按钮 */}
          <div className="flex items-center gap-3">


            {/* 归档按钮（如果支持）*/}
            {onBatchArchive && (
              <button
                onClick={handleBatchArchive}
                disabled={selectedCount === 0 || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {operationLoading === 'archive' ? (
                  <InlineLoading type="processing" size="sm" text="归档中" className="text-white" />
                ) : (
                  <>
                    <Archive size={16} className="text-white" />
                    <span className="text-white font-medium">归档</span>
                  </>
                )}
              </button>
            )}

            {/* 删除按钮 */}
            <div className="relative">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={selectedCount === 0 || loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {operationLoading === 'delete' ? (
                  <InlineLoading type="processing" size="sm" text="删除中" className="text-white" />
                ) : (
                  <>
                    <Trash2 size={16} className="text-white" />
                    <span className="text-white font-medium">删除</span>
                  </>
                )}
              </button>


            </div>

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              disabled={loading}
            >
              <X size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            className="p-6 rounded-lg border shadow-xl max-w-md w-full"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  确认删除
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  您即将删除 {selectedCount} {getTargetText()}。此操作无法撤销。
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={operationLoading === 'delete'}
                className="px-4 py-2 text-sm rounded border hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                style={{ 
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-secondary)' 
                }}
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={operationLoading === 'delete'}
                className="px-4 py-2 text-sm rounded bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {operationLoading === 'delete' && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {operationLoading === 'delete' ? '删除中...' : '确认删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
