'use client';

import PromptTemplateManager from '@/components/agent/PromptTemplateManager';

export default function PromptTemplatesPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            提示词模板管理
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            管理你的AI提示词模板，支持变量替换和收藏功能
          </p>
        </div>
        
        <div 
          className="rounded-lg border p-6 shadow-sm"
          style={{
            borderColor: 'var(--card-border)',
            backgroundColor: 'var(--card-glass)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <PromptTemplateManager />
        </div>
      </div>
    </div>
  );
}
