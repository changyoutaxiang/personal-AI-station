/**
 * 增强版EntryList组件 - 支持批量操作
 * 这是EntryList的演示版本，展示如何集成批量操作功能
 */
'use client';

import { useState, useEffect } from 'react';
import { fetchEntries, removeEntry, batchDeleteEntriesAction, batchUpdateEntriesAction } from '@/lib/actions';
import type { Entry } from '@/types/index';
import { debug } from '@/lib/debug';
import { useBatchOperations } from '@/hooks/useBatchOperations';
import BatchOperations from '@/components/ui/BatchOperations';

export default function EntryListWithBatch() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const {
    selectedItems,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    selectedCount
  } = useBatchOperations(entries);

  const loadEntries = async () => {
    setLoading(true);
    try {
      const result = await fetchEntries();
      if (result.success) {
        setEntries(result.data);
      }
    } catch (error) {
      debug.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const handleBatchDelete = async (ids: number[]) => {
    try {
      const result = await batchDeleteEntriesAction(ids);
      if (result.success) {
        setMessage(result.data?.message || '批量删除成功');
        await loadEntries(); // 重新加载数据
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || '批量删除失败');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      debug.error('批量删除失败:', error);
      setMessage('批量删除失败，请重试');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleBatchUpdate = async (ids: number[], updates: Record<string, unknown>) => {
    try {
      const result = await batchUpdateEntriesAction(ids, updates);
      if (result.success) {
        setMessage(result.data?.message || '批量更新成功');
        await loadEntries(); // 重新加载数据
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(result.error || '批量更新失败');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      debug.error('批量更新失败:', error);
      setMessage('批量更新失败，请重试');
      setTimeout(() => setMessage(''), 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 消息提示 */}
      {message && (
        <div className={`p-3 rounded-md ${
          message.includes('成功') 
            ? 'bg-success-100 text-success-800 border border-success-200' 
            : 'bg-error-100 text-error-800 border border-error-200'
        }`}>
          {message}
        </div>
      )}

      {/* 列表头部 - 显示批量选择状态 */}
      {entries.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={selectedCount === entries.length && entries.length > 0}
              ref={(input) => {
                if (input) {
                  input.indeterminate = selectedCount > 0 && selectedCount < entries.length;
                }
              }}
              onChange={(e) => toggleSelectAll(e.target.checked)}
              className="h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-600">
              {selectedCount > 0 ? `已选择 ${selectedCount} 项` : '选择全部'}
            </span>
          </div>
          
          <span className="text-sm text-neutral-500">
            共 {entries.length} 条记录
          </span>
        </div>
      )}

      {/* 记录列表 */}
      <div className="space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            暂无记录，开始记录您的第一个想法吧！
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 bg-white rounded-lg border transition-all duration-200 ${
                isSelected(entry.id)
                  ? 'border-primary-300 bg-primary-50 shadow-sm'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* 选择框 */}
                <input
                  type="checkbox"
                  checked={isSelected(entry.id)}
                  onChange={() => toggleSelection(entry.id)}
                  className="mt-1 h-4 w-4 text-primary-600 rounded border-neutral-300 focus:ring-primary-500"
                />

                {/* 记录内容 */}
                <div className="flex-1 min-w-0">
                  <div className="text-neutral-800 mb-2">
                    {entry.content}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-500">
                    <span>{new Date(entry.created_at).toLocaleString()}</span>
                    {entry.project_tag && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs">
                        {entry.project_tag}
                      </span>
                    )}

                  </div>
                </div>

                {/* 单个操作按钮 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const result = await removeEntry(entry.id);
                      if (result.success) {
                        await loadEntries();
                      }
                    }}
                    className="p-1 text-neutral-400 hover:text-error-600 transition-colors"
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

      {/* 批量操作工具栏 */}
      <BatchOperations
        selectedItems={selectedItems}
        totalItems={entries.length}
        onSelectAll={toggleSelectAll}
        onClearSelection={clearSelection}
        onBatchDelete={handleBatchDelete}
        onBatchUpdate={handleBatchUpdate}
        itemType="entries"
      />
    </div>
  );
}