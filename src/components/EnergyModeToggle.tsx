'use client';

import { useEnergyMode, updateEnergyCSS, type EnergyMode } from '@/hooks/useEnergyMode';
import { useEffect } from 'react';

const EnergyModeToggle = () => {
  const { mode, effectiveMode, isLowBattery, prefersReducedMotion, setEnergyMode } = useEnergyMode();

  // 当有效模式改变时更新CSS变量
  useEffect(() => {
    updateEnergyCSS(effectiveMode);
  }, [effectiveMode]);

  const handleModeChange = (newMode: EnergyMode) => {
    setEnergyMode(newMode);
  };

  const getModeIcon = (modeType: EnergyMode) => {
    switch (modeType) {
      case 'normal': return '⚡';
      case 'eco': return '🌱';
      case 'auto': return '🤖';
      default: return '⚡';
    }
  };

  const getModeLabel = (modeType: EnergyMode) => {
    switch (modeType) {
      case 'normal': return '标准模式';
      case 'eco': return '节能模式';
      case 'auto': return '智能模式';
      default: return '标准模式';
    }
  };

  const getModeDescription = (modeType: EnergyMode) => {
    switch (modeType) {
      case 'normal': return '完整视觉效果，最佳体验';
      case 'eco': return '简化动画，节省电量';
      case 'auto': return '根据设备状态自动调节';
      default: return '完整视觉效果，最佳体验';
    }
  };

  return (
    <div className="backdrop-blur-sm rounded-xl p-4 shadow-lg" style={{backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)', color: 'var(--text-primary)'}}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium flex items-center gap-2" style={{color: 'var(--text-primary)'}}>
          <span className="text-lg">🔋</span>
          能耗模式
        </h3>
        
        {/* 状态指示器 */}
        <div className="flex items-center gap-2 text-xs">
          {isLowBattery && (
            <span className="px-2 py-1 rounded-full flex items-center gap-1" style={{
              backgroundColor: 'var(--tag-red-bg)', color: 'var(--tag-red-text)', border: '1px solid var(--tag-red-border)'
            }}>
              🔋 低电量
            </span>
          )}
          {prefersReducedMotion && (
            <span className="px-2 py-1 rounded-full flex items-center gap-1" style={{
              backgroundColor: 'var(--tag-blue-bg)', color: 'var(--tag-blue-text)', border: '1px solid var(--tag-blue-border)'
            }}>
              ♿ 减少动效
            </span>
          )}
          <span className="px-2 py-1 rounded-full flex items-center gap-1" style={{
            backgroundColor: effectiveMode === 'eco' ? 'var(--tag-green-bg)' : 'var(--tag-blue-bg)',
            color: effectiveMode === 'eco' ? 'var(--tag-green-text)' : 'var(--tag-blue-text)',
            border: `1px solid ${effectiveMode === 'eco' ? 'var(--tag-green-border)' : 'var(--tag-blue-border)'}`
          }}>
            {effectiveMode === 'eco' ? '🌱 节能中' : '⚡ 标准'}
          </span>
        </div>
      </div>

      {/* 模式选择器 */}
      <div className="grid grid-cols-3 gap-2">
        {(['normal', 'eco', 'auto'] as EnergyMode[]).map((modeType) => (
          <button
            key={modeType}
            onClick={() => handleModeChange(modeType)}
            className={`relative p-3 rounded-lg border transition-all duration-200 ${mode === modeType ? 'shadow-lg' : ''}`}
            style={
              mode === modeType
                ? { backgroundColor: 'color-mix(in oklab, var(--flow-primary) 18%, transparent)', borderColor: 'color-mix(in oklab, var(--flow-primary) 40%, transparent)', color: 'var(--text-on-primary)' }
                : { backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }
            }
          >
            <div className="text-center">
              <div className="text-xl mb-1">{getModeIcon(modeType)}</div>
              <div className="text-xs font-medium mb-1">{getModeLabel(modeType)}</div>
              <div className="text-xs leading-tight" style={{color: 'var(--text-secondary)'}}>
                {getModeDescription(modeType)}
              </div>
            </div>
            
            {/* 选中指示器 */}
            {mode === modeType && (
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2" style={{ backgroundColor: 'var(--flow-primary)', borderColor: 'var(--card-glass)' }}></div>
            )}
          </button>
        ))}
      </div>

      {/* 当前状态说明 */}
      <div className="mt-3 p-2 rounded-lg border" style={{backgroundColor: 'var(--card-glass)', borderColor: 'var(--card-border)'}}>
        <div className="text-xs" style={{color: 'var(--text-secondary)'}}>
          <span className="font-medium" style={{color: 'var(--text-primary)'}}>当前状态：</span>
          {mode === 'auto' ? (
            <span>
              智能模式 → {effectiveMode === 'eco' ? '节能运行' : '标准运行'}
              {isLowBattery && ' (检测到低电量)'}
              {prefersReducedMotion && ' (系统偏好减少动效)'}
            </span>
          ) : (
            <span>{getModeDescription(mode)}</span>
          )}
        </div>
      </div>

      {/* 节能提示 */}
      {effectiveMode === 'eco' && (
        <div className="mt-2 p-2 rounded-lg" style={{backgroundColor: 'var(--tag-green-bg)', border: '1px solid var(--tag-green-border)'}}>
          <div className="text-xs flex items-center gap-2" style={{color: 'var(--tag-green-text)'}}>
            <span>💡</span>
            <span>节能模式已启用，动画效果已简化以节省电量</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnergyModeToggle;