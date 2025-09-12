'use client';

import { useState } from 'react';
import { updateEntryAction, polishTextAction } from '@/lib/actions';
import { trackEvent } from '@/lib/client-tracker';
import type { Entry } from '@/types/index';
import AIQuestions from './AIQuestions';
import { debug } from '@/lib/debug';
import MinimalistAgent from './MinimalistAgent';

interface EditEntryFormProps {
  entry: Entry;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditEntryForm({ entry, onSave, onCancel }: EditEntryFormProps) {
  const [content, setContent] = useState(entry.content);
  const [projectTag, setProjectTag] = useState(entry.project_tag || '');
  const [dailyReportTag, setDailyReportTag] = useState(entry.daily_report_tag || '无');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  // 智能体状态
  const [showMinimalistAgent, setShowMinimalistAgent] = useState(false);

  // 文本润色功能
  const handlePolish = async () => {
    if (!content.trim()) {
      setMessage('❌ 请先输入内容');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (content.length > 500) {
      setMessage('❌ 文本长度超过500字符，请缩短后再试');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsPolishing(true);
    setMessage('✨ AI正在润色文本...');
    setShowComparison(false);
    setPolishedText(null);

    try {
      const result = await polishTextAction(content);
      
      trackEvent.aiInteraction('text_polish', {
        original_length: content.length,
        success: result.success
      });
      
      if (result.success && result.polishedText) {
        setPolishedText(result.polishedText);
        setShowComparison(true);
        setMessage('✅ 润色完成！请选择是否使用优化后的文本');
      } else {
        setMessage(`❌ ${result.error || '润色失败，请重试'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      debug.error('润色请求失败:', error);
      setMessage('❌ 网络错误，请检查连接后重试');
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsPolishing(false);
    }
  };

  // 接受润色结果
  const acceptPolish = () => {
    if (polishedText) {
      setContent(polishedText);
      setPolishedText(null);
      setShowComparison(false);
      setMessage('✅ 已应用润色结果');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 拒绝润色结果
  const rejectPolish = () => {
    setPolishedText(null);
    setShowComparison(false);
    setMessage('保持原文不变');
    setTimeout(() => setMessage(''), 3000);
  };

  // 智能体对话处理
  const handleAgentChat = async (agentType: 'leader' | 'minimalist' | 'intelligent') => {
    if (!content.trim()) {
      setMessage('❌ 请先输入内容');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    // 根据智能体类型打开相应的组件
    switch (agentType) {
      case 'minimalist':
        setShowMinimalistAgent(true);
        break;
      case 'leader':
        // 这里将来会集成领导智能体
        setMessage('🤖 领导智能体正在开发中...');
        setTimeout(() => setMessage(''), 3000);
        break;
      case 'intelligent':
        // 这里将来会集成智能智能体
        setMessage('🤖 智能智能体正在开发中...');
        setTimeout(() => setMessage(''), 3000);
        break;
    }

    // 追踪智能体交互
    trackEvent.aiInteraction('agent_chat', {
      agent_type: agentType,
      content_length: content.length
    });
  };

  // 处理智能体响应
  const handleAgentResponse = () => {
    // 可以选择将响应插入到内容中，或者显示在其他地方
    setMessage('✅ 智能体分析完成');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage('内容不能为空');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const updates = {
        content: content.trim(),
        project_tag: projectTag || undefined,
        daily_report_tag: dailyReportTag,
      };

      debug.log('🚀 更新记录:', { id: entry.id, updates });
      
      const result = await updateEntryAction(entry.id, updates);
      
      if (result.success) {
        debug.log('✅ 记录更新成功');
        
        // 追踪内容编辑行为
        trackEvent.contentEdit(entry.id, {
          content_changed: content !== entry.content,
          project_tag_changed: projectTag !== entry.project_tag,
          tags_changed: dailyReportTag !== entry.daily_report_tag
        });
        
        setMessage('✅ 记录更新成功！');
        setTimeout(() => {
          setMessage('');
          onSave();
        }, 1000);
      } else {
        debug.error('❌ 服务器返回错误:', result.error);
        setMessage(`❌ 更新失败：${result.error || '未知错误'}`);
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (error) {
      debug.error('❌ 网络请求失败:', error);
      setMessage(`❌ 网络错误：${error instanceof Error ? error.message : '请重试'}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-blue-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">✏️ 编辑记录</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          title="取消编辑"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  e.preventDefault();
                  const form = e.currentTarget.form;
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              placeholder="记录今天的重要信息、想法、会议内容... (Ctrl+Enter 快速保存)"
              className="w-full px-3 py-2 pb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 bg-blue-50"
              rows={6}
              required
            />
            <span className="absolute bottom-2 right-3 text-xs text-gray-400 pointer-events-none">
              {content.length} 字符
            </span>
          </div>

          {/* AI功能区 */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            {/* 润色按钮 */}
            <button
              type="button"
              onClick={handlePolish}
              disabled={isPolishing || !content.trim() || content.length > 500}
              className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                isPolishing 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              ✨ {isPolishing ? '润色中...' : '润色'}
            </button>
            
            {/* AI提问按钮 */}
            <AIQuestions 
              content={content}
              onQuestionInsert={(question) => {
                setContent(prev => prev + '\n\n' + question);
              }}
            />
            
            {/* 智能体按钮区域 */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200">
              {/* 领导智能体 */}
              <button
                type="button"
                onClick={() => handleAgentChat('leader')}
                disabled={!content.trim()}
                className="px-3 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="以领导视角分析内容"
              >
                👔 领导
              </button>
              
              {/* 极简智能体 */}
              <button
                type="button"
                onClick={() => handleAgentChat('minimalist')}
                disabled={!content.trim()}
                className="px-3 py-2 text-sm rounded-lg flex items-center gap-2 bg-green-100 text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="极简化处理内容"
              >
                ⚡ 极简
              </button>
              
              {/* 智能智能体 */}
              <button
                type="button"
                onClick={() => handleAgentChat('intelligent')}
                disabled={!content.trim()}
                className="px-3 py-2 text-sm rounded-lg flex items-center gap-2 bg-orange-100 text-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                title="智能分析和建议"
              >
                🧠 智能
              </button>
            </div>
          </div>

          {/* 润色结果对比区域 */}
          {showComparison && polishedText && (
            <div className="mt-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-purple-800">💡 AI润色建议</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={acceptPolish}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-full transition-colors"
                  >
                    ✓ 使用此版本
                  </button>
                  <button
                    type="button"
                    onClick={rejectPolish}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    保持原文
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">原文：</p>
                  <p className="text-sm text-gray-800 bg-white p-2 rounded border">{content}</p>
                </div>
                <div>
                  <p className="text-xs text-purple-600 mb-1">润色后：</p>
                  <p className="text-sm text-purple-800 bg-white p-2 rounded border font-medium">{polishedText}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 标签设置区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* 项目标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📁 项目</label>
            <input
              type="text"
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
              placeholder="输入项目名称"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 日报分类 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">📈 日报</label>
            <select
              value={dailyReportTag}
              onChange={(e) => setDailyReportTag(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="无" className="text-gray-900">➖ 无</option>
              <option value="核心进展" className="text-gray-900">📈 核心进展</option>
              <option value="问题与卡点" className="text-gray-900">🚫 问题与卡点</option>
              <option value="思考与困惑" className="text-gray-900">🤔 思考与困惑</option>
              <option value="AI学习" className="text-gray-900">🤖 AI学习</option>
            </select>
          </div>
        </div>

        {/* 消息显示 */}
        {message && (
          <div className={`mb-4 p-3 rounded-md text-sm ${
            message.includes('✅') 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : message.includes('❌') 
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className={`px-6 py-2 rounded-md transition-colors ${
              isSubmitting || !content.trim()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? '保存中...' : '保存更改'}
          </button>
        </div>
      </form>
      
      {/* 极简智能体组件 */}
      <MinimalistAgent
        content={content}
        onResponse={handleAgentResponse}
        isVisible={showMinimalistAgent}
        onClose={() => setShowMinimalistAgent(false)}
      />
    </div>
  );
}