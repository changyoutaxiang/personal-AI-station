'use client';

import { useState } from 'react';
import { validateDataIntegrityAction, quickHealthCheckAction } from '@/lib/actions';

interface IntegrityReport {
  isValid: boolean;
  totalChecks: number;
  passedChecks: number;
  errors: string[];
  warnings: string[];
  details: {
    entries: {
      total: number;
      withContent: number;
      withTimestamps: number;
      withValidImportance: number;
    };
    knowledgeBase: {
      total: number;
      active: number;
      withContent: number;
    };
    database: {
      tablesExist: boolean;
      indexesExist: boolean;
      foreignKeysValid: boolean;
    };
  };
}

interface HealthStatus {
  healthy: boolean;
  entryCount: number;
  knowledgeCount: number;
}

export default function DataIntegrityChecker() {
  const [report, setReport] = useState<IntegrityReport | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string>('');

  // 快速健康检查
  const performQuickCheck = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await quickHealthCheckAction();
      if (result.success) {
        setHealth(result.data as HealthStatus);
      } else {
        setError(result.error || '快速检查失败');
      }
    } catch {
      setError('快速检查失败');
    } finally {
      setLoading(false);
    }
  };

  // 完整性验证
  const performFullCheck = async () => {
    setChecking(true);
    setError('');
    
    try {
      const result = await validateDataIntegrityAction();
      if (result.success) {
        setReport(result.data as IntegrityReport);
        
        // 同时更新健康状态
        await performQuickCheck();
      } else {
        setError(result.error || '完整性验证失败');
      }
    } catch {
      setError('完整性验证失败');
    } finally {
      setChecking(false);
    }
  };

  // 获取健康状态颜色
  const getHealthColor = () => {
    if (!health) return 'gray';
    return health.healthy ? 'green' : 'red';
  };

  // 获取验证状态颜色
  const getValidityColor = () => {
    if (!report) return 'gray';
    if (report.errors.length > 0) return 'red';
    if (report.warnings.length > 0) return 'yellow';
    return 'green';
  };

  return (
    <div className="rounded-lg shadow-md p-6" style={{
      backgroundColor: 'var(--background)',
      border: '1px solid var(--card-border)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>🔍 数据完整性检查</h2>
        <div className="flex gap-2">
          <button
            onClick={performQuickCheck}
            disabled={loading || checking}
            className="px-4 py-2 text-white rounded disabled:opacity-50 transition-colors"
            style={{
              backgroundColor: 'var(--flow-primary)',
              border: '1px solid var(--flow-primary)'
            }}
          >
            {loading ? '检查中...' : '⚡ 快速检查'}
          </button>
          <button
            onClick={performFullCheck}
            disabled={loading || checking}
            className="px-4 py-2 text-white rounded disabled:opacity-50 transition-colors"
            style={{
              backgroundColor: 'var(--text-success)',
              border: '1px solid var(--text-success)'
            }}
          >
            {checking ? '验证中...' : '🔍 完整验证'}
          </button>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="rounded-lg p-4 mb-4" style={{
          backgroundColor: 'var(--text-error)/10',
          border: '1px solid var(--text-error)'
        }}>
          <p style={{ color: 'var(--text-error)' }}>{error}</p>
        </div>
      )}

      {/* 快速健康状态 */}
      {health && (
        <div className="mb-6">
          <h3 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>⚡ 系统健康状态</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: health.healthy ? 'var(--text-success)/10' : 'var(--text-error)/10',
              border: `1px solid ${health.healthy ? 'var(--text-success)' : 'var(--text-error)'}`
            }}>
              <div className="text-2xl font-bold" style={{
                color: health.healthy ? 'var(--text-success)' : 'var(--text-error)'
              }}>
                {health.healthy ? '✅' : '❌'}
              </div>
              <div className="text-sm" style={{
                color: health.healthy ? 'var(--text-success)' : 'var(--text-error)'
              }}>
                {health.healthy ? '系统正常' : '系统异常'}
              </div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: 'var(--flow-primary)/10',
              border: '1px solid var(--flow-primary)'
            }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--flow-primary)' }}>{health.entryCount}</div>
              <div className="text-sm" style={{ color: 'var(--flow-primary)' }}>记录总数</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: 'var(--dynamic-primary)/10',
              border: '1px solid var(--dynamic-primary)'
            }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--dynamic-primary)' }}>{health.knowledgeCount}</div>
              <div className="text-sm" style={{ color: 'var(--dynamic-primary)' }}>知识文档</div>
            </div>
          </div>
        </div>
      )}

      {/* 完整性验证报告 */}
      {report && (
        <div className="border-t pt-6">
          <h3 className="font-medium mb-4" style={{ color: 'var(--text-primary)' }}>🔍 完整性验证报告</h3>
          
          {/* 验证概览 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: report.isValid ? 'var(--text-success)/10' : 'var(--text-error)/10',
              border: `1px solid ${report.isValid ? 'var(--text-success)' : 'var(--text-error)'}`
            }}>
              <div className="text-2xl font-bold" style={{
                color: report.isValid ? 'var(--text-success)' : 'var(--text-error)'
              }}>
                {report.isValid ? '✅' : '❌'}
              </div>
              <div className="text-sm" style={{
                color: report.isValid ? 'var(--text-success)' : 'var(--text-error)'
              }}>
                {report.isValid ? '验证通过' : '验证失败'}
              </div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: 'var(--text-success)/10',
              border: '1px solid var(--text-success)'
            }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-success)' }}>
                {report.passedChecks}/{report.totalChecks}
              </div>
              <div className="text-sm" style={{ color: 'var(--text-success)' }}>检查通过</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: 'var(--text-error)/10',
              border: '1px solid var(--text-error)'
            }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-error)' }}>{report.errors.length}</div>
              <div className="text-sm" style={{ color: 'var(--text-error)' }}>错误</div>
            </div>
            <div className="rounded-lg p-4 text-center" style={{
              backgroundColor: 'var(--text-warning)/10',
              border: '1px solid var(--text-warning)'
            }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text-warning)' }}>{report.warnings.length}</div>
              <div className="text-sm" style={{ color: 'var(--text-warning)' }}>警告</div>
            </div>
          </div>

          {/* 错误列表 */}
          {report.errors.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-error)' }}>❌ 错误信息</h4>
              <div className="rounded-lg p-4" style={{
                backgroundColor: 'var(--text-error)/10',
                border: '1px solid var(--text-error)'
              }}>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-error)' }}>
                  {report.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 警告列表 */}
          {report.warnings.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2" style={{ color: 'var(--text-warning)' }}>⚠️ 警告信息</h4>
              <div className="rounded-lg p-4" style={{
                backgroundColor: 'var(--text-warning)/10',
                border: '1px solid var(--text-warning)'
              }}>
                <ul className="text-sm space-y-1" style={{ color: 'var(--text-warning)' }}>
                  {report.warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 详细信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 记录数据详情 */}
            <div className="rounded-lg p-4" style={{
              backgroundColor: 'var(--card-glass)',
              border: '1px solid var(--card-border)'
            }}>
              <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>📝 记录数据详情</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>总记录数：</span>
                  <span className="font-medium">{report.details.entries.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>有内容记录：</span>
                  <span className="font-medium">{report.details.entries.withContent}</span>
                </div>
                <div className="flex justify-between">
                  <span>有时间戳记录：</span>
                  <span className="font-medium">{report.details.entries.withTimestamps}</span>
                </div>
                <div className="flex justify-between">
                  <span>重要程度有效：</span>
                  <span className="font-medium">{report.details.entries.withValidImportance}</span>
                </div>
              </div>
            </div>

            {/* 知识库详情 */}
            <div className="rounded-lg p-4" style={{
              backgroundColor: 'var(--card-glass)',
              border: '1px solid var(--card-border)'
            }}>
              <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>📚 知识库详情</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>总文档数：</span>
                  <span className="font-medium">{report.details.knowledgeBase.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>活跃文档：</span>
                  <span className="font-medium">{report.details.knowledgeBase.active}</span>
                </div>
                <div className="flex justify-between">
                  <span>有内容文档：</span>
                  <span className="font-medium">{report.details.knowledgeBase.withContent}</span>
                </div>
              </div>
            </div>

            {/* 数据库详情 */}
            <div className="rounded-lg p-4" style={{
              backgroundColor: 'var(--card-glass)',
              border: '1px solid var(--card-border)'
            }}>
              <h4 className="font-medium mb-3" style={{ color: 'var(--text-primary)' }}>🗄️ 数据库详情</h4>
              <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <div className="flex justify-between">
                  <span>核心表存在：</span>
                  <span className="font-medium" style={{
                    color: report.details.database.tablesExist ? 'var(--text-success)' : 'var(--text-error)'
                  }}>
                    {report.details.database.tablesExist ? '✅ 是' : '❌ 否'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>索引完整：</span>
                  <span className="font-medium" style={{
                    color: report.details.database.indexesExist ? 'var(--text-success)' : 'var(--text-warning)'
                  }}>
                    {report.details.database.indexesExist ? '✅ 是' : '⚠️ 部分'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 未检查状态 */}
      {!health && !report && !loading && !checking && (
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          <p className="mb-2">还未进行数据完整性检查</p>
          <p className="text-sm">点击上方按钮开始检查数据完整性</p>
        </div>
      )}

      {/* 检查进行中状态 */}
      {(loading || checking) && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--flow-primary)' }}></div>
          <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>
            {loading ? '正在进行快速检查...' : '正在进行完整验证...'}
          </span>
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-6 rounded-lg p-4" style={{
        backgroundColor: 'var(--flow-primary)/10',
        border: '1px solid var(--flow-primary)'
      }}>
        <h3 className="font-medium mb-2" style={{ color: 'var(--flow-primary)' }}>💡 检查说明</h3>
        <div className="text-sm space-y-1" style={{ color: 'var(--flow-primary)' }}>
          <p>• <strong>快速检查</strong>：检查系统基本健康状态和数据统计</p>
          <p>• <strong>完整验证</strong>：全面检查数据完整性、一致性和有效性</p>
          <p>• <strong>自动修复</strong>：大部分问题可以通过重新同步或备份恢复解决</p>
          <p>• <strong>定期检查</strong>：建议每周进行一次完整验证，确保数据质量</p>
        </div>
      </div>
    </div>
  );
}