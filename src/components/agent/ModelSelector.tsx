'use client';

import { useState, useRef, useEffect } from 'react';
import { AVAILABLE_MODELS } from '@/lib/models';
import type { ModelOption } from '@/lib/models';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 获取当前选中模型的信息
  const selectedModelInfo = AVAILABLE_MODELS.find(model => model.value === selectedModel) || AVAILABLE_MODELS[0];

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModelSelect = (model: ModelOption) => {
    onModelChange(model.value);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg border transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-black/5 dark:hover:bg-white/5'
        }`}
        style={{
          borderColor: 'var(--card-border)',
          backgroundColor: 'var(--card-glass)',
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            模型:
          </span>
          <span>{selectedModelInfo.label}</span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--text-secondary)' }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && !disabled && (
        <div
          className="absolute bottom-full left-0 right-0 mb-1 py-1 rounded-lg shadow-lg border z-[9999] max-h-60 overflow-y-auto"
          style={{
            backgroundColor: 'var(--card-glass)',
            borderColor: 'var(--card-border)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {AVAILABLE_MODELS.map((model) => (
            <button
              key={model.value}
              onClick={() => handleModelSelect(model)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${
                selectedModel === model.value ? 'font-medium' : ''
              }`}
              style={{
                color: selectedModel === model.value ? 'var(--flow-primary)' : 'var(--text-primary)'
              }}
            >
              <div className="flex items-center justify-between">
                <span>{model.label}</span>
                {selectedModel === model.value && (
                  <svg
                    className="w-4 h-4"
                    style={{ color: 'var(--flow-primary)' }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                {model.value}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
