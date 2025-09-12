# Notion风格森林绿调色板使用指南

## 概览

这个色板系统基于Notion的设计理念，采用低饱和度、偏中性的森林绿调，营造沉稳、自然、适合长时间阅读的视觉体验。支持亮色/暗色双模式，确保在不同环境下的舒适性。

## 核心设计理念

- **低饱和、偏中性**：减少视觉噪声，营造"克制、纯净"的气质
- **层次清晰**：通过颜色层级明确界面元素的重要性
- **长阅读友好**：所有颜色都经过优化，支持长时间专注阅读
- **双模式支持**：自动适配系统偏好，也支持手动切换

## 色彩体系结构

### 1. 森林绿主色系 (Forest)
用于品牌元素、主要交互组件和重要强调。

```css
/* 主要应用场景 */
--forest-primary: #2f7f60;        /* 按钮、链接、品牌色 */
--forest-primary-light: #3a9e74;  /* 悬停状态、激活状态 */
--forest-primary-dark: #1f5a44;   /* 按钮按下、深色强调 */

/* 层级使用 */
--forest-50 到 --forest-900;      /* 从浅到深的渐变层级 */
```

**使用建议：**
- 主按钮背景：`var(--forest-primary)`
- 链接颜色：`var(--forest-600)`
- 悬停效果：`var(--forest-primary-light)`
- 选中状态：`var(--forest-500)`

### 2. 橄榄绿辅助色系 (Olive)
用于次要元素、辅助信息和知性内容。

```css
--olive-primary: #6b8e62;         /* 次要按钮、标签 */
--olive-50 到 --olive-900;        /* 完整层级体系 */
```

**使用建议：**
- 次要按钮：`var(--olive-primary)`
- 标签背景：`var(--olive-100)`
- 辅助文本：`var(--olive-600)`

### 3. 薄荷绿强调色系 (Mint)
用于成功状态、清新提示和轻量级强调。

```css
--mint-primary: #a8e6cf;          /* 成功提示、清新强调 */
--mint-50 到 --mint-900;          /* 完整层级体系 */
```

**使用建议：**
- 成功提示：`var(--mint-primary)`
- 轻量级高亮：`var(--mint-200)`
- 正面反馈：`var(--mint-400)`

### 4. 中性色系统 (Neutral)
构成界面的基础色彩，包括背景、文字、边框等。

#### 背景色
```css
--neutral-bg-primary: #fafaf7;    /* 主背景 - 页面背景 */
--neutral-bg-secondary: #f7fbf7;  /* 次背景 - 卡片背景 */
--neutral-bg-tertiary: #f2f8f4;   /* 三级背景 - 面板背景 */
--neutral-bg-elevated: #ffffff;   /* 悬浮背景 - 弹窗、浮层 */
```

#### 文字色
```css
--neutral-text-primary: #1a3528;    /* 主文字 - 标题、正文 */
--neutral-text-secondary: #4a5650;  /* 次文字 - 描述、说明 */
--neutral-text-tertiary: #7c857b;   /* 三级文字 - 辅助信息 */
--neutral-text-placeholder: #9ba599; /* 占位符文字 */
--neutral-text-disabled: #c1cac0;   /* 禁用状态文字 */
```

#### 边框色
```css
--neutral-border-light: #e8f1ea;    /* 浅边框 - 分隔线 */
--neutral-border-medium: #d1e4d6;   /* 中等边框 - 输入框 */
--neutral-border-strong: #b8d1c0;   /* 强边框 - 强调边框 */
```

## 语义化颜色

### 品牌色
```css
--brand-primary: var(--forest-primary);    /* 主品牌色 */
--brand-secondary: var(--olive-primary);   /* 次品牌色 */
--brand-accent: var(--mint-primary);       /* 品牌强调色 */
```

### 功能色
```css
--success: var(--forest-500);     /* 成功状态 */
--warning: #f4a261;               /* 警告状态 */
--error: #e76f51;                 /* 错误状态 */
--info: var(--mint-600);          /* 信息提示 */
```

### 交互状态
```css
--hover-bg: var(--forest-50);     /* 悬停背景 */
--active-bg: var(--forest-100);   /* 激活背景 */
--focus-ring: var(--forest-300);  /* 焦点环 */
--selected-bg: var(--mint-100);   /* 选中背景 */
```

## 暗色模式

暗色模式会自动调整以下关键颜色：

### 背景系统
- 主背景：`#0b1411` (深林绿黑)
- 次背景：`#0f1e18` (更深林绿)
- 三级背景：`#11251f` (深绿灰)

### 文字系统
- 主文字：`#e8f5ee` (浅绿白)
- 次文字：`#c1d4c7` (中绿灰)
- 三级文字：`#9bb5a3` (暗绿灰)

### 主色调整
- 森林绿：更亮的 `#4db383`
- 橄榄绿：调整为 `#8aa082`
- 薄荷绿：保持轻盈感

## 实际应用示例

### 按钮设计
```css
/* 主按钮 */
.btn-primary {
  background-color: var(--forest-primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: var(--forest-primary-light);
}

/* 次要按钮 */
.btn-secondary {
  background-color: var(--olive-100);
  color: var(--olive-primary);
  border: 1px solid var(--olive-300);
}
```

### 卡片设计
```css
.card {
  background-color: var(--neutral-bg-secondary);
  border: 1px solid var(--neutral-border-light);
  box-shadow: var(--shadow-sm);
  color: var(--neutral-text-primary);
}
```

### 文本层级
```css
.text-primary {
  color: var(--neutral-text-primary);
}

.text-secondary {
  color: var(--neutral-text-secondary);
}

.text-muted {
  color: var(--neutral-text-tertiary);
}
```

## 使用建议

### DO ✅
- 使用CSS变量确保主题一致性
- 遵循颜色的语义化含义
- 在暗色模式下测试所有界面
- 保持足够的对比度以确保可访问性
- 优先使用中性色构建界面基础

### DON'T ❌
- 不要混用不同色系的相似层级
- 不要在暗色模式使用高饱和度霓虹色
- 不要忽略文字对比度要求
- 不要在功能色之外创建新的语义色
- 不要在同一个界面使用过多颜色层级

## 阴影系统

提供了五个层级的阴影，使用森林绿作为阴影颜色，营造自然柔和的层次感：

```css
--shadow-xs: 轻微阴影        /* 边框替代 */
--shadow-sm: 小阴影          /* 卡片 */
--shadow-md: 中等阴影        /* 按钮、输入框 */
--shadow-lg: 大阴影          /* 弹窗、面板 */
--shadow-xl: 超大阴影        /* 模态框 */
```

## 可访问性考虑

所有颜色组合都满足WCAG 2.1的对比度要求：
- 主文字对比度 ≥ 4.5:1
- 大字体对比度 ≥ 3:1
- 非文字元素对比度 ≥ 3:1

这个色板系统为长时间阅读和深度思考提供了最佳的视觉环境，同时保持了现代界面设计的美感和专业性。
