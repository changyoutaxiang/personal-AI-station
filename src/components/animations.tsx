/**
 * 动画组件库
 * 提供可复用的动画组件
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAnimation, createFadeInAnimation, createScaleAnimation } from '@/lib/animations';

export interface AnimatedProps {
  children: React.ReactNode;
  animation?: 'fadeIn' | 'scaleIn' | 'slideIn' | 'bounce' | 'pulse';
  duration?: number;
  delay?: number;
  easing?: string;
  className?: string;
  style?: React.CSSProperties;
  onAnimationComplete?: () => void;
}

/**
 * 基础动画组件
 */
export function Animated({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  className = '',
  style = {},
  onAnimationComplete
}: AnimatedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { animate } = useAnimation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    let animationConfig;
    switch (animation) {
      case 'fadeIn':
        animationConfig = createFadeInAnimation({ duration, delay, easing });
        break;
      case 'scaleIn':
        animationConfig = createScaleAnimation({ duration, delay, easing });
        break;
      case 'slideIn':
        animationConfig = {
          keyframes: [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          options: { duration, delay, easing, fill: 'forwards' as FillMode }
        };
        break;
      case 'bounce':
        animationConfig = {
          keyframes: [
            { transform: 'scale(0.3)', opacity: 0 },
            { transform: 'scale(1.05)' },
            { transform: 'scale(0.9)' },
            { transform: 'scale(1)', opacity: 1 }
          ],
          options: { duration: duration * 1.5, delay, easing, fill: 'forwards' as FillMode }
        };
        break;
      case 'pulse':
        animationConfig = {
          keyframes: [
            { transform: 'scale(1)' },
            { transform: 'scale(1.05)' },
            { transform: 'scale(1)' }
          ],
          options: { duration, delay, easing, fill: 'forwards' as FillMode }
        };
        break;
      default:
        animationConfig = createFadeInAnimation({ duration, delay, easing });
    }

    const anim = animate(ref.current, animationConfig, onAnimationComplete);
    setIsVisible(true);

    return () => {
      anim?.cancel();
    };
  }, [animation, duration, delay, easing, animate, onAnimationComplete]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        willChange: 'transform, opacity',
        ...style
      }}
    >
      {children}
    </div>
  );
}

export interface StaggeredListProps {
  items: React.ReactNode[];
  staggerDelay?: number;
  animation?: 'fadeIn' | 'slideIn' | 'scaleIn';
  className?: string;
  itemClassName?: string;
  onAnimationComplete?: () => void;
}

/**
 * 错列列表动画组件
 */
export function StaggeredList({
  items,
  staggerDelay = 50,
  animation = 'fadeIn',
  className = '',
  itemClassName = '',
  onAnimationComplete
}: StaggeredListProps) {
  const [completedCount, setCompletedCount] = useState(0);

  const handleItemComplete = () => {
    const newCount = completedCount + 1;
    setCompletedCount(newCount);
    
    if (newCount === items.length && onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <div className={className}>
      {items.map((item, index) => (
        <Animated
          key={index}
          animation={animation}
          delay={index * staggerDelay}
          className={itemClassName}
          onAnimationComplete={handleItemComplete}
        >
          {item}
        </Animated>
      ))}
    </div>
  );
}

export interface CounterProps {
  from: number;
  to: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  onAnimationComplete?: () => void;
}

/**
 * 数字滚动动画组件
 */
export function Counter({
  from,
  to,
  duration = 1000,
  delay = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  onAnimationComplete
}: CounterProps) {
  const [count, setCount] = useState(from);
  const [isAnimating, setIsAnimating] = useState(false);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = timestamp - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const currentCount = from + (to - from) * easeProgress;
    
    setCount(currentCount);

    if (progress < 1) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      setIsAnimating(false);
      onAnimationComplete?.();
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      startTimeRef.current = null;
      requestRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timer);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [from, to, duration, delay]);

  const formattedCount = decimals > 0 
    ? count.toFixed(decimals) 
    : Math.floor(count).toString();

  return (
    <span className={className}>
      {prefix}
      {formattedCount}
      {suffix}
      {isAnimating && <span className="ml-1 animate-pulse">|</span>}
    </span>
  );
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  duration?: number;
  delay?: number;
  showValue?: boolean;
  className?: string;
  barClassName?: string;
  animated?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * 进度条动画组件
 */
export function ProgressBar({
  value,
  max = 100,
  duration = 800,
  delay = 0,
  showValue = false,
  className = '',
  barClassName = '',
  animated = true,
  onAnimationComplete
}: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const percentage = Math.min((value / max) * 100, 100);
    
    if (!animated) {
      setProgress(percentage);
      return;
    }

    const timer = setTimeout(() => {
      setIsAnimating(true);
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        setProgress(percentage * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          onAnimationComplete?.();
        }
      };
      
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, max, duration, delay, animated, onAnimationComplete]);

  return (
    <div className={className}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-blue-500 rounded-full transition-all duration-300 ease-out ${barClassName}`}
          style={{ 
            width: `${progress}%`,
            transform: isAnimating ? 'scaleX(1)' : 'scaleX(0.95)',
            transformOrigin: 'left'
          }}
        />
      </div>
      {showValue && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}

export interface TypewriterProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  cursor?: boolean;
  onAnimationComplete?: () => void;
}

/**
 * 打字机效果组件
 */
export function Typewriter({
  text,
  speed = 50,
  delay = 0,
  className = '',
  cursor = true,
  onAnimationComplete
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(true);
      let index = 0;
      
      const type = () => {
        if (index < text.length) {
          setDisplayText(text.substring(0, index + 1));
          index++;
          setTimeout(type, speed);
        } else {
          setIsTyping(false);
          onAnimationComplete?.();
        }
      };
      
      type();
    }, delay);

    return () => clearTimeout(timer);
  }, [text, speed, delay, onAnimationComplete]);

  return (
    <span className={className}>
      {displayText}
      {cursor && isTyping && (
        <span className="animate-pulse">|</span>
      )}
    </span>
  );
}

export interface FloatingProps {
  children: React.ReactNode;
  duration?: number;
  amplitude?: number;
  delay?: number;
  className?: string;
}

/**
 * 悬浮动画组件
 */
export function Floating({
  children,
  duration = 3000,
  amplitude = 10,
  delay = 0,
  className = ''
}: FloatingProps) {
  return (
    <div
      className={className}
      style={{
        animation: `float ${duration}ms ease-in-out ${delay}ms infinite`
      }}
    >
      {children}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-${amplitude}px);
          }
        }
      `}</style>
    </div>
  );
}

export interface GlowingProps {
  children: React.ReactNode;
  duration?: number;
  intensity?: number;
  className?: string;
}

/**
 * 发光效果组件
 */
export function Glowing({
  children,
  duration = 2000,
  intensity = 0.5,
  className = ''
}: GlowingProps) {
  return (
    <div
      className={className}
      style={{
        animation: `glow ${duration}ms ease-in-out infinite`
      }}
    >
      {children}
      <style jsx>{`
        @keyframes glow {
          0%, 100% {
            filter: brightness(1) drop-shadow(0 0 0px rgba(59, 130, 246, 0));
          }
          50% {
            filter: brightness(${1 + intensity}) drop-shadow(0 0 ${intensity * 20}px rgba(59, 130, 246, ${intensity}));
          }
        }
      `}</style>
    </div>
  );
}

export interface PulseProps {
  children: React.ReactNode;
  duration?: number;
  scale?: number;
  className?: string;
}

/**
 * 脉冲效果组件
 */
export function Pulse({
  children,
  duration = 2000,
  scale = 1.05,
  className = ''
}: PulseProps) {
  return (
    <div
      className={className}
      style={{
        animation: `pulse ${duration}ms ease-in-out infinite`
      }}
    >
      {children}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(${scale});
          }
        }
      `}</style>
    </div>
  );
}