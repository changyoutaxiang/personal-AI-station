'use client';

import { useState } from 'react';
import { generateQuestionsAction } from '@/lib/actions';
import { trackEvent } from '@/lib/client-tracker';
import { debug } from '@/lib/debug';

interface AIQuestionsProps {
  content: string;
  onClose?: () => void;
  onQuestionInsert?: (question: string) => void;
}

export default function AIQuestions({ content, onClose, onQuestionInsert }: AIQuestionsProps) {
  const [questions, setQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerateQuestions = async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    setProgress(0);
    setIsVisible(true); // 立即显示弹窗，让用户看到加载状态

    // 启动进度条动画
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          return prev; // 在95%停止，等待实际结果
        }
        // 前70%快速增长，后面缓慢增长，模拟真实的处理过程
        if (prev < 30) {
          return prev + Math.random() * 8 + 2; // 2-10%增长
        } else if (prev < 70) {
          return prev + Math.random() * 5 + 1; // 1-6%增长
        } else {
          return prev + Math.random() * 2 + 0.5; // 0.5-2.5%增长
        }
      });
    }, 150); // 每150ms更新一次

    let requestSuccess = false;
    
    try {
      const result = await generateQuestionsAction(content);
      
      // 追踪AI交互
      trackEvent.aiInteraction('generate_questions', {
        content_length: content.length,
        success: result.success,
        questions_count: result.questions?.length || 0
      });
      
      // 清除进度条定时器
      clearInterval(progressInterval);
      
      if (result.success && result.questions) {
        requestSuccess = true;
        // 快速完成到100%
        setProgress(100);
        setTimeout(() => {
          setQuestions(result.questions || []);
        }, 200); // 让用户看到100%完成的满足感
      } else {
        setError(result.error || 'AI提问功能暂时不可用');
        setProgress(0);
      }
    } catch (error) {
      clearInterval(progressInterval);
      debug.error('生成问题失败:', error);
      setError('生成问题失败，请重试');
      setProgress(0);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, requestSuccess ? 500 : 0); // 成功时延迟一点显示结果
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setQuestions([]);
    setError(null);
    setProgress(0);
    onClose?.();
  };

  const insertQuestion = (question: string) => {
    if (onQuestionInsert) {
      onQuestionInsert(question);
      // 插入问题后关闭弹窗
      handleClose();
    }
  };

  return (
    <div className="inline-block">
      {/* 触发按钮 */}
      <button
        onClick={handleGenerateQuestions}
        disabled={isLoading || !content.trim()}
        className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 flex items-center gap-2 ${
          isLoading || !content.trim()
            ? 'bg-gray-500/30 border-gray-500/50 text-gray-500 cursor-not-allowed' 
            : 'bg-[var(--flow-secondary)]/20 border-[var(--flow-secondary)]/50 text-[var(--flow-secondary)] font-medium hover:bg-[var(--flow-secondary)]/30 hover:text-white'
        }`}
        title="AI将对您的内容进行犀利提问"
      >
        {isLoading ? (
          <>
            <span className="text-base animate-spin">⏳</span>
            <span>思考中...</span>
          </>
        ) : (
          <>
            <span className="text-base">❓</span>
            <span>提问</span>
          </>
        )}
      </button>

      {/* 问题弹窗 */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden" style={{
            background: 'var(--card-glass)',
            border: '1px solid var(--card-border)'
          }}>
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b" style={{
              borderColor: 'var(--card-border)'
            }}>
              <div>
                <h3 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>🤔 AI犀利提问</h3>
                <p className="text-sm mt-1" style={{color: 'var(--text-secondary)'}}>
                  基于您的内容，AI生成了以下深度思考问题
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--card-glass)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                ✕
              </button>
            </div>

            {/* 内容区域 */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="text-center py-12">
                  {/* 生动的加载动画 */}
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-spin">
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl animate-pulse">🤔</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* 加载提示文字 */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-medium animate-pulse" style={{color: 'var(--flow-primary)'}}>
                      AI正在深度分析您的内容...
                    </h4>
                    <div className="text-sm space-y-1" style={{color: 'var(--text-secondary)'}}>
                      <p className="animate-pulse delay-100">🔍 理解核心观点</p>
                      <p className="animate-pulse delay-200">💡 挖掘深层逻辑</p>
                      <p className="animate-pulse delay-300">❓ 生成犀利问题</p>
                    </div>
                  </div>
                  
                  {/* 动态进度条 */}
                  <div className="mt-8 max-w-xs mx-auto">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs" style={{color: 'var(--text-secondary)'}}>处理进度</span>
                      <span className="text-xs font-medium" style={{color: 'var(--flow-primary)'}}>
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{backgroundColor: 'var(--card-border)'}}>
                      <div 
                        className="h-full rounded-full transition-all duration-300 ease-out"
                        style={{ 
                          width: `${progress}%`,
                          background: 'linear-gradient(to right, var(--flow-primary), var(--flow-secondary))'
                        }}
                      ></div>
                    </div>
                    <p className="text-xs mt-2" style={{color: 'var(--text-muted)'}}>
                      {progress < 30 ? '正在理解内容...' : 
                       progress < 70 ? '分析逻辑结构...' : 
                       progress < 95 ? '生成深度问题...' : 
                       '即将完成...'}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-2">❌</div>
                  <p className="text-sm mb-3" style={{color: 'var(--text-error, #ef4444)'}}>{error}</p>
                  <button
                    onClick={handleGenerateQuestions}
                    className="mt-3 px-4 py-2 text-sm rounded-md transition-colors"
                    style={{
                      backgroundColor: 'var(--text-error, #ef4444)',
                      color: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                  >
                    重试
                  </button>
                </div>
              ) : questions.length > 0 ? (
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <div
                      key={index}
                      className="rounded-lg p-4 border-l-4"
                      style={{
                        backgroundColor: 'var(--card-glass)',
                        borderLeftColor: 'var(--flow-primary)'
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <span className="text-xs font-medium mb-1 block" style={{color: 'var(--flow-primary)'}}>
                            问题 {index + 1}
                          </span>
                          <p className="leading-relaxed" style={{color: 'var(--text-primary)'}}>
                            {question}
                          </p>
                        </div>
                        <button
                          onClick={() => insertQuestion(question)}
                          className="ml-3 p-1.5 rounded transition-colors"
                          style={{
                            color: 'var(--text-secondary)',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--card-glass)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                          title="将问题插入到输入框"
                        >
                          📝
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-2" style={{color: 'var(--text-muted)'}}>💭</div>
                  <p style={{color: 'var(--text-secondary)'}}>
                    点击&ldquo;好问题&rdquo;按钮，让AI为您生成深度思考问题
                  </p>
                </div>
              )}
            </div>

            {/* 底部操作区 */}
            {questions.length > 0 && (
              <div className="p-4 border-t" style={{
                borderColor: 'var(--card-border)',
                backgroundColor: 'var(--card-glass)'
              }}>
                <div className="flex items-center justify-between">
                  <div className="text-xs" style={{color: 'var(--text-muted)'}}>
                    💡 提示：点击 📝 按钮将问题插入到输入框，继续思考和补充
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleGenerateQuestions}
                      className="px-3 py-1.5 text-sm rounded transition-colors"
                      style={{
                        color: 'var(--flow-primary)',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--flow-primary)';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--flow-primary)';
                      }}
                    >
                      重新生成
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-3 py-1.5 text-sm rounded transition-colors"
                      style={{
                        backgroundColor: 'var(--card-glass)',
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--card-border)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-border)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--card-glass)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}