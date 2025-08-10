'use client';

import { useState, useEffect } from 'react';
import { exportDataAsJSONAction, exportDataAsCSVAction, getExportPreviewAction } from '@/lib/actions';
import DataIntegrityChecker from './DataIntegrityChecker';
import EmptyState from './ui/EmptyState';
import { debug } from '@/lib/debug';

interface ExportPreview {
  totalRecords: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
  projectCount: number;
  personCount: number;
  knowledgeBaseCount: number;
  topProjects: Array<{ project_tag: string; count: number }>;
  importanceDistribution: Array<{ importance_tag: number; count: number }>;
}

type ExportFormat = 'json' | 'csv';

export default function DataExport() {
  const [preview, setPreview] = useState<ExportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string>('');
  const [includeKnowledgeBase, setIncludeKnowledgeBase] = useState(true);
  const [activeTab, setActiveTab] = useState<'export' | 'integrity'>('export');

  // 加载导出预览
  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getExportPreviewAction();
      if (result.success) {
        setPreview(result.data as ExportPreview);
      } else {
        setError(result.error || '加载预览失败');
      }
    } catch {
      setError('加载预览失败');
    } finally {
      setLoading(false);
    }
  };

  // 下载文件的辅助函数
  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 处理导出
  const handleExport = async (format: ExportFormat) => {
    setExporting(format);
    setError('');

    try {
      let result;
      let mimeType: string;

      switch (format) {
        case 'json':
          result = await exportDataAsJSONAction(includeKnowledgeBase);
          mimeType = 'application/json';
          break;
        case 'csv':
          result = await exportDataAsCSVAction();
          mimeType = 'text/csv';
          break;
        default:
          throw new Error('不支持的导出格式');
      }

      if (result.success) {
        const filename = result.filename || `digital-brain-export-${Date.now()}.${format}`;
        downloadFile(result.data || '', filename, mimeType);
        debug.log(`✅ ${format.toUpperCase()}导出成功:`, filename);
      } else {
        setError(result.error || '导出失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败');
    } finally {
      setExporting(null);
    }
  };

  useEffect(() => {
    loadPreview();
  }, []);

  return (
    <div className="space-y-6">
      {/* 标签页导航 */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'export'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📤 数据导出
            </button>
            <button
              onClick={() => setActiveTab('integrity')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'integrity'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔍 完整性检查
            </button>
          </div>
        </div>
      </div>

      {/* 数据导出标签页 */}
      {activeTab === 'export' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">📤 数据导出</h2>
            <button
              onClick={loadPreview}
              disabled={loading}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 transition-colors"
            >
              {loading ? '刷新中...' : '🔄 刷新'}
            </button>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 数据预览 */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">加载预览中...</span>
            </div>
          ) : preview && preview.totalRecords > 0 ? (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">📊 数据概览</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{preview.totalRecords}</div>
                  <div className="text-sm text-blue-800">总记录数</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">{preview.projectCount}</div>
                  <div className="text-sm text-green-800">项目标签</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{preview.personCount}</div>
                  <div className="text-sm text-purple-800">人物标签</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{preview.knowledgeBaseCount}</div>
                  <div className="text-sm text-yellow-800">知识文档</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">📅 数据时间范围</h4>
                  <p className="text-gray-600">
                    {new Date(preview.dateRange.earliest).toLocaleDateString('zh-CN')} - {new Date(preview.dateRange.latest).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                
                {preview.topProjects.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">🏷️ 主要项目</h4>
                    <div className="space-y-1">
                      {preview.topProjects.slice(0, 3).map((project, index) => (
                        <div key={index} className="flex justify-between text-gray-600">
                          <span>{project.project_tag}</span>
                          <span>{project.count} 条</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : preview && preview.totalRecords === 0 ? (
            <EmptyState 
              type="data-export"
              size="medium"
              title="暂无数据可导出"
              description="先添加一些记录，然后就可以导出您的数据了"
              action={{
                label: '创建第一条记录',
                onClick: () => {
                  // 触发创建记录的事件
                  window.dispatchEvent(new CustomEvent('openEntryForm'));
                }
              }}
            />
          ) : (
            <EmptyState 
              type="loading"
              size="medium"
              title="准备数据预览"
              description="正在分析您的数据..."
            />
          )}

          {/* 导出选项 */}
          {preview && preview.totalRecords > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-medium text-gray-900 mb-4">🎯 导出格式选择</h3>
              
              {/* 包含知识库选项 */}
              <div className="mb-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={includeKnowledgeBase}
                    onChange={(e) => setIncludeKnowledgeBase(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">包含背景知识库数据</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  选中后，JSON格式会包含知识库内容（CSV格式仅包含记录数据）
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* JSON导出 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-lg">📋</span>
                    <h4 className="font-medium text-gray-900 ml-2">JSON 格式</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    完整的结构化数据，适合程序处理和数据备份
                  </p>
                  <ul className="text-xs text-gray-500 mb-3 space-y-1">
                    <li>• 包含所有字段和元数据</li>
                    <li>• 可选择包含知识库</li>
                    <li>• 便于程序解析</li>
                    <li>• 文件体积适中</li>
                  </ul>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={exporting !== null}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {exporting === 'json' ? '导出中...' : '📤 导出 JSON'}
                  </button>
                </div>

                {/* CSV导出 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-lg">📊</span>
                    <h4 className="font-medium text-gray-900 ml-2">CSV 格式</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    表格数据，适合Excel打开和数据分析
                  </p>
                  <ul className="text-xs text-gray-500 mb-3 space-y-1">
                    <li>• Excel完美兼容</li>
                    <li>• 便于数据分析</li>
                    <li>• 仅包含记录数据</li>
                    <li>• 文件体积最小</li>
                  </ul>
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting !== null}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {exporting === 'csv' ? '导出中...' : '📊 导出 CSV'}
                  </button>
                </div>
              </div>

              {/* 使用说明 */}
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">💡 使用说明</h3>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• <strong>JSON格式</strong>：最完整的数据格式，建议用于完整备份</p>
                  <p>• <strong>CSV格式</strong>：适合在Excel中进行数据分析和统计</p>
                  <p>• 导出的文件会自动下载到您的下载文件夹</p>
                  <p>• 建议定期导出数据作为备份，确保数据安全</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 数据完整性检查标签页 */}
      {activeTab === 'integrity' && (
        <DataIntegrityChecker />
      )}
    </div>
  );
}