'use client';

import { useState, useEffect } from 'react';
import { syncKnowledgeBaseAction, getKnowledgeDocumentsAction, getKnowledgeStatsAction } from '@/lib/actions';
import type { KnowledgeDocument } from '@/types/index';

interface KnowledgeStats {
  total: number;
  byType: Array<{ document_type: string; count: number }>;
}

export default function KnowledgeManager() {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({ total: 0, byType: [] });
  const [loading, setLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string>('');
  const [error, setError] = useState<string>('');

  // 加载知识库数据
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [docsResult, statsResult] = await Promise.all([
        getKnowledgeDocumentsAction(),
        getKnowledgeStatsAction()
      ]);

      if (docsResult.success) {
        setDocuments(docsResult.data as KnowledgeDocument[]);
      } else {
        setError(docsResult.error || '加载文档失败');
      }

      if (statsResult.success) {
        setStats(statsResult.data as KnowledgeStats);
      }
    } catch {
      setError('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 同步知识库
  const handleSync = async () => {
    setLoading(true);
    setSyncResult('');
    setError('');
    
    try {
      const result = await syncKnowledgeBaseAction();
      
      if (result.success) {
        setSyncResult(`✅ 同步完成: 创建${result.created}个, 更新${result.updated}个, 删除${result.deleted}个文档`);
        await loadData(); // 重新加载数据
      } else {
        setError(result.error || '同步失败');
      }
    } catch {
      setError('同步过程中出现错误');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="rounded-lg shadow-md p-6" style={{
      backgroundColor: 'var(--card-glass)',
      border: '1px solid var(--card-border)',
      color: 'var(--text-primary)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">📚 背景知识库管理</h2>
        <div className="flex gap-2">
          <button
            onClick={handleSync}
            disabled={loading}
            className="px-4 py-2 rounded disabled:opacity-50 transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--flow-primary)',
              color: 'white'
            }}
          >
            {loading ? '同步中...' : '🔄 同步文件'}
          </button>
          <a
            href="/knowledge-base"
            target="_blank"
            className="px-4 py-2 rounded transition-colors hover:opacity-80"
            style={{
              backgroundColor: 'var(--text-secondary)',
              color: 'white'
            }}
          >
            📁 打开文件夹
          </a>
        </div>
      </div>

      {/* 同步结果 */}
      {syncResult && (
        <div className="rounded-lg p-4 mb-4 border" style={{
          backgroundColor: 'var(--text-success)/20',
          borderColor: 'var(--text-success)/30',
          color: 'var(--text-success)'
        }}>
          <p>{syncResult}</p>
        </div>
      )}

      {/* 错误信息 */}
      {error && (
        <div className="rounded-lg p-4 mb-4 border" style={{
          backgroundColor: 'var(--text-error)/20',
          borderColor: 'var(--text-error)/30',
          color: 'var(--text-error)'
        }}>
          <p>{error}</p>
        </div>
      )}

      {/* 统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg p-4 text-center border" style={{
          backgroundColor: 'var(--flow-primary)/20',
          borderColor: 'var(--flow-primary)/30',
          color: 'var(--flow-primary)'
        }}>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm">总文档数</div>
        </div>
        
        {stats.byType.slice(0, 3).map((type) => (
          <div key={type.document_type} className="rounded-lg p-4 text-center border" style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--card-border)',
            color: 'var(--text-primary)'
          }}>
            <div className="text-2xl font-bold">{type.count}</div>
            <div className="text-sm">{type.document_type}</div>
          </div>
        ))}
      </div>

      {/* 使用说明 */}
      <div className="rounded-lg p-4 mb-6 border" style={{
        backgroundColor: 'var(--flow-accent)/20',
        borderColor: 'var(--flow-accent)/30',
        color: 'var(--text-primary)'
      }}>
        <h3 className="font-medium mb-2">💡 使用指南</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-1">文件组织建议</h4>
            <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <li>• business/ - 业务和公司信息</li>
              <li>• team/ - 团队结构和人员信息</li>
              <li>• personal/ - 个人思维方式和偏好</li>
              <li>• current-focus/ - 当前关注点和目标</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-1">文档格式要求</h4>
            <ul className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <li>• 使用 Markdown 格式 (.md)</li>
              <li>• 文件名用英文和连字符</li>
              <li>• 单个文件建议不超过2000字</li>
              <li>• 使用标题和列表结构化内容</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 文档列表 */}
      <div className="border-t pt-4">
        <h3 className="font-medium mb-3">📋 已索引文档 ({documents.length})</h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--flow-primary)' }}></div>
            <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>加载中...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            <p>还没有找到任何知识文档</p>
            <p className="text-sm mt-2">请在 knowledge-base/ 文件夹中添加 .md 文件，然后点击&ldquo;同步文件&rdquo;</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div key={doc.id} className="border rounded-lg p-4" style={{
                backgroundColor: 'var(--card-glass)',
                borderColor: 'var(--card-border)',
                color: 'var(--text-primary)'
              }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2 py-1 text-xs rounded" style={{
                        backgroundColor: 'var(--flow-primary)/20',
                        color: 'var(--flow-primary)'
                      }}>
                        {doc.document_type}
                      </span>
                      <span className="text-sm font-medium">{doc.title}</span>
                      <div className="flex">
                        {Array.from({ length: doc.priority }, (_, i) => (
                          <span key={i} className="text-warning-400">★</span>
                        ))}
                      </div>
                    </div>
                    {doc.summary && (
                      <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{doc.summary}</p>
                    )}
                    {doc.keywords && (
                      <div className="flex flex-wrap gap-1">
                        {doc.keywords.split(', ').map((keyword, index) => (
                          <span key={index} className="inline-block px-2 py-1 text-xs rounded" style={{
                            backgroundColor: 'var(--card-glass)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--card-border)'
                          }}>
                            {keyword}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-xs ml-4" style={{ color: 'var(--text-muted)' }}>
                    <div>创建: {new Date(doc.created_at).toLocaleDateString('zh-CN')}</div>
                    <div>更新: {new Date(doc.updated_at).toLocaleDateString('zh-CN')}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI功能说明 */}
      <div className="mt-6 bg-warning-50 border border-warning-200 rounded-lg p-4">
        <h3 className="font-medium text-warning-900 mb-2">🤖 AI背景增强</h3>
        <p className="text-sm text-warning-800">
          这些背景文档会自动成为AI的上下文信息。当您使用AI功能（如犀利提问、智能周报等）时，
          AI会结合您的个人背景、业务信息和团队情况提供更精准、个性化的分析和建议。
        </p>
      </div>
    </div>
  );
}