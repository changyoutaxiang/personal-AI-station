'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'text-white shadow hover:opacity-90',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };
  
  const variantStyle = variant === 'default' ? 
    { backgroundColor: 'var(--flow-primary)' } : 
    {};
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      style={variantStyle}
      {...props}
    >
      {children}
    </button>
  );
}
