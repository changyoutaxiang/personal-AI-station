/**
 * 批量操作组件 - 用于记录和待办事项的批量操作
 * 支持多选、批量删除、批量状态更新等功能
 */
'use client';

import { useState } from 'react';
import { debug } from '@/lib/debug';

interface BatchOperationsProps {
  selectedItems: Set<number>;
  totalItems: number;
  onSelectAll: (selected: boolean) => void;
  onClearSelection: () => void;
  onBatchDelete: (ids: number[]) => Promise<void>;
  onBatchUpdate?: (ids: number[], updates: Record<string, unknown>) => Promise<void>;
  itemType: 'entries' | 'todos';
}

export default function BatchOperations({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  onBatchDelete,
  onBatchUpdate,
  itemType
}: BatchOperationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const selectedCount = selectedItems.size;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;
  const isPartialSelected = selectedCount > 0 && selectedCount < totalItems;

  const handleSelectAll = () => {
    onSelectAll(!isAllSelected);
  };

  const handleBatchDelete = async () => {
    if (selectedCount === 0) return;
    
    setIsLoading(true);
    try {
      debug.log(`🗑️ Batch deleting ${selectedCount} ${itemType}`);
      await onBatchDelete(Array.from(selectedItems));
      onClearSelection();
      setShowConfirmDelete(false);
    } catch (error) {
      debug.error('Batch delete failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchStatusUpdate = async (status: string) => {
    if (selectedCount === 0 || !onBatchUpdate) return;
    
    setIsLoading(true);
    try {
      debug.log(`📝 Batch updating ${selectedCount} ${itemType} to status: ${status}`);
      await onBatchUpdate(Array.from(selectedItems), { status });
      onClearSelection();
    } catch (error) {
      debug.error('Batch update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <>
      {/* 批量操作工具栏 */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-neutral-200 p-4 flex items-center gap-4 min-w-max">
          {/* 选择状态 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isPartialSelected;
              }}
              onChange={handleSelectAll}
              className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-neutral-700">
              已选择 {selectedCount} 项
            </span>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-6 bg-neutral-300"></div>

          {/* 批量操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 待办事项特有的状态更新 */}
            {itemType === 'todos' && onBatchUpdate && (
              <>
                <button
                  onClick={() => handleBatchStatusUpdate('pending')}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  标记待处理
                </button>
                <button
                  onClick={() => handleBatchStatusUpdate('in_progress')}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-warning-100 text-warning-700 rounded-md hover:bg-warning-200 transition-colors disabled:opacity-50"
                >
                  标记进行中
                </button>
                <button
                  onClick={() => handleBatchStatusUpdate('completed')}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-sm bg-success-100 text-success-700 rounded-md hover:bg-success-200 transition-colors disabled:opacity-50"
                >
                  标记完成
                </button>
              </>
            )}

            {/* 批量删除 */}
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-error-100 text-error-700 rounded-md hover:bg-error-200 transition-colors disabled:opacity-50"
            >
              删除选中
            </button>

            {/* 清除选择 */}
            <button
              onClick={onClearSelection}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-800 transition-colors disabled:opacity-50"
            >
              取消选择
            </button>
          </div>
        </div>
      </div>

      {/* 删除确认对话框 */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-neutral-800 mb-2">
              确认删除
            </h3>
            <p className="text-neutral-600 mb-4">
              确定要删除选中的 {selectedCount} 个{itemType === 'entries' ? '记录' : '待办事项'}吗？此操作无法撤销。
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={isLoading}
                className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleBatchDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-error-600 text-white rounded-md hover:bg-error-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}