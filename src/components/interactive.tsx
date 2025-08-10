/**
 * 交互反馈组件库
 * 提供按钮、卡片等组件的微交互动画效果
 */

'use client';

import React, { useState, useRef } from 'react';
import { useAnimation, createScaleAnimation, createShakeAnimation } from '@/lib/animations';

export interface InteractiveButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  ripple?: boolean;
  tooltip?: string;
  animation?: 'scale' | 'bounce' | 'shake';
  onAnimationComplete?: () => void;
}

/**
 * 交互式按钮组件
 */
export function InteractiveButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ripple = true,
  tooltip,
  animation = 'scale',
  onAnimationComplete
}: InteractiveButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { animate } = useAnimation();
  const rippleId = useRef(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // 创建涟漪效果
    if (ripple && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = { x, y, id: rippleId.current++ };
      setRipples(prev => [...prev, newRipple]);
      
      // 移除涟漪
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id));
      }, 600);
    }

    // 执行点击动画
    if (buttonRef.current && animation) {
      let animationConfig;
      switch (animation) {
        case 'scale':
          animationConfig = createScaleAnimation({ 
            duration: 150, 
            fromScale: 0.95, 
            toScale: 1 
          });
          break;
        case 'bounce':
          animationConfig = {
            keyframes: [
              { transform: 'scale(1)' },
              { transform: 'scale(0.9)' },
              { transform: 'scale(1.05)' },
              { transform: 'scale(1)' }
            ],
            options: { duration: 300, fill: 'forwards' }
          };
          break;
        case 'shake':
          animationConfig = createShakeAnimation({ duration: 300 });
          break;
        default:
          animationConfig = createScaleAnimation({ duration: 150 });
      }
      
      animate(buttonRef.current, animationConfig as import('@/lib/animations').KeyframeAnimation, onAnimationComplete);
    }

    onClick?.();
  };

  const baseClasses = 'relative overflow-hidden font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-300',
    outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200 disabled:text-gray-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 disabled:text-gray-400'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        className={buttonClasses}
        onClick={handleClick}
        disabled={disabled || loading}
        title={tooltip}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-10">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          </div>
        )}
        
        {/* 涟漪效果 */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className="absolute bg-white bg-opacity-30 rounded-full pointer-events-none"
            style={{
              left: ripple.x - 10,
              top: ripple.y - 10,
              width: 20,
              height: 20,
              animation: 'ripple 0.6s ease-out'
            }}
          />
        ))}
        
        <span className={loading ? 'opacity-0' : 'opacity-100'}>{children}</span>
      </button>
      
      <style jsx>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

export interface InteractiveCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hover?: boolean;
  press?: boolean;
  lift?: boolean;
  glow?: boolean;
  disabled?: boolean;
  animation?: 'lift' | 'glow' | 'scale' | 'rotate';
}

/**
 * 交互式卡片组件
 */
export function InteractiveCard({
  children,
  onClick,
  className = '',
  hover = true,
  press = true,
  lift = true,
  glow = false,
  disabled = false,
  animation = 'lift'
}: InteractiveCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (disabled) return;
    onClick?.();
  };

  const getTransform = () => {
    if (disabled) return 'none';
    
    let transform = '';
    
    if (isPressed && press) {
      transform += 'scale(0.98) ';
    } else if (isHovered && hover) {
      switch (animation) {
        case 'lift':
          transform += 'translateY(-4px) ';
          break;
        case 'scale':
          transform += 'scale(1.02) ';
          break;
        case 'rotate':
          transform += 'rotate(1deg) ';
          break;
        default:
          transform += 'translateY(-2px) ';
      }
    }
    
    return transform || 'none';
  };

  const getBoxShadow = () => {
    if (disabled) return 'none';
    
    if (isHovered && lift) {
      return '0 10px 25px rgba(0, 0, 0, 0.15)';
    }
    
    return '0 4px 6px rgba(0, 0, 0, 0.1)';
  };

  const getFilter = () => {
    if (disabled) return 'none';
    
    if (isHovered && glow) {
      return 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))';
    }
    
    return 'none';
  };

  return (
    <div
      ref={cardRef}
      className={`relative rounded-xl border border-gray-200 bg-white cursor-pointer transition-all duration-200 ${className}`}
      style={{
        transform: getTransform(),
        boxShadow: getBoxShadow(),
        filter: getFilter(),
        opacity: disabled ? 0.6 : 1
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      {children}
    </div>
  );
}

export interface InteractiveSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

/**
 * 交互式开关组件
 */
export function InteractiveSwitch({
  checked,
  onChange,
  disabled = false,
  className = '',
  size = 'md',
  label
}: InteractiveSwitchProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    onChange(!checked);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  };

  const sizeClasses = {
    sm: 'w-8 h-4',
    md: 'w-11 h-6',
    lg: 'w-14 h-8'
  };

  const knobSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const knobPosition = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-7' : 'translate-x-0.5'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        className={`relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${sizeClasses[size]}`}
        onClick={handleClick}
        disabled={disabled}
      >
        <div
          className={`inline-block bg-white rounded-full transition-transform duration-200 ${knobSizeClasses[size]} ${
            isAnimating ? 'scale-110' : ''
          }`}
          style={{
            transform: knobPosition[size]
          }}
        />
      </button>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </div>
  );
}

export interface InteractiveCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  indeterminate?: boolean;
}

/**
 * 交互式复选框组件
 */
export function InteractiveCheckbox({
  checked,
  onChange,
  disabled = false,
  className = '',
  label,
  indeterminate = false
}: InteractiveCheckboxProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (disabled || isAnimating) return;
    
    setIsAnimating(true);
    onChange(!checked);
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        className={`relative w-5 h-5 rounded border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          checked || indeterminate
            ? 'bg-blue-500 border-blue-500'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${
          isAnimating ? 'scale-110' : ''
        }`}
        onClick={handleClick}
        disabled={disabled}
      >
        {(checked || indeterminate) && (
          <div className="absolute inset-0 flex items-center justify-center">
            {indeterminate ? (
              <div className="w-3 h-0.5 bg-white rounded-full"></div>
            ) : (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
          </div>
        )}
      </button>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </div>
  );
}

export interface InteractiveSliderProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
  step?: number;
  showValue?: boolean;
  label?: string;
}

/**
 * 交互式滑块组件
 */
export function InteractiveSlider({
  value,
  min,
  max,
  onChange,
  disabled = false,
  className = '',
  step = 1,
  showValue = false,
  label
}: InteractiveSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    updateValue(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || disabled) return;
    updateValue(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateValue = (e: MouseEvent | React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newValue = min + percentage * (max - min);
    const steppedValue = Math.round(newValue / step) * step;
    
    onChange(Math.max(min, Math.min(max, steppedValue)));
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-700">{label}</span>
          {showValue && (
            <span className="text-sm font-medium text-gray-900">{value}</span>
          )}
        </div>
      )}
      <div
        ref={sliderRef}
        className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer"
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute h-full bg-blue-500 rounded-full transition-all duration-200"
          style={{ width: `${percentage}%` }}
        />
        <div
          className={`absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full -top-1 transition-all duration-200 ${
            isDragging ? 'scale-110' : ''
          }`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  );
}

export interface InteractiveBadgeProps {
  children: React.ReactNode;
  onClick?: () => void;
  onClose?: () => void;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
  pulse?: boolean;
}

/**
 * 交互式徽章组件
 */
export function InteractiveBadge({
  children,
  onClick,
  onClose,
  className = '',
  variant = 'default',
  size = 'md',
  closable = false,
  pulse = false
}: InteractiveBadgeProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-medium transition-all duration-200 ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      } ${pulse ? 'animate-pulse' : ''} ${className}`}
      onClick={onClick}
    >
      <span>{children}</span>
      {closable && (
        <button
          className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleClose();
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
}