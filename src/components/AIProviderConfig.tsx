'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Key, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface AIProviderConfig {
  id: number;
  provider_id: string;
  provider_name: string;
  api_key?: string;
  api_endpoint?: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

const AIProviderConfig = () => {
  const [openrouterConfig, setOpenrouterConfig] = useState<AIProviderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [apiKey, setApiKey] = useState<string>('');
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpenRouterConfig = async () => {
      try {
        const response = await axios.get('/api/providers');
        const providers = response.data;
        const openrouterProvider = providers.find((p: AIProviderConfig) => p.provider_id === 'openrouter');
        
        if (openrouterProvider) {
          setOpenrouterConfig(openrouterProvider);
          setApiKey(openrouterProvider.api_key || '');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '获取OpenRouter配置失败');
      } finally {
        setLoading(false);
      }
    };

    fetchOpenRouterConfig();
  }, []);

  const handleSave = async () => {
    if (!openrouterConfig || !apiKey.trim()) return;
    
    setUpdating(true);
    setError(null);
    setSuccess(null);
    
    try {
      await axios.put(`/api/providers/${openrouterConfig.id}`, {
        api_key: apiKey.trim()
      });
      
      setOpenrouterConfig({
        ...openrouterConfig,
        api_key: apiKey.trim()
      });
      
      setIsEditing(false);
      setSuccess('OpenRouter API 密钥已更新');
      
      // 3秒后清除成功消息
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新API密钥失败');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = () => {
    setApiKey(openrouterConfig?.api_key || '');
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">加载配置中...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Key className="w-6 h-6 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">OpenRouter API 配置</h3>
      </div>

      <div className="space-y-4">
        {/* API 密钥配置 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            API 密钥
          </label>
          <div className="flex space-x-3">
            <input
              type={isEditing ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              disabled={!isEditing}
              placeholder="请输入 OpenRouter API 密钥 (sk-or-v1-...)"
              className={`flex-1 px-4 py-2 border rounded-lg transition-colors ${
                isEditing 
                  ? 'border-blue-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' 
                  : 'border-gray-300 bg-gray-50'
              } disabled:cursor-not-allowed`}
            />
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                编辑
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={updating || !apiKey.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                >
                  <Save className="w-4 h-4" />
                  <span>{updating ? '保存中...' : '保存'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  取消
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 状态显示 */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-600">状态:</span>
          {openrouterConfig?.is_enabled ? (
            <span className="text-green-600 flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>已启用</span>
            </span>
          ) : (
            <span className="text-red-600 flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>未启用</span>
            </span>
          )}
        </div>

        {/* 错误和成功消息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        {/* 说明文档 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">OpenRouter API 密钥说明</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 访问 <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-800">OpenRouter Keys 页面</a> 获取API密钥</li>
            <li>• API密钥格式：sk-or-v1-...</li>
            <li>• OpenRouter 提供超过100个AI模型的统一接口</li>
            <li>• 配置后即可使用所有支持的模型进行对话</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIProviderConfig;