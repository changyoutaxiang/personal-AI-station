'use client';

import { useState, useEffect } from 'react';
import { fetchEntries, removeEntry, generateDailyReport, updateEntriesOrderAction, updateEntryAction } from '@/lib/actions';
import type { Entry } from '@/types/index';
import { debug } from '@/lib/debug';
import EditEntryForm from './EditEntryForm';
import { Animated } from './animations';
import { InteractiveCard, InteractiveButton } from './interactive';
import { createFadeInAnimation, createScaleAnimation } from '@/lib/animations';
import EmptyState from './ui/EmptyState';


export default function EntryList() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [dailyReport, setDailyReport] = useState<string>('');

  const [draggedEntry, setDraggedEntry] = useState<Entry | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
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
  }, []);

  const loadEntries = async () => {
    try {
      const result = await fetchEntries();
      if (result.success) {
        setEntries(result.data);
      }
    } catch (error) {
      debug.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('确定要删除这条记录吗？')) {
      const result = await removeEntry(id);
      if (result.success) {
        loadEntries();
      }
    }
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
  const handleSaveEdit = () => {
    setEditingEntry(null);
    loadEntries(); // 重新加载记录列表
  };

  // 取消记录编辑
  const handleCancelEdit = () => {
    setEditingEntry(null);
  };

  // 获取标签选项
  const getTagOptions = (tagType: string) => {
    switch (tagType) {
      case 'attribute_tag':
        return [
          { value: '今日跟进', label: '📅 今日跟进' },
          { value: '本周跟进', label: '📆 本周跟进' },
          { value: '本月提醒', label: '🗓️ 本月提醒' },
          { value: '无', label: '➖ 无' }
        ];
      case 'urgency_tag':
        return [
          { value: 'Jack 交办', label: '🔥 Jack 交办' },
          { value: '重要承诺', label: '⚡ 重要承诺' },
          { value: '临近 deadline', label: '⏰ 临近 deadline' },
          { value: '无', label: '➖ 无' }
        ];
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
            className="px-2 py-1 text-xs border rounded"
            placeholder="项目名称"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)' }}
            autoFocus
          />
          <button
            onClick={saveTagEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80"
            style={{ backgroundColor: 'var(--text-success)', color: 'white' }}
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80"
            style={{ backgroundColor: 'var(--text-muted)', color: 'white' }}
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
            className="px-2 py-1 text-xs border rounded"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)' }}
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
            className="px-2 py-1 text-xs rounded hover:opacity-80"
            style={{ backgroundColor: 'var(--text-success)', color: 'white' }}
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs rounded hover:opacity-80"
            style={{ backgroundColor: 'var(--text-muted)', color: 'white' }}
          >
            ✕
          </button>
        </div>
      );     }   };

  const handleGenerateReport = async () => {
    try {
      const result = await generateDailyReport();
      if (result.success && result.data) {
        setDailyReport(result.data);
        setShowReport(true);
      }
    } catch (error) {
      debug.error('生成日报失败:', error);
    }
  };

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

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, entry: Entry) => {
    debug.log('🎯 开始拖拽记录:', entry.id);
    setDraggedEntry(entry);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', entry.id.toString());
  };

  // 拖拽结束
  const handleDragEnd = () => {
    debug.log('🎯 拖拽结束');
    setDraggedEntry(null);
    setDragOverIndex(null);
    setIsDragging(false);
  };

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  // 拖拽离开
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // 只在离开整个拖拽区域时清除
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
    }
  };

  // 处理放置
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    debug.log('🎯 处理放置，目标位置:', dropIndex);
    
    if (!draggedEntry) {
      debug.log('❌ 没有被拖拽的记录');
      return;
    }

    const dragIndex = entries.findIndex(entry => entry.id === draggedEntry.id);
    if (dragIndex === -1 || dragIndex === dropIndex) {
      debug.log('❌ 无效的拖拽操作');
      return;
    }

    try {
      debug.log(`🔄 移动记录 ${draggedEntry.id} 从位置 ${dragIndex} 到 ${dropIndex}`);
      
      // 创建新的排序数组
      const newEntries = [...entries];
      const [movedEntry] = newEntries.splice(dragIndex, 1);
      newEntries.splice(dropIndex, 0, movedEntry);
      
      // 立即更新UI（乐观更新）
      setEntries(newEntries);
      
      // 准备排序更新数据
      const orderUpdates = newEntries.map((entry, index) => ({
        id: entry.id,
        sort_order: newEntries.length - index // 新记录排在前面，所以使用倒序
      }));
      
      debug.log('📝 批量更新排序:', orderUpdates.slice(0, 3));
      
      // 调用Server Action更新数据库
      const result = await updateEntriesOrderAction(orderUpdates);
      
      if (result.success) {
        debug.log('✅ 排序更新成功:', result.data);
      } else {
        debug.error('❌ 排序更新失败:', result.error);
        // 如果更新失败，恢复原始顺序
        loadEntries();
      }
    } catch (error) {
      debug.error('❌ 拖拽排序失败:', error);
      // 出错时恢复原始顺序
      loadEntries();
    } finally {
      setDraggedEntry(null);
      setDragOverIndex(null);
      setIsDragging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4" style={{borderColor: 'var(--card-border)', borderTopColor: 'var(--flow-primary)'}}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs animate-pulse" style={{color: 'var(--text-secondary)'}}>💭</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.length > 0 && (
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <h2 className="text-2xl font-bold flex items-center gap-3" style={{color: 'var(--foreground)'}}>
                <span className="text-3xl animate-thoughtBubble">📝</span>
                <span style={{color: 'var(--text-primary)'}}>
                  思维轨迹
                </span>
              </h2>
              <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--flow-primary)]/50 rounded-full"></div>
            </div>
            <div className="px-3 py-1 rounded-full border backdrop-blur-sm" style={{ backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)' }}>
              <span className="text-sm font-medium" style={{color: 'var(--text-secondary)'}}>{entries.length} 条记录</span>
            </div>
          </div>
          <div className="flex gap-2">

            <button
              onClick={handleGenerateReport}
              className="group px-6 py-3 rounded-xl hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm flex items-center gap-3"
              style={{
                backgroundColor: 'var(--flow-primary)',
                color: 'var(--text-on-primary)',
                border: '1px solid var(--flow-primary)'
              }}
            >
              <span className="text-lg group-hover:animate-bounce transition-transform duration-300">📊</span>
              <span className="font-medium">日报</span>
            </button>
          </div>
        </div>
      )}
      
      {/* 添加自定义动画样式 */}
      <style jsx>{`
        @keyframes thoughtBubble {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-5px) rotate(1deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          75% { transform: translateY(-5px) rotate(-1deg); }
        }
        
        .animate-thoughtBubble {
          animation: thoughtBubble 4s ease-in-out infinite;
        }
        
        .thought-card {
          position: relative;
          overflow: hidden;
        }
        
        .thought-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 12%, transparent), transparent);
          transition: left 0.5s;
        }
        
        .thought-card:hover::before {
          left: 100%;
        }
      `}</style>

      {showReport && (
        <div className="rounded-lg shadow-sm p-4 mb-4 border" style={{
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--card-border)',
          color: 'var(--text-primary)'
        }}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg">📊 今日日报</h3>
            <button
              onClick={() => setShowReport(false)}
              className="text-xl leading-none hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
              title="关闭"
            >
              ✕
            </button>
          </div>
          <pre className="whitespace-pre-wrap text-sm p-4 rounded border font-mono leading-relaxed" style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-primary)'
          }}>{dailyReport}</pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(dailyReport);
              alert('已复制到剪贴板');
            }}
            className="mt-3 px-4 py-2 rounded text-sm transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--flow-primary)',
              color: 'white'
            }}
          >
            📋 复制日报
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState 
          type="entries"
          size="large"
          action={{
            label: '创建第一条记录',
            onClick: () => {
              // 滚动到顶部的表单区域
              const formElement = document.querySelector('[data-entry-form]');
              if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth' });
                // 聚焦到表单的输入框
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {entries.map((entry, index) => (
            <Animated 
              key={entry.id}
              animation="fadeIn"
              delay={index * 50}
              className="group relative backdrop-blur-md rounded-2xl px-6 pt-6 pb-2 transition-all duration-300 cursor-move hover:shadow-xl hover:scale-[1.02] glass-border-soft overflow-hidden"
              style={{ backgroundColor: 'var(--card-glass)' }}
            >
              <div
                className={`h-full rounded-2xl overflow-hidden`}
                style={{
                  backgroundColor: 'var(--card-glass)',
                  ...(draggedEntry?.id === entry.id ? {
                    opacity: 0.5,
                    transform: 'rotate(2deg) scale(1.05)',
                    outline: '1px solid var(--flow-primary)',
                    boxShadow: '0 0 0 1px var(--flow-primary), 0 10px 25px color-mix(in oklab, var(--flow-primary) 30%, transparent)'
                  } : {}),
                  ...(dragOverIndex === index ? {
                    borderTop: '4px solid var(--flow-primary)',
                    backgroundColor: 'color-mix(in oklab, var(--flow-primary) 20%, transparent)'
                  } : {})
                }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, entry)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
                title="拖拽可重新排序记录"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    {/* 拖拽手柄 */}
                    <div className={`flex-shrink-0 mt-1 transition-all duration-300`}
                         style={{
                           color: isDragging ? 'var(--flow-primary)' : 'var(--text-muted)',
                           transform: isDragging ? 'scale(1.1)' : 'scale(1)'
                         }}
                         onMouseEnter={(e) => {
                           if (!isDragging) {
                             e.currentTarget.style.color = 'var(--text-secondary)';
                           }
                         }}
                         onMouseLeave={(e) => {
                           if (!isDragging) {
                             e.currentTarget.style.color = 'var(--text-muted)';
                           }
                         }}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                    </svg>
                  </div>
                  
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
                      
                      {/* 紧急标签 */}
                      <div className="relative">
                        {entry.attribute_tag && entry.attribute_tag !== '无' ? (
                          <span 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm"
                            style={{ 
                              backgroundColor: 'var(--tag-green-bg)', 
                              color: 'var(--tag-green-text)',
                              borderColor: 'var(--tag-green-border)' 
                            }}
                            onClick={() => startEditTag(entry.id, 'attribute_tag', entry.attribute_tag || '')}
                          >
                            <span className="text-base">
                              {entry.attribute_tag === '今日跟进' && '📅'}
                              {entry.attribute_tag === '本周跟进' && '📆'}
                              {entry.attribute_tag === '本月提醒' && '🗓️'}
                            </span>
                            <span>{entry.attribute_tag}</span>
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-all duration-300 border backdrop-blur-sm"
                            style={{
                              backgroundColor: 'var(--card-glass)',
                              color: 'var(--text-muted)',
                              borderColor: 'var(--card-border)'
                            }}
                            onClick={() => startEditTag(entry.id, 'attribute_tag', entry.attribute_tag || '无')}
                          >
                            <span className="text-base">📅</span>
                            <span>+</span>
                          </span>
                        )}
                        {renderTagEditor(entry.id, 'attribute_tag')}
                      </div>
                      
                      {/* 重要标签 */}
                      <div className="relative">
                        {entry.urgency_tag && entry.urgency_tag !== '无' ? (
                          <span 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm"
                            style={{ 
                              backgroundColor: 'var(--tag-red-bg)', 
                              color: 'var(--tag-red-text)',
                              borderColor: 'var(--tag-red-border)' 
                            }}
                            onClick={() => startEditTag(entry.id, 'urgency_tag', entry.urgency_tag || '')}
                          >
                            <span className="text-base">
                              {entry.urgency_tag === 'Jack 交办' && '🔥'}
                              {entry.urgency_tag === '重要承诺' && '⚡'}
                              {entry.urgency_tag === '临近 deadline' && '⏰'}
                            </span>
                            <span>{entry.urgency_tag}</span>
                          </span>
                        ) : (
                          <span 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-all duration-300 border backdrop-blur-sm"
                            style={{ 
                              backgroundColor: 'var(--card-glass)', 
                              color: 'var(--text-muted)',
                              borderColor: 'var(--card-border)' 
                            }}
                            onClick={() => startEditTag(entry.id, 'urgency_tag', entry.urgency_tag || '无')}
                          >
                            <span className="text-base">🔥</span>
                            <span>+</span>
                          </span>
                        )}
                        {renderTagEditor(entry.id, 'urgency_tag')}
                      </div>
                      
                      {/* 日报标签 */}
                      <div className="relative">
                        {entry.daily_report_tag && entry.daily_report_tag !== '无' ? (
                          <span 
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all duration-300 border backdrop-blur-sm"
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
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => startEditEntry(entry)}
                    className="group/btn p-2 rounded-lg transition-all duration-300 border backdrop-blur-sm hover:bg-opacity-80"
                    style={{ 
                      color: 'var(--text-muted)',
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--card-glass)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--flow-primary) 15%, transparent)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--flow-primary) 30%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card-glass)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                    }}
                    title="编辑记录"
                  >
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="group/btn p-2 rounded-lg transition-all duration-300 border backdrop-blur-sm hover:bg-opacity-80"
                    style={{ 
                      color: 'var(--text-muted)',
                      borderColor: 'var(--card-border)',
                      backgroundColor: 'var(--card-glass)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'color-mix(in oklab, var(--tag-red-text) 15%, transparent)';
                      e.currentTarget.style.color = 'var(--tag-red-text)';
                      e.currentTarget.style.borderColor = 'color-mix(in oklab, var(--tag-red-text) 30%, transparent)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--card-glass)';
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.borderColor = 'var(--card-border)';
                    }}
                    title="删除"
                  >
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm mt-4 pt-4 pb-3 border-t" style={{color: 'var(--text-muted)', borderColor: 'var(--card-border)'}}>
                <span className="font-medium">{formatDate(entry.created_at)}</span>
                {draggedEntry?.id === entry.id && (
                  <span className="font-medium animate-pulse" style={{color: 'var(--flow-primary)'}}>正在移动...</span>
                )}
              </div>
              
              {/* 玻璃拟态装饰 */}
              <div className="absolute top-0 left-0 w-full h-full rounded-2xl pointer-events-none" style={{background: 'linear-gradient(to bottom right, color-mix(in oklab, var(--foreground) 8%, transparent), transparent)'}}></div>
              <div className="absolute top-2 left-2 w-8 h-8 rounded-full blur-xl pointer-events-none" style={{background: 'color-mix(in oklab, var(--foreground) 10%, transparent)'}}></div>
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
    </div>
  );
}