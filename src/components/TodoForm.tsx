'use client';

import { useState, useEffect } from 'react';
import type { Todo } from '@/types/index';
import { createTodoAction, updateTodoAction } from '@/lib/actions';
import { debug } from '@/lib/debug';

interface TodoFormProps {
  editingTodo?: Todo;
  defaultProject?: string;
  onTodoCreated: () => void;
  onCancel?: () => void;
}

export default function TodoForm({ editingTodo, defaultProject, onTodoCreated, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [weekday, setWeekday] = useState<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | ''>('');
  const [projectTag, setProjectTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // 当editingTodo或defaultProject变化时，填充表单
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority);
      setWeekday(editingTodo.weekday || '');
      setProjectTag(editingTodo.project_tag || '');
    } else {
      // 清空表单
      setTitle('');
      setDescription('');
      setPriority('medium');
      setWeekday('');
      setProjectTag(defaultProject || '');
    }
  }, [editingTodo, defaultProject]);

  // 重置表单
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setWeekday('');
    setProjectTag('');
    setMessage('');
  };

  // 表单提交处理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage('❌ 任务标题不能为空');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      if (editingTodo) {
        // 更新现有Todo
        const updates: Partial<Todo> = {
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          weekday: weekday || undefined,
          project_tag: projectTag.trim() || undefined
        };

        const result = await updateTodoAction(editingTodo.id, updates);
        
        if (result.success) {
          setMessage('✅ 任务更新成功！');
          setTimeout(() => {
            setMessage('');
            onTodoCreated(); // 刷新列表
          }, 1000);
        } else {
          setMessage(`❌ ${result.error || '更新失败，请重试'}`);
          setTimeout(() => setMessage(''), 5000);
        }
      } else {
        // 创建新Todo
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', description.trim());
        formData.append('priority', priority);
        if (weekday) formData.append('weekday', weekday);
        formData.append('project_tag', projectTag.trim());

        const result = await createTodoAction(formData);
        
        if (result.success) {
          resetForm();
          setMessage('✅ 任务创建成功！');
          setTimeout(() => {
            setMessage('');
            onTodoCreated(); // 刷新列表
          }, 1000);
        } else {
          setMessage(`❌ ${result.error || '创建失败，请重试'}`);
          setTimeout(() => setMessage(''), 5000);
        }
      }
    } catch (error) {
      debug.error('提交Todo失败:', error);
      setMessage('❌ 网络错误，请检查连接后重试');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 键盘快捷键处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter 或 Cmd+Enter 提交表单
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting && title.trim()) {
          const formElement = document.querySelector('form');
          if (formElement) {
            const formEvent = new Event('submit', { cancelable: true, bubbles: true });
            formElement.dispatchEvent(formEvent);
          }
        }
      }
      
      // ESC 键取消编辑
      if (e.key === 'Escape' && editingTodo && onCancel) {
        e.preventDefault();
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, title, editingTodo, onCancel]);

  // 优先级配置
  const priorityOptions = [
    { value: 'low', label: '🟢 低优先级', color: 'text-green-600' },
    { value: 'medium', label: '🟡 中优先级', color: 'text-orange-600' },
    { value: 'high', label: '🔴 高优先级', color: 'text-red-600' }
  ];



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 消息提示 */}
      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium border transition-all duration-200 ${
          message.includes('✅') 
            ? 'bg-success/10 text-success border-success/20' 
            : 'bg-error/10 text-error border-error/20'
        }`}>
          {message}
        </div>
      )}

      {/* 任务标题 */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2 text-text-primary">
          任务标题 *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-color-primary transition-all duration-normal text-sm"
          placeholder="输入任务标题..."
          required
          disabled={isSubmitting}
          autoFocus={!editingTodo}
          maxLength={100}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-text-secondary">
            {title.length}/100
          </p>
          <p className="text-xs text-text-muted">
            💡 Ctrl+Enter 提交
          </p>
        </div>
      </div>

      {/* 任务描述 */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-2 text-text-primary">
          详细描述
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-color-primary transition-all duration-normal text-sm resize-none"
          rows={3}
          placeholder="任务的详细描述（可选）..."
          disabled={isSubmitting}
          maxLength={500}
        />
        <p className="text-xs text-text-secondary mt-1">
          {description.length}/500
        </p>
      </div>

      {/* 设置行：优先级、周几、项目标签 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 优先级选择 */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium mb-2 text-text-primary">
            优先级
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-color-primary transition-all duration-normal text-sm cursor-pointer"
            disabled={isSubmitting}
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 周几选择 */}
        <div>
          <label htmlFor="weekday" className="block text-sm font-medium mb-2 text-text-primary">
            周几
          </label>
          <select
            id="weekday"
            value={weekday}
            onChange={(e) => setWeekday(e.target.value as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | '')}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-color-primary transition-all duration-normal text-sm cursor-pointer"
            disabled={isSubmitting}
          >
            <option value="">不指定</option>
            <option value="monday">📅 周一</option>
            <option value="tuesday">📅 周二</option>
            <option value="wednesday">📅 周三</option>
            <option value="thursday">📅 周四</option>
            <option value="friday">📅 周五</option>
            <option value="saturday">📅 周六</option>
            <option value="sunday">📅 周日</option>
          </select>
        </div>

        {/* 项目标签 */}
        <div>
          <label htmlFor="projectTag" className="block text-sm font-medium mb-2 text-text-primary">
            项目标签
          </label>
          <select
            id="projectTag"
            value={projectTag}
            onChange={(e) => setProjectTag(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-color-primary focus:border-color-primary transition-all duration-normal text-sm cursor-pointer"
            disabled={isSubmitting}
          >
            <option value="">请选择项目</option>
            <option value="FSD">📊 FSD</option>
            <option value="AIEC">🤖 AIEC</option>
            <option value="训战营">🎯 训战营</option>
            <option value="管理会议">📋 管理会议</option>
            <option value="组织赋能">🚀 组织赋能</option>
            <option value="其他">📝 其他</option>
          </select>
        </div>
      </div>

      {/* 提交按钮区域 */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-border">
        {/* 编辑模式下显示取消按钮 */}
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg border border-border bg-transparent text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-all duration-normal text-sm font-medium"
            disabled={isSubmitting}
          >
            取消编辑
          </button>
        )}
        
        {/* 重置按钮（非编辑模式） */}
        {!editingTodo && (
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2.5 rounded-lg border border-border bg-transparent text-text-secondary hover:bg-background-subtle hover:text-text-primary transition-all duration-normal text-sm font-medium"
            disabled={isSubmitting}
          >
            重置表单
          </button>
        )}

        {/* 提交按钮 */}
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="px-5 py-2.5 rounded-lg font-medium transition-all duration-normal text-sm inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed bg-color-primary text-white hover:bg-color-primary-hover hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-color-primary transform"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {editingTodo ? '更新中...' : '创建中...'}
            </>
          ) : (
            <>
              {editingTodo ? '✏️ 更新任务' : '➕ 创建任务'}
            </>
          )}
        </button>
      </div>

      {/* 快捷键提示 */}
      <div className="text-xs text-text-muted pt-2 border-t border-border">
        <div className="flex flex-wrap gap-3">
          <span>💡 快捷键：</span>
          <span>Ctrl+Enter 提交</span>
          {editingTodo && <span>ESC 取消编辑</span>}
        </div>
      </div>
    </form>
  );
}