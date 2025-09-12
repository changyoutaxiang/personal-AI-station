'use client';

import React from 'react';
import { SubTask } from '@/types/todo';
import { Check, Trash2, Plus } from 'lucide-react';

interface TodoSubTasksProps {
  subTasks: SubTask[];
  newSubTaskText: string;
  onNewSubTaskTextChange: (text: string) => void;
  onAddSubTask: () => void;
  onToggleSubTask: (subTaskId: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
  showSubTasks: boolean;
  isOverdueTask: boolean;
}

export function TodoSubTasks({
  subTasks,
  newSubTaskText,
  onNewSubTaskTextChange,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
  showSubTasks,
  isOverdueTask
}: TodoSubTasksProps) {
  const completedSubTasks = subTasks.filter(st => st.completed).length;
  const totalSubTasks = subTasks.length;

  if (!showSubTasks) return null;

  return (
    <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
      {subTasks.map(subTask => (
        <div key={subTask.id} className="flex items-center space-x-3">
          <button
            onClick={() => onToggleSubTask(subTask.id)}
            className={`w-4 h-4 rounded border flex items-center justify-center ${
              subTask.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            {subTask.completed && <Check className="w-3 h-3 text-white" />}
          </button>
          <span className={`text-sm ${subTask.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
            {subTask.text}
          </span>
          <button
            onClick={() => onDeleteSubTask(subTask.id)}
            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
      
      {/* Add sub-task */}
      <div className="flex items-center space-x-2 mt-2">
        <input
          type="text"
          value={newSubTaskText}
          onChange={(e) => onNewSubTaskTextChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAddSubTask()}
          placeholder="添加子任务..."
          className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:border-purple-400 focus:outline-none"
        />
        <button
          onClick={onAddSubTask}
          className="text-purple-500 hover:text-purple-600 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
        </button>
        {isOverdueTask && (
          <div className="flex items-center space-x-1 text-red-600 font-medium">
            <span>⚠️ 逾期任务</span>
          </div>
        )}
      </div>

      {totalSubTasks > 0 && (
        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <span>进度: {completedSubTasks}/{totalSubTasks} 子任务</span>
        </div>
      )}
    </div>
  );
}