/**
 * 批量操作自定义钩子
 * 处理多选逻辑和批量操作状态管理
 */
'use client';

import { useState, useCallback } from 'react';
import { debug } from '@/lib/debug';

export function useBatchOperations<T extends { id: number }>(items: T[]) {
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // 切换单个项目的选择状态
  const toggleSelection = useCallback((id: number) => {
    setSelectedItems(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      debug.log(`🔄 Item ${id} selection toggled, now ${newSelected.size} items selected`);
      return newSelected;
    });
  }, []);

  // 全选/取消全选
  const toggleSelectAll = useCallback((selected: boolean) => {
    if (selected) {
      const allIds = new Set(items.map(item => item.id));
      setSelectedItems(allIds);
      debug.log(`✅ Selected all ${allIds.size} items`);
    } else {
      setSelectedItems(new Set());
      debug.log('❌ Cleared all selections');
    }
  }, [items]);

  // 清除所有选择
  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
    debug.log('🧹 Cleared all selections');
  }, []);

  // 检查项目是否被选中
  const isSelected = useCallback((id: number) => {
    return selectedItems.has(id);
  }, [selectedItems]);

  // 获取选中的项目数据
  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedItems.has(item.id));
  }, [items, selectedItems]);

  return {
    selectedItems,
    toggleSelection,
    toggleSelectAll,
    clearSelection,
    isSelected,
    getSelectedItems,
    selectedCount: selectedItems.size,
    isAllSelected: selectedItems.size === items.length && items.length > 0,
    isPartialSelected: selectedItems.size > 0 && selectedItems.size < items.length
  };
}