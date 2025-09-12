'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAllAvailableModels } from '@/lib/ai-providers';

interface AIModelConfig {
  id: number;
  function_name: string;
  model_name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

const AIModelConfig = () => {
  const [configs, setConfigs] = useState<AIModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const response = await axios.get('/api/models');
        setConfigs(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch configs');
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleUpdate = async (functionName: string, newModel: string) => {
    if (!newModel || newModel === configs.find(c => c.function_name === functionName)?.model_name) return;
    
    setUpdating(functionName);
    try {
      await axios.put(`/api/models/${functionName}`, { model: newModel });
      setConfigs(configs.map(config => 
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

  const availableModels = getAllAvailableModels();
  
  const getModelLabel = (modelValue: string) => {
    const model = availableModels.find(m => m.value === modelValue);
    return model ? model.label : modelValue;
  };

  if (loading) return <div className="p-4">Loading AI configurations...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-2xl">⚙️</span>
        <h2 className="text-2xl font-semibold text-neutral-800">AI模型配置</h2>
      </div>
      <div className="space-y-6">
        {configs.map(config => (
          <div key={config.id} className="border border-gray-200 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">{config.function_name.replace(/_/g, ' ').toUpperCase()}</h3>
                <p className="text-gray-600 mb-3">{config.description}</p>
                <div className="flex flex-col gap-2">
                  <div className="text-sm">
                    <span className="font-medium">Current Model: </span>
                    <span className="font-mono bg-blue-100 px-2 py-1 rounded text-blue-800">
                      {getModelLabel(config.model_name)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(config.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="ml-4">
                <select 
                  value={config.model_name}
                  onChange={(e) => handleUpdate(config.function_name, e.target.value)}
                  disabled={updating === config.function_name}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                >
                  {availableModels.map(model => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
                {updating === config.function_name && (
                  <div className="text-xs text-blue-600 mt-1">Updating...</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Available Models:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {availableModels.map(model => (
            <div key={model.value} className="flex justify-between">
              <span className="font-medium">{model.label}:</span>
              <code className="text-xs text-gray-600">{model.value}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIModelConfig;

