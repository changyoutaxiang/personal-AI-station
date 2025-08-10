'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface HistorySettingsProps {
  historyLimit: number;
  onHistoryLimitChange: (limit: number) => void;
}

export default function HistorySettings({ 
  historyLimit, 
  onHistoryLimitChange 
}: HistorySettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempLimit, setTempLimit] = useState(historyLimit);

  const handleSave = () => {
    if (tempLimit < 1 || tempLimit > 100) {
      toast.error('历史记录限制必须在1-100之间');
      return;
    }
    
    onHistoryLimitChange(tempLimit);
    setIsOpen(false);
    toast.success(`历史记录限制已设置为 ${tempLimit} 条`);
  };

  const handleReset = () => {
    setTempLimit(20); // 默认值
  };

  const presetOptions = [
    { value: 10, label: '10条 (简短对话)' },
    { value: 20, label: '20条 (推荐)' },
    { value: 50, label: '50条 (长对话)' },
    { value: 100, label: '100条 (完整记忆)' }
  ];

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        style={{ color: 'var(--text-secondary)' }}
        title="历史记录设置"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>历史记录: {historyLimit}条</span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* 下拉面板 */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 mt-2 w-80 rounded-lg border shadow-lg z-50"
          style={{ 
            backgroundColor: 'var(--card-glass)', 
            borderColor: 'var(--card-border)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div className="p-4">
            <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
              历史记录设置
            </h3>
            
            <div className="space-y-3">
              {/* 说明文字 */}
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                设置携带的历史消息数量。较少的历史记录可以减少token消耗，较多的历史记录能提供更好的上下文连续性。
              </p>

              {/* 预设选项 */}
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  快速选择:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {presetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTempLimit(option.value)}
                      className={`p-2 text-xs rounded-lg border transition-colors ${
                        tempLimit === option.value
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                      style={{ 
                        color: tempLimit === option.value ? 'var(--flow-primary)' : 'var(--text-secondary)',
                        borderColor: tempLimit === option.value ? 'var(--flow-primary)' : 'var(--card-border)'
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 自定义输入 */}
              <div className="space-y-2">
                <label className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                  自定义数量 (1-100):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tempLimit}
                    onChange={(e) => setTempLimit(parseInt(e.target.value) || 1)}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border"
                    style={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--card-border)',
                      color: 'var(--text-primary)'
                    }}
                  />
                  <button
                    onClick={handleReset}
                    className="px-3 py-2 text-xs rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    title="重置为默认值"
                  >
                    重置
                  </button>
                </div>
              </div>

              {/* Token估算提示 */}
              <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <div className="flex justify-between">
                    <span>预估Token消耗:</span>
                    <span className={tempLimit > 50 ? 'text-orange-500' : tempLimit > 20 ? 'text-yellow-500' : 'text-green-500'}>
                      {tempLimit < 10 ? '很低' : tempLimit < 30 ? '中等' : tempLimit < 60 ? '较高' : '很高'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <button
                onClick={() => {
                  setTempLimit(historyLimit);
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-sm rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                style={{ color: 'var(--text-secondary)' }}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm rounded-lg font-medium transition-colors"
                style={{ 
                  backgroundColor: 'var(--flow-primary)', 
                  color: 'white'
                }}
              >
                保存设置
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
