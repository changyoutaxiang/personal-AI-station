'use client';

import { useState, useEffect } from 'react';
import { fetchEntries, fetchTodayEntries, fetchThisWeekEntries, removeEntry, updateEntryAction } from '@/lib/actions';
import type { Entry } from '@/types/index';
import { debug } from '@/lib/debug';
import EditEntryForm from './EditEntryForm';
import { Animated } from './animations';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';
import ViewModeSelector, { type ViewMode } from './ViewModeSelector';

interface MultiViewEntryListProps {
  initialMode?: ViewMode;
  onViewModeChange?: (mode: ViewMode) => void;
}

export default function MultiViewEntryList({ initialMode = 'today', onViewModeChange }: MultiViewEntryListProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);
  
  // 删除相关状态
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  
  
  // 标签编辑相关状态
  const [editingTag, setEditingTag] = useState<{ entryId: number; tagType: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');
  
  // 记录编辑相关状态
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  useEffect(() => {
    loadEntries();
    
    // 监听新记录添加事件
    const handleEntryAdded = () => {
      loadEntries();
    };
    
    window.addEventListener('entryAdded', handleEntryAdded);
    
    return () => {
      window.removeEventListener('entryAdded', handleEntryAdded);
    };
  }, [viewMode]);

  // 初始化时通知父组件当前视图模式
  useEffect(() => {
    onViewModeChange?.(viewMode);
  }, [viewMode, onViewModeChange]);

  const loadEntries = async () => {
    setLoading(true);
    try {
      let result;
      switch (viewMode) {
        case 'today':
          result = await fetchTodayEntries();
          break;
        case 'week':
          result = await fetchThisWeekEntries();
          break;
        case 'history':
          result = await fetchEntries();
          break;
        default:
          result = await fetchTodayEntries();
      }
      
      if (Array.isArray(result)) {
        setEntries(result);
      } else if (result.success) {
        setEntries(result.data);
      }
    } catch (error) {
      debug.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    onViewModeChange?.(mode);
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      const result = await removeEntry(id);
      if (result.success) {
        loadEntries();
      }
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(false);
      setDeleteTargetId(null);
    }
  };

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
        loadEntries();
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

  // 开始编辑记录
  const startEditEntry = (entry: Entry) => {
    setEditingEntry(entry);
  };

  // 保存记录编辑
  const handleSaveEdit = async () => {
    setEditingEntry(null);
    loadEntries();
  };

  // 取消记录编辑
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };



  // 渲染标签编辑器
  const renderTagEditor = (entryId: number, tagType: string) => {
    if (!editingTag || editingTag.entryId !== entryId || editingTag.tagType !== tagType) {
      return null;
    }

    return (
      <div className="absolute top-full left-0 mt-1 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg min-w-[200px]">
        <input
          type="text"
          value={editingValue}
          onChange={(e) => setEditingValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              saveTagEdit();
            } else if (e.key === 'Escape') {
              cancelEdit();
            }
          }}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="输入标签内容"
          autoFocus
        />
        <div className="flex gap-1 mt-2">
          <button
            onClick={saveTagEdit}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            保存
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            取消
          </button>
        </div>
      </div>
    );
  };



  // 根据视图模式决定布局类名
  const getLayoutClassName = () => {
    switch (viewMode) {
      case 'today':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6'; // 双排瀑布流
      case 'week':
      case 'history':
        return 'grid grid-cols-1 gap-4'; // 单排
      default:
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
    }
  };

  // 根据视图模式决定卡片样式
  const getCardClassName = (index: number) => {
    const baseClass = "group relative backdrop-blur-md rounded-2xl transition-all duration-300 cursor-move glass-border-soft overflow-hidden";
    
    switch (viewMode) {
      case 'today':
        return `${baseClass} px-6 pt-6 pb-2 hover:scale-[1.02]`; // 瀑布流样式
      case 'week':
      case 'history':
        return `${baseClass} px-4 py-4 hover:scale-[1.01]`; // 紧凑单排样式
      default:
        return `${baseClass} px-6 pt-6 pb-2 hover:scale-[1.02]`;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <ViewModeSelector 
          currentMode={viewMode} 
          onModeChange={handleViewModeChange}
          className="mb-6"
        />
        <div className="flex justify-center py-12">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4" style={{borderColor: 'var(--card-border)', borderTopColor: 'var(--flow-primary)'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs animate-pulse" style={{color: 'var(--text-secondary)'}}>💭</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 视图模式选择器 */}
      <ViewModeSelector 
        currentMode={viewMode} 
        onModeChange={handleViewModeChange}
        className="mb-6"
      />
      
      {/* 记录列表 */}
      {entries.length === 0 ? (
        <EmptyState 
          type="entries"
          size="large"
          action={{
            label: '创建第一条记录',
            onClick: () => {
              const formElement = document.querySelector('[data-entry-form]');
              if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
                const textarea = formElement.querySelector('textarea');
                if (textarea) {
                  (textarea as HTMLTextAreaElement).focus();
                }
              }
            },
            icon: '✍️'
          }}
        />
      ) : (
        <div className={getLayoutClassName()}>
          {entries.map((entry, index) => (
            <Animated 
              key={entry.id}
              animation="fadeIn"
              delay={index * 50}
              className={getCardClassName(index)}
              style={{ backgroundColor: 'var(--card-glass)' }}
            >
              <div
                className="h-full rounded-2xl overflow-hidden"
                style={{
                  backgroundColor: 'var(--card-glass)'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3 flex-1 ml-1">
                    <div className="flex-1 min-w-0">
                      <p className="whitespace-pre-wrap mb-4 leading-relaxed font-medium" style={{color: 'var(--foreground)'}}>{entry.content}</p>
                    
                      <div className="flex flex-wrap gap-3 text-sm">
                        {/* 项目标签 */}
                        <div className="relative">
                          {entry.project_tag ? (
                            <span 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm"
                              style={{ 
                                backgroundColor: 'var(--tag-blue-bg)', 
                                color: 'var(--tag-blue-text)',
                                borderColor: 'var(--tag-blue-border)'
                              }}
                              onClick={() => startEditTag(entry.id, 'project_tag', entry.project_tag || '')}
                            >
                              <span className="text-base">📁</span>
                              <span>{entry.project_tag}</span>
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm"
                              style={{ 
                                backgroundColor: 'var(--card-glass)', 
                                color: 'var(--text-muted)',
                                borderColor: 'var(--card-border)' 
                              }}
                              onClick={() => startEditTag(entry.id, 'project_tag', '')}
                            >
                              <span className="text-base">📁</span>
                              <span>+</span>
                            </span>
                          )}
                          {renderTagEditor(entry.id, 'project_tag')}
                        </div>
                        
                        {/* 日报标签 */}
                        <div className="relative">
                          {entry.daily_report_tag && entry.daily_report_tag !== '无' ? (
                            <span 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm"
                              style={{ 
                                backgroundColor: 'var(--tag-purple-bg)', 
                                color: 'var(--tag-purple-text)',
                                borderColor: 'var(--tag-purple-border)'
                              }}
                              onClick={() => startEditTag(entry.id, 'daily_report_tag', entry.daily_report_tag || '')}
                            >
                              <span className="text-base">
                                {entry.daily_report_tag === '核心进展' && '📈'}
                                {entry.daily_report_tag === '问题与卡点' && '🚫'}
                                {entry.daily_report_tag === '思考与困惑' && '🤔'}
                                {entry.daily_report_tag === 'AI学习' && '🤖'}
                              </span>
                              <span>{entry.daily_report_tag}</span>
                            </span>
                          ) : (
                            <span 
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-all duration-300 border backdrop-blur-sm"
                              style={{
                                backgroundColor: 'var(--tag-purple-bg)',
                                color: 'var(--tag-purple-text)',
                                borderColor: 'var(--tag-purple-border)'
                              }}
                              onClick={() => startEditTag(entry.id, 'daily_report_tag', entry.daily_report_tag || '无')}
                            >
                              <span className="text-base">📈</span>
                              <span>+</span>
                            </span>
                          )}
                          {renderTagEditor(entry.id, 'daily_report_tag')}
                        </div>
                        

                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mr-1">
                    <button
                      onClick={() => startEditEntry(entry)}
                      className="group/btn p-1.5 rounded-lg transition-all duration-300 border backdrop-blur-sm hover:bg-opacity-80"
                      style={{ 
                        color: 'var(--text-muted)',
                        borderColor: 'var(--card-border)',
                        backgroundColor: 'var(--card-glass)'
                      }}
                      title="编辑记录"
                    >
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openDeleteConfirm(entry.id)}
                      className="group/btn p-1.5 rounded-lg transition-all duration-300 border backdrop-blur-sm hover:bg-opacity-80"
                      style={{ 
                        color: 'var(--text-muted)',
                        borderColor: 'var(--card-border)',
                        backgroundColor: 'var(--card-glass)'
                      }}
                      title="删除"
                    >
                      <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

              </div>
            </Animated>
          ))}
        </div>
      )}
      
      {/* 编辑表单 */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <EditEntryForm
              entry={editingEntry}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          </div>
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
    </div>
  );
}