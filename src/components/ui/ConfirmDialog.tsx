'use client';

import React from 'react';

interface ConfirmDialogProps {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
  disableOutsideClose?: boolean;
  children?: React.ReactNode;
  zIndexClassName?: string; // e.g., z-50
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  disableOutsideClose = false,
  children,
  zIndexClassName = 'z-50',
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleOverlayClick = () => {
    if (!loading && !disableOutsideClose) onCancel();
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 ${zIndexClassName}`} onClick={handleOverlayClick}>
      <div
        className="p-6 rounded-lg border shadow-xl max-w-md w-full"
        style={{
          backgroundColor: 'var(--card-glass)',
          borderColor: 'var(--card-border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {title}
          </h3>
          {description && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {description}
            </p>
          )}
        </div>

        {children}

        <div className="flex gap-3 justify-end mt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded border hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            style={{
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)'
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm rounded transition-colors disabled:opacity-50 flex items-center gap-2 ${
              danger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-[var(--flow-primary)] hover:opacity-90 text-white'
            }`}
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}