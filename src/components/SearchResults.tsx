'use client';

import React, { useState, useCallback } from 'react';
import { removeEntry, updateEntryAction } from '@/lib/actions';
import type { Entry, SearchResult } from '@/types/index';
import { debug } from '@/lib/debug';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';


interface SearchResultsProps {
  results: SearchResult;
  onEntryDeleted: () => void;
}

export default function SearchResults({ results, onEntryDeleted }: SearchResultsProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());
  
  // 标签编辑相关状态
  const [editingTag, setEditingTag] = useState<{ entryId: number; tagType: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'project' | 'person' | 'importance'>('list');
  const [selectedEntry, setSelectedEntry] = useState<number | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entryId: number } | null>(null);
  // 删除确认对话框状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // 导航到上一个或下一个条目
  const navigateEntry = useCallback((direction: 'up' | 'down') => {
    const entries = results.entries;
    if (entries.length === 0) return;
    
    const currentIndex = selectedEntry ? entries.findIndex(e => e.id === selectedEntry) : -1;
    let newIndex: number;
    
    if (direction === 'down') {
      newIndex = currentIndex < entries.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : entries.length - 1;
    }
    
    setSelectedEntry(entries[newIndex].id);
  }, [results.entries, selectedEntry]);

  // 切换条目展开状态
  const toggleExpanded = useCallback((entryId: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  }, [expandedEntries]);

  // 删除记录
  const handleDelete = useCallback(async (id: number) => {
    try {
      setDeletingId(id);
      const result = await removeEntry(id);
      if (result.success) {
        onEntryDeleted();
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      debug.error('删除记录失败:', error);
      alert('删除失败，请重试');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  }, [onEntryDeleted]);

  const openDeleteConfirm = (id: number) => {
    setDeleteTargetId(id);
    setShowDeleteConfirm(true);
  };

  // 开始编辑标签
  const startEditTag = (entryId: number, tagType: string, currentValue: string) => {
    setEditingTag({ entryId, tagType });
    setEditingValue(currentValue || '');
  };

  // 保存标签编辑
  const saveTagEdit = async () => {
    if (!editingTag) return;
    
    try {
      const updates = {
        [editingTag.tagType]: editingValue || undefined
      };
      
      const result = await updateEntryAction(editingTag.entryId, updates);
      if (result.success) {
        onEntryDeleted(); // 触发刷新
        setEditingTag(null);
        setEditingValue('');
      }
    } catch (error) {
      debug.error('更新标签失败:', error);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingTag(null);
    setEditingValue('');
  };

  // 获取标签选项
  const getTagOptions = (tagType: string) => {
    switch (tagType) {
      case 'daily_report_tag':
        return [
          { value: '核心进展', label: '📈 核心进展' },
          { value: '问题与卡点', label: '🚫 问题与卡点' },
          { value: '思考与困惑', label: '🤔 思考与困惑' },
          { value: 'AI学习', label: '🤖 AI学习' },
          { value: '无', label: '➖ 无' }
        ];
      default:
        return [];
    }
  };

  // 渲染标签编辑器
  const renderTagEditor = (entryId: number, tagType: string) => {
    const isEditing = editingTag?.entryId === entryId && editingTag?.tagType === tagType;
    
    if (!isEditing) return null;
    
    const options = getTagOptions(tagType);
    
    if (tagType === 'project_tag') {
      // 输入型标签
      return (
        <div className="flex items-center gap-1 mt-1">
          <input
            type="text"
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            placeholder="项目名称"
            autoFocus
          />
          <button
            onClick={saveTagEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80" style={{backgroundColor: 'var(--success-color)', color: 'var(--text-on-primary)'}}
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80" style={{backgroundColor: 'var(--text-muted)', color: 'var(--text-on-primary)'}}
          >
            ✕
          </button>
        </div>
      );
    } else {
      // 选择型标签
      return (
        <div className="flex items-center gap-1 mt-1">
          <select
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            className="px-2 py-1 text-xs border border-gray-300 rounded"
            autoFocus
          >
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={saveTagEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80" style={{backgroundColor: 'var(--success-color)', color: 'var(--text-on-primary)'}}
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80" style={{backgroundColor: 'var(--text-muted)', color: 'var(--text-on-primary)'}}
          >
            ✕
          </button>
        </div>
      );
    }
  };

  // 键盘事件处理
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedEntry === null) return;
      
      switch (e.key) {
        case 'Enter':
          e.preventDefault();
          toggleExpanded(selectedEntry);
          break;
        case 'Delete':
          e.preventDefault();
          if (selectedEntry != null) {
            openDeleteConfirm(selectedEntry);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedEntry(null);
          setContextMenu(null);
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateEntry('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          navigateEntry('up');
          break;
      }
    };

    const handleClickOutside = () => {
      setContextMenu(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClickOutside);
    };
  }, [selectedEntry, results.entries, toggleExpanded, handleDelete, navigateEntry]);

  // 处理右键菜单
  const handleContextMenu = (e: React.MouseEvent, entryId: number) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      entryId
    });
  };

  // 复制内容到剪贴板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 这里可以添加成功提示
    } catch (error) {
      debug.error('复制失败:', error);
    }
  };

  // 生成内容摘要
  const generateSummary = (content: string, maxLength = 150): { summary: string; needsExpansion: boolean } => {
    if (content.length <= maxLength) {
      return { summary: content, needsExpansion: false };
    }
    
    // 尝试在句号、感叹号、问号处断句
    const sentences = content.split(/[。！？.!?]/);
    let summary = '';
    
    for (const sentence of sentences) {
      if (summary.length + sentence.length <= maxLength) {
        summary += sentence + (sentence.length > 0 ? '。' : '');
      } else {
        break;
      }
    }
    
    // 如果没有找到合适的断句点，就简单截取
    if (summary.length === 0) {
      summary = content.substring(0, maxLength) + '...';
    }
    
    return { summary: summary.trim(), needsExpansion: true };
  };

  // 按不同维度分组记录
  const groupEntries = () => {
    const entries = results.entries;
    
    switch (viewMode) {
      case 'project':
        const projectGroups = new Map<string, Entry[]>();
        entries.forEach(entry => {
          const key = entry.project_tag || '无项目标签';
          if (!projectGroups.has(key)) {
            projectGroups.set(key, []);
          }
          projectGroups.get(key)!.push(entry);
        });
        return Array.from(projectGroups.entries()).map(([group, items]) => ({ group, items }));
        
      case 'person':
        const personGroups = new Map<string, Entry[]>();
        entries.forEach(entry => {
          const key = '无人物标签'; // 已移除person_tag字段
          if (!personGroups.has(key)) {
            personGroups.set(key, []);
          }
          personGroups.get(key)!.push(entry);
        });
        return Array.from(personGroups.entries()).map(([group, items]) => ({ group, items }));
        
      case 'importance':
        const importanceGroups = new Map<string, Entry[]>();
        entries.forEach(entry => {
          const key = '无重要度标签'; // 已移除importance_tag字段
          if (!importanceGroups.has(key)) {
            importanceGroups.set(key, []);
          }
          importanceGroups.get(key)!.push(entry);
        });
        return Array.from(importanceGroups.entries()).map(([group, items]) => ({ group, items }));
        
      default:
        return [{ group: '所有记录', items: entries }];
    }
  };

  // 高亮搜索词
  const highlightText = (text: string, searchTerms: string[]): React.JSX.Element => {
    if (!searchTerms.length) {
      return <span>{text}</span>;
    }

    const uniqueTerms = [...new Set(searchTerms.map(term => term.toLowerCase()))];
    
    // 创建正则表达式，匹配所有搜索词
    const regex = new RegExp(`(${uniqueTerms.map(term => 
      term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    ).join('|')})`, 'gi');

    const parts = text.split(regex);
    
    return (
      <span>
        {parts.map((part, index) => {
          const isMatch = uniqueTerms.some(term => 
            part.toLowerCase() === term.toLowerCase()
          );
          
          return isMatch ? (
            <mark 
              key={index} 
              className="bg-yellow-200 text-yellow-900 px-0.5 rounded"
            >
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          );
        })}
      </span>
    );
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 移除了过时的5星评级系统

  if (!results.entries.length) {
    return (
      <EmptyState 
        type="search"
        size="medium"
        title="没有找到匹配的记录"
        description={
          results.suggestions.length > 0 
            ? "尝试使用搜索建议或不同的关键词" 
            : "尝试使用不同的关键词或检查拼写"
        }
        secondaryAction={
          results.suggestions.length > 0 ? {
            label: '查看搜索建议',
            onClick: () => {
              // 显示搜索建议的交互
              const suggestionsContainer = document.querySelector('[data-suggestions]');
              if (suggestionsContainer) {
                suggestionsContainer.scrollIntoView({ behavior: 'smooth' });
              }
            },
            icon: '💡'
          } : undefined
        }
      >
        {/* 搜索建议区域 */}
        {results.suggestions.length > 0 && (
          <div className="mt-6" data-suggestions>
            <p className="text-sm font-medium mb-3 text-center" style={{ color: 'var(--text-secondary)' }}>
              💡 搜索建议：
            </p>
            <div className="flex justify-center flex-wrap gap-2">
              {results.suggestions.map((suggestion, index) => (
                <span 
                  key={index}
                  className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  style={{
                    backgroundColor: 'var(--flow-primary)/20',
                    color: 'var(--flow-primary)'
                  }}
                  onClick={() => {
                    // 这里可以触发新的搜索
                    const searchBox = document.querySelector('input[type="search"]');
                    if (searchBox) {
                      (searchBox as HTMLInputElement).value = suggestion;
                      searchBox.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                  }}
                >
                  {suggestion}
                </span>
              ))}
            </div>
          </div>
        )}
      </EmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索结果统计 */}
      <div className="pb-4 border-b" style={{ borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))' }}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              🔍 搜索结果
            </h2>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              找到 <span className="font-medium" style={{ color: 'var(--flow-primary)' }}>{results.totalCount}</span> 条记录
              · 用时 <span className="font-medium">{results.searchTime}ms</span>
            </div>
          </div>
          
          {/* 快速操作 */}
          <div className="flex items-center gap-2">
            {/* 视图模式切换 */}
            <div className="flex items-center border rounded overflow-hidden" style={{ borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))' }}>
              <button
                onClick={() => setViewMode('list')}
                className="px-2 py-1 text-xs transition-colors"
                style={{
                  backgroundColor: viewMode === 'list' ? 'var(--flow-primary)' : 'transparent',
                  color: viewMode === 'list' ? 'white' : 'var(--text-secondary)'
                }}
                title="列表视图"
              >
                📋
              </button>
              <button
                onClick={() => setViewMode('project')}
                className="px-2 py-1 text-xs border-l transition-colors"
                style={{
                  borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
                  backgroundColor: viewMode === 'project' ? 'var(--flow-primary)' : 'transparent',
                  color: viewMode === 'project' ? 'white' : 'var(--text-secondary)'
                }}
                title="按项目分组"
              >
                🏷️
              </button>
              <button
                onClick={() => setViewMode('person')}
                className="px-2 py-1 text-xs border-l transition-colors"
                style={{
                  borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
                  backgroundColor: viewMode === 'person' ? 'var(--flow-primary)' : 'transparent',
                  color: viewMode === 'person' ? 'white' : 'var(--text-secondary)'
                }}
                title="按人物分组"
              >
                👤
              </button>
              <button
                onClick={() => setViewMode('importance')}
                className="px-2 py-1 text-xs border-l transition-colors"
                style={{
                  borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
                  backgroundColor: viewMode === 'importance' ? 'var(--flow-primary)' : 'transparent',
                  color: viewMode === 'importance' ? 'white' : 'var(--text-secondary)'
                }}
                title="按重要程度分组"
              >
                ⭐
              </button>
            </div>
            
            <button
              onClick={() => setExpandedEntries(new Set())}
              className="text-xs px-2 py-1 rounded border transition-colors"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))'
              }}
            >
              全部收起
            </button>
            <button
              onClick={() => setExpandedEntries(new Set(results.entries.map(e => e.id)))}
              className="text-xs px-2 py-1 rounded border transition-colors"
              style={{
                color: 'var(--text-secondary)',
                borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))'
              }}
            >
              全部展开
            </button>
          </div>
        </div>
        
        {results.searchTerms.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>搜索词：</span>
            {results.searchTerms.map((term, index) => (
              <span 
                key={index}
                className="px-2 py-1 rounded text-sm"
                style={{
                  backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.1))',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--card-border, rgba(255, 255, 255, 0.2))'
                }}
              >
                {term}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 搜索结果列表 */}
      <div className="space-y-6">
        {groupEntries().map(({ group, items }) => (
          <div key={group}>
            {/* 分组标题 */}
            {viewMode !== 'list' && (
              <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))' }}>
                <h3 className="font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  {viewMode === 'project' && '🏷️'}
                  {viewMode === 'person' && '👤'}
                  {viewMode === 'importance' && '⭐'}
                  {group}
                </h3>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{items.length} 条记录</span>
              </div>
            )}
            
            {/* 该分组的记录 */}
            <div className="space-y-3">
              {items.map((entry, index) => (
                <div 
                  key={entry.id} 
                  className="rounded-lg shadow-sm border p-4 hover:shadow-md transition-all duration-200 opacity-0 animate-fadeInUp cursor-pointer"
                  style={{
                    backgroundColor: selectedEntry === entry.id ? 'var(--card-glass, rgba(255, 255, 255, 0.2))' : 'var(--background)',
                    borderColor: selectedEntry === entry.id ? 'var(--flow-primary)' : 'var(--card-border, rgba(255, 255, 255, 0.2))',
                    boxShadow: selectedEntry === entry.id ? '0 0 0 2px var(--flow-primary)/20' : undefined,
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'forwards'
                  }}
                  onClick={() => setSelectedEntry(entry.id)}
                  onContextMenu={(e) => handleContextMenu(e, entry.id)}
                  tabIndex={0}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      {/* 内容 */}
                      <div className="whitespace-pre-wrap mb-3 leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                        {(() => {
                          const isExpanded = expandedEntries.has(entry.id);
                          const { summary, needsExpansion } = generateSummary(entry.content);
                          const displayContent = isExpanded ? entry.content : summary;
                          
                          return (
                            <div>
                              {highlightText(displayContent, results.searchTerms)}
                              {needsExpansion && (
                                <button
                                  onClick={() => toggleExpanded(entry.id)}
                                  className="ml-2 text-sm font-medium inline-flex items-center transition-all duration-200 px-2 py-1 rounded"
                                  style={{
                                    color: 'var(--flow-primary)',
                                    backgroundColor: 'transparent'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--card-glass, rgba(255, 255, 255, 0.1))';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  {isExpanded ? (
                                    <>
                                      <span>收起</span>
                                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                      </svg>
                                    </>
                                  ) : (
                                    <>
                                      <span>展开全文</span>
                                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                      
                      {/* 标签 */}
                      <div className="flex flex-wrap gap-2 text-xs mb-3">
                        {/* 项目标签 */}
                        {entry.project_tag ? (
                          <span 
                            className="px-2 py-1 rounded-full cursor-pointer hover:opacity-80" style={{backgroundColor: 'var(--flow-primary)', color: 'var(--text-on-primary)'}}
                            onClick={(e) => {
                               e.stopPropagation();
                               startEditTag(entry.id, 'project_tag', entry.project_tag || '');
                             }}
                          >
                            📁 {highlightText(entry.project_tag, results.searchTerms)}
                          </span>
                        ) : (
                          <span 
                            className="px-2 py-1 rounded-full cursor-pointer hover:opacity-80" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-muted)'}}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTag(entry.id, 'project_tag', '');
                            }}
                          >
                            📁 +
                          </span>
                        )}
                        

                        
                        {/* 日报标签 */}
                        {entry.daily_report_tag && entry.daily_report_tag !== '无' ? (
                          <span 
                            className="px-2 py-1 rounded-full cursor-pointer hover:opacity-80" style={{backgroundColor: 'var(--flow-secondary)', color: 'var(--text-on-primary)'}}
                            onClick={(e) => {
                               e.stopPropagation();
                               startEditTag(entry.id, 'daily_report_tag', entry.daily_report_tag || '');
                             }}
                          >
                            {entry.daily_report_tag === '核心进展' && '📈'}
                            {entry.daily_report_tag === '问题与卡点' && '🚫'}
                            {entry.daily_report_tag === '思考与困惑' && '🤔'}
                            {entry.daily_report_tag === 'AI学习' && '🤖'}
                            {' '}{highlightText(entry.daily_report_tag, results.searchTerms)}
                          </span>
                        ) : (
                          <span 
                            className="px-2 py-1 rounded-full cursor-pointer hover:opacity-80" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-muted)'}}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditTag(entry.id, 'daily_report_tag', '无');
                            }}
                          >
                            📈 +
                          </span>
                        )}
                        
                        {/* 标签编辑器 */}
                        {renderTagEditor(entry.id, 'project_tag')}
                         {renderTagEditor(entry.id, 'daily_report_tag')}
                      </div>
                      
                      {/* 元数据信息 */}
                      <div className="flex items-center gap-4 text-xs" style={{color: 'var(--text-muted)'}}>
                        <span>📝 条目 #{entry.id}</span>
                        <span>📝 {entry.content.length} 字符</span>
                        {expandedEntries.has(entry.id) && (
                          <span>✅ 已展开</span>
                        )}
                      </div>
                    </div>
                    
                    {/* 删除按钮 */}
                    <button
                      onClick={() => openDeleteConfirm(entry.id)}
                      disabled={deletingId === entry.id}
                      className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="删除记录"
                    >
                      {deletingId === entry.id ? (
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 分页信息（如果需要的话） */}
      {results.totalCount > results.entries.length && (
        <div className="text-center py-4 text-sm" style={{color: 'var(--text-muted)'}}>
          显示了前 {results.entries.length} 条结果，共 {results.totalCount} 条
        </div>
      )}

      {/* 右键菜单 */}
      {contextMenu && (
        <div
          className="fixed rounded-lg shadow-lg py-2 z-50 min-w-[150px]"
          style={{
            backgroundColor: 'var(--card-background)',
            border: '1px solid var(--card-border)',
            left: contextMenu.x,
            top: contextMenu.y,
            transform: 'translate(-50%, -10px)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const entry = results.entries.find(e => e.id === contextMenu.entryId);
              if (entry) {
                toggleExpanded(entry.id);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:opacity-80" style={{color: 'var(--text-primary)', backgroundColor: 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-glass)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {expandedEntries.has(contextMenu.entryId) ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                收起内容
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                展开内容
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              const entry = results.entries.find(e => e.id === contextMenu.entryId);
              if (entry) {
                copyToClipboard(entry.content);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:opacity-80" style={{color: 'var(--text-primary)', backgroundColor: 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-glass)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            复制内容
          </button>
          
          <hr className="my-1" style={{borderColor: 'var(--card-border)'}} />
          
          <button
            onClick={() => {
              openDeleteConfirm(contextMenu.entryId);
              setContextMenu(null);
            }}
            className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:opacity-80" style={{color: 'var(--error-color)', backgroundColor: 'transparent'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--card-glass)'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            删除记录
          </button>
        </div>
      )}

      {/* 删除确认对话框（居中显示） */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="确认删除"
        description="您确定要删除这条记录吗？此操作无法撤销。"
        cancelText="取消"
        confirmText={deletingId != null ? '删除中...' : '确认删除'}
        onCancel={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTargetId != null && handleDelete(deleteTargetId)}
        loading={deletingId != null}
        danger
      />

       {/* 键盘快捷键提示 */}
       {selectedEntry && (
         <div className="fixed bottom-4 right-4 px-3 py-2 rounded-lg text-xs opacity-75" style={{backgroundColor: 'var(--card-background)', color: 'var(--text-primary)', border: '1px solid var(--card-border)'}}>
           <div className="space-y-1">
             <div>↑↓ 导航 | Enter 展开/收起</div>
             <div>Delete 删除 | Esc 取消选择</div>
           </div>
         </div>
       )}
    </div>
  );
}