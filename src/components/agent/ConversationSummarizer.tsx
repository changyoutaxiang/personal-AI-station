'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface ConversationSummarizerProps {
  conversationId: number;
  messageCount: number;
  onSummaryGenerated?: (summary: string) => void;
}

export default function ConversationSummarizer({ 
  conversationId, 
  messageCount,
  onSummaryGenerated 
}: ConversationSummarizerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isCompressed, setIsCompressed] = useState(false);

  // 生成对话总结
  const handleGenerateSummary = async () => {
    if (!conversationId || messageCount < 10) {
      toast.error('对话需要至少10条消息才能生成总结');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/agent/conversations/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId,
          type: 'summary' // 总结类型
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
        onSummaryGenerated?.(data.summary);
        toast.success('对话总结生成成功');
      } else {
        toast.error(`生成总结失败: ${data.error}`);
      }
    } catch (error) {
      console.error('生成总结失败:', error);
      toast.error('生成总结失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 压缩历史记录
  const handleCompressHistory = async () => {
    if (!conversationId || messageCount < 20) {
      toast.error('对话需要至少20条消息才能进行压缩');
      return;
    }

    if (!window.confirm('压缩历史记录将替换早期消息为总结，此操作不可逆转。确定要继续吗？')) {
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/agent/conversations/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conversationId,
          keepRecentCount: 10 // 保留最近10条消息
        }),
      });

      const data = await response.json();
      if (data.success) {
        setIsCompressed(true);
        toast.success(`历史记录已压缩，节省了 ${data.tokensSaved || 0} 个token`);
        // 可以触发消息列表重新加载
        window.location.reload();
      } else {
        toast.error(`压缩失败: ${data.error}`);
      }
    } catch (error) {
      console.error('压缩失败:', error);
      toast.error('压缩失败');
    } finally {
      setIsGenerating(false);
    }
  };

  // 如果消息数量不足，不显示组件
  if (messageCount < 5) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* 总结功能 */}
      {messageCount >= 10 && (
        <div 
          className="p-3 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card-glass)', 
            borderColor: 'var(--card-border)' 
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                对话总结
              </span>
            </div>
            <button
              onClick={handleGenerateSummary}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--flow-primary)', 
                color: 'white' 
              }}
            >
              {isGenerating ? '生成中...' : '生成总结'}
            </button>
          </div>

          {summary ? (
            <div 
              className="p-3 rounded-lg text-sm leading-relaxed"
              style={{ 
                backgroundColor: 'var(--background)', 
                color: 'var(--text-primary)' 
              }}
            >
              {summary}
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              为长对话生成简洁的总结，便于快速回顾对话要点
            </p>
          )}
        </div>
      )}

      {/* 压缩功能 */}
      {messageCount >= 20 && !isCompressed && (
        <div 
          className="p-3 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--card-glass)', 
            borderColor: 'var(--card-border)' 
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                历史压缩
              </span>
              <span className="px-2 py-1 text-xs rounded-full bg-orange-500/10 text-orange-500">
                Beta
              </span>
            </div>
            <button
              onClick={handleCompressHistory}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs rounded-lg font-medium transition-colors disabled:opacity-50"
              style={{ 
                backgroundColor: 'var(--flow-secondary)', 
                color: 'white' 
              }}
            >
              {isGenerating ? '压缩中...' : '压缩历史'}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              将早期对话压缩为总结，保留最近的消息，可显著减少token消耗
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>📊 当前消息: {messageCount}条</span>
              <span>🎯 预计节省: ~{Math.round(messageCount * 0.6)}条</span>
              <span>💰 Token优化: 高</span>
            </div>
          </div>
        </div>
      )}

      {/* 已压缩提示 */}
      {isCompressed && (
        <div 
          className="p-3 rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800"
        >
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">历史记录已压缩</span>
          </div>
          <p className="text-xs mt-1 text-green-600 dark:text-green-300">
            早期对话已转换为总结，token消耗已优化
          </p>
        </div>
      )}
    </div>
  );
}
