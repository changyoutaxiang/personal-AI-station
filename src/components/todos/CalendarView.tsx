'use client';

import React from 'react';
import { Clock, Timer, Flag } from 'lucide-react';
import { Todo } from '@/types/todo';
import { TodoItem } from './TodoItem';

interface CalendarViewProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

export function CalendarView({ todos, onToggle, onDelete, onUpdate }: CalendarViewProps) {
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() - today.getDay() + 1); // Start from Monday

  // Generate 7 days of the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const dayNames = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

  // Group todos by date
  const todosByDate = weekDays.map(date => {
    const dateString = date.toDateString();
    const dayTodos = todos.filter(todo => {
      if (!todo.dueDate) return false;
      return new Date(todo.dueDate).toDateString() === dateString;
    });
    return {
      date,
      todos: dayTodos
    };
  });

  // Get todos without due dates
  const unscheduledTodos = todos.filter(todo => !todo.dueDate);

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const compareDate = new Date(date);
    compareDate.setHours(23, 59, 59, 999);
    return compareDate < today;
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
    <div className="space-y-8">
      {/* Week Calendar - Vertical Layout */}
      <div className="space-y-4">
        {todosByDate.map(({ date, todos: dayTodos }, index) => {
          const todayClass = isToday(date) ? 'ring-2 ring-purple-400 bg-purple-50' : '';
          const pastClass = isPastDate(date) ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200';
          
          return (
            <div
              key={date.toISOString()}
              className={`border-2 rounded-2xl p-6 ${todayClass || pastClass} transition-all duration-200`}
            >
              {/* Date Header - Horizontal Layout */}
              <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className={`text-lg font-bold ${isToday(date) ? 'text-purple-700' : isPastDate(date) ? 'text-red-600' : 'text-gray-600'}`}>
                    {dayNames[index]}
                  </div>
                  <div className={`text-3xl font-bold ${isToday(date) ? 'text-purple-800' : isPastDate(date) ? 'text-red-700' : 'text-gray-800'}`}>
                    {date.getDate()}
                  </div>
                  <div className="text-lg text-gray-500">
                    {date.getMonth() + 1}月
                  </div>
                  {isToday(date) && (
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      今天
                    </span>
                  )}
                  {isPastDate(date) && dayTodos.some(todo => !todo.completed) && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      逾期
                    </span>
                  )}
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  {dayTodos.length} 个任务 
                  {dayTodos.length > 0 && (
                    <span className="ml-2">
                      ({dayTodos.filter(todo => todo.completed).length} 已完成)
                    </span>
                  )}
                </div>
              </div>

              {/* Day Tasks - Full width with more space */}
              <div className="space-y-4">
                {dayTodos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📅</div>
                    <div className="text-sm">今日暂无安排</div>
                  </div>
                ) : (
                  dayTodos.map(todo => (
                    <div key={todo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                      <TodoItem
                        todo={todo}
                        activeTab="week"
                        onToggle={onToggle}
                        onDelete={onDelete}
                        onUpdate={onUpdate}
                        operationLoading={{}}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unscheduled Tasks */}
      {unscheduledTodos.length > 0 && (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-800">未设定日期</h3>
            <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-sm">
              {unscheduledTodos.length}
            </span>
          </div>
          <div className="space-y-4">
            {unscheduledTodos.map(todo => (
              <div key={todo.id} className="bg-white rounded-xl shadow-sm border border-gray-100">
                <TodoItem
                  todo={todo}
                  activeTab="week"
                  onToggle={onToggle}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  operationLoading={{}}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}