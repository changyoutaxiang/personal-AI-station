'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AI_PROVIDERS, getProviderById } from '@/lib/ai-providers';

interface AIModelConfig {
  id: number;
  function_name: string;
  model_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

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
  const [modelConfigs, setModelConfigs] = useState<AIModelConfig[]>([]);
  const [providerConfigs, setProviderConfigs] = useState<AIProviderConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'models' | 'providers'>('models');
  const [selectedProvider, setSelectedProvider] = useState<string>('openrouter');
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{api_key: string; api_endpoint: string}>({api_key: '', api_endpoint: ''});

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const [modelsResponse, providersResponse] = await Promise.all([
          axios.get('/api/models'),
          axios.get('/api/providers')
        ]);
        setModelConfigs(modelsResponse.data);
        setProviderConfigs(providersResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch configs');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleModelUpdate = async (functionName: string, newModel: string) => {
    if (!newModel || newModel === modelConfigs.find(c => c.function_name === functionName)?.model_name) return;
    
    setUpdating(functionName);
    try {
      await axios.put(`/api/models/${functionName}`, { model: newModel });
      setModelConfigs(modelConfigs.map(config => 
        config.function_name === functionName 
          ? { ...config, model_name: newModel, updated_at: new Date().toISOString() } 
          : config
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update model');
    } finally {
      setUpdating(null);
    }
  };

  const handleProviderUpdate = async (providerId: string, updates: Partial<AIProviderConfig>) => {
    setUpdating(providerId);
    try {
      await axios.put(`/api/providers/${providerId}`, updates);
      setProviderConfigs(providerConfigs.map(config => 
        config.provider_id === providerId 
          ? { ...config, ...updates, updated_at: new Date().toISOString() } 
          : config
      ));
      // 关闭编辑模式
      setEditingProvider(null);
      setEditForm({api_key: '', api_endpoint: ''});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update provider');
    } finally {
      setUpdating(null);
    }
  };

  const handleEditProvider = (config: AIProviderConfig) => {
    setEditingProvider(config.provider_id);
    setEditForm({
      api_key: config.api_key || '',
      api_endpoint: config.api_endpoint || ''
    });
  };

  const handleCancelEdit = () => {
    setEditingProvider(null);
    setEditForm({api_key: '', api_endpoint: ''});
  };

  const handleSaveEdit = (providerId: string) => {
    handleProviderUpdate(providerId, {
      api_key: editForm.api_key,
      api_endpoint: editForm.api_endpoint
    });
  };

  const getModelLabel = (modelValue: string) => {
    // 从所有供应商中查找模型
    for (const provider of AI_PROVIDERS) {
      const model = provider.models.find(m => m.id === modelValue);
      if (model) return model.name;
    }
    return modelValue;
  };

  const getProviderForModel = (modelValue: string) => {
    for (const provider of AI_PROVIDERS) {
      if (provider.models.some(m => m.id === modelValue)) {
        return provider;
      }
    }
    return null;
  };

  const getAvailableModels = () => {
    const provider = getProviderById(selectedProvider);
    return provider ? provider.models : [];
  };

  if (loading) return <div className="p-4">Loading AI configurations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">⚙️</span>
        <h2 className="text-2xl font-semibold text-neutral-800">AI配置管理</h2>
      </div>

      {/* 标签页导航 */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('models')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'models'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          模型配置
        </button>
        <button
          onClick={() => setActiveTab('providers')}
          className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'providers'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          供应商配置
        </button>
      </div>

      {activeTab === 'models' && (
        <div className="space-y-6">
          {/* 供应商选择器 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择供应商查看可用模型:
            </label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {AI_PROVIDERS.map(provider => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
          </div>

          {/* 模型配置列表 */}
          {modelConfigs.map(config => {
            const currentProvider = getProviderForModel(config.model_name);
            return (
              <div key={config.id} className="border border-gray-200 p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2">
                      {config.function_name.replace(/_/g, ' ').toUpperCase()}
                    </h3>
                    <p className="text-gray-600 mb-3">{config.description}</p>
                    <div className="flex flex-col gap-2">
                      <div className="text-sm">
                        <span className="font-medium">当前模型: </span>
                        <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                          {getModelLabel(config.model_name)}
                        </span>
                        {currentProvider && (
                          <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                            {currentProvider.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        最后更新: {new Date(config.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        选择模型:
                      </label>
                      <select 
                        value={config.model_name}
                        onChange={(e) => handleModelUpdate(config.function_name, e.target.value)}
                        disabled={updating === config.function_name}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                      >
                        {getAvailableModels().map(model => (
                          <option key={model.id} value={model.id}>
                            {model.name}
                          </option>
                        ))}
                      </select>
                      {updating === config.function_name && (
                        <div className="text-xs text-blue-600">更新中...</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* 可用模型展示 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">
              {getProviderById(selectedProvider)?.name} 可用模型:
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm">
              {getAvailableModels().map(model => (
                <div key={model.id} className="flex justify-between items-center p-2 bg-white rounded border">
                  <span className="font-medium">{model.name}</span>
                  <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {model.id}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'providers' && (
        <div className="space-y-6">
          {providerConfigs.map(config => (
            <div key={config.id} className="border border-gray-200 p-6 rounded-lg shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-bold">{config.provider_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      config.is_enabled 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {config.is_enabled ? '已启用' : '已禁用'}
                    </span>
                  </div>
                  {editingProvider === config.provider_id ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API端点:
                        </label>
                        <input
                          type="text"
                          value={editForm.api_endpoint}
                          onChange={(e) => setEditForm({...editForm, api_endpoint: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="输入API端点URL"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API密钥:
                        </label>
                        <input
                          type="password"
                          value={editForm.api_key}
                          onChange={(e) => setEditForm({...editForm, api_key: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="输入API密钥"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(config.provider_id)}
                          disabled={updating === config.provider_id}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                        >
                          保存
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">API端点: </span>
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {config.api_endpoint || '未配置'}
                        </code>
                      </div>
                      <div>
                        <span className="font-medium">API密钥: </span>
                        <span className="text-gray-600">
                          {config.api_key ? '已配置' : '未配置'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        最后更新: {config.updated_at ? new Date(config.updated_at).toLocaleString() : '未知'}
                      </div>
                    </div>
                  )}
                </div>
                <div className="ml-4 space-y-2">
                  {editingProvider !== config.provider_id && (
                    <>
                      <button
                        onClick={() => handleEditProvider(config)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        配置
                      </button>
                      <button
                        onClick={() => handleProviderUpdate(config.provider_id, { is_enabled: !config.is_enabled })}
                        disabled={updating === config.provider_id}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                          config.is_enabled
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {config.is_enabled ? '禁用' : '启用'}
                      </button>
                    </>
                  )}
                  {updating === config.provider_id && (
                    <div className="text-xs text-blue-600">更新中...</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIProviderConfig;