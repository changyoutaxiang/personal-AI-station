'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Save, 
  Wand2, 
  Calendar, 
  Clock, 
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { Project, CreateProjectRequest } from '@/types/project';
import { ProjectAIDecomposer } from '@/lib/ai/projectDecomposer';

interface ProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: CreateProjectRequest) => Promise<void>;
  parentProjects?: Project[];
  loading?: boolean;
}

const priorityOptions = [
  { value: 'low', label: '低优先级', color: '#8B5CF6' },
  { value: 'medium', label: '中优先级', color: '#3B82F6' },
  { value: 'high', label: '高优先级', color: '#F97316' },
  { value: 'urgent', label: '紧急', color: '#EF4444' }
] as const;

const statusOptions = [
  { value: 'active', label: '进行中' },
  { value: 'on_hold', label: '暂停' },
  { value: 'completed', label: '已完成' },
  { value: 'archived', label: '已归档' }
] as const;

export function ProjectForm({ 
  project, 
  isOpen, 
  onClose, 
  onSave,
  parentProjects = [],
  loading = false
}: ProjectFormProps) {
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    description: '',
    priority: 'medium',
    status: 'active',
    estimatedHours: undefined,
    parentId: undefined,
    startDate: '',
    dueDate: '',
    color: '',
    icon: ''
  });

  const [showAIHelper, setShowAIHelper] = useState(false);
  const [aiSuggestions, setAIsuggestions] = useState<string[]>([]);
  const [aiLoading, setAILoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 重置表单数据
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        priority: project.priority,
        status: project.status,
        estimatedHours: project.estimatedHours,
        parentId: project.parentId,
        startDate: project.startDate?.split('T')[0] || '',
        dueDate: project.dueDate?.split('T')[0] || '',
        color: project.color || '',
        icon: project.icon || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        priority: 'medium',
        status: 'active',
        estimatedHours: undefined,
        parentId: undefined,
        startDate: '',
        dueDate: '',
        color: '',
        icon: ''
      });
    }
    setErrors({});
  }, [project, isOpen]);

  const handleInputChange = (field: keyof CreateProjectRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // 清除对应字段的错误
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const generateAISuggestions = async () => {
    if (!formData.description?.trim()) {
      setErrors({ description: '请先输入项目描述以获取AI建议' });
      return;
    }

    setAILoading(true);
    try {
      const suggestions = ProjectAIDecomposer.suggestProjectName(formData.description);
      setAIsuggestions(suggestions);
      setShowAIHelper(true);
    } catch (error) {
      console.error('AI建议生成失败:', error);
    } finally {
      setAILoading(false);
    }
  };

  const applySuggestion = (name: string) => {
    handleInputChange('name', name);
    setShowAIHelper(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = '项目名称不能为空';
    }

    if (formData.startDate && formData.dueDate) {
      const start = new Date(formData.startDate);
      const due = new Date(formData.dueDate);
      if (start > due) {
        newErrors.dueDate = '截止日期不能早于开始日期';
      }
    }

    if (formData.estimatedHours && formData.estimatedHours <= 0) {
      newErrors.estimatedHours = '预估工时必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('保存项目失败:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 flex items-start justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl my-8"
      >
        <form 
          onSubmit={handleSubmit}
          className="rounded-xl shadow-2xl overflow-hidden"
          style={{
            background: 'var(--card-background)',
            border: '1px solid var(--card-border)'
          }}
        >
          {/* 头部 */}
          <div 
            className="flex items-center justify-between p-6"
            style={{
              background: 'var(--card-glass)',
              borderBottom: '1px solid var(--card-border)'
            }}
          >
            <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              {project ? '编辑项目' : '新建项目'}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg transition-colors hover:bg-gray-100"
              style={{ color: 'var(--text-secondary)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 表单内容 */}
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* 项目名称与AI建议 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                项目名称 *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{
                    background: 'var(--card-glass)',
                    color: 'var(--text-primary)',
                    border: `1px solid ${errors.name ? '#EF4444' : 'var(--card-border)'}`
                  }}
                  placeholder="输入项目名称..."
                />
                <button
                  type="button"
                  onClick={generateAISuggestions}
                  disabled={aiLoading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:shadow-sm disabled:opacity-50"
                  style={{
                    background: 'var(--flow-primary)',
                    color: 'white'
                  }}
                >
                  {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                  AI建议
                </button>
              </div>
              {errors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
              
              {/* AI建议面板 */}
              {showAIHelper && aiSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div 
                    className="p-3 rounded-lg space-y-2"
                    style={{
                      background: 'var(--card-glass)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      AI建议的项目名称：
                    </p>
                    <div className="space-y-1">
                      {aiSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="block w-full text-left px-2 py-1 text-sm rounded hover:bg-blue-500/10 transition-colors"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 项目描述 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                项目描述
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                style={{
                  background: 'var(--card-glass)',
                  color: 'var(--text-primary)',
                  border: `1px solid ${errors.description ? '#EF4444' : 'var(--card-border)'}`
                }}
                placeholder="描述项目的目标和内容..."
              />
              {errors.description && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* 优先级和状态 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  优先级
                </label>
                <div className="relative">
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value as any)}
                    className="w-full px-3 py-2 pr-8 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    style={{
                      background: 'var(--card-glass)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    {priorityOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  状态
                </label>
                <div className="relative">
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value as any)}
                    className="w-full px-3 py-2 pr-8 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    style={{
                      background: 'var(--card-glass)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>
              </div>
            </div>

            {/* 时间范围 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-4 h-4" />
                  开始日期
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{
                    background: 'var(--card-glass)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--card-border)'
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Calendar className="w-4 h-4" />
                  截止日期
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{
                    background: 'var(--card-glass)',
                    color: 'var(--text-primary)',
                    border: `1px solid ${errors.dueDate ? '#EF4444' : 'var(--card-border)'}`
                  }}
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.dueDate}
                  </p>
                )}
              </div>
            </div>

            {/* 预估工时和父项目 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <Clock className="w-4 h-4" />
                  预估工时 (小时)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={formData.estimatedHours || ''}
                  onChange={(e) => handleInputChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full px-3 py-2 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                  style={{
                    background: 'var(--card-glass)',
                    color: 'var(--text-primary)',
                    border: `1px solid ${errors.estimatedHours ? '#EF4444' : 'var(--card-border)'}`
                  }}
                  placeholder="例如: 40"
                />
                {errors.estimatedHours && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.estimatedHours}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  父项目
                </label>
                <div className="relative">
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => handleInputChange('parentId', e.target.value || undefined)}
                    className="w-full px-3 py-2 pr-8 rounded-lg border-0 text-sm focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                    style={{
                      background: 'var(--card-glass)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--card-border)'
                    }}
                  >
                    <option value="">无父项目</option>
                    {parentProjects
                      .filter(p => p.id !== project?.id) // 排除自己
                      .map(parent => (
                        <option key={parent.id} value={parent.id}>
                          {parent.name}
                        </option>
                      ))}
                  </select>
                  <ChevronDown 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: 'var(--text-secondary)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div 
            className="flex items-center justify-end gap-3 p-6"
            style={{
              background: 'var(--card-glass)',
              borderTop: '1px solid var(--card-border)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--card-border)'
              }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-md disabled:opacity-50"
              style={{
                background: 'var(--flow-primary)',
                color: 'white'
              }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  保存项目
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}