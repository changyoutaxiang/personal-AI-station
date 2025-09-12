'use client';

import { useState, useEffect } from 'react';
import { fetchEntries, removeEntry, generateDailyReport, updateEntryAction } from '@/lib/actions';
import type { Entry } from '@/types/index';
import { debug } from '@/lib/debug';
import EditEntryForm from './EditEntryForm';
import { Animated } from './animations';
import { InteractiveCard, InteractiveButton } from './interactive';
import { createFadeInAnimation, createScaleAnimation } from '@/lib/animations';
import EmptyState from './ui/EmptyState';
import ConfirmDialog from './ui/ConfirmDialog';


export default function EntryList() {
  console.log('🚀 EntryList 组件已加载');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [dailyReport, setDailyReport] = useState<string>('');

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
  }, []);

  const loadEntries = async () => {
    try {
      console.log('🔄 开始加载记录...');
      const result = await fetchEntries();
      console.log('📦 fetchEntries 返回结果:', result);
      
      if (result.success) {
        console.log('✅ 成功获取记录数据:', result.data.length, '条记录');
        console.log('🔍 前3条记录的标签数据:', result.data.slice(0, 3).map(e => ({
          id: e.id,
          project_tag: e.project_tag,
          daily_report_tag: e.daily_report_tag
        })));
        setEntries(result.data);
      } else {
        console.error('❌ 加载记录失败:', result.error);
        debug.error('加载记录失败:', result.error);
        setEntries([]);
      }
    } catch (error) {
      console.error('💥 loadEntries 异常:', error);
      debug.error('加载记录失败:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
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
        // 处理新的返回格式
        if (typeof result.data === 'string') {
          // 向后兼容旧格式
          setDailyReport(result.data);
        } else if (result.data.type === 'simple' || result.data.type === 'fallback') {
          // 简单格式或回退格式
          setDailyReport(result.data.content || '报告内容为空');
        } else if (result.data.type === 'ai_enhanced' && result.data.analysis) {
          // AI增强格式 - 转换为可读文本
          const analysis = result.data.analysis;
          const reportText = `# ${analysis.date} AI智能日报

## 📊 执行总结
${analysis.executive_summary}

## 🎯 核心成就
${analysis.key_achievements.map((achievement: string, index: number) => `${index + 1}. ${achievement}`).join('\n')}

## 📈 效率分析
**完成率评估**: ${analysis.efficiency_analysis?.completion_rate_assessment || '暂无'}
**时间分配**: ${analysis.efficiency_analysis?.time_allocation || '暂无'}  
**精力管理**: ${analysis.efficiency_analysis?.energy_management || '暂无'}

## 💡 关键洞察
${analysis.insights.map((insight: string, index: number) => `${index + 1}. ${insight}`).join('\n')}

${analysis.bottlenecks && analysis.bottlenecks.length > 0 ? `## ⚠️ 发现瓶颈
${analysis.bottlenecks.map((bottleneck: string, index: number) => `${index + 1}. ${bottleneck}`).join('\n')}` : ''}

## 🚀 明日优化
**优先关注**: ${analysis.tomorrow_optimization?.priority_focus || '暂无'}
**方法建议**: ${analysis.tomorrow_optimization?.method_suggestions || '暂无'}
**习惯调整**: ${analysis.tomorrow_optimization?.habit_adjustments || '暂无'}

## ✅ 行动建议
${analysis.actionable_tips.map((tip: string, index: number) => `${index + 1}. ${tip}`).join('\n')}

---
*由AI智能分析生成 - ${new Date().toLocaleString('zh-CN')}*`;
          setDailyReport(reportText);
        } else {
          setDailyReport('未知的报告格式');
        }
        setShowReport(true);
        
        // 显示警告信息（如果有）
        if (typeof result.data === 'object' && result.data.warning) {
          debug.log('⚠️ 日报生成警告:', result.data.warning);
        }
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
                  backgroundColor: 'var(--card-glass)'
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-start gap-3 flex-1">

                  
                  <div className="flex-1 min-w-0">
                    <p className="whitespace-pre-wrap mb-4 leading-relaxed font-medium" style={{color: 'var(--foreground)'}}>{entry.content}</p>
                  
                    <div className="flex flex-wrap gap-3 text-sm">
                      {/* 项目标签 */}
                      <div className="relative">
                        {(() => {
                          return entry.project_tag && entry.project_tag !== '无' ? (
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
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-80 transition-all duration-300 border backdrop-blur-sm"
                              style={{
                                backgroundColor: 'var(--tag-blue-bg)',
                                color: 'var(--tag-blue-text)',
                                borderColor: 'var(--tag-blue-border)'
                              }}
                              onClick={() => startEditTag(entry.id, 'project_tag', entry.project_tag || '无')}
                            >
                              <span className="text-base">📁</span>
                              <span>+</span>
                            </span>
                          );
                        })()}
                        {renderTagEditor(entry.id, 'project_tag')}
                      </div>
                      

                      
                      {/* 日报标签 */}
                      <div className="relative">
                        {(() => {
                          return entry.daily_report_tag && entry.daily_report_tag !== '无' ? (
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
                          );
                        })()}
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
                    onClick={() => openDeleteConfirm(entry.id)}
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
                <span className="font-medium">条目 #{entry.id}</span>
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