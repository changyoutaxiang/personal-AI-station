'use client';

import { useState } from 'react';
import { trackEvent } from '@/lib/client-tracker';
import { debug } from '@/lib/debug';
// 移除直接导入AI函数，改用API调用

interface MinimalistAgentProps {
  content: string;
  onResponse: (response: string) => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function MinimalistAgent({ content, onResponse, isVisible, onClose }: MinimalistAgentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);





  const handleAnalyze = async () => {
    if (!content.trim()) {
      setError('请先输入内容');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      // 调用API路由进行分析，设置30秒超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch('/api/minimalist-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.analysis) {
        setResponse(result.analysis);
        onResponse(result.analysis);
        
        // 追踪智能体交互
        trackEvent.aiInteraction('minimalist_agent', {
          content_length: content.length,
          success: true,
          tokens_used: result.tokensUsed || 0,
          analysis_type: 'ai_powered'
        });
      } else {
        throw new Error(result.error || '分析失败');
      }
      
    } catch (error) {
      debug.error('极简智能体分析失败:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          setError('分析超时，请重试（建议缩短输入内容）');
        } else if (error.message.includes('API请求失败')) {
          setError('服务器响应错误，请稍后重试');
        } else {
          setError(`分析失败: ${error.message}`);
        }
      } else {
        setError('分析失败，请重试');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-green-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              ⚡
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800">极简增长首席顾问</h3>
              <p className="text-sm text-green-600">
                基于《极简增长》方法论的深度分析
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-green-600">
                <div className="w-6 h-6 border-2 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                <span>极简增长顾问正在深度分析...</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                正在应用四大灵魂追问框架...
              </p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">❌</div>
              <p className="text-red-600">{error}</p>
              <button
                onClick={handleAnalyze}
                className="mt-4 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
              >
                重新分析
              </button>
            </div>
          ) : response ? (
            <div className="prose prose-sm max-w-none">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {response}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-green-500 mb-4 text-4xl">⚡</div>
              <h4 className="text-lg font-medium text-gray-800 mb-2">
                极简增长首席顾问已就位
              </h4>
              <p className="text-gray-600 mb-6">
                我将基于《极简增长》的核心方法论，为您提供深度分析和战略建议
              </p>
              <div className="bg-gray-50 p-4 rounded-lg text-left mb-6">
                <p className="text-sm text-gray-700 font-medium mb-2">📋 您的内容：</p>
                <p className="text-sm text-gray-600 bg-white p-3 rounded border">
                  {content.slice(0, 200)}{content.length > 200 ? '...' : ''}
                </p>
              </div>
              <button
                onClick={handleAnalyze}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                开始极简增长分析
              </button>
            </div>
          )}
        </div>

        {/* 底部操作区 */}
        {response && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                💡 基于《极简增长》方法论的专业分析
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAnalyze}
                  className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  重新分析
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}