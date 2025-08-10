'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import type { PromptTemplate } from './types';

interface PromptTemplateSelectorProps {
  templates: PromptTemplate[];
  selectedTemplate: PromptTemplate | null;
  onTemplateChange: (template: PromptTemplate | null) => void;
  onApplyTemplate?: (systemPrompt: string) => void;
  currentConversationId?: number;
  disabled?: boolean;
}

export default function PromptTemplateSelector({ 
  templates, 
  selectedTemplate, 
  onTemplateChange, 
  disabled = false 
}: PromptTemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTemplateSelect = (template: PromptTemplate | null) => {
    onTemplateChange(template);
    setIsOpen(false);
  };

  // 创建新模板
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !newTemplateContent.trim()) {
      toast.error('请填写模板名称和内容');
      return;
    }

    try {
      const response = await fetch('/api/agent/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName.trim(),
          content: newTemplateContent.trim(),
          description: newTemplateDescription.trim() || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('模板创建成功');
        setShowCreateModal(false);
        resetCreateForm();
        // 这里应该触发重新加载模板列表，但为了简化，我们只是提示用户
        toast('请刷新页面查看新模板', { icon: '🔄' });
      } else {
        toast.error(`创建模板失败: ${data.error}`);
      }
    } catch (error) {
      console.error('创建模板失败:', error);
      toast.error('创建模板失败');
    }
  };

  // 更新模板
  const handleUpdateTemplate = async () => {
    if (!editingTemplate || !newTemplateName.trim() || !newTemplateContent.trim()) {
      toast.error('请填写模板名称和内容');
      return;
    }

    try {
      const response = await fetch(`/api/agent/prompts/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTemplateName.trim(),
          content: newTemplateContent.trim(),
          description: newTemplateDescription.trim() || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('模板更新成功');
        setShowEditModal(false);
        setEditingTemplate(null);
        resetCreateForm();
        // 这里应该触发重新加载模板列表，但为了简化，我们只是提示用户
        toast('请刷新页面查看更新', { icon: '🔄' });
      } else {
        toast.error(`更新模板失败: ${data.error}`);
      }
    } catch (error) {
      console.error('更新模板失败:', error);
      toast.error('更新模板失败');
    }
  };

  // 重置创建表单
  const resetCreateForm = () => {
    setNewTemplateName('');
    setNewTemplateContent('');
    setNewTemplateDescription('');
  };

  // 开始编辑模板
  const startEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    setNewTemplateDescription(template.description || '');
    setShowEditModal(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
          style={{
            borderColor: 'var(--card-border)',
            backgroundColor: 'var(--card-glass)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              模板:
            </span>
            <span className="truncate">
              {selectedTemplate ? selectedTemplate.name : '无模板'}
            </span>
          </div>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && !disabled && (
          <div
            className="absolute bottom-full left-0 right-0 mb-1 py-1 rounded-lg shadow-lg border z-[9999] max-h-80 overflow-y-auto"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              backdropFilter: 'blur(10px)'
            }}
          >
            {/* 无模板选项 */}
            <button
              onClick={() => handleTemplateSelect(null)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                !selectedTemplate ? 'font-medium' : ''
              }`}
              style={{
                color: !selectedTemplate ? 'var(--flow-primary)' : 'var(--text-primary)'
              }}
            >
              <div className="flex items-center justify-between">
                <span>无模板</span>
                {!selectedTemplate && (
                  <svg className="w-4 h-4" style={{ color: 'var(--flow-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
            </button>

            <div className="border-t my-1" style={{ borderColor: 'var(--card-border)' }}></div>

            {/* 模板列表 */}
            {templates.map((template) => (
              <div key={template.id} className="group">
                <div className="flex">
                  <button
                    onClick={() => handleTemplateSelect(template)}
                    className={`flex-1 px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                      selectedTemplate?.id === template.id ? 'font-medium' : ''
                    }`}
                    style={{
                      color: selectedTemplate?.id === template.id ? 'var(--flow-primary)' : 'var(--text-primary)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="truncate">{template.name}</div>
                        {template.description && (
                          <div className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                            {template.description}
                          </div>
                        )}
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <svg className="w-4 h-4 ml-2 flex-shrink-0" style={{ color: 'var(--flow-primary)' }} fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                        </svg>
                      )}
                    </div>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditTemplate(template);
                    }}
                    className="px-2 py-2 text-xs opacity-0 group-hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                    style={{ color: 'var(--text-secondary)' }}
                    title="编辑模板"
                  >
                    ✏️
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t my-1" style={{ borderColor: 'var(--card-border)' }}></div>

            {/* 创建新模板按钮 */}
            <button
              onClick={() => {
                setShowCreateModal(true);
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--flow-primary)' }}
            >
              ＋ 创建新模板
            </button>
            
            {/* 模板管理链接 */}
            <Link
              href="/prompt-templates"
              className="block w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setIsOpen(false)}
            >
              🔧 管理所有模板
            </Link>
          </div>
        )}
      </div>

      {/* 创建模板弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)' }}
          >
            <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                创建提示模板
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  模板名称 *
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入模板名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  描述
                </label>
                <input
                  type="text"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入模板描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  模板内容 *
                </label>
                <textarea
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="w-full p-2 border rounded-lg h-32 resize-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入系统提示词内容"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-secondary)'
                }}
              >
                取消
              </button>
              <button
                onClick={handleCreateTemplate}
                className="px-4 py-2 text-sm rounded-lg text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--flow-primary)' }}
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑模板弹窗 */}
      {showEditModal && editingTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)' }}
          >
            <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                编辑提示模板
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  模板名称 *
                </label>
                <input
                  type="text"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入模板名称"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  描述
                </label>
                <input
                  type="text"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入模板描述（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  模板内容 *
                </label>
                <textarea
                  value={newTemplateContent}
                  onChange={(e) => setNewTemplateContent(e.target.value)}
                  className="w-full p-2 border rounded-lg h-32 resize-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入系统提示词内容"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTemplate(null);
                  resetCreateForm();
                }}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-secondary)'
                }}
              >
                取消
              </button>
              <button
                onClick={handleUpdateTemplate}
                className="px-4 py-2 text-sm rounded-lg text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: 'var(--flow-primary)' }}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
