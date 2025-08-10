/**
 * 微交互动画工具库
 * 提供统一的动画效果和过渡动画
 */

import { useCallback, useRef } from 'react';

export interface AnimationOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
}

export interface KeyframeAnimation {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
}

/**
 * 缓动函数配置
 */
export const EasingFunctions = {
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
  smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)'
};

/**
 * 常用动画时长
 */
export const AnimationDurations = {
  fast: 150,
  normal: 300,
  slow: 500,
  extraSlow: 800
};

/**
 * 淡入动画
 */
export function createFadeInAnimation(options: AnimationOptions = {}): KeyframeAnimation {
  const {
    duration = AnimationDurations.normal,
    easing = EasingFunctions.easeOut,
    delay = 0,
    fill = 'forwards'
  } = options;

  return {
    keyframes: [
      { opacity: 0, transform: 'translateY(10px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 淡出动画
 */
export function createFadeOutAnimation(options: AnimationOptions = {}): KeyframeAnimation {
  const {
    duration = AnimationDurations.normal,
    easing = EasingFunctions.easeIn,
    delay = 0,
    fill = 'forwards'
  } = options;

  return {
    keyframes: [
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 0, transform: 'translateY(-10px)' }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 缩放动画
 */
export function createScaleAnimation(options: AnimationOptions & {
  fromScale?: number;
  toScale?: number;
} = {}): KeyframeAnimation {
  const {
    fromScale = 0.8,
    toScale = 1,
    duration = AnimationDurations.normal,
    easing = EasingFunctions.elastic,
    delay = 0,
    fill = 'forwards'
  } = options;

  return {
    keyframes: [
      { transform: `scale(${fromScale})`, opacity: 0 },
      { transform: `scale(${toScale})`, opacity: 1 }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 滑入动画
 */
export function createSlideInAnimation(options: AnimationOptions & {
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
} = {}): KeyframeAnimation {
  const {
    direction = 'up',
    distance = 20,
    duration = AnimationDurations.normal,
    easing = EasingFunctions.easeOut,
    delay = 0,
    fill = 'forwards'
  } = options;

  const getTransform = (progress: number) => {
    switch (direction) {
      case 'left':
        return `translateX(${-distance + distance * progress}px)`;
      case 'right':
        return `translateX(${distance - distance * progress}px)`;
      case 'down':
        return `translateY(${distance - distance * progress}px)`;
      case 'up':
      default:
        return `translateY(${-distance + distance * progress}px)`;
    }
  };

  return {
    keyframes: [
      { transform: getTransform(0), opacity: 0 },
      { transform: getTransform(1), opacity: 1 }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 脉冲动画
 */
export function createPulseAnimation(options: AnimationOptions & {
  scale?: number;
  count?: number;
} = {}): KeyframeAnimation {
  const {
    scale = 1.05,
    count = 1,
    duration = AnimationDurations.normal,
    easing = EasingFunctions.easeInOut,
    delay = 0,
    fill = 'forwards'
  } = options;

  const keyframes: Keyframe[] = [];
  for (let i = 0; i <= count; i++) {
    const progress = i / count;
    const currentScale = 1 + (scale - 1) * Math.sin(progress * Math.PI);
    keyframes.push({ transform: `scale(${currentScale})` });
  }

  return {
    keyframes,
    options: { duration, easing, delay, fill }
  };
}

/**
 * 摇摆动画
 */
export function createShakeAnimation(options: AnimationOptions & {
  intensity?: number;
} = {}): KeyframeAnimation {
  const {
    intensity = 5,
    duration = AnimationDurations.fast,
    easing = EasingFunctions.easeInOut,
    delay = 0,
    fill = 'forwards'
  } = options;

  return {
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: `translateX(-${intensity}px)` },
      { transform: 'translateX(0)' },
      { transform: `translateX(${intensity}px)` },
      { transform: 'translateX(0)' }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 旋转动画
 */
export function createRotateAnimation(options: AnimationOptions & {
  fromRotation?: number;
  toRotation?: number;
} = {}): KeyframeAnimation {
  const {
    fromRotation = 0,
    toRotation = 360,
    duration = AnimationDurations.slow,
    easing = EasingFunctions.easeInOut,
    delay = 0,
    fill = 'forwards'
  } = options;

  return {
    keyframes: [
      { transform: `rotate(${fromRotation}deg)` },
      { transform: `rotate(${toRotation}deg)` }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 弹跳动画
 */
export function createBounceAnimation(options: AnimationOptions = {}): KeyframeAnimation {
  const {
    duration = AnimationDurations.slow,
    easing = EasingFunctions.bounce,
    delay = 0,
    fill = 'forwards'
  } = options;

  return {
    keyframes: [
      { transform: 'translateY(0)', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' },
      { transform: 'translateY(-30px)', easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)' },
      { transform: 'translateY(0)', easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)' },
      { transform: 'translateY(-15px)', easing: 'cubic-bezier(0.755, 0.05, 0.855, 0.06)' },
      { transform: 'translateY(0)', easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)' }
    ],
    options: { duration, easing, delay, fill }
  };
}

/**
 * 动画Hook
 */
export function useAnimation() {
  const animationRef = useRef<Animation | null>(null);

  const animate = useCallback((
    element: Element,
    animation: KeyframeAnimation,
    onComplete?: () => void
  ) => {
    // 取消之前的动画
    if (animationRef.current) {
      animationRef.current.cancel();
    }

    // 执行新动画
    animationRef.current = element.animate(animation.keyframes, animation.options);

    // 监听动画完成
    if (onComplete) {
      animationRef.current.onfinish = onComplete;
    }

    return animationRef.current;
  }, []);

  const cancel = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.cancel();
      animationRef.current = null;
    }
  }, []);

  const finish = useCallback(() => {
    if (animationRef.current) {
      animationRef.current.finish();
      animationRef.current = null;
    }
  }, []);

  return { animate, cancel, finish };
}

/**
 * 批量动画工具
 */
export function createStaggerAnimation(
  elements: Element[],
  baseAnimation: KeyframeAnimation,
  staggerDelay: number = 50
): Animation[] {
  return elements.map((element, index) => {
    const animation = {
      ...baseAnimation,
      options: {
        ...baseAnimation.options,
        delay: (baseAnimation.options.delay || 0) + index * staggerDelay
      }
    };
    return element.animate(animation.keyframes, animation.options);
  });
}

/**
 * 序列动画工具
 */
export async function playSequenceAnimation(
  element: Element,
  animations: KeyframeAnimation[]
): Promise<void> {
  for (const animation of animations) {
    await new Promise<void>((resolve) => {
      const anim = element.animate(animation.keyframes, animation.options);
      anim.onfinish = () => resolve();
    });
  }
}

/**
 * CSS动画类名生成器
 */
export const AnimationClasses = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideIn: 'animate-slide-in',
  slideOut: 'animate-slide-out',
  scaleIn: 'animate-scale-in',
  scaleOut: 'animate-scale-out',
  pulse: 'animate-pulse',
  bounce: 'animate-bounce',
  shake: 'animate-shake',
  spin: 'animate-spin'
};

/**
 * 生成CSS动画样式
 */
export function generateAnimationStyles(): string {
  return `
    @keyframes fade-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fade-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slide-out {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    @keyframes scale-out {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.8);
      }
    }

    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.05);
      }
    }

    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% {
        transform: translateY(0);
      }
      40%, 43% {
        transform: translateY(-20px);
      }
      70% {
        transform: translateY(-10px);
      }
      90% {
        transform: translateY(-4px);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: translateX(0);
      }
      10%, 30%, 50%, 70%, 90% {
        transform: translateX(-5px);
      }
      20%, 40%, 60%, 80% {
        transform: translateX(5px);
      }
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .animate-fade-in {
      animation: fade-in 0.3s ease-out forwards;
    }

    .animate-fade-out {
      animation: fade-out 0.3s ease-in forwards;
    }

    .animate-slide-in {
      animation: slide-in 0.3s ease-out forwards;
    }

    .animate-slide-out {
      animation: slide-out 0.3s ease-in forwards;
    }

    .animate-scale-in {
      animation: scale-in 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6) forwards;
    }

    .animate-scale-out {
      animation: scale-out 0.3s ease-in forwards;
    }

    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    .animate-bounce {
      animation: bounce 1s ease-in-out infinite;
    }

    .animate-shake {
      animation: shake 0.5s ease-in-out;
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }

    /* 交互式动画类 */
    .hover-scale {
      transition: transform 0.2s ease;
    }

    .hover-scale:hover {
      transform: scale(1.05);
    }

    .hover-lift {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .hover-lift:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    }

    .active-scale {
      transition: transform 0.1s ease;
    }

    .active-scale:active {
      transform: scale(0.95);
    }

    /* 加载动画 */
    .loading-pulse {
      animation: pulse 1.5s ease-in-out infinite;
    }

    .loading-bounce {
      animation: bounce 1s ease-in-out infinite;
    }

    .loading-spin {
      animation: spin 1s linear infinite;
    }
  `;
}