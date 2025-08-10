'use client';

import { useState } from 'react';
import { addEntry, polishTextAction } from '@/lib/actions';
import { trackEvent } from '@/lib/client-tracker';
import { debug } from '@/lib/debug';
import AIQuestions from './AIQuestions';
import SimilarContent from './SimilarContent';
import { Animated } from './animations';
import { InteractiveButton } from './interactive';
import { createScaleAnimation, createFadeInAnimation } from '@/lib/animations';


export default function EntryForm() {
  const [content, setContent] = useState('');
  const [projectTag, setProjectTag] = useState('');

  // 高级选项状态（恢复完整功能）

  const [attributeTag, setAttributeTag] = useState('无');
  const [urgencyTag, setUrgencyTag] = useState('Jack 交办');
  const [dailyReportTag, setDailyReportTag] = useState('核心进展');
  const [resourceTag, setResourceTag] = useState('自己搞定');


  
  // AI功能状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  







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
      
      // 追踪AI交互
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


    formData.append('attribute_tag', attributeTag);
    formData.append('urgency_tag', urgencyTag);
    formData.append('daily_report_tag', dailyReportTag);
    formData.append('resource_tag', resourceTag);


    formData.append('effort_tag', '轻松');

    try {
      debug.log('🚀 Submitting form with data:', {
        content: content.slice(0, 50) + '...',
        projectTag,

        attributeTag,
        urgencyTag
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
        setProjectTag('');

        setAttributeTag('无');
        setUrgencyTag('Jack 交办');
        setDailyReportTag('核心进展');
        setResourceTag('自己搞定');
        

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
    <form onSubmit={handleSubmit} className="space-y-6" data-entry-form>
      {/* 第一层：核心输入区（平衡模式：始终可见，简化设计） */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            id="content"
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
            placeholder="记录你的想法... (Ctrl+Enter 快速保存)"
            className="w-full h-32 p-4 border rounded-xl resize-none transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50 focus:border-[var(--flow-primary)]/50"
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


      </div>

      {/* AI功能区域（简化为小按钮） */}
      <div className="border-t pt-4" style={{borderColor: 'var(--card-border)'}}>
        <div className="flex gap-3">
          {/* 文本润色 */}
          <InteractiveButton
            onClick={handlePolish}
            disabled={isPolishing || !content.trim() || content.length > 500}
            loading={isPolishing}
            className={`px-4 py-2 text-sm rounded-lg border flex items-center gap-2 ${
              isPolishing 
                ? 'bg-gray-500/30 border-gray-500/50 text-gray-500 cursor-not-allowed' 
                : 'bg-[var(--flow-primary)]/20 border-[var(--flow-primary)]/50 text-[var(--flow-primary)] font-medium hover:bg-[var(--flow-primary)]/30 hover:text-white'
            }`}
            animation="scale"
            ripple={true}
          >
            <span className="text-base">{isPolishing ? '⏳' : '✨'}</span>
            <span>{isPolishing ? '润色中...' : '润色'}</span>
          </InteractiveButton>

          {/* 智能提问 */}
          <div className="flex items-center">
            <AIQuestions 
              content={content}
              onQuestionInsert={(question) => {
                setContent(prev => prev + '\n\n' + question);
              }}
            />
          </div>
        </div>

        {/* 润色结果对比区域（平衡模式：简化样式） */}
        {showComparison && polishedText && (
          <Animated animation="fadeIn" duration={400} className="mt-4">
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
          </Animated>
        )}
      </div>

      {/* 高级选项（恢复完整功能，保持简化视觉） */}
      <div className="border-t pt-4" style={{borderColor: 'var(--card-border)'}}>

        
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
          <div>
            <label className="block text-xs font-medium mb-2" style={{color: 'var(--text-secondary)'}}>项目</label>
            <select
              value={projectTag}
              onChange={(e) => setProjectTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
              style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid'}}
            >
              <option value="">选择项目</option>
              <option value="FSD">🚀 FSD</option>
              <option value="AIEC">🤖 AIEC</option>
              <option value="训战营">🎯 训战营</option>
              <option value="其他">📋 其他</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{color: 'var(--text-secondary)'}}>紧急程度</label>
            <select
              value={attributeTag}
              onChange={(e) => setAttributeTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
              style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid'}}
            >
              <option value="今日跟进">📅 今日跟进</option>
              <option value="本周跟进">📆 本周跟进</option>
              <option value="本月提醒">🗓️ 本月提醒</option>
              <option value="无">➖ 无</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{color: 'var(--text-secondary)'}}>重要事项</label>
            <select
              value={urgencyTag}
              onChange={(e) => setUrgencyTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
              style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid'}}
            >
              <option value="Jack 交办">🔥 Jack 交办</option>
              <option value="重要承诺">⚡ 重要承诺</option>
              <option value="临近 deadline">⏰ 临近 deadline</option>
              <option value="无">➖ 无</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{color: 'var(--text-secondary)'}}>日报分类</label>
            <select
              value={dailyReportTag}
              onChange={(e) => setDailyReportTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
              style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid'}}
            >
              <option value="核心进展">📈 核心进展</option>
              <option value="问题与卡点">🚫 问题与卡点</option>
              <option value="思考与困惑">🤔 思考与困惑</option>
              <option value="AI学习">🤖 AI学习</option>
              <option value="无">➖ 无</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2" style={{color: 'var(--text-secondary)'}}>资源消耗</label>
            <select
              value={resourceTag}
              onChange={(e) => setResourceTag(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--flow-primary)]/50"
              style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-primary)', border: '1px solid'}}
            >
              <option value="自己搞定">💪 自己搞定</option>
              <option value="团队搞定">👥 团队搞定</option>
              <option value="需要支援">🆘 需要支援</option>
            </select>
          </div>






        </div>
      </div>

      {/* 相似内容检测（平衡模式：保持但简化样式） */}
      <SimilarContent 
        content={content} 
        onMergeComplete={() => {
          setMessage('✅ 记录已成功合并');
          setContent('');
          setProjectTag('');

          setAttributeTag('无');
          setUrgencyTag('Jack 交办');
          setDailyReportTag('核心进展');

          setTimeout(() => setMessage(''), 3000);
          
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('entryAdded'));
          }
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

      {/* 提交按钮（平衡模式：简化渐变，突出重要性） */}
      <InteractiveButton
        disabled={isSubmitting || !content.trim()}
        loading={isSubmitting}
        className="w-full bg-[var(--flow-primary)] hover:bg-[var(--flow-secondary)] text-white py-3 px-6 rounded-lg font-medium border border-[var(--flow-primary)]/50 hover:border-[var(--flow-secondary)]/50"
        animation="bounce"
        ripple={true}
      >
        <span className="text-lg">
          {isSubmitting ? '⏳' : '💾'}
        </span>
        <span>{isSubmitting ? '保存中...' : '保存记录'}</span>
        {!isSubmitting && (
          <span className="text-xs opacity-70 ml-2" style={{color: 'white'}}>Ctrl+Enter</span>
        )}
      </InteractiveButton>
    </form>


    </>
  );
}