'use client';

import React, { useState, useEffect } from 'react';
import { Todo, Priority, Category } from '@/types/todo';
import { Timer, Calendar, Clock, Flag } from 'lucide-react';

interface TodoEditFormProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onCancel: () => void;
}

const categoryColors = {
  work: 'bg-blue-100 text-blue-800',
  life: 'bg-green-100 text-green-800',
  study: 'bg-purple-100 text-purple-800',
  health: 'bg-pink-100 text-pink-800',
  other: 'bg-gray-100 text-gray-800',
  overdue: 'bg-red-100 text-red-800'
};

const categoryLabels = {
  work: 'FSD 项目',
  life: 'AIEC团队',
  study: '训战营',
  health: '组织赋能',
  other: '业务赋能',
  overdue: '逾期任务'
};

export function TodoEditForm({ todo, onUpdate, onCancel }: TodoEditFormProps) {
  const [editText, setEditText] = useState(todo.text);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editTags, setEditTags] = useState(todo.tags);
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
  );
  const [editEstimatedTime, setEditEstimatedTime] = useState(
    todo.estimatedTime ? todo.estimatedTime.toString() : ''
  );
  const handleSave = () => {
    console.log('💾 保存编辑:', {
      id: todo.id,
      text: editText.trim(),
      priority: editPriority,
      tags: editTags,
      dueDate: editDueDate,
      estimatedTime: editEstimatedTime
    });
    
    if (editText.trim()) {
      onUpdate(todo.id, {
        text: editText.trim(),
        priority: editPriority,
        tags: editTags,
        dueDate: editDueDate ? new Date(editDueDate) : undefined,
        estimatedTime: editEstimatedTime ? parseInt(editEstimatedTime) : undefined
      });
    }
  };

  const toggleEditTag = (tag: Category) => {
    setEditTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-4">
      {/* Edit text */}
      <input
        type="text"
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400 focus:outline-none"
        autoFocus
      />
      
      {/* Edit priority */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600">优先级:</span>
        <div className="flex space-x-1">
          {(['high', 'medium', 'low'] as Priority[]).map(p => (
            <button
              key={p}
              onClick={() => setEditPriority(p)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                editPriority === p
                  ? p === 'high' ? 'bg-red-500 text-white' 
                    : p === 'medium' ? 'bg-yellow-500 text-white'
                    : 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {p === 'high' ? '🔥 高' : p === 'medium' ? '⚡ 中' : '🌱 低'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Edit tags */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-600">标签:</span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => toggleEditTag(key as Category)}
              className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                editTags.includes(key as Category)
                  ? categoryColors[key as Category]
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Edit due date and estimated time - 简化版本 */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600">日期:</span>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400 focus:outline-none text-sm"
          />
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-600 flex items-center space-x-1">
            <Timer className="w-4 h-4 text-purple-400" />
            <span>时长:</span>
          </span>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={editEstimatedTime}
              onChange={(e) => setEditEstimatedTime(e.target.value)}
              placeholder="分钟"
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-400 focus:outline-none text-sm"
            />
            <span className="text-xs text-gray-500">分钟</span>
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          保存
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}