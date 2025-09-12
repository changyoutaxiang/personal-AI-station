'use client';

import React, { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useRef } from 'react';
import { Plus, Flag, Timer } from 'lucide-react';
import { Priority, Category, RepeatType } from '@/types/todo';
import { useTheme } from './ThemeProvider';
import { useDebounceCallback } from '@/hooks/todos/useDebounce';

interface AddTodoFormProps {
  activeTab: 'today' | 'week';
  onAdd: (todoData: {
    text: string;
    priority: Priority;
    tags: Category[];
    dueDate?: Date;
    estimatedTime?: number;
    repeatType: RepeatType;
    category: 'today' | 'week';
  }) => void;
}

const categoryOptions: { value: Category; label: string; color: string }[] = [
  { value: 'work', label: 'FSD 项目', color: 'bg-blue-100 text-blue-800' },
  { value: 'life', label: 'AIEC团队', color: 'bg-green-100 text-green-800' },
  { value: 'study', label: '训战营', color: 'bg-purple-100 text-purple-800' },
  { value: 'health', label: '组织赋能', color: 'bg-pink-100 text-pink-800' },
  { value: 'other', label: '业务赋能', color: 'bg-gray-100 text-gray-800' }
];

export const AddTodoForm = forwardRef<{ triggerAdd: (content: string) => void }, AddTodoFormProps>(
  ({ activeTab, onAdd }, ref) => {
    const { getThemeColors } = useTheme();
    const dateInputRef = useRef<HTMLInputElement>(null);
    const colors = getThemeColors();
  
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [selectedTags, setSelectedTags] = useState<Category[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useDebounceCallback(async () => {
    if (text.trim() && !isSubmitting) {
      // 判断任务应该进入哪个面板
      let targetCategory: 'today' | 'week' = 'week'; // 默认进入本周任务
      
      if (dueDate) {
        const selectedDate = new Date(dueDate);
        const today = new Date();
        
        // 检查是否是今天 - 只有选择今天的任务才进入"今日任务"
        const isToday = selectedDate.getFullYear() === today.getFullYear() &&
                       selectedDate.getMonth() === today.getMonth() &&
                       selectedDate.getDate() === today.getDate();
        
        if (isToday) {
          targetCategory = 'today';
        }
      }
      // 没有选择日期或选择其他日期的任务都进入"本周任务"
      
      setIsSubmitting(true);
      try {
        await onAdd({
          text: text.trim(),
          priority,
          tags: selectedTags,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
          repeatType: 'none',
          category: targetCategory
        });
        
        // Reset form
        setText('');
        setPriority('medium');
        setSelectedTags([]);
        setDueDate('');
        setEstimatedTime('');
        setShowAdvanced(false);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, 300);

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    triggerAdd: (content: string) => {
      setText(content);
      // 使用setTimeout确保状态更新后再提交
      setTimeout(() => {
        handleSubmit();
      }, 100);
    }
  }), [handleSubmit]);

  const toggleTag = (tag: Category) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-3xl shadow-2xl p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300">
      <div className="space-y-4">
        {/* Main input */}
        <div className="flex space-x-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && !showAdvanced && handleSubmit()}
            placeholder={`添加${activeTab === 'today' ? '今日' : '本周'}任务...（Ctrl+Enter 快速提交）`}
            rows={4}
            className="flex-1 px-6 py-4 border-0 rounded-2xl focus:outline-none transition-all duration-300 text-gray-700 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl placeholder-gray-400 text-lg resize-none min-h-[120px]"
          />
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-6 py-4 border-0 rounded-2xl transition-all duration-300 text-gray-600 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Flag className="w-5 h-5" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-gradient-to-r ${colors.primary} hover:opacity-90 text-white px-10 py-4 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center space-x-3 text-lg ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <Plus className="w-6 h-6" />
            <span>添加任务</span>
          </button>
        </div>

        {/* Advanced options */}
        {showAdvanced && (
          <div className="space-y-6 pt-4">
            {/* Priority */}
            <div className="flex items-center space-x-4">
              <label className="text-base font-bold text-gray-700 w-20">优先级:</label>
              <div className="flex space-x-2">
                {(['high', 'medium', 'low'] as Priority[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-md ${
                      priority === p
                        ? p === 'high' ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-lg' 
                          : p === 'medium' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                          : 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg'
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                    }`}
                  >
                    {p === 'high' ? '🔥 高' : p === 'medium' ? '⚡ 中' : '🌱 低'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start space-x-4">
              <label className="text-base font-bold text-gray-700 w-20 mt-1">标签:</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => toggleTag(option.value)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-md ${
                      selectedTags.includes(option.value)
                        ? `${option.color} shadow-lg`
                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 hover:from-gray-200 hover:to-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date and estimated time - 紧凑布局 */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">日期:</label>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="px-3 py-2 border-2 border-pink-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm bg-white/80 backdrop-blur-sm shadow-md focus:shadow-lg transition-all duration-300 text-gray-700"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                  <Timer className="w-4 h-4 text-purple-400" />
                  <span>时长:</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={estimatedTime}
                    onChange={(e) => setEstimatedTime(e.target.value)}
                    placeholder="分钟"
                    className="w-20 px-3 py-2 border-2 border-pink-200 rounded-lg focus:border-purple-400 focus:outline-none text-sm bg-white/80 backdrop-blur-sm shadow-md focus:shadow-lg transition-all duration-300"
                  />
                  <span className="text-xs text-gray-500">分钟</span>
                </div>
              </div>
            </div>


          </div>
        )}
      </div>
    </div>
  );
});

AddTodoForm.displayName = 'AddTodoForm';