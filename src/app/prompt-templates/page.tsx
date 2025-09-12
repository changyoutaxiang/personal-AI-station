'use client';

import { useState, useEffect } from 'react';
import PromptTemplateManager from '@/components/agent/PromptTemplateManager';
// 移除局部返回按钮，统一使用全局按钮


interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  category: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function PromptTemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);

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
