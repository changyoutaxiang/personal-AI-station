'use client';

import React from 'react';
import { Todo, Category } from '@/types/todo';

interface TodoTaskContentProps {
  todo: Todo;
  isCompletedTodayTask: boolean;
  isOverdueTask: boolean;
}

const categoryColors = {
  work: 'bg-blue-100 text-blue-800',
  life: 'bg-green-100 text-green-800',
  study: 'bg-purple-100 text-purple-800',
  health: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800'
};

const categoryLabels = {
  work: 'FSD 项目',
  life: 'AIEC团队',
  study: '训战营',
  health: '组织赋能',
  other: '业务赋能'
};

const priorityIcons = {
  high: '🔥',
  medium: '⚡',
  low: '🌱'
};

export function TodoTaskContent({ todo, isCompletedTodayTask, isOverdueTask }: TodoTaskContentProps) {
  return (
    <div className="flex-1 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">
              {isOverdueTask ? '🚨' : priorityIcons[todo.priority]}
            </span>
            <span
              className={`text-lg transition-all duration-200 ${
                todo.completed
                  ? isCompletedTodayTask
                    ? 'line-through text-gray-600'
                    : 'line-through text-gray-500'
                  : isCompletedTodayTask
                    ? 'text-gray-700'
                    : isOverdueTask
                      ? 'text-red-700 font-semibold'
                      : 'text-gray-700'
              }`}
            >
              {todo.text}
            </span>
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            {todo.tags.map(tag => (
              <span
                key={tag}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCompletedTodayTask 
                    ? 'bg-gray-200 text-gray-600' 
                    : isOverdueTask
                      ? 'bg-red-200 text-red-800'
                      : categoryColors[tag]
                }`}
              >
                {categoryLabels[tag]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Due date and time estimate */}
      <div className={`flex items-center space-x-4 text-sm ${
        isCompletedTodayTask ? 'text-gray-400' : 'text-gray-500'
      }`}>
        {todo.dueDate && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
          </div>
        )}
        {todo.timeRange && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{todo.timeRange.startTime} - {todo.timeRange.endTime}</span>
          </div>
        )}
        {todo.estimatedTime && (
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span>{todo.estimatedTime}分钟</span>
          </div>
        )}
      </div>
    </div>
  );
}