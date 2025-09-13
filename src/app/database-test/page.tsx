'use client';

import { useState, useEffect } from 'react';
import { dbAdapter, getDatabaseType, healthCheckDatabase } from '@/lib/database-adapter';

interface HealthStatus {
  status: 'ok' | 'error';
  message: string;
  type: string;
}

interface TaskRecord {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

export default function DatabaseTestPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [databaseType, setDatabaseType] = useState<string>('');

  useEffect(() => {
    setDatabaseType(getDatabaseType());
    checkHealth();
    loadTasks();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const status = await healthCheckDatabase();
      setHealthStatus(status);
    } catch (error) {
      setHealthStatus({
        status: 'error',
        message: `Health check failed: ${error}`,
        type: 'unknown'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const taskData = await dbAdapter.getTasks(5); // 获取最新 5 条任务
      setTasks(taskData);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const createTestTask = async () => {
    setLoading(true);
    try {
      const newTask = {
        title: `测试任务 ${new Date().toLocaleTimeString()}`,
        description: '这是一个测试任务',
        status: 'todo',
        priority: 'medium'
      };

      await dbAdapter.createTask(newTask);
      await loadTasks(); // 重新加载任务列表
    } catch (error) {
      console.error('Failed to create task:', error);
      alert(`创建任务失败: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            数据库切换测试面板
          </h1>

          {/* 数据库状态 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                当前数据库类型
              </h2>
              <div className="text-2xl font-bold text-blue-600">
                {databaseType.toUpperCase()}
              </div>
              <p className="text-sm text-blue-700 mt-1">
                通过环境变量 DATABASE_TYPE 控制
              </p>
            </div>

            <div className={`rounded-lg p-4 ${
              healthStatus?.status === 'ok'
                ? 'bg-green-50'
                : healthStatus?.status === 'error'
                ? 'bg-red-50'
                : 'bg-gray-50'
            }`}>
              <h2 className="text-lg font-semibold mb-2">
                连接状态
              </h2>
              {loading ? (
                <div className="text-gray-600">检查中...</div>
              ) : healthStatus ? (
                <div>
                  <div className={`text-2xl font-bold ${
                    healthStatus.status === 'ok' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {healthStatus.status === 'ok' ? '✅ 正常' : '❌ 异常'}
                  </div>
                  <p className="text-sm mt-1">
                    {healthStatus.message}
                  </p>
                </div>
              ) : (
                <div className="text-gray-600">未检查</div>
              )}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={checkHealth}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '检查中...' : '检查连接'}
            </button>

            <button
              onClick={loadTasks}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '加载中...' : '重新加载任务'}
            </button>

            <button
              onClick={createTestTask}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建测试任务'}
            </button>
          </div>

          {/* 任务列表 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              最新任务 ({tasks.length} 条)
            </h2>

            {tasks.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                暂无任务数据
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {task.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          状态: {task.status} | ID: {task.id}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(task.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 切换说明 */}
          <div className="mt-8 bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              💡 数据库切换说明
            </h3>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>• 修改 <code className="bg-yellow-200 px-1 rounded">.env.local</code> 中的 <code className="bg-yellow-200 px-1 rounded">DATABASE_TYPE</code></p>
              <p>• 可选值: <code className="bg-yellow-200 px-1 rounded">sqlite</code> 或 <code className="bg-yellow-200 px-1 rounded">supabase</code></p>
              <p>• 修改后重启开发服务器生效</p>
              <p>• 当前设置: <strong>{databaseType}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}