'use client';

import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Task } from '@/types/project';
import { CreateTaskRequest } from '@/lib/services/taskService';

interface TaskFormProps {
  task?: Task;
  projectId: string;
  onSubmit: (taskData: CreateTaskRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function TaskForm({ task, projectId, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<CreateTaskRequest>({
    title: task?.title || '',
    description: task?.description || '',
    projectId: projectId,
    status: task?.status || 'todo',
    priority: task?.priority || 'medium',
    estimatedHours: task?.estimatedHours || undefined,
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    assignee: task?.assignee || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '任务标题不能为空';
    }
    
    if (formData.estimatedHours && formData.estimatedHours < 0) {
      newErrors.estimatedHours = '预估工时不能为负数';
    }
    
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = '截止日期不能早于今天';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const submitData = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('提交表单失败:', error);
    }
  };

  const handleInputChange = (field: keyof CreateTaskRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // 清除相关错误
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="w-full max-w-md rounded-xl shadow-xl"
        style={{
          background: 'var(--card-glass)',
          backdropFilter: 'blur(15px)',
          border: '1px solid var(--card-border)'
        }}
      >
        {/* 表单头部 */}
        <div className="flex items-center justify-between p-6 border-b" style={{borderColor: 'var(--card-border)'}}>
          <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>
            {task ? '编辑任务' : '添加任务'}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-black/5 transition-colors"
            style={{color: 'var(--text-secondary)'}}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 表单内容 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 任务标题 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              任务标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{
                background: 'var(--background)',
                color: 'var(--text-primary)',
                borderColor: errors.title ? '#ef4444' : 'var(--card-border)'
              }}
              placeholder="请输入任务标题"
              disabled={isLoading}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* 任务描述 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              任务描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              style={{
                background: 'var(--background)',
                color: 'var(--text-primary)',
                borderColor: 'var(--card-border)'
              }}
              placeholder="请输入任务描述（可选）"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* 状态和优先级 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value as Task['status'])}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--card-border)'
                }}
                disabled={isLoading}
              >
                <option value="todo">待办</option>
                <option value="in_progress">进行中</option>
                <option value="review">审核中</option>
                <option value="done">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                优先级
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value as Task['priority'])}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--card-border)'
                }}
                disabled={isLoading}
              >
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
                <option value="urgent">紧急</option>
              </select>
            </div>
          </div>

          {/* 预估工时和截止日期 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                <Clock className="w-4 h-4 inline mr-1" />
                预估工时
              </label>
              <input
                type="number"
                value={formData.estimatedHours || ''}
                onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  borderColor: errors.estimatedHours ? '#ef4444' : 'var(--card-border)'
                }}
                placeholder="小时"
                min="0"
                step="0.5"
                disabled={isLoading}
              />
              {errors.estimatedHours && (
                <p className="text-red-500 text-sm mt-1">{errors.estimatedHours}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
                <Calendar className="w-4 h-4 inline mr-1" />
                截止日期
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                style={{
                  background: 'var(--background)',
                  color: 'var(--text-primary)',
                  borderColor: errors.dueDate ? '#ef4444' : 'var(--card-border)'
                }}
                disabled={isLoading}
              />
              {errors.dueDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>
              )}
            </div>
          </div>

          {/* 负责人 */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-primary)'}}>
              负责人
            </label>
            <input
              type="text"
              value={formData.assignee}
              onChange={(e) => handleInputChange('assignee', e.target.value)}
              className="w-full px-3 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              style={{
                background: 'var(--background)',
                color: 'var(--text-primary)',
                borderColor: 'var(--card-border)'
              }}
              placeholder="请输入负责人姓名（可选）"
              disabled={isLoading}
            />
          </div>

          {/* 表单按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--card-border)'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '保存中...' : (task ? '更新任务' : '创建任务')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}