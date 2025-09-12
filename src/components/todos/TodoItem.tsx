'use client';

import React, { useState } from 'react';
import { Todo, SubTask } from '@/types/todo';
import { useDebounceCallback } from '@/hooks/todos/useDebounce';
import { TodoTaskHeader } from './TodoTaskHeader';
import { TodoTaskContent } from './TodoTaskContent';
import { TodoTaskActions } from './TodoTaskActions';
import { TodoSubTasks } from './TodoSubTasks';
import { TodoEditForm } from './TodoEditForm';

interface TodoItemProps {
  todo: Todo;
  activeTab: 'today' | 'week';
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  operationLoading: { [key: string]: boolean };
}

export function TodoItem({ 
  todo, 
  activeTab, 
  onToggle, 
  onDelete, 
  onUpdate, 
  operationLoading
}: TodoItemProps) {
  const [showSubTasks, setShowSubTasks] = useState(false);
  const [newSubTaskText, setNewSubTaskText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Check if task is overdue (created before today and not completed)
  const isOverdue = () => {
    if (todo.completed || activeTab !== 'today') return false;
    
    // If task has a due date, check if it's overdue based on due date
    if (todo.dueDate) {
      const today = new Date();
      const dueDate = new Date(todo.dueDate);
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today;
    }
    
    // Fallback: check if task was created before today
    const today = new Date();
    const taskDate = new Date(todo.createdAt);
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate < today;
  };

  // 今日任务中已完成的任务使用灰色样式
  const isCompletedTodayTask = todo.completed && activeTab === 'today';
  const isOverdueTask = isOverdue();

  const addSubTask = useDebounceCallback(() => {
    if (newSubTaskText.trim()) {
      const newSubTask: SubTask = {
        id: Date.now().toString(),
        text: newSubTaskText.trim(),
        completed: false
      };
      onUpdate(todo.id, {
        subTasks: [...todo.subTasks, newSubTask]
      });
      setNewSubTaskText('');
    }
  }, 200);

  const toggleSubTask = useDebounceCallback((subTaskId: string) => {
    const updatedSubTasks = todo.subTasks.map(subTask =>
      subTask.id === subTaskId ? { ...subTask, completed: !subTask.completed } : subTask
    );
    onUpdate(todo.id, { subTasks: updatedSubTasks });
  }, 200);

  const deleteSubTask = useDebounceCallback((subTaskId: string) => {
    const updatedSubTasks = todo.subTasks.filter(subTask => subTask.id !== subTaskId);
    onUpdate(todo.id, { subTasks: updatedSubTasks });
  }, 200);

  const handleSaveEdit = (id: string, updates: Partial<Todo>) => {
    onUpdate(id, updates);
    setIsEditing(false);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl border-l-4 ${
      isCompletedTodayTask ? 'border-gray-300 bg-gray-100' : 
      isOverdueTask ? 'border-red-500 bg-red-50' : 
      'border-purple-400 bg-white'
    } ${todo.completed && activeTab === 'week' ? 'opacity-75' : ''}`}>
      
      {isEditing ? (
        <TodoEditForm 
          todo={todo}
          onUpdate={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="flex items-start space-x-4">
          <TodoTaskHeader
            todo={todo}
            activeTab={activeTab}
            isCompletedTodayTask={isCompletedTodayTask}
            isOverdueTask={isOverdueTask}
            onToggle={onToggle}
            operationLoading={operationLoading}
          />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <TodoTaskContent
                todo={todo}
                isCompletedTodayTask={isCompletedTodayTask}
                isOverdueTask={isOverdueTask}
              />
              
              <TodoTaskActions
                todo={todo}
                onDelete={onDelete}
                operationLoading={operationLoading}
                isEditing={isEditing}
                showSubTasks={showSubTasks}
                hasSubTasks={todo.subTasks.length > 0}
                onToggleEdit={() => setIsEditing(!isEditing)}
                onToggleSubTasks={() => setShowSubTasks(!showSubTasks)}
              />
            </div>
            
            <TodoSubTasks
              subTasks={todo.subTasks}
              newSubTaskText={newSubTaskText}
              onNewSubTaskTextChange={setNewSubTaskText}
              onAddSubTask={addSubTask}
              onToggleSubTask={toggleSubTask}
              onDeleteSubTask={deleteSubTask}
              showSubTasks={showSubTasks}
              isOverdueTask={isOverdueTask}
            />
          </div>
        </div>
      )}
    </div>
  );
}