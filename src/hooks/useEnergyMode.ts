import { useState, useEffect } from 'react';

export type EnergyMode = 'normal' | 'eco' | 'auto';

interface EnergyModeState {
  mode: EnergyMode;
  isLowBattery: boolean;
  prefersReducedMotion: boolean;
  shouldReduceAnimations: boolean;
}

export const useEnergyMode = () => {
  const [energyState, setEnergyState] = useState<EnergyModeState>({
    mode: 'normal',
    isLowBattery: false,
    prefersReducedMotion: false,
    shouldReduceAnimations: false
  });

  // 检测用户偏好设置
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => {
      setEnergyState(prev => ({
        ...prev,
        prefersReducedMotion: e.matches,
        shouldReduceAnimations: prev.mode === 'auto' ? e.matches || prev.isLowBattery : prev.mode === 'eco'
      }));
    };

    setEnergyState(prev => ({
      ...prev,
      prefersReducedMotion: mediaQuery.matches,
      shouldReduceAnimations: prev.mode === 'auto' ? mediaQuery.matches || prev.isLowBattery : prev.mode === 'eco'
    }));

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 检测电池状态（如果支持）
  useEffect(() => {
    const checkBatteryStatus = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as unknown as { getBattery: () => Promise<{ level: number; charging: boolean; addEventListener: (event: string, listener: () => void) => void; removeEventListener: (event: string, listener: () => void) => void }> }).getBattery();
          const updateBatteryStatus = () => {
            const isLow = battery.level < 0.2 || battery.charging === false && battery.level < 0.3;
            setEnergyState(prev => ({
              ...prev,
              isLowBattery: isLow,
              shouldReduceAnimations: prev.mode === 'auto' ? isLow || prev.prefersReducedMotion : prev.mode === 'eco'
            }));
          };

          updateBatteryStatus();
          battery.addEventListener('levelchange', updateBatteryStatus);
          battery.addEventListener('chargingchange', updateBatteryStatus);

          return () => {
            battery.removeEventListener('levelchange', updateBatteryStatus);
            battery.removeEventListener('chargingchange', updateBatteryStatus);
          };
        } catch (error) {
          console.log('Battery API not available:', error);
        }
      }
    };

    checkBatteryStatus();
  }, []);

  // 设置能耗模式
  const setEnergyMode = (mode: EnergyMode) => {
    setEnergyState(prev => {
      const newState = {
        ...prev,
        mode,
        shouldReduceAnimations: mode === 'eco' || (mode === 'auto' && (prev.isLowBattery || prev.prefersReducedMotion))
      };
      
      // 更新DOM属性
      document.documentElement.setAttribute('data-energy-mode', mode);
      document.documentElement.setAttribute('data-reduce-animations', newState.shouldReduceAnimations.toString());
      
      // 保存用户偏好
      localStorage.setItem('energy-mode', mode);
      
      return newState;
    });
  };

  // 从localStorage恢复设置
  useEffect(() => {
    const savedMode = localStorage.getItem('energy-mode') as EnergyMode;
    if (savedMode && ['normal', 'eco', 'auto'].includes(savedMode)) {
      setEnergyMode(savedMode);
    } else {
      setEnergyMode('auto'); // 默认自动模式
    }
  }, []);

  // 获取当前有效的能耗模式
  const getEffectiveMode = (): 'normal' | 'eco' => {
    if (energyState.mode === 'eco') return 'eco';
    if (energyState.mode === 'auto' && energyState.shouldReduceAnimations) return 'eco';
    return 'normal';
  };

  return {
    ...energyState,
    setEnergyMode,
    effectiveMode: getEffectiveMode(),
    // 便捷方法
    isEcoMode: getEffectiveMode() === 'eco',
    isNormalMode: getEffectiveMode() === 'normal'
  };
};

// 节能模式配置
export const ENERGY_CONFIG = {
  normal: {
    animationDuration: 1,
    blurIntensity: 16,
    shadowIntensity: 1,
    gradientComplexity: 'full',
    enableParticles: true,
    enableHoverEffects: true
  },
  eco: {
    animationDuration: 0.5,
    blurIntensity: 4,
    shadowIntensity: 0.3,
    gradientComplexity: 'simple',
    enableParticles: false,
    enableHoverEffects: false
  }
} as const;

// CSS变量更新工具
export const updateEnergyCSS = (mode: 'normal' | 'eco') => {
  const config = ENERGY_CONFIG[mode];
  const root = document.documentElement;
  
  root.style.setProperty('--animation-duration-multiplier', config.animationDuration.toString());
  root.style.setProperty('--blur-intensity', `${config.blurIntensity}px`);
  root.style.setProperty('--shadow-intensity', config.shadowIntensity.toString());
  root.style.setProperty('--enable-particles', config.enableParticles ? '1' : '0');
  root.style.setProperty('--enable-hover-effects', config.enableHoverEffects ? '1' : '0');
};