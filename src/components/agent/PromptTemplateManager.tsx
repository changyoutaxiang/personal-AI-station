'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import type { PromptTemplate } from './types';

interface PromptTemplateManagerProps {
  onApplyTemplate?: (systemPrompt: string) => void;
  currentConversationId?: number;
}

interface VariableModalProps {
  template: PromptTemplate;
  onApply: (resolvedPrompt: string) => void;
  onClose: () => void;
}

// 变量替换弹窗组件
function VariableModal({ template, onApply, onClose }: VariableModalProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  
  // 从模板内容中提取变量
  const extractedVariables = useMemo(() => {
    const regex = /\{\{(\w+)\}\}/g;
    const vars: string[] = [];
    let match;
    while ((match = regex.exec(template.content)) !== null) {
      if (!vars.includes(match[1])) {
        vars.push(match[1]);
      }
    }
    return vars;
  }, [template.content]);

  // 初始化变量值
  useEffect(() => {
    const initialVars: Record<string, string> = {};
    extractedVariables.forEach(varName => {
      initialVars[varName] = '';
    });
    setVariables(initialVars);
  }, [extractedVariables]);

  const handleApply = () => {
    // 检查是否所有变量都已填写
    const missingVars = extractedVariables.filter(varName => !variables[varName]?.trim());
    if (missingVars.length > 0) {
      toast.error(`请填写以下变量：${missingVars.join(', ')}`);
      return;
    }

    // 替换变量
    let resolvedContent = template.content;
    Object.entries(variables).forEach(([varName, value]) => {
      const regex = new RegExp(`\\{\\{${varName}\\}\\}`, 'g');
      resolvedContent = resolvedContent.replace(regex, value.trim());
    });

    onApply(resolvedContent);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
        style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)' }}
      >
        <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            填写模板变量 - {template.name}
          </h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            请为以下变量填写具体值，将替换模板中的占位符
          </p>
        </div>
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {extractedVariables.map((varName) => (
            <div key={varName}>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                {varName} *
              </label>
              <textarea
                value={variables[varName] || ''}
                onChange={(e) => setVariables(prev => ({ ...prev, [varName]: e.target.value }))}
                className="w-full p-2 border rounded-lg h-20 resize-none"
                style={{
                  borderColor: 'var(--card-border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--text-primary)'
                }}
                placeholder={`输入 ${varName} 的值`}
              />
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--card-border)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            style={{
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)'
            }}
          >
            取消
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm rounded-lg text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: 'var(--flow-primary)' }}
          >
            应用模板
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromptTemplateManager({ onApplyTemplate, currentConversationId }: PromptTemplateManagerProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortByFavorite, setSortByFavorite] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    description: '',
    is_favorite: false
  });

  // 默认模板
  const DEFAULT_TEMPLATES = [
    {
      name: '通用中文助理',
      content: '你是一个亲切友好的中文AI助理。请用简洁清晰的方式回答问题，保持结构化表达，语言风格要温暖而专业。在回答时：\n\n1. 直接回答核心问题\n2. 提供具体可行的建议\n3. 必要时给出步骤或要点\n4. 保持积极正面的态度\n\n请始终使用中文回复，确保信息准确有用。',
      description: '适用于日常问答和通用对话场景的中文助理',
      is_favorite: true
    },
    {
      name: '产品经理助手',
      content: '你是一位经验丰富的产品经理，专注于帮助用户进行产品规划和需求分析。在回答时请：\n\n1. **需求梳理**：帮助明确和细化需求\n2. **PRD结构**：提供清晰的产品需求文档建议\n3. **优先级建议**：基于价值和成本给出优先级排序\n4. **可行性分析**：考虑技术实现和资源约束\n5. **用户体验**：从用户角度思考产品设计\n\n请用结构化的方式呈现分析结果，包含具体的行动建议和注意事项。',
      description: '专门用于产品需求分析、PRD编写和产品规划的助手',
      is_favorite: true
    },
    {
      name: '写作润色系统',
      content: '你是一位专业的中文写作顾问，擅长文本润色和结构优化。请帮助用户：\n\n1. **风格保持**：保持原文的核心观点和个人风格\n2. **结构优化**：改善段落逻辑和文章结构\n3. **用词规范**：提升表达的准确性和流畅度\n4. **语法纠正**：修正语法错误和表达问题\n5. **可读性提升**：增强文本的可读性和吸引力\n\n在润色时，请标注主要修改点并解释改进理由。',
      description: '专用于文本润色、结构优化和写作指导',
      is_favorite: false
    },
    {
      name: '极简增长首席顾问',
      content: `作为极简增长首席顾问，我将基于《极简增长》读书笔记知识库为您提供专业分析和建议。

## 核心理念：
- **人工智能时代的极简组织与敏捷增长**：极简增长不仅是'事'的聚焦，同时也是'人'的聚焦，意味着更小、更敏捷的极简组织
- **对的事遇对的人迸发超预期能量**：'对的事'找到'对的人'，两者产生化学反应，将迸发出超预期的巨大能量
- **选人比育人更重要**：选人比育人更关键，企业家应该将80%的精力放在寻找和甄别人才上

## 四大灵魂追问：
1. 核心客户是谁？他们的核心需求是什么？
2. 我们的核心产品是什么？它如何满足核心客户的核心需求？
3. 我们的核心竞争力是什么？如何形成压强投入？
4. 我们应该坚决舍弃什么？如何避免资源分散？

## 分析方法：
- 压强投入原则：集中优势资源在最关键的环节
- 坚决舍弃智慧：识别并放弃分散注意力的次要事项
- 停止昨天的战争：避免在过时行业中的无谓竞争

请基于以上框架对您的问题进行深度分析，并提供具体的行动建议。`,
      description: '基于《极简增长》知识库的战略分析和决策顾问',
      is_favorite: true
    }
  ];

  // 筛选和排序模板
  const filteredTemplates = useMemo(() => {
    const result = templates.filter(template => 
      template.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (template.description?.toLowerCase().includes(searchKeyword.toLowerCase()) || false)
    );

    if (sortByFavorite) {
      result.sort((a, b) => {
        if (a.is_favorite && !b.is_favorite) return -1;
        if (!a.is_favorite && b.is_favorite) return 1;
        return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      });
    } else {
      result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    }

    return result;
  }, [templates, searchKeyword, sortByFavorite]);

  // 加载模板列表
  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/agent/prompts');
      const data = await response.json();
      
      if (data.success) {
        setTemplates(data.templates);
      } else {
        toast.error('加载模板失败');
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      toast.error('加载模板失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // 初始化默认模板
  const initializeDefaultTemplates = async () => {
    try {
      for (const template of DEFAULT_TEMPLATES) {
        const response = await fetch('/api/agent/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(template)
        });
        
        if (!response.ok) {
          // 如果模板已存在，忽略错误
          const data = await response.json();
          if (!data.error?.includes('已存在')) {
            console.warn(`创建默认模板失败: ${template.name}`, data.error);
          }
        }
      }
      
      toast.success('默认模板已初始化');
      loadTemplates();
    } catch (error) {
      console.error('初始化默认模板失败:', error);
      toast.error('初始化默认模板失败');
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      content: '',
      description: '',
      is_favorite: false
    });
  };

  // 创建模板
  const handleCreateTemplate = async () => {
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error('请填写模板名称和内容');
      return;
    }

    try {
      const response = await fetch('/api/agent/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          content: formData.content.trim(),
          description: formData.description.trim() || undefined,
          is_favorite: formData.is_favorite
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('模板创建成功');
        setShowCreateModal(false);
        resetForm();
        loadTemplates();
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
    if (!editingTemplate || !formData.name.trim() || !formData.content.trim()) {
      toast.error('请填写模板名称和内容');
      return;
    }

    try {
      const response = await fetch(`/api/agent/prompts/${editingTemplate.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          content: formData.content.trim(),
          description: formData.description.trim() || undefined,
          is_favorite: formData.is_favorite
        })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('模板更新成功');
        setShowEditModal(false);
        setEditingTemplate(null);
        resetForm();
        loadTemplates();
      } else {
        toast.error(`更新模板失败: ${data.error}`);
      }
    } catch (error) {
      console.error('更新模板失败:', error);
      toast.error('更新模板失败');
    }
  };

  // 删除模板
  const handleDeleteTemplate = async (template: PromptTemplate) => {
    if (!confirm(`确定要删除模板"${template.name}"吗？此操作不可撤销。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/agent/prompts/${template.id}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        toast.success('模板删除成功');
        loadTemplates();
      } else {
        toast.error(`删除模板失败: ${data.error}`);
      }
    } catch (error) {
      console.error('删除模板失败:', error);
      toast.error('删除模板失败');
    }
  };

  // 切换收藏状态
  const toggleFavorite = async (template: PromptTemplate) => {
    try {
      const response = await fetch(`/api/agent/prompts/${template.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_favorite: !template.is_favorite
        })
      });

      const data = await response.json();
      if (data.success) {
        loadTemplates();
      } else {
        toast.error('操作失败');
      }
    } catch (error) {
      console.error('切换收藏失败:', error);
      toast.error('操作失败');
    }
  };

  // 应用模板
  const handleApplyTemplate = (template: PromptTemplate) => {
    // 检查是否包含变量
    const hasVariables = /\{\{\w+\}\}/.test(template.content);
    
    if (hasVariables) {
      setSelectedTemplate(template);
      setShowVariableModal(true);
    } else {
      applyTemplateDirectly(template.content);
    }
  };

  // 直接应用模板
  const applyTemplateDirectly = async (systemPrompt: string) => {
    try {
      if (currentConversationId && onApplyTemplate) {
        // 如果有当前对话ID，更新对话的system_prompt
        const response = await fetch(`/api/agent/conversations/${currentConversationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_prompt: systemPrompt
          })
        });

        const data = await response.json();
        if (data.success) {
          onApplyTemplate(systemPrompt);
          toast.success('模板已应用到当前对话');
        } else {
          toast.error('应用模板失败');
        }
      } else if (onApplyTemplate) {
        // 如果没有对话ID，仅回调通知
        onApplyTemplate(systemPrompt);
        toast.success('模板已设置为系统提示词');
      }
    } catch (error) {
      console.error('应用模板失败:', error);
      toast.error('应用模板失败');
    }
  };

  // 开始编辑模板
  const startEditTemplate = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      content: template.content,
      description: template.description || '',
      is_favorite: template.is_favorite
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--flow-primary)' }}></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* 头部操作区 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="搜索模板名称或描述..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortByFavorite(!sortByFavorite)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                sortByFavorite ? 'text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'
              }`}
              style={
                sortByFavorite 
                  ? { backgroundColor: 'var(--flow-primary)', borderColor: 'var(--flow-primary)' }
                  : { borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }
              }
            >
              收藏优先
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-sm rounded-lg text-white transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--flow-primary)' }}
            >
              新建模板
            </button>
            {templates.length === 0 && (
              <button
                onClick={initializeDefaultTemplates}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{
                  borderColor: 'var(--card-border)',
                  color: 'var(--flow-primary)'
                }}
              >
                加载默认模板
              </button>
            )}
          </div>
        </div>

        {/* 模板列表 */}
        <div className="space-y-2">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              {templates.length === 0 ? '暂无模板，可以创建新模板或加载默认模板' : '没有找到匹配的模板'}
            </div>
          ) : (
            filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                style={{
                  borderColor: 'var(--card-border)',
                  backgroundColor: 'var(--card-glass)'
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {template.name}
                      </h3>
                      {template.is_favorite && (
                        <span className="text-yellow-500" title="收藏">⭐</span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm mb-2 text-gray-600 dark:text-gray-400">
                        {template.description}
                      </p>
                    )}
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                      <div>创建时间：{new Date(template.created_at).toLocaleString()}</div>
                      <div>更新时间：{new Date(template.updated_at).toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApplyTemplate(template)}
                      className="px-3 py-1 text-xs rounded text-white transition-colors hover:opacity-90"
                      style={{ backgroundColor: 'var(--flow-primary)' }}
                    >
                      应用
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleFavorite(template)}
                        className="px-2 py-1 text-xs border rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{
                          borderColor: 'var(--card-border)',
                          color: template.is_favorite ? 'var(--flow-primary)' : 'var(--text-secondary)'
                        }}
                        title={template.is_favorite ? '取消收藏' : '添加收藏'}
                      >
                        {template.is_favorite ? '★' : '☆'}
                      </button>
                      <button
                        onClick={() => startEditTemplate(template)}
                        className="px-2 py-1 text-xs border rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{
                          borderColor: 'var(--card-border)',
                          color: 'var(--text-secondary)'
                        }}
                        title="编辑"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="px-2 py-1 text-xs border rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600"
                        style={{ borderColor: 'var(--card-border)' }}
                        title="删除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 预览内容 */}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    查看内容预览
                  </summary>
                  <div 
                    className="mt-2 p-3 rounded text-xs whitespace-pre-wrap"
                    style={{ 
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-secondary)',
                      maxHeight: '200px',
                      overflowY: 'auto'
                    }}
                  >
                    {template.content.slice(0, 500)}
                    {template.content.length > 500 && '...'}
                  </div>
                </details>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 创建模板弹窗 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)' }}
          >
            <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                创建提示模板
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    模板名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="输入模板描述（可选）"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="create-favorite"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="create-favorite" className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  标记为收藏
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  模板内容 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-48 resize-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入系统提示词内容，支持变量占位符如 {{goal}} {{context}}"
                />
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  提示：可以使用 {"{{变量名}}"} 的格式添加变量，应用时会提示填写
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
            style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)' }}
          >
            <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                编辑提示模板
              </h3>
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    模板名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-lg"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--background)',
                      color: 'var(--text-primary)'
                    }}
                    placeholder="输入模板描述（可选）"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-favorite"
                  checked={formData.is_favorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_favorite: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="edit-favorite" className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  标记为收藏
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                  模板内容 *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full p-2 border rounded-lg h-48 resize-none"
                  style={{
                    borderColor: 'var(--card-border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="输入系统提示词内容，支持变量占位符如 {{goal}} {{context}}"
                />
                <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                  提示：可以使用 {"{{变量名}}"} 的格式添加变量，应用时会提示填写
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingTemplate(null);
                  resetForm();
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

      {/* 变量填写弹窗 */}
      {showVariableModal && selectedTemplate && (
        <VariableModal
          template={selectedTemplate}
          onApply={(resolvedPrompt) => {
            applyTemplateDirectly(resolvedPrompt);
            setShowVariableModal(false);
            setSelectedTemplate(null);
          }}
          onClose={() => {
            setShowVariableModal(false);
            setSelectedTemplate(null);
          }}
        />
      )}
    </>
  );
}
