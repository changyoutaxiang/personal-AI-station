'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Palette, Settings, TestTube2 } from 'lucide-react';
import ColorSchemeToggle from './ColorSchemeToggle';

interface ThemeControllerProps {
  mode?: 'full' | 'compact' | 'debug';
  showBackgroundSwitcher?: boolean;
  iconColor?: 'white' | 'adaptive';
}

const ThemeController: React.FC<ThemeControllerProps> = ({ 
  mode = 'full', 
  showBackgroundSwitcher = true,
  iconColor = 'adaptive'
}) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // 加载背景配置
    const loadBackgrounds = async () => {
      try {
        const res = await fetch('/themes/themes.json', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const fromConfig = Array.isArray(data?.themes)
            ? data.themes.map((t: any) => t?.background).filter(Boolean)
            : [];
          if (fromConfig.length > 0) {
            setBackgrounds(fromConfig);
          }
        }
      } catch (e) {
        console.error('读取背景配置失败:', e);
      }
    };

    loadBackgrounds();
  }, []);

  const handleRandomBackground = () => {
    const source = backgrounds.length > 0 
      ? backgrounds 
      : [
          '/greg-rakozy-oMpAz-DN-9I-unsplash.jpg',
          '/themes/backgrounds/1.jpg',
          '/themes/backgrounds/2.jpg',
        ];

    const randomIndex = Math.floor(Math.random() * source.length);
    const selectedBackground = source[randomIndex];

    // 优先应用到首页背景容器
    const hero = document.getElementById('hero-bg');
    if (hero) {
      if (selectedBackground.startsWith('linear-gradient')) {
        (hero as HTMLElement).style.backgroundImage = selectedBackground;
      } else {
        (hero as HTMLElement).style.backgroundImage = `url('${selectedBackground}')`;
      }
      return;
    }

    // 回退：应用到 body 元素
    const body = document.body;
    if (selectedBackground.startsWith('linear-gradient')) {
      body.style.background = selectedBackground;
      body.style.backgroundAttachment = 'fixed';
    } else {
      body.style.background = `url('${selectedBackground}') center/cover no-repeat fixed`;
    }
  };

  const themes = [
    {
      id: 'warm',
      name: '温暖粉色',
      description: '温馨的粉紫色调，营造舒适的使用体验',
      colors: ['var(--dynamic-primary)', 'var(--dynamic-secondary)', 'var(--text-success)', 'var(--text-warning)'],
      gradient: 'linear-gradient(to right, var(--dynamic-primary), var(--dynamic-secondary))'
    },
    {
      id: 'cyber',
      name: '科技未来',
      description: '霓虹青色调，营造科技感和未来感的视觉体验',
      colors: ['var(--flow-primary)', 'var(--dynamic-primary)', 'var(--dynamic-secondary)', 'var(--text-secondary)'],
      gradient: 'linear-gradient(to right, var(--flow-primary), var(--dynamic-primary), var(--dynamic-secondary))'
    },
    {
      id: 'forest',
      name: '森林绿',
      description: '自然舒适的森林绿调，营造专注的工作环境',
      colors: ['#2f7f60', '#6b8e62', '#a8e6cf', '#79cfa8'],
      gradient: 'linear-gradient(to right, #2f7f60, #6b8e62)'
    },
    {
      id: 'dopamine',
      name: '多巴胺',
      description: '充满活力的橙红色调，激发创造力和积极情绪',
      colors: ['#FF6B47', '#FFD700', '#6366F1', '#00D084'],
      gradient: 'linear-gradient(90deg, #FF6B47, #FFD700, #6366F1)'
    }
  ];

  if (!mounted) {
    return <div>加载中...</div>;
  }

  // 紧凑模式 - 只显示快速切换按钮
  if (mode === 'compact') {
    return (
      <div className="flex items-center gap-2">
        {/* 只有在不显示背景切换器时才显示主题选择按钮 */}
        {!showBackgroundSwitcher && themes.map((themeOption) => (
          <button
            key={themeOption.id}
            onClick={() => setTheme(themeOption.id as any)}
            className="w-8 h-8 rounded-full border-2 transition-all duration-200"
            style={{
              background: themeOption.gradient,
              borderColor: theme === themeOption.id ? 'var(--text-primary)' : 'var(--card-border)',
              opacity: theme === themeOption.id ? 1 : 0.6
            }}
            title={themeOption.name}
          />
        ))}
        {showBackgroundSwitcher && (
          <button
            onClick={handleRandomBackground}
            className="group relative p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
            title="切换背景图"
          >
            <Palette className={`w-5 h-5 ${iconColor === 'white' ? 'text-white' : ''}`} style={iconColor === 'adaptive' ? { color: 'var(--text-primary)' } : {}} />
            
            {/* 悬停提示 */}
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                背景图
              </div>
            </div>
          </button>
        )}
      </div>
    );
  }

  // 调试模式
  if (mode === 'debug') {
    return (
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">🧪 主题调试面板</h2>
          <button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg border transition-colors"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)'
            }}
          >
            <TestTube2 className="w-4 h-4" />
            {showDebugPanel ? '隐藏' : '显示'}调试信息
          </button>
        </div>

        {/* 快速切换按钮 */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">快速切换:</h3>
          <div className="flex gap-2 flex-wrap">
            {themes.map((themeOption) => (
              <button
                key={themeOption.id}
                onClick={() => setTheme(themeOption.id as any)}
                className="px-4 py-2 rounded font-medium transition-colors"
                style={{
                  backgroundColor: theme === themeOption.id ? 'var(--dynamic-primary)' : 'var(--card-glass)',
                  color: theme === themeOption.id ? 'white' : 'var(--text-primary)',
                  border: `1px solid ${theme === themeOption.id ? 'var(--dynamic-primary)' : 'var(--card-border)'}`
                }}
              >
                {themeOption.name}
              </button>
            ))}
          </div>
        </div>

        {/* 调试信息面板 */}
        {showDebugPanel && (
          <>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">当前状态:</h3>
              <div className="space-y-2 text-sm font-mono">
                <div>Context主题: <span className="px-2 py-1 rounded" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)'}}>{theme}</span></div>
                <div>DOM属性: <span className="px-2 py-1 rounded" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)'}}>{document.documentElement.getAttribute('data-theme')}</span></div>
                <div>localStorage: <span className="px-2 py-1 rounded" style={{backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)'}}>{localStorage.getItem('app-theme')}</span></div>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">CSS变量测试:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm mb-1">背景色 (--background):</div>
                  <div className="h-12 rounded border" style={{background: 'var(--background)'}}></div>
                </div>
                <div>
                  <div className="text-sm mb-1">前景色 (--foreground):</div>
                  <div 
                    className="h-12 rounded border flex items-center justify-center" 
                    style={{backgroundColor: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--foreground)'}}
                  >
                    文字
                  </div>
                </div>
                <div>
                  <div className="text-sm mb-1">主色 (--dynamic-primary):</div>
                  <div className="h-12 rounded border" style={{backgroundColor: 'var(--dynamic-primary)'}}></div>
                </div>
                <div>
                  <div className="text-sm mb-1">次色 (--dynamic-secondary):</div>
                  <div className="h-12 rounded border" style={{backgroundColor: 'var(--dynamic-secondary)'}}></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // 完整模式 - 显示详细的主题选择界面
  return (
    <div 
      className="p-6 rounded-lg shadow-sm transition-all duration-300" 
      style={{
        backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.95))',
        border: '1px solid var(--card-border, #e5e7eb)',
        boxShadow: 'var(--card-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1))'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎨</span>
          <h3 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>主题设置</h3>
        </div>
        
        {showBackgroundSwitcher && (
          <button
            onClick={handleRandomBackground}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: 'var(--card-glass)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-primary)'
            }}
          >
            <Palette className="w-4 h-4" />
            <span className="text-sm">随机背景</span>
          </button>
        )}
      </div>
      
      <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
        选择您喜欢的界面主题风格，设置会自动保存。
      </p>

      <div className="space-y-4">
        {themes.map((themeOption) => (
          <div 
            key={themeOption.id}
            className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
            style={{
              borderColor: theme === themeOption.id ? 'var(--dynamic-primary)' : 'var(--card-border)',
              background: theme === themeOption.id 
                ? 'linear-gradient(to right, var(--dynamic-primary)/10, var(--dynamic-primary)/20)' 
                : 'var(--card-glass)',
              boxShadow: theme === themeOption.id ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
            }}
            onClick={() => setTheme(themeOption.id as any)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full shadow-md" 
                  style={{ background: themeOption.gradient }}
                ></div>
                <div>
                  <h4 className="font-medium" style={{color: 'var(--text-primary)'}}>{themeOption.name}</h4>
                  <p className="text-sm" style={{color: 'var(--text-secondary)'}}>{themeOption.description}</p>
                </div>
              </div>
              <div 
                className="w-5 h-5 rounded-full border-2 transition-all duration-200" 
                style={{
                  borderColor: theme === themeOption.id ? 'var(--dynamic-primary)' : 'var(--card-border)',
                  backgroundColor: theme === themeOption.id ? 'var(--dynamic-primary)' : 'transparent'
                }}
              >
                {theme === themeOption.id && (
                  <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
                )}
              </div>
            </div>
            
            {/* 预览色彩 */}
            <div className="flex gap-2 mt-3">
              {themeOption.colors.map((color, index) => (
                <div key={index} className="w-6 h-6 rounded" style={{ backgroundColor: color }}></div>
              ))}
            </div>

            {/* 多巴胺主题特殊渐变预览 */}
            {themeOption.id === 'dopamine' && (
              <div 
                className="h-3 rounded-full mt-2" 
                style={{ background: themeOption.gradient }}
                title="多巴胺主题渐变预览"
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* 颜色模式切换 */}
      <div className="mt-8">
        <ColorSchemeToggle />
      </div>

      <div className="mt-6 p-3 rounded-lg" style={{
        backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.1))',
        border: '1px solid var(--card-border, rgba(255, 255, 255, 0.2))'
      }}>
        <div className="flex items-center gap-2" style={{color: 'var(--flow-primary)'}}>
          <span className="text-sm">💡</span>
          <span className="text-sm font-medium">提示</span>
        </div>
        <p className="text-sm mt-1" style={{color: 'var(--text-secondary)'}}>
          主题和颜色模式切换会立即生效，您的选择会自动保存到本地存储中。
        </p>
      </div>
    </div>
  );
};

export default ThemeController;