'use client';

import React from 'react';
import { Todo } from '@/types/todo';

interface TodoTaskHeaderProps {
  todo: Todo;
  activeTab: 'today' | 'week';
  isCompletedTodayTask: boolean;
  isOverdueTask: boolean;
  onToggle: (id: string) => void;
  operationLoading: { [key: string]: boolean };
}

export function TodoTaskHeader({ 
  todo, 
  activeTab, 
  isCompletedTodayTask, 
  isOverdueTask, 
  onToggle, 
  operationLoading
}: TodoTaskHeaderProps) {
  console.log('🚀 TodoTaskHeader渲染:', {
    todoId: todo.id,
    onToggleType: typeof onToggle,
    isFunction: typeof onToggle === 'function'
  });
  
  const baseClasses = 'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 mt-1 cursor-pointer';
  
  const getButtonClasses = () => {
    if (operationLoading[todo.id]) {
      return 'bg-gray-200 border-gray-300 cursor-not-allowed';
    }
    
    if (todo.completed) {
      return isCompletedTodayTask 
        ? 'bg-gray-400 border-gray-400'
        : 'bg-gradient-to-r from-purple-500 to-pink-500 border-transparent';
    }
    
    if (isCompletedTodayTask) {
      return 'border-gray-400 hover:border-gray-500';
    }
    
    if (isOverdueTask) {
      return 'border-red-500 hover:border-red-600 bg-red-50';
    }
    
    return 'border-gray-300 hover:border-purple-400';
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('🎯 点击圆圈切换任务状态:', {
      id: todo.id, 
      completed: todo.completed,
      loading: operationLoading[todo.id],
      disabled: operationLoading[todo.id]
    });
    onToggle(todo.id);
  };

  return (
    <button
      onClick={handleToggleClick}
      disabled={operationLoading[todo.id]}
      className={`${baseClasses} ${getButtonClasses()}`}
      style={{ zIndex: 10 }}
      data-testid={`todo-toggle-${todo.id}`}
    >
      {operationLoading[todo.id] ? (
        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
      ) : todo.completed ? (
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
    </button>
  );
}