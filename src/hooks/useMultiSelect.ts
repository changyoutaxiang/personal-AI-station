'use client';

import { useState, useCallback, useMemo } from 'react';

export type SelectableItem = {
  id: number;
  [key: string]: any;
};

export interface UseMultiSelectOptions {
  maxSelections?: number;
  onSelectionChange?: (selectedIds: number[]) => void;
  onMaxReached?: () => void;
}

export interface UseMultiSelectReturn<T extends SelectableItem> {
  // 状态
  selectedIds: number[];
  selectedItems: T[];
  isMultiSelectMode: boolean;
  isAllSelected: boolean;
  selectedCount: number;
  
  // 操作方法
  toggleItem: (item: T) => void;
  toggleAll: (items: T[]) => void;
  selectItem: (item: T) => void;
  deselectItem: (item: T) => void;
  selectItems: (items: T[]) => void;
  deselectItems: (items: T[]) => void;
  clearSelection: () => void;
  enterMultiSelectMode: () => void;
  exitMultiSelectMode: () => void;
  
  // 辅助方法
  isSelected: (itemId: number) => boolean;
  canSelect: () => boolean;
  getSelectionSummary: () => string;
}

export function useMultiSelect<T extends SelectableItem>(
  items: T[] = [],
  options: UseMultiSelectOptions = {}
): UseMultiSelectReturn<T> {
  const {
    maxSelections,
    onSelectionChange,
    onMaxReached
  } = options;

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);

  // 计算选中的项目
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  // 检查是否全选
  const isAllSelected = useMemo(() => {
    return items.length > 0 && items.every(item => selectedIds.includes(item.id));
  }, [items, selectedIds]);

  // 选中数量
  const selectedCount = selectedIds.length;

  // 检查是否可以选择更多项目
  const canSelect = useCallback(() => {
    if (!maxSelections) return true;
    return selectedCount < maxSelections;
  }, [selectedCount, maxSelections]);

  // 触发选择变化回调
  const notifySelectionChange = useCallback((newSelectedIds: number[]) => {
    onSelectionChange?.(newSelectedIds);
  }, [onSelectionChange]);

  // 切换单个项目选择状态
  const toggleItem = useCallback((item: T) => {
    setSelectedIds(prev => {
      const newIds = prev.includes(item.id)
        ? prev.filter(id => id !== item.id)
        : canSelect() 
          ? [...prev, item.id]
          : (onMaxReached?.(), prev);
      
      notifySelectionChange(newIds);
      return newIds;
    });
  }, [canSelect, onMaxReached, notifySelectionChange]);

  // 选择单个项目
  const selectItem = useCallback((item: T) => {
    if (!selectedIds.includes(item.id) && canSelect()) {
      const newIds = [...selectedIds, item.id];
      setSelectedIds(newIds);
      notifySelectionChange(newIds);
    } else if (!canSelect()) {
      onMaxReached?.();
    }
  }, [selectedIds, canSelect, onMaxReached, notifySelectionChange]);

  // 取消选择单个项目
  const deselectItem = useCallback((item: T) => {
    if (selectedIds.includes(item.id)) {
      const newIds = selectedIds.filter(id => id !== item.id);
      setSelectedIds(newIds);
      notifySelectionChange(newIds);
    }
  }, [selectedIds, notifySelectionChange]);

  // 选择多个项目
  const selectItems = useCallback((itemsToSelect: T[]) => {
    const newIds = [...selectedIds];
    let added = 0;
    
    for (const item of itemsToSelect) {
      if (!newIds.includes(item.id)) {
        if (!maxSelections || newIds.length + added < maxSelections) {
          newIds.push(item.id);
          added++;
        } else {
          onMaxReached?.();
          break;
        }
      }
    }
    
    if (added > 0) {
      setSelectedIds(newIds);
      notifySelectionChange(newIds);
    }
  }, [selectedIds, maxSelections, onMaxReached, notifySelectionChange]);

  // 取消选择多个项目
  const deselectItems = useCallback((itemsToDeselect: T[]) => {
    const idsToRemove = itemsToDeselect.map(item => item.id);
    const newIds = selectedIds.filter(id => !idsToRemove.includes(id));
    
    if (newIds.length !== selectedIds.length) {
      setSelectedIds(newIds);
      notifySelectionChange(newIds);
    }
  }, [selectedIds, notifySelectionChange]);

  // 切换全选
  const toggleAll = useCallback((itemsToToggle: T[]) => {
    if (isAllSelected) {
      // 全部取消选择
      setSelectedIds([]);
      notifySelectionChange([]);
    } else {
      // 全部选择（考虑最大选择限制）
      const itemsToSelect = itemsToToggle.slice(0, maxSelections || itemsToToggle.length);
      const newIds = itemsToSelect.map(item => item.id);
      setSelectedIds(newIds);
      notifySelectionChange(newIds);
      
      // 如果有限制且超出，触发回调
      if (maxSelections && itemsToToggle.length > maxSelections) {
        onMaxReached?.();
      }
    }
  }, [isAllSelected, maxSelections, onMaxReached, notifySelectionChange]);

  // 清空选择
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
    notifySelectionChange([]);
  }, [notifySelectionChange]);

  // 进入多选模式
  const enterMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(true);
  }, []);

  // 退出多选模式
  const exitMultiSelectMode = useCallback(() => {
    setIsMultiSelectMode(false);
    clearSelection();
  }, [clearSelection]);

  // 检查项目是否被选中
  const isSelected = useCallback((itemId: number) => {
    return selectedIds.includes(itemId);
  }, [selectedIds]);

  // 获取选择摘要
  const getSelectionSummary = useCallback(() => {
    if (selectedCount === 0) return '未选择任何项目';
    if (selectedCount === 1) return '已选择 1 个项目';
    return `已选择 ${selectedCount} 个项目`;
  }, [selectedCount]);

  return {
    // 状态
    selectedIds,
    selectedItems,
    isMultiSelectMode,
    isAllSelected,
    selectedCount,
    
    // 操作方法
    toggleItem,
    toggleAll,
    selectItem,
    deselectItem,
    selectItems,
    deselectItems,
    clearSelection,
    enterMultiSelectMode,
    exitMultiSelectMode,
    
    // 辅助方法
    isSelected,
    canSelect,
    getSelectionSummary
  };
}
