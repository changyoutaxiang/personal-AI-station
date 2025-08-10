'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { HistorySettings, ConversationSummarizer } from '@/components/agent';

export default function UXDemoPage() {
  const [historyLimit, setHistoryLimit] = useState(20);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSendMessage = () => {
    if (!textInput.trim()) {
      toast.error('请输入消息内容');
      return;
    }

    if (textInput.length > 5000) {
      toast.error('消息长度不能超过5000字符');
      return;
    }

    if (isLoading) {
      toast.error('请等待上一条消息处理完成');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('消息发送成功');
      setTextInput('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 页面标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            UX 与性能优化演示
          </h1>
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
            展示聊天系统的各种用户体验优化功能
          </p>
        </div>

        {/* 功能卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* 历史裁剪功能 */}
          <div 
            className="p-6 rounded-xl border shadow-sm"
            style={{ 
              backgroundColor: 'var(--card-glass)', 
              borderColor: 'var(--card-border)' 
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              📋 历史裁剪
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              仅携带最近N条消息参与上下文，减少token消耗
            </p>
            <HistorySettings 
              historyLimit={historyLimit}
              onHistoryLimitChange={setHistoryLimit}
            />
          </div>

          {/* 发送节流功能 */}
          <div 
            className="p-6 rounded-xl border shadow-sm"
            style={{ 
              backgroundColor: 'var(--card-glass)', 
              borderColor: 'var(--card-border)' 
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              🚦 发送节流
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              在上次请求完成前禁止再次发送
            </p>
            <div className="space-y-3">
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="输入测试消息..."
                className="w-full p-3 rounded-lg border resize-none"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--text-primary)'
                }}
                rows={3}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading}
                className="w-full px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
                style={{
                  backgroundColor: isLoading ? 'var(--text-secondary)' : 'var(--flow-primary)',
                  color: 'white'
                }}
              >
                {isLoading ? '发送中...' : '发送消息'}
              </button>
            </div>
          </div>

          {/* 文本长度限制 */}
          <div 
            className="p-6 rounded-xl border shadow-sm"
            style={{ 
              backgroundColor: 'var(--card-glass)', 
              borderColor: 'var(--card-border)' 
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              📏 文本长度限制
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              前端5000字符提示，后端再次校验
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  字符计数:
                </span>
                <span className={`text-sm ${textInput.length > 5000 ? 'text-red-500' : ''}`}>
                  {textInput.length}/5000
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    textInput.length > 5000 ? 'bg-red-500' : 
                    textInput.length > 4000 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((textInput.length / 5000) * 100, 100)}%` }}
                ></div>
              </div>
              {textInput.length > 4000 && (
                <p className={`text-xs ${textInput.length > 5000 ? 'text-red-500' : 'text-yellow-500'}`}>
                  {textInput.length > 5000 ? '内容过长，请缩减文本' : '内容较长，建议精简'}
                </p>
              )}
            </div>
          </div>

          {/* 错误反馈 */}
          <div 
            className="p-6 rounded-xl border shadow-sm"
            style={{ 
              backgroundColor: 'var(--card-glass)', 
              borderColor: 'var(--card-border)' 
            }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              🔔 错误反馈
            </h3>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Toast明确错误原因，包含OpenRouter错误信息
            </p>
            <div className="space-y-2">
              <button
                onClick={() => toast.success('操作成功完成！')}
                className="w-full px-4 py-2 rounded-lg bg-green-500 text-white font-medium"
              >
                成功提示
              </button>
              <button
                onClick={() => toast.error('AI服务错误: 请求频率限制')}
                className="w-full px-4 py-2 rounded-lg bg-red-500 text-white font-medium"
              >
                错误提示
              </button>
              <button
                onClick={() => toast('这是一条信息提示', { icon: '💡' })}
                className="w-full px-4 py-2 rounded-lg bg-blue-500 text-white font-medium"
              >
                信息提示
              </button>
            </div>
          </div>
        </div>

        {/* 对话总结与压缩 */}
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{ 
            backgroundColor: 'var(--card-glass)', 
            borderColor: 'var(--card-border)' 
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            🗜️ 对话总结与压缩 (可选优化)
          </h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            对长对话支持一键总结与压缩上一段历史，减少token消耗
          </p>
          <ConversationSummarizer 
            conversationId={1}
            messageCount={25}
            onSummaryGenerated={(summary) => {
              console.log('生成的总结:', summary);
            }}
          />
        </div>

        {/* 功能说明 */}
        <div 
          className="p-6 rounded-xl border shadow-sm"
          style={{ 
            backgroundColor: 'var(--card-glass)', 
            borderColor: 'var(--card-border)' 
          }}
        >
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            ✨ 功能总结
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  历史裁剪: 默认20条消息，可设置1-100
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  消息分页: 支持向上滚动加载旧消息
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  发送节流: 防止重复提交请求
                </span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  文本限制: 前端5000字符实时提示
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-green-500">✅</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  错误反馈: 解析OpenRouter具体错误
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-orange-500">🔄</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  总结压缩: 智能减少长对话token
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
