import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '', variant = 'default' }) => {
  const base = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variants: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    outline: 'border border-gray-200 text-gray-700',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`${base} ${variants[variant]} ${className}`}>{children}</span>
  );
};

export default Badge;