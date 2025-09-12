'use client';

import React from 'react';
import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Todo } from '@/types/todo';

interface TodoTaskActionsProps {
  todo: Todo;
  onDelete: (id: string) => void;
  operationLoading: { [key: string]: boolean };
  isEditing: boolean;
  showSubTasks: boolean;
  hasSubTasks: boolean;
  onToggleEdit: () => void;
  onToggleSubTasks: () => void;
}

export function TodoTaskActions({
  todo,
  onDelete,
  operationLoading,
  isEditing,
  showSubTasks,
  hasSubTasks,
  onToggleEdit,
  onToggleSubTasks
}: TodoTaskActionsProps) {

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖊️ 点击编辑按钮:', todo.id);
    onToggleEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🗑️ 点击删除按钮:', todo.id);
    onDelete(todo.id);
  };

  return (
    <div 
      className="flex items-center space-x-2" 
      style={{ 
        zIndex: 998, 
        position: 'relative',
        pointerEvents: 'auto'
      }}
    >
      {/* 编辑模式下不显示任何按钮，因为使用专门的编辑表单 */}
      {!isEditing && (
        <>
          <button
            onClick={handleEditClick}
            className="text-gray-400 hover:text-blue-500 transition-colors duration-200 p-2 hover:bg-blue-50 rounded-lg"
            title="编辑任务"
            style={{ 
              zIndex: 999, 
              position: 'relative',
              pointerEvents: 'auto',
              minWidth: '32px',
              minHeight: '32px'
            }}
          >
            <Edit2 className="w-5 h-5" />
          </button>
          {hasSubTasks && (
            <button
              onClick={onToggleSubTasks}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              {showSubTasks ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          )}
          <button
            onClick={handleDeleteClick}
            disabled={operationLoading[todo.id]}
            className={`text-gray-400 hover:text-red-500 transition-colors duration-200 p-2 rounded-lg ${
              operationLoading[todo.id]
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-red-50'
            }`}
            title="删除任务"
            style={{ 
              zIndex: 999, 
              position: 'relative',
              pointerEvents: 'auto',
              minWidth: '32px',
              minHeight: '32px'
            }}
          >
            {operationLoading[todo.id] ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </button>
        </>
      )}
    </div>
  );
}