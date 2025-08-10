'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorStateProps {
  error: string | null;
  onRetry?: () => void;
  onClearError?: () => void;
  onRecoverFromError?: () => void;
  showRecovery?: boolean;
}

export default function ErrorState({ 
  error, 
  onRetry, 
  onClearError, 
  onRecoverFromError,
  showRecovery = false 
}: ErrorStateProps) {
  if (!error) return null;

  return (
    <div className="flex items-center justify-center min-h-[200px] p-6">
      <div className="text-center max-w-md mx-auto">
        <div 
          className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
          style={{ 
            backgroundColor: 'var(--destructive-bg)',
            border: '2px solid var(--destructive-border)'
          }}
        >
          <AlertCircle 
            size={32} 
            style={{ color: 'var(--destructive-text)' }}
          />
        </div>
        
        <h3 
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--text-primary)' }}
        >
          出现错误
        </h3>
        
        <p 
          className="text-sm mb-6 leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {error}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} />
              重试
            </Button>
          )}
          
          {onClearError && (
            <Button
              onClick={onClearError}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Home size={16} />
              清除错误
            </Button>
          )}
          
          {showRecovery && onRecoverFromError && (
            <Button
              onClick={onRecoverFromError}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Bug size={16} />
              错误恢复
            </Button>
          )}
        </div>
        
        <div 
          className="mt-6 p-3 rounded-lg text-xs text-left"
          style={{ 
            backgroundColor: 'var(--muted-bg)',
            border: '1px solid var(--muted-border)',
            color: 'var(--text-muted)'
          }}
        >
          <strong>故障排除建议：</strong>
          <ul className="mt-2 space-y-1 list-disc list-inside">
            <li>检查网络连接是否正常</li>
            <li>稍后重试或刷新页面</li>
            <li>如果问题持续存在，请联系技术支持</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
