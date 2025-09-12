import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 基础颜色系统 - 对齐 CSS 变量
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        
        // 主要品牌色（支持 alpha 通道）
        primary: "hsl(var(--dopamine-orange-h) var(--dopamine-orange-s) var(--dopamine-orange-l) / <alpha-value>)",
        secondary: "hsl(var(--dopamine-green-h) var(--dopamine-green-s) var(--dopamine-green-l) / <alpha-value>)",
        accent: "hsl(var(--dopamine-light-green-h) var(--dopamine-light-green-s) var(--dopamine-light-green-l) / <alpha-value>)",
        indigo: "hsl(var(--dopamine-indigo-h) var(--dopamine-indigo-s) var(--dopamine-indigo-l) / <alpha-value>)",
        warning: "hsl(var(--dopamine-yellow-h) var(--dopamine-yellow-s) var(--dopamine-yellow-l) / <alpha-value>)",
        
        // 语义色彩（RGB 格式支持 alpha）
        'dynamic-primary': "rgb(var(--dopamine-orange-rgb) / <alpha-value>)",
        'dynamic-secondary': "rgb(255 130 95 / <alpha-value>)",
        'text-success': "rgb(var(--dopamine-green-rgb) / <alpha-value>)",
        'text-warning': "rgb(var(--dopamine-yellow-rgb) / <alpha-value>)",
        'text-accent': "rgb(var(--dopamine-indigo-rgb) / <alpha-value>)",
        
        // 组件专色（支持 alpha）
        processor: "rgb(var(--dopamine-orange-rgb) / <alpha-value>)",
        memory: "rgb(var(--dopamine-green-rgb) / <alpha-value>)",
        storage: "rgb(var(--dopamine-light-green-rgb) / <alpha-value>)",
        connection: "rgb(var(--dopamine-indigo-rgb) / <alpha-value>)",
        compact: "rgb(var(--dopamine-yellow-rgb) / <alpha-value>)",
        
        
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e', // 成功色
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d'
        },
        
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444', // 错误色
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d'
        },
        
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280', // 中性色
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#030712'
        }
      },
      fontFamily: {
        'artistic': ['Brush Script MT', 'Lucida Handwriting', 'cursive'],
        'elegant': ['Playfair Display', 'Georgia', 'serif'],
        'modern': ['Montserrat', 'Helvetica Neue', 'sans-serif'],
        'creative': ['Comic Sans MS', 'Impact', 'var(--font-pacifico)', 'var(--font-dancing-script)', 'cursive'],
        'handwritten': ['Kalam', 'Caveat', 'cursive'],
      },
      animation: {
        // 平衡模式：保留功能性动画
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse-slow 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        
        // 保留简化的装饰动画（品牌特色）
        'float': 'float 3s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
        
        // 移除：复杂装饰动画
        // 'glow', 'shimmer', 'heartbeat', 'bounce-big', 'color-shift', 'breathe', 'waterfall'
      },
      keyframes: {
        // 平衡模式：仅保留必要的动画关键帧
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        // Dopamine 主题特有动画
        'dopamine-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(var(--dopamine-orange-rgb), 0.3)' 
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(var(--dopamine-orange-rgb), 0.5)' 
          },
        },
        // 节能模式友好的动画关键帧
        'fadeIn': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slideUp': {
          '0%': { 
            opacity: '0',
            transform: 'translateY(10px)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)' 
          }
        },
        'scaleIn': {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.95)' 
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)' 
          }
        },
      },
    },
  },
  plugins: [],
};



export default config;