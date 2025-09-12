'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Clock, Timer, Flag } from 'lucide-react';
import { Todo, Priority } from '@/types/todo';
import { TodoItem } from './TodoItem';
import { useTheme } from './ThemeProvider';

interface PriorityViewProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  operationLoading: { [key: string]: boolean };
}

const priorityConfig = {
  high: {
    label: '高优先级',
    icon: '🔥',
    gradient: 'from-red-400 to-pink-500',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  medium: {
    label: '中优先级', 
    icon: '⚡',
    gradient: 'from-yellow-400 to-orange-500',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  low: {
    label: '低优先级',
    icon: '🌱', 
    gradient: 'from-green-400 to-emerald-500',
    bg: 'bg-green-50',
    border: 'border-green-200'
  }
};

export function PriorityView({ todos, onToggle, onDelete, onUpdate, operationLoading }: PriorityViewProps) {
  const [collapsed, setCollapsed] = useState<Record<Priority, boolean>>({
    high: false,
    medium: false,
    low: false
  });

  const groupedTodos = {
    high: todos.filter(todo => todo.priority === 'high'),
    medium: todos.filter(todo => todo.priority === 'medium'), 
    low: todos.filter(todo => todo.priority === 'low')
  };

  const toggleCollapse = (priority: Priority) => {
    setCollapsed(prev => ({
      ...prev,
      [priority]: !prev[priority]
    }));
  };

  if (todos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          本周任务清单空空如也
        </h3>
        <p className="text-gray-500">
          所有任务都已完成，好样的！
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(['high', 'medium', 'low'] as Priority[]).map(priority => {
        const config = priorityConfig[priority];
        const priorityTodos = groupedTodos[priority];
        const completedCount = priorityTodos.filter(todo => todo.completed).length;
        const isCollapsed = collapsed[priority];

        if (priorityTodos.length === 0) return null;

        return (
          <div key={priority} className={`${config.bg} ${config.border} border-2 rounded-2xl overflow-hidden`}>
            {/* Header */}
            <div 
              onClick={() => toggleCollapse(priority)}
              className={`bg-gradient-to-r ${config.gradient} p-4 cursor-pointer hover:opacity-90 transition-opacity duration-200`}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{config.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold">{config.label}</h3>
                    <p className="text-sm opacity-90">
                      {completedCount} / {priorityTodos.length} 已完成
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {priorityTodos.length} 个任务
                  </div>
                  {isCollapsed ? 
                    <ChevronRight className="w-6 h-6" /> : 
                    <ChevronDown className="w-6 h-6" />
                  }
                </div>
              </div>
            </div>

            {/* Tasks */}
            {!isCollapsed && (
              <div className="p-4 space-y-4">
                {priorityTodos.map(todo => (
                  <div key={todo.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <TodoItem
                      todo={todo}
                      activeTab="week"
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                      operationLoading={operationLoading || {}}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}