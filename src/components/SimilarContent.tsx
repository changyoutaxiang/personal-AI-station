'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { findSimilarEntriesAction, mergeEntriesAction, updateEntryAction } from '@/lib/actions';
import { debug } from '@/lib/debug';

interface SimilarEntry {
  id: number;
  content: string;
  similarity: number;
  project_tag?: string;
  attribute_tag?: string;
  urgency_tag?: string;
  daily_report_tag?: string;
  ai_score?: number;
  ai_reason?: string;
  basic_score?: number;
  fallback?: boolean;
}

interface SimilarContentProps {
  content: string;
  entryId?: number; // 当前记录的ID（编辑时使用）
  onMergeComplete?: () => void;
}

export default function SimilarContent({ content, entryId, onMergeComplete }: SimilarContentProps) {
  const [similarEntries, setSimilarEntries] = useState<SimilarEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<number>>(new Set());
  const [mergeContent, setMergeContent] = useState('');
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  
  // 标签编辑相关状态
  const [editingTag, setEditingTag] = useState<{ entryId: number; tagType: string } | null>(null);
  const [editingValue, setEditingValue] = useState('');

  // 监听 showMergeDialog 状态变化
  useEffect(() => {
    debug.log('🔗 showMergeDialog changed to:', showMergeDialog);
  }, [showMergeDialog]);

  // 相似内容检查函数 - 用useCallback避免无限循环
  const checkSimilarContent = useCallback(async (searchContent: string) => {
    if (!searchContent.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await findSimilarEntriesAction(searchContent);
      
      if (result.success && result.similarEntries) {
        // 过滤掉当前记录本身
        const filteredEntries = result.similarEntries.filter(entry => 
          entryId ? entry.id !== entryId : true
        );
        
        setSimilarEntries(filteredEntries);
        setIsVisible(filteredEntries.length > 0);
        
        // 只在找到相似内容时记录日志
        if (filteredEntries.length > 0) {
          debug.log(`🔗 Found ${filteredEntries.length} similar entries with max similarity: ${Math.max(...filteredEntries.map(e => e.similarity))}%`);
        }
      }
    } catch (error) {
      debug.error('❌ Similarity check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [entryId]);

  // 防抖逻辑 - 使用useRef存储timeout ID
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // 防抖函数 - 避免频繁的API调用
  const debouncedCheckSimilarContent = useCallback((searchContent: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      checkSimilarContent(searchContent);
    }, 800); // 800ms防抖延迟
  }, [checkSimilarContent]);

  // 手动触发相似内容查找的函数
  const triggerSimilarityCheck = useCallback(() => {
    if (content && content.trim().length >= 10) {
      checkSimilarContent(content);
    } else {
      setSimilarEntries([]);
      setIsVisible(false);
    }
  }, [content, checkSimilarContent]);

  // 暴露手动触发函数给父组件
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).triggerSimilarityCheck = triggerSimilarityCheck;
    }
  }, [triggerSimilarityCheck]);

  const handleSelectEntry = (entryId: number) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleMergeClick = () => {
    debug.log('🔗 handleMergeClick called, selectedEntries size:', selectedEntries.size);
    debug.log('🔗 selectedEntries:', Array.from(selectedEntries));
    
    if (selectedEntries.size === 0) {
      alert('请先选择要合并的记录');
      return;
    }
    
    // 准备合并的内容
    const selectedContent = similarEntries
      .filter(entry => selectedEntries.has(entry.id))
      .map(entry => entry.content)
      .join('\n\n---\n\n');
    
    debug.log('🔗 Setting merge content and showing dialog...');
    setMergeContent(`${content}\n\n---\n\n${selectedContent}`);
    setShowMergeDialog(true);
    debug.log('🔗 showMergeDialog should now be true');
  };

  const handleConfirmMerge = async () => {
    // 新记录合并：只需要选中的条目即可，entryId 可以为 undefined
    if (selectedEntries.size === 0) return;

    setIsMerging(true);
    try {
      debug.log('🔗 Starting merge process...', {
        entryId,
        selectedEntries: Array.from(selectedEntries),
        mergeContentLength: mergeContent.length
      });

      const result = await mergeEntriesAction(
        entryId, // 可能为 undefined（新记录），也可能有值（编辑已有记录）
        Array.from(selectedEntries),
        mergeContent
      );
      
      debug.log('🔗 Merge action result:', result);
      
      if (result.success) {
        debug.log('✅ Merge completed successfully');
        
        // 关闭对话框和相似内容显示
        setShowMergeDialog(false);
        setIsVisible(false);
        
        // 清空选择状态
        setSelectedEntries(new Set());
        
        // 通知合并完成
        onMergeComplete?.();
        
        // 延迟一小段时间确保状态更新完成
        setTimeout(() => {
          debug.log('🔗 Merge cleanup completed');
        }, 100);
      } else {
        debug.error('❌ Merge failed:', result.error);
        alert('合并失败：' + result.error);
      }
    } catch (error) {
      debug.error('❌ Merge error:', error);
      alert('合并失败，请重试');
    } finally {
      setIsMerging(false);
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
        // 更新本地状态
        setSimilarEntries(prev => prev.map(entry => 
          entry.id === editingTag.entryId 
            ? { ...entry, [editingTag.tagType]: editingValue || undefined }
            : entry
        ));
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
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
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
            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
          >
            ✓
          </button>
          <button
            onClick={cancelEdit}
            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            ✕
          </button>
        </div>
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 移除了过时的5星评级系统

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-sm text-blue-800">🔍 正在智能检测相似内容...</span>
        </div>
      </div>
    );
  }

  if (!isVisible || similarEntries.length === 0) {
    return null;
  }

  return (
    <>
      {/* 相似内容提示 */}
      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-sm font-medium text-orange-800 mb-1">
              🔗 发现相似内容
            </h4>
            <p className="text-xs text-orange-600 mb-2">
              找到 {similarEntries.length} 条相似记录，请<strong>勾选要合并的记录</strong>，然后点击下方的合并按钮
            </p>
            
            {/* 相似内容列表 */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {similarEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 p-2 bg-white rounded border"
                >
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => handleSelectEntry(entry.id)}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-900 line-clamp-2">
                      {entry.content.length > 80 
                        ? entry.content.substring(0, 80) + '...'
                        : entry.content
                      }
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-purple-600 font-medium">
                        {entry.similarity.toFixed(1)}% 相似
                      </span>
                      {entry.ai_score && (
                        <span className="text-xs text-green-600 bg-green-50 px-1 rounded">
                          AI:{entry.ai_score}分
                        </span>
                      )}
                      {entry.fallback && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1 rounded">
                          基础算法
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        条目 #{entry.id}
                      </span>
                    </div>
                    
                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {/* 项目标签 */}
                      {entry.project_tag && entry.project_tag !== '无' ? (
                        <span 
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full cursor-pointer hover:bg-blue-200"
                          onClick={() => startEditTag(entry.id, 'project_tag', entry.project_tag || '')}
                        >
                          📁 {entry.project_tag}
                        </span>
                      ) : (
                        <span 
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full cursor-pointer hover:bg-gray-200"
                          onClick={() => startEditTag(entry.id, 'project_tag', '')}
                        >
                          📁 +
                        </span>
                      )}
                      

                      
                      {/* 日报标签 */}
                      {entry.daily_report_tag && entry.daily_report_tag !== '无' ? (
                        <span 
                          className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full cursor-pointer hover:bg-purple-200"
                          onClick={() => startEditTag(entry.id, 'daily_report_tag', entry.daily_report_tag || '')}
                        >
                          {entry.daily_report_tag === '核心进展' && '📈'}
                          {entry.daily_report_tag === '问题与卡点' && '🚫'}
                          {entry.daily_report_tag === '思考与困惑' && '🤔'}
                          {entry.daily_report_tag === 'AI学习' && '🤖'}
                          {' '}{entry.daily_report_tag}
                        </span>
                      ) : (
                        <span 
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full cursor-pointer hover:bg-gray-200"
                          onClick={() => startEditTag(entry.id, 'daily_report_tag', '无')}
                        >
                          📈 +
                        </span>
                      )}
                      
                      {/* 标签编辑器 */}
                      {renderTagEditor(entry.id, 'project_tag')}
                       {renderTagEditor(entry.id, 'daily_report_tag')}
                    </div>
                    {entry.ai_reason && !entry.fallback && (
                      <div className="mt-1 p-1 bg-green-50 rounded text-xs text-green-800">
                        💡 {entry.ai_reason}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 p-1 text-orange-400 hover:text-orange-600 hover:bg-orange-100 rounded transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2 mt-3">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleMergeClick();
            }}
            disabled={selectedEntries.size === 0}
            className="px-3 py-1.5 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            合并选中的记录 ({selectedEntries.size})
          </button>
        </div>
      </div>

      {/* 合并确认对话框 */}
      {(() => {
        if (showMergeDialog) {
          debug.log('🔗 Rendering merge dialog, mergeContent length:', mergeContent.length);
        }
        return showMergeDialog;
      })() && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-16"
          onClick={(e) => {
            // 点击背景关闭对话框，但要防止事件冒泡
            if (e.target === e.currentTarget) {
              debug.log('🔗 Background clicked, closing dialog');
              setShowMergeDialog(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => {
              // 防止点击对话框内容时关闭对话框
              e.stopPropagation();
            }}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                🔗 合并记录
              </h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  debug.log('🔗 Close button clicked');
                  setShowMergeDialog(false);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {/* 内容区域 */}
            <div className="p-4">
              <p className="text-sm text-gray-800 mb-3">
                请编辑合并后的内容。系统已自动将所选记录合并，您可以进一步编辑：
              </p>
              
              <textarea
                value={mergeContent}
                onChange={(e) => setMergeContent(e.target.value)}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="编辑合并后的内容..."
              />
              
              <div className="text-xs text-gray-700 mt-2">
                ⚠️ 合并操作将删除所选的原始记录，请确认内容无误后再执行
              </div>
            </div>

            {/* 底部操作区 */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowMergeDialog(false)}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmMerge}
                  disabled={isMerging || !mergeContent.trim()}
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isMerging ? (
                    <>
                      <div className="inline-block w-3 h-3 mr-2 animate-spin rounded-full border border-white border-t-transparent"></div>
                      合并中...
                    </>
                  ) : (
                    '确认合并'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}