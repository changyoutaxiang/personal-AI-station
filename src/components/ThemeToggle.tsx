'use client';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import ColorSchemeToggle from './ColorSchemeToggle';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div 
      className="p-6 rounded-lg shadow-sm transition-all duration-300" 
      style={{
        backgroundColor: 'var(--card-glass, rgba(255, 255, 255, 0.95))',
        border: '1px solid var(--card-border, #e5e7eb)',
        boxShadow: 'var(--card-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1))'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🎨</span>
        <h3 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>主题设置</h3>
      </div>
      
      <p className="mb-6" style={{color: 'var(--text-secondary)'}}>
        选择您喜欢的界面主题风格，设置会自动保存。
      </p>

      <div className="space-y-4">
        {/* 温暖粉色主题 */}
        <div 
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: theme === 'warm' ? 'var(--dynamic-primary)' : 'var(--card-border)',
            background: theme === 'warm' ? 'linear-gradient(to right, var(--dynamic-primary)/10, var(--dynamic-primary)/20)' : 'var(--card-glass)',
            boxShadow: theme === 'warm' ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
          onClick={() => setTheme('warm')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(to right, var(--dynamic-primary), var(--dynamic-secondary))'
              }}></div>
              <div>
                <h4 className="font-medium" style={{color: 'var(--text-primary)'}}>温暖粉色</h4>
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>温馨的粉紫色调，营造舒适的使用体验</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: theme === 'warm' ? 'var(--dynamic-primary)' : 'var(--card-border)',
              backgroundColor: theme === 'warm' ? 'var(--dynamic-primary)' : 'transparent'
            }}>
              {theme === 'warm' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
          
          {/* 预览色彩 */}
          <div className="flex gap-2 mt-3">
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--dynamic-primary)' }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--dynamic-secondary)' }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--text-success)' }}></div>
            <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--text-warning)' }}></div>
          </div>
        </div>

        

  
        {/* 科技未来主题 */}
        <div
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: theme === 'cyber' ? 'var(--flow-primary)' : 'var(--card-border)',
            background: theme === 'cyber' ? 'linear-gradient(to right, var(--card-glass), var(--flow-primary)/30)' : 'var(--card-glass)',
            boxShadow: theme === 'cyber' ? '0 10px 15px -3px var(--flow-primary)/20' : 'none'
          }}
          onClick={() => setTheme('cyber')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(to right, var(--flow-primary), var(--dynamic-primary), var(--dynamic-secondary))',
                boxShadow: theme === 'cyber' ? '0 4px 6px -1px var(--flow-primary)/30' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}></div>
              <div>
                <h4 className="font-medium" style={{
                  color: theme === 'cyber' ? '#ffffff' : 'var(--text-primary)'
                }}>科技未来</h4>
                <p className="text-sm" style={{
                  color: theme === 'cyber' ? '#e2e8f0' : 'var(--text-secondary)'
                }}>霓虹青色调，营造科技感和未来感的视觉体验</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: theme === 'cyber' ? 'var(--flow-primary)' : 'var(--card-border)',
              backgroundColor: theme === 'cyber' ? 'var(--flow-primary)' : 'transparent',
              boxShadow: theme === 'cyber' ? '0 1px 2px 0 var(--flow-primary)/50' : 'none'
            }}>
              {theme === 'cyber' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
          
          {/* 预览色彩 */}
          <div className="flex gap-2 mt-3">
             <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--flow-primary)' }}></div>
             <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--dynamic-primary)' }}></div>
             <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--dynamic-secondary)' }}></div>
             <div className="w-6 h-6 rounded" style={{ backgroundColor: 'var(--text-secondary)' }}></div>
           </div>
         </div>

        {/* 森林绿主题 */}
        <div
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: theme === 'forest' ? 'var(--dynamic-primary)' : 'var(--card-border)',
            background: theme === 'forest' ? 'linear-gradient(to right, var(--card-glass), rgba(47, 127, 96, 0.1))' : 'var(--card-glass)',
            boxShadow: theme === 'forest' ? '0 10px 15px -3px rgba(47, 127, 96, 0.2)' : 'none'
          }}
          onClick={() => setTheme('forest')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(to right, #2f7f60, #6b8e62)',
                boxShadow: theme === 'forest' ? '0 4px 6px -1px rgba(47, 127, 96, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}></div>
              <div>
                <h4 className="font-medium" style={{
                  color: theme === 'forest' ? 'var(--text-primary)' : 'var(--text-primary)'
                }}>森林绿</h4>
                <p className="text-sm" style={{
                  color: theme === 'forest' ? 'var(--text-secondary)' : 'var(--text-secondary)'
                }}>自然舒适的森林绿调，营造专注的工作环境</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: theme === 'forest' ? '#2f7f60' : 'var(--card-border)',
              backgroundColor: theme === 'forest' ? '#2f7f60' : 'transparent',
              boxShadow: theme === 'forest' ? '0 1px 2px 0 rgba(47, 127, 96, 0.5)' : 'none'
            }}>
              {theme === 'forest' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
          
          {/* 预览色彩 */}
          <div className="flex gap-2 mt-3">
             <div className="w-6 h-6 rounded" style={{ backgroundColor: '#2f7f60' }}></div>
             <div className="w-6 h-6 rounded" style={{ backgroundColor: '#6b8e62' }}></div>
             <div className="w-6 h-6 rounded" style={{ backgroundColor: '#a8e6cf' }}></div>
             <div className="w-6 h-6 rounded" style={{ backgroundColor: '#79cfa8' }}></div>
           </div>
         </div>

        {/* 多巴胺主题 */}
        <div
          className="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300"
          style={{
            borderColor: theme === 'dopamine' ? '#FF6B47' : 'var(--card-border)',
            background: theme === 'dopamine' ? 'linear-gradient(to right, var(--card-glass), rgba(255, 107, 71, 0.1))' : 'var(--card-glass)',
            boxShadow: theme === 'dopamine' ? '0 10px 15px -3px rgba(255, 107, 71, 0.2)' : 'none'
          }}
          onClick={() => setTheme('dopamine')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full shadow-md" style={{
                background: 'linear-gradient(90deg, #FF6B47, #FFD700, #6366F1)',
                boxShadow: theme === 'dopamine' ? '0 4px 6px -1px rgba(255, 107, 71, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}></div>
              <div>
                <h4 className="font-medium" style={{
                  color: theme === 'dopamine' ? 'var(--text-primary)' : 'var(--text-primary)'
                }}>多巴胺</h4>
                <p className="text-sm" style={{
                  color: theme === 'dopamine' ? 'var(--text-secondary)' : 'var(--text-secondary)'
                }}>充满活力的橙红色调，激发创造力和积极情绪</p>
              </div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 transition-all duration-200" style={{
              borderColor: theme === 'dopamine' ? '#FF6B47' : 'var(--card-border)',
              backgroundColor: theme === 'dopamine' ? '#FF6B47' : 'transparent',
              boxShadow: theme === 'dopamine' ? '0 1px 2px 0 rgba(255, 107, 71, 0.5)' : 'none'
            }}>
              {theme === 'dopamine' && (
                <div className="w-full h-full rounded-full scale-50" style={{ backgroundColor: 'var(--background)' }}></div>
              )}
            </div>
          </div>
          
          {/* 预览色彩 */}
          <div className="space-y-2 mt-3">
            {/* 渐变预览条 */}
            <div 
              className="h-3 rounded-full" 
              style={{ background: 'linear-gradient(90deg, #FF6B47, #FFD700, #6366F1)' }}
              title="多巴胺主题渐变预览"
            ></div>
            {/* 单色预览 */}
            <div className="flex gap-2">
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FF6B47' }}></div>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#FFD700' }}></div>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#6366F1' }}></div>
              <div className="w-6 h-6 rounded" style={{ backgroundColor: '#00D084' }}></div>
            </div>
          </div>
         </div>

  
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

export default ThemeToggle;