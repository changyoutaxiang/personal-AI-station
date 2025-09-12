'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Briefcase, Users, Target, Building, Settings } from 'lucide-react';
import { Todo, Category } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface TagViewProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  operationLoading: { [key: string]: boolean };
}

const tagConfig = {
  work: {
    label: 'FSD 项目',
    icon: Briefcase,
    gradient: 'from-blue-400 to-cyan-500',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  life: {
    label: 'AIEC团队',
    icon: Users,
    gradient: 'from-green-400 to-emerald-500', 
    bg: 'bg-green-50',
    border: 'border-green-200'
  },
  study: {
    label: '训战营',
    icon: Target,
    gradient: 'from-purple-400 to-indigo-500',
    bg: 'bg-purple-50',
    border: 'border-purple-200'
  },
  health: {
    label: '组织赋能',
    icon: Building,
    gradient: 'from-pink-400 to-rose-500',
    bg: 'bg-pink-50', 
    border: 'border-pink-200'
  },
  other: {
    label: '业务赋能',
    icon: Settings,
    gradient: 'from-gray-400 to-gray-500',
    bg: 'bg-gray-50',
    border: 'border-gray-200'
  }
};

export function TagView({ todos, onToggle, onDelete, onUpdate, operationLoading }: TagViewProps) {
  const [collapsed, setCollapsed] = useState<Record<Category, boolean>>({
    work: false,
    life: false,
    study: false,
    health: false,
    other: false
  });

  // Group todos by tags (a todo can appear in multiple groups)
  const groupedTodos = {
    work: todos.filter(todo => todo.tags.includes('work')),
    life: todos.filter(todo => todo.tags.includes('life')),
    study: todos.filter(todo => todo.tags.includes('study')),
    health: todos.filter(todo => todo.tags.includes('health')),
    other: todos.filter(todo => todo.tags.includes('other'))
  };

  // Get todos without any tags
  const untaggedTodos = todos.filter(todo => todo.tags.length === 0);

  const toggleCollapse = (tag: Category) => {
    setCollapsed(prev => ({
      ...prev,
      [tag]: !prev[tag]
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
      {(['work', 'life', 'study', 'health', 'other'] as Category[]).map(tag => {
        const config = tagConfig[tag];
        const tagTodos = groupedTodos[tag];
        const completedCount = tagTodos.filter(todo => todo.completed).length;
        const isCollapsed = collapsed[tag];
        const Icon = config.icon;

        if (tagTodos.length === 0) return null;

        return (
          <div key={tag} className={`${config.bg} ${config.border} border-2 rounded-2xl overflow-hidden`}>
            {/* Header */}
            <div 
              onClick={() => toggleCollapse(tag)}
              className={`bg-gradient-to-r ${config.gradient} p-4 cursor-pointer hover:opacity-90 transition-opacity duration-200`}
            >
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <Icon className="w-6 h-6" />
                  <div>
                    <h3 className="text-lg font-bold">{config.label}</h3>
                    <p className="text-sm opacity-90">
                      {completedCount} / {tagTodos.length} 已完成
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                    {tagTodos.length} 个任务
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
                {tagTodos.map(todo => (
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

      {/* Untagged todos */}
      {untaggedTodos.length > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-400 to-gray-500 p-4">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">未分类任务</h3>
                  <p className="text-sm opacity-90">
                    {untaggedTodos.filter(todo => todo.completed).length} / {untaggedTodos.length} 已完成
                  </p>
                </div>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                {untaggedTodos.length} 个任务
              </div>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {untaggedTodos.map(todo => (
              <div key={todo.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <TodoItem
                  todo={todo}
                  activeTab="week"
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  operationLoading={operationLoading}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}