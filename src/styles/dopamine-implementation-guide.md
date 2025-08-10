# 多巴胺主题实施指南

## 实施概述

本指南将详细说明如何在现有的 Digital Brain 项目中实施"多巴胺"主题色板，确保与现有变量名保持一致，仅替换颜色值。

## 第一步：全局变量替换

### globals.css 中需要替换的颜色值

```css
/* 在 :root 选择器中替换以下值 */

/* 1. 主要动态色彩变量 (行64-68) */
--dynamic-primary: #FF6B47;              /* 原: #0ea5e9 */
--dynamic-secondary: #FF825F;            /* 原: #0284c7 */
--dynamic-accent: #FFD700;               /* 原: #7dd3fc */
--dynamic-glow: rgba(255, 107, 71, 0.3); /* 原: rgba(14, 165, 233, 0.3) */
--dynamic-pulse: rgba(255, 130, 95, 0.2); /* 原: rgba(2, 132, 199, 0.2) */

/* 2. 流动色彩系统 (行82-91) */
--flow-primary: #FF6B47;                 /* 原: #0ea5e9 */
--flow-secondary: #00D084;               /* 原: #0284c7 */
--flow-accent: #8FD14F;                  /* 原: #7dd3fc */
--flow-blue: #6366F1;                    /* 原: #0ea5e9 */
--flow-cyan: #00D084;                    /* 原: #06b6d4 */
--flow-sky: #8FD14F;                     /* 原: #38bdf8 */
--flow-teal: #00D084;                    /* 原: #14b8a6 */
--flow-indigo: #6366F1;                  /* 原: #6366f1 保持不变 */

/* 3. 文字颜色变量 (行103-106) */
--text-accent: #6366F1;                  /* 原: #0891b2 */
--text-success: #00D084;                 /* 原: #047857 */
--text-warning: #FFD700;                 /* 原: #b45309 */

/* 4. 思维流动主题色彩系统 (行71-74) */
--mind-flow-primary: linear-gradient(135deg, #FF6B47 0%, #E25434 100%);
--mind-flow-secondary: linear-gradient(135deg, #00D084 0%, #00B873 100%);
--mind-flow-accent: linear-gradient(135deg, #8FD14F 0%, #76B83D 100%);
/* mind-flow-neutral 保持不变 */

/* 5. 主题色彩变量 - 为橙红系重新定义 (行51-61) */
--primary-50: #fff4f1;
--primary-100: #ffe6df;
--primary-200: #ffccc0;
--primary-300: #ffa892;
--primary-400: #ff8260;
--primary-500: #FF6B47;                  /* 主色 */
--primary-600: #E25434;
--primary-700: #c73e1c;
--primary-800: #a53316;
--primary-900: #8b2f17;
--primary-950: #4c1408;
```

## 第二步：暗色模式适配

### [data-color-scheme="dark"] 选择器中的调整

```css
/* 在暗色模式选择器中 (行111开始) 添加或调整 */
[data-color-scheme="dark"] {
  /* 确保暗色背景下的对比度 */
  --text-accent: #7A7CF4;               /* 稍亮的紫蓝色 */
  --text-success: #33D89B;              /* 稍亮的绿色 */
  --text-warning: #FFDF33;              /* 稍亮的黄色 */
  
  /* 调整动态色彩在暗色模式下的表现 */
  --dynamic-glow: rgba(255, 107, 71, 0.4);  /* 增强发光效果 */
  --dynamic-pulse: rgba(255, 130, 95, 0.3); /* 增强脉冲效果 */
}
```

## 第三步：主题变体适配

### 温暖主题调整 [data-theme="warm"]

```css
/* 在温暖主题中 (行157开始) 保持多巴胺色彩 */
[data-theme="warm"] {
  /* 动态色彩变量 - 使用多巴胺色彩 (行176-180) */
  --dynamic-primary: #FF6B47;
  --dynamic-secondary: #FF825F;
  --dynamic-accent: #FFD700;
  --dynamic-glow: rgba(255, 107, 71, 0.3);
  --dynamic-pulse: rgba(255, 130, 95, 0.2);
  
  /* 流动色彩调整 (行189-198) */
  --flow-primary: #FF6B47;
  --flow-secondary: #00D084;
  --flow-accent: #8FD14F;
  --flow-blue: #6366F1;
  --flow-cyan: #00D084;
  --flow-sky: #8FD14F;
}
```

### 科技主题调整 [data-theme="cyber"]

```css
/* 在科技主题中 (行240开始) 使用多巴胺色彩 */
[data-theme="cyber"] {
  /* 动态色彩变量 (行259-263) */
  --dynamic-primary: #FF6B47;
  --dynamic-secondary: #FF825F;
  --dynamic-accent: #FFD700;
  --dynamic-glow: rgba(255, 107, 71, 0.4);     /* 科技感增强 */
  --dynamic-pulse: rgba(255, 130, 95, 0.3);
  
  /* 流动色彩 (行277-286) */
  --flow-primary: #FF6B47;
  --flow-secondary: #00D084;
  --flow-accent: #8FD14F;
  --flow-cyan: #00D084;
  --flow-sky: #8FD14F;
  --flow-teal: #00D084;
  --flow-indigo: #6366F1;
}
```

### 森林主题调整 [data-theme="forest"]

```css
/* 在森林主题中 (行342开始) 融合多巴胺绿色系 */
[data-theme="forest"] {
  /* 保持森林主色，融入多巴胺绿色 */
  --dynamic-secondary: #00D084;            /* 使用多巴胺鲜绿 */
  --dynamic-accent: #8FD14F;              /* 使用多巴胺浅绿 */
  
  --flow-secondary: #00D084;
  --flow-accent: #8FD14F;
  --flow-cyan: #00D084;
  --flow-sky: #8FD14F;
  --flow-teal: #00D084;
}
```

## 第四步：设计令牌更新

### design-tokens.css 中的调整

```css
/* 在 design-tokens.css 中更新状态色彩 (行20-23) */
--color-success: #00D084;                /* 更新为多巴胺鲜绿 */
--color-warning: #FFD700;                /* 更新为多巴胺明黄 */
--color-info: #6366F1;                   /* 更新为多巴胺紫蓝 */

/* 更新边框色彩 (行37-42) */
--color-border-success: #00D084;
--color-border-warning: #FFD700;
--color-border-error: #FF6B47;           /* 使用主色作为错误边框 */
```

## 第五步：特殊组件适配

### 标签颜色系统

```css
/* 更新标签颜色以匹配多巴胺主题 (行7-30) */
:root {
  /* 橙色标签 - 使用主色 */
  --tag-orange-bg: rgba(255, 107, 71, 0.15);
  --tag-orange-border: rgba(255, 107, 71, 0.35);
  --tag-orange-text: #a53316;
  
  /* 绿色标签 - 使用成功色 */
  --tag-green-bg: rgba(0, 208, 132, 0.15);
  --tag-green-border: rgba(0, 208, 132, 0.35);
  --tag-green-text: #062814;
  
  /* 黄色标签 - 使用警告色 */
  --tag-yellow-bg: rgba(255, 215, 0, 0.15);
  --tag-yellow-border: rgba(255, 215, 0, 0.35);
  --tag-yellow-text: #1f1500;
  
  /* 紫色标签 - 使用信息色 */
  --tag-purple-bg: rgba(99, 102, 241, 0.15);
  --tag-purple-border: rgba(99, 102, 241, 0.35);
  --tag-purple-text: #312e81;
}
```

## 第六步：验证和测试

### 测试清单

1. **视觉验证**
   - [ ] 检查所有主题下的颜色一致性
   - [ ] 验证暗色/亮色模式的对比度
   - [ ] 确认交互状态的视觉反馈

2. **可访问性验证**
   - [ ] 使用对比度检查工具验证所有颜色搭配
   - [ ] 测试键盘导航的焦点指示器
   - [ ] 验证屏幕阅读器的兼容性

3. **跨浏览器测试**
   - [ ] Chrome/Edge (Chromium)
   - [ ] Firefox
   - [ ] Safari
   - [ ] 移动端浏览器

4. **响应式测试**
   - [ ] 移动端 (320px+)
   - [ ] 平板端 (768px+)
   - [ ] 桌面端 (1024px+)
   - [ ] 大屏幕 (1440px+)

## 第七步：性能优化

### CSS 变量优化

```css
/* 添加性能优化的CSS变量 */
:root {
  /* 预计算的颜色值，减少运行时计算 */
  --dopamine-primary-rgb: 255, 107, 71;
  --dopamine-success-rgb: 0, 208, 132;
  --dopamine-accent-rgb: 143, 209, 79;
  --dopamine-info-rgb: 99, 102, 241;
  --dopamine-warning-rgb: 255, 215, 0;
}

/* 使用 rgb() 函数提高性能 */
.optimized-background {
  background: rgba(var(--dopamine-primary-rgb), 0.1);
}
```

## 第八步：文档更新

### 更新组件文档

1. **颜色指南**: 更新所有组件的颜色使用示例
2. **设计系统**: 同步更新 Figma 或其他设计工具中的色彩样板
3. **开发文档**: 更新 CSS 变量使用指南
4. **用户指南**: 更新主题切换相关说明

## 回滚计划

如需回滚到原始颜色，保存以下原始值：

```css
/* 原始颜色值备份 */
/*
--dynamic-primary: #0ea5e9;
--dynamic-secondary: #0284c7;
--dynamic-accent: #7dd3fc;
--flow-primary: #0ea5e9;
--flow-secondary: #0284c7;
--flow-accent: #7dd3fc;
--text-accent: #0891b2;
--text-success: #047857;
--text-warning: #b45309;
*/
```

## 后续维护

1. **定期审查**: 每季度检查颜色在新组件中的应用
2. **用户反馈**: 收集用户对新色彩系统的反馈
3. **可访问性更新**: 跟进WCAG标准的更新
4. **性能监控**: 监控颜色变化对页面渲染性能的影响
