'use client';

import { useState, useEffect, useRef } from 'react';
import { addEntry, polishTextAction } from '@/lib/actions';
import { trackEvent } from '@/lib/client-tracker';
import { debug } from '@/lib/debug';
import AIQuestions from './AIQuestions';
import SimilarContent from './SimilarContent';
import { InteractiveButton } from './interactive';


interface EntryFormProps {
  initialContent?: string;
}

export default function EntryForm({ initialContent = '' }: EntryFormProps) {
  const [content, setContent] = useState(initialContent);
  const [projectTag, setProjectTag] = useState('无');

  // 高级选项状态（恢复完整功能）

  const [dailyReportTag, setDailyReportTag] = useState('无');


  
  // AI功能状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  
  









  const handleInputChange = (text: string) => {
    setContent(text);
  };




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
      // 使用统一的润色功能
      const result = await polishTextAction(content);
      
      // 追踪AI交互
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



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage('内容不能为空');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    
    const formData = new FormData();
    formData.append('content', content);
    formData.append('project_tag', projectTag);


    formData.append('daily_report_tag', dailyReportTag);


    formData.append('effort_tag', '轻松');

    try {
      debug.log('🚀 Submitting form with data:', {
        content: content.slice(0, 50) + '...',
        projectTag
      });
      
      const result = await addEntry(formData);
      debug.log('📥 Server response:', result);
      
      if (result.success) {
        debug.log('✅ Entry saved successfully');
        
        // 追踪内容创建行为
        trackEvent.contentCreate(content.length, projectTag || undefined);
        
        // 追踪标签使用
        if (projectTag) {
          trackEvent.tagUsage('project', projectTag);
        }

        
        setContent('');
        setProjectTag('无');

        setDailyReportTag('无');
        

        setMessage('✅ 记录保存成功！');
        setTimeout(() => setMessage(''), 3000);
        
        // 触发父组件刷新列表
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('entryAdded'));
        }
      } else {
        debug.error('❌ Server returned error:', result.error);
        setMessage(`❌ 保存失败：${result.error || '未知错误'}`);
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
    <>
    <form onSubmit={handleSubmit} className="space-y-4" data-entry-form>
      {/* 第一层：核心输入区（平衡模式：始终可见，简化设计） */}
      <div className="space-y-4">
        {/* 输入区域和AI按钮的响应式布局 */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* 文本输入区域 */}
          <div className="flex-1 relative">
            <textarea
              id="content"
              value={content}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.ctrlKey && e.key === 'Enter') {
                  e.preventDefault();
                  const form = e.currentTarget.form;
                  if (form) {
                    form.requestSubmit();
                  }
                }
              }}
              placeholder="记录你的想法... (Ctrl+Enter 快速保存)"
              className="w-full h-40 md:h-56 p-3 md:p-4 border rounded-xl resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50 focus:border-[var(--flow-primary)]/50 text-sm md:text-base"
              style={{
                backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.1))',
                borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
                color: 'var(--text-primary)',
                '--placeholder-color': 'var(--text-secondary)'
              } as React.CSSProperties & { '--placeholder-color': string }}
              rows={5}
              required
              disabled={isSubmitting}
            />
            <div className="absolute bottom-3 right-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              {content.length}/1000
            </div>
          </div>

          {/* AI功能按钮区域（响应式排列） */}
          <div className="flex flex-row md:flex-col gap-3 justify-center md:justify-start pt-2">
            {/* 文本润色 */}
            <button
              onClick={handlePolish}
              disabled={isPolishing || !content.trim() || content.length > 500}
              className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 shadow-sm border-2 ${
                isPolishing 
                  ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed shadow-none border-gray-200' 
                  : 'bg-gradient-to-br from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-200/50 hover:from-purple-500/20 hover:to-purple-600/15 hover:border-purple-300/70 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-0.5 active:translate-y-0 hover:scale-105'
              }`}
            >
              <span className={`text-lg transition-transform duration-300 ${
                isPolishing ? '' : 'group-hover:scale-110 group-hover:rotate-12'
              }`}>
                {isPolishing ? '⏳' : '✨'}
              </span>
            </button>

            {/* 智能提问 */}
            <div className="flex items-center">
              <AIQuestions 
                content={content}
                onQuestionInsert={(question) => {
                  setContent(prev => prev + '\n\n' + question);
                }}
              />
            </div>

            {/* 查找相似记录 */}
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).triggerSimilarityCheck) {
                  (window as any).triggerSimilarityCheck();
                }
              }}
              disabled={!content.trim() || content.trim().length < 10}
              className={`group relative w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-medium transition-all duration-300 shadow-sm border-2 ${
                !content.trim() || content.trim().length < 10
                  ? 'bg-gray-100/80 text-gray-400 cursor-not-allowed shadow-none border-gray-200' 
                  : 'bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 text-emerald-600 border-emerald-200/50 hover:from-emerald-500/20 hover:to-emerald-600/15 hover:border-emerald-300/70 hover:shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0 hover:scale-105'
              }`}
            >
              <span className={`text-lg transition-transform duration-300 ${
                !content.trim() || content.trim().length < 10 ? '' : 'group-hover:scale-110'
              }`}>
                🔍
              </span>
            </button>
          </div>
        </div>


      </div>


      {/* 润色结果对比区域移到这里 */}
      <div>


        {/* 润色结果对比区域（平衡模式：简化样式） */}
        {showComparison && polishedText && (
          <div className="mt-4 animate-fade-in">
            <div className="p-4 border rounded-lg" style={{
              backgroundColor: 'color-mix(in oklab, var(--flow-primary) 10%, transparent)',
              borderColor: 'color-mix(in oklab, var(--flow-primary) 30%, transparent)'
            }}>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>💡 AI润色建议</h4>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={acceptPolish}
                  className="px-3 py-1 text-xs rounded-lg border transition-colors"
                  style={{
                    backgroundColor: 'var(--tag-green-bg)',
                    color: 'var(--tag-green-text)',
                    borderColor: 'var(--tag-green-border)'
                  }}
                >
                  ✓ 使用
                </button>
                <button
                  type="button"
                  onClick={rejectPolish}
                  className="px-3 py-1 text-xs hover:opacity-80 rounded-lg border transition-colors"
                  style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-secondary)', borderColor: 'var(--card-border)'}}
                >
                  保持原文
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs mb-1" style={{color: 'var(--text-muted)'}}>原文：</p>
                <p className="text-sm p-2 rounded border" style={{color: 'var(--text-secondary)', backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)'}}>{content}</p>
              </div>
              <div>
                <p className="text-xs mb-1" style={{color: 'var(--flow-primary)'}}>润色后：</p>
                <p className="text-sm p-2 rounded border font-medium" style={{color: 'var(--text-primary)', backgroundColor: 'var(--flow-primary)/20', borderColor: 'var(--flow-primary)/30'}}>{polishedText}</p>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* 高级选项（恢复完整功能，保持简化视觉） */}
      <div className="pt-1">
        <div className="flex gap-3 mb-1" style={{alignItems: 'center'}}>
          <select
            value={projectTag}
            onChange={(e) => setProjectTag(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
            style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid', minWidth: '110px', maxWidth: '115px'}}
          >
            <option value="无">➖ 无</option>
            <option value="其他">📋 其他</option>
            <option value="FSD">🚀 FSD</option>
            <option value="AIEC">🤖 AIEC</option>
            <option value="训战营">🎯 训战营</option>
          </select>



          <select
            value={dailyReportTag}
            onChange={(e) => setDailyReportTag(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
            style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid', minWidth: '110px', maxWidth: '115px'}}
          >
            <option value="无">➖ 无</option>
            <option value="核心进展">📈 核心进展</option>
            <option value="问题与卡点">🚫 问题与卡点</option>
            <option value="思考与困惑">🤔 思考与困惑</option>
            <option value="AI学习">🤖 AI学习</option>
          </select>
        </div>
      </div>

      {/* 相似内容检测（平衡模式：保持但简化样式） */}
      <SimilarContent 
        content={content} 
        onMergeComplete={() => {
          debug.log('🔗 Merge completed callback triggered');
          setMessage('✅ 记录已成功合并');
          setContent('');
          setProjectTag('其他');
          setDailyReportTag('核心进展');
          
          // 延迟触发事件，确保状态已更新
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              debug.log('🔗 Dispatching entryAdded event');
              window.dispatchEvent(new CustomEvent('entryAdded'));
            }
            setTimeout(() => setMessage(''), 3000);
          }, 100);
        }}
      />

      {/* 状态消息（平衡模式：简化样式） */}
      {message && (
        <div className="p-3 rounded-lg text-sm border transition-all duration-200"
          style={
            message.includes('✅')
              ? { backgroundColor: 'var(--tag-green-bg)', borderColor: 'var(--tag-green-border)', color: 'var(--tag-green-text)' }
              : message.includes('❌')
                ? { backgroundColor: 'var(--tag-red-bg)', borderColor: 'var(--tag-red-border)', color: 'var(--tag-red-text)' }
                : { backgroundColor: 'color-mix(in oklab, var(--flow-primary) 12%, transparent)', borderColor: 'color-mix(in oklab, var(--flow-primary) 30%, transparent)', color: 'var(--text-primary)' }
          }>
          {message}
        </div>
      )}


    </form>


    </>
  );
}