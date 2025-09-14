'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Brain, Settings, BarChart3, Code, FolderKanban, Menu, X } from 'lucide-react';
import ThemeController from '@/components/ThemeController';


export default function HomePage() {

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const router = useRouter();



  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      label: '对话',
      href: '/agent',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: FolderKanban,
      label: '项目',
      href: '/projects',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: Code,
      label: 'HTML渲染',
      href: '/html-renderer',
      color: 'from-pink-500 to-rose-600'
    },
    {
      icon: BarChart3,
      label: '分析',
      href: '/analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 默认背景图片 */}
      <div 
        id="hero-bg"
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: 'url(/greg-rakozy-oMpAz-DN-9I-unsplash.jpg)',
        }}
      >
      </div>

      {/* 右上角导航 - 响应式优化 */}
      <nav className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        {/* 移动端：汉堡菜单 */}
        <div className="md:hidden">
          <button 
            className="group relative p-3 rounded-xl bg-black/30 backdrop-blur-md border-2 border-white/50 hover:bg-black/50 hover:border-white/80 transition-all duration-300 shadow-lg"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            {showMobileMenu ? <X className="w-6 h-6 text-white drop-shadow-lg" /> : <Menu className="w-6 h-6 text-white drop-shadow-lg" />}
          </button>
        </div>
        
        {/* 桌面端：完整导航 */}
        <div className="hidden md:flex gap-3">
          {/* 背景图切换按钮 */}
          <ThemeController mode="compact" showBackgroundSwitcher={true} iconColor="white" />
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={item.onClick || (() => router.push(item.href))}
                className={`group relative p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 ${item.label === '番茄钟' && showPomodoro ? 'bg-white/30' : ''}`}
                title={item.label}
              >
                <IconComponent className="w-5 h-5 text-white" />
                
                {/* 悬停提示 */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 移动端导航菜单 */}
      {showMobileMenu && (
        <div className="md:hidden fixed top-16 right-4 z-30 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl p-4 min-w-[200px]">
          <div className="grid grid-cols-2 gap-3">
            {/* 背景图切换按钮 */}
            <div className="col-span-2 mb-2">
              <ThemeController mode="compact" showBackgroundSwitcher={true} iconColor="adaptive" />
            </div>
            
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else {
                      router.push(item.href);
                    }
                    setShowMobileMenu(false);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 ${item.label === '番茄钟' && showPomodoro ? 'bg-gray-100' : ''}`}
                >
                  <IconComponent className="w-5 h-5 text-gray-700" />
                  <span className="text-xs text-gray-600 font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}


      {/* 主要内容 - 响应式优化 */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-6 -mt-16">
        {/* Slogan - 响应式字号调整 */}
        <div className="text-center mb-6 md:mb-5 w-full" style={{ maxWidth: "calc(100% - 2rem)" }}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 tracking-tight leading-tight">
            May the <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI</span> be with you
          </h1>
        </div>

        {/* 导航卡片 - 响应式网格 */}
        <div className="w-full max-w-4xl mx-auto px-2 md:px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {navigationItems.slice(0, 8).map((item) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className="group relative p-4 md:p-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105"
                >
                  <div className="flex flex-col items-center gap-2 md:gap-3">
                    <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    <span className="text-xs md:text-sm text-white font-medium">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
    </div>
  );
}
