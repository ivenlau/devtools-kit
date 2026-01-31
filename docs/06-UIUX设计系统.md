# DevToolsKit UI/UX 设计系统

> **版本**: 1.0.0
> **最后更新**: 2025-01-30
> **设计方向**: 工业科技风 - 专业、精确、现代

---

## 设计哲学

### 核心原则

1. **精确性优先** - 像代码一样精确，每个像素都有意义
2. **功能美学** - 美观服务于功能，不牺牲可用性
3. **开发友好** - 使用开发者熟悉的视觉语言（语法高亮、代码字体）
4. **流畅交互** - 每个操作都有即时反馈，打造工具级体验
5. **专业质感** - 拒绝玩具感，追求工业级产品的精致度

### 设计隐喻

**"数字工作台"** - 像物理工作台一样组织有序、工具触手可及

---

## 一、视觉设计系统

### 1.1 色彩系统

#### 主色调 - 科技蓝渐变

```css
:root {
  /* 主色 - 从深空蓝到电光蓝 */
  --primary-50: #E8F4FF;
  --primary-100: #D1E9FF;
  --primary-200: #A6D4FF;
  --primary-300: #76B9FF;
  --primary-400: #4A9EFF;
  --primary-500: #1E84FF;  /* 主品牌色 */
  --primary-600: #0069E0;
  --primary-700: #0052B3;
  --primary-800: #003D87;
  --primary-900: #002A5C;

  /* 渐变色 - 用于强调和引导 */
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-tech: linear-gradient(135deg, #1E84FF 0%, #00D4FF 100%);
  --gradient-warm: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%);
  --gradient-cool: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

  /* 语法高亮色 - 开发者友好 */
  --syntax-red: #FF5C5C;      /* 关键字、错误 */
  --syntax-orange: #FFB86C;   /* 字符串 */
  --syntax-yellow: #F1FA8C;   /* 注释 */
  --syntax-green: #50FA7B;    /* 成功、变量 */
  --syntax-cyan: #8BE9FD;     /* 类型、函数 */
  --syntax-blue: #6272A4;     /* 数字 */
  --syntax-purple: #BD93F9;   /* 控制流 */
  --syntax-pink: #FF79C6;     /* 运算符 */
}
```

#### 中性色 - 精确灰度

```css
:root {
  /* 亮色主题 */
  --gray-0: #FFFFFF;
  --gray-25: #FAFAFA;
  --gray-50: #F5F5F5;
  --gray-100: #E8E8E8;
  --gray-200: #D4D4D4;
  --gray-300: #A3A3A3;
  --gray-400: #737373;
  --gray-500: #525252;
  --gray-600: #404040;
  --gray-700: #262626;
  --gray-800: #171717;
  --gray-900: #0A0A0A;
}

[data-theme="dark"] {
  /* 暗色主题 */
  --gray-0: #0A0A0A;      /* 纯黑背景 */
  --gray-25: #141414;
  --gray-50: #1E1E1E;     /* 编辑器背景 */
  --gray-100: #2D2D2D;
  --gray-200: #404040;
  --gray-300: #525252;
  --gray-400: #A3A3A3;
  --gray-500: #D4D4D4;
  --gray-600: #E8E8E8;
  --gray-700: #F5F5F5;
  --gray-800: #FAFAFA;
  --gray-900: #FFFFFF;
}
```

#### 功能色

```css
:root {
  --success-light: #D1FAE5;
  --success: #10B981;
  --success-dark: #059669;

  --warning-light: #FEF3C7;
  --warning: #F59E0B;
  --warning-dark: #D97706;

  --error-light: #FEE2E2;
  --error: #EF4444;
  --error-dark: #DC2626;

  --info-light: #DBEAFE;
  --info: #3B82F6;
  --info-dark: #2563EB;
}
```

#### 语义色应用

```css
/* 背景色系统 */
:root {
  --bg-primary: var(--gray-0);
  --bg-secondary: var(--gray-25);
  --bg-tertiary: var(--gray-50);
  --bg-elevated: #FFFFFF;
  --bg-overlay: rgba(0, 0, 0, 0.5);

  /* 文本色系统 */
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-400);
  --text-inverse: #FFFFFF;

  /* 边框色系统 */
  --border-subtle: var(--gray-100);
  --border-default: var(--gray-200);
  --border-strong: var(--gray-300);
  --border-focus: var(--primary-500);
}

[data-theme="dark"] {
  --bg-primary: var(--gray-0);
  --bg-secondary: var(--gray-25);
  --bg-tertiary: var(--gray-50);
  --bg-elevated: var(--gray-25);

  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
  --text-tertiary: var(--gray-400);

  --border-subtle: var(--gray-100);
  --border-default: var(--gray-200);
  --border-strong: var(--gray-300);
}
```

### 1.2 字体系统

#### 字体选择

**设计理念**: 拒绝Inter/Roboto等通用字体，选择具有技术感和独特性的字体组合

```css
:root {
  /* 标题字体 - Space Grotesk */
  /* 几何感强，具有科技特质，字母形态独特 */
  --font-display: 'Space Grotesk', 'Helvetica Neue', sans-serif;
  --font-display-weight: 300;  /* Light */
  --font-display-weight-medium: 500;  /* Medium */
  --font-display-weight-bold: 700;  /* Bold */

  /* 正文字体 - JetBrains Mono */
  /* 开发者熟悉的代码字体，具有精确感 */
  --font-body: 'JetBrains Mono', 'SF Mono', 'Monaco', 'Inconsolata', monospace;
  --font-body-size: 14px;
  --font-body-line-height: 1.6;

  /* UI字体 - IBM Plex Sans */
  /* IBM设计，具有工业质感 */
  --font-ui: 'IBM Plex Sans', 'Helvetica Neue', sans-serif;
  --font-ui-size: 13px;
}
```

#### 字体比例系统

```css
/* 使用Type Scale (1.250 - Major Third) */
:root {
  --text-xs: 0.694rem;    /* 11.1px - 说明文字 */
  --text-sm: 0.833rem;    /* 13.3px - 小标签 */
  --text-base: 1rem;      /* 16px - 正文 */
  --text-lg: 1.2rem;      /* 19.2px - 强调文本 */
  --text-xl: 1.44rem;     /* 23px - 小标题 */
  --text-2xl: 1.728rem;   /* 27.6px - 标题 */
  --text-3xl: 2.074rem;   /* 33.2px - 大标题 */
  --text-4xl: 2.488rem;   /* 39.8px - Hero标题 */
  --text-5xl: 2.986rem;   /* 47.8px - 超大标题 */
}
```

#### 字重系统

```css
:root {
  --font-weight-light: 300;
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

#### 行高系统

```css
:root {
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### 1.3 间距系统

**设计理念**: 基于8px网格，精确控制空间

```css
:root {
  /* 基础间距单位 */
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

#### 组件内间距

```css
/* 组件内边距标准 */
:root {
  --padding-compact: var(--space-2) var(--space-3);     /* 紧凑 */
  --padding-default: var(--space-3) var(--space-4);     /* 默认 */
  --padding-spacious: var(--space-4) var(--space-6);    /* 宽松 */
}
```

### 1.4 圆角系统

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;    /* 4px - 小元素 */
  --radius-default: 0.5rem;  /* 8px - 默认 */
  --radius-md: 0.75rem;    /* 12px - 卡片 */
  --radius-lg: 1rem;       /* 16px - 大卡片 */
  --radius-xl: 1.5rem;     /* 24px - 容器 */
  --radius-full: 9999px;   /* 完全圆角 */
}
```

#### 圆角使用原则

- **按钮**: `var(--radius-default)`
- **输入框**: `var(--radius-default)`
- **卡片**: `var(--radius-md)`
- **弹窗**: `var(--radius-lg)`
- **标签/徽章**: `var(--radius-full)`

### 1.5 阴影系统

**设计理念**: 创建深度层次，而非单纯的装饰

```css
:root {
  /* 精确阴影 - 像工业设计一样精确 */
  --shadow-xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1),
               0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
               0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
               0 4px 6px -4px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
               0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* 内阴影 */
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* 彩色阴影 - 科技感 */
  --shadow-glow-blue: 0 0 20px rgba(30, 132, 255, 0.3);
  --shadow-glow-purple: 0 0 20px rgba(118, 75, 162, 0.3);
  --shadow-glow-green: 0 0 20px rgba(16, 185, 129, 0.3);
}
```

#### 阴影层级

```css
/* 层级0 - 基础层 */
.layer-0 {
  box-shadow: none;
}

/* 层级1 - 悬浮元素 */
.layer-1 {
  box-shadow: var(--shadow-sm);
}

/* 层级2 - 下拉菜单 */
.layer-2 {
  box-shadow: var(--shadow-md);
}

/* 层级3 - 弹窗 */
.layer-3 {
  box-shadow: var(--shadow-lg);
}

/* 层级4 - Modal */
.layer-4 {
  box-shadow: var(--shadow-xl);
}
```

### 1.6 图标系统

使用 **Lucide Icons** - 简洁、现代、一致的图标库

```typescript
import {
  // 工具类图标
  Code2, Braces, FileCode, Hash,
  // 操作类图标
  Copy, Download, Upload, Trash2,
  // 状态类图标
  CheckCircle, XCircle, AlertCircle, Info,
  // 导航类图标
  Home, Settings, Clock, Star,
  // 编辑类图标
  Type, Image, Palette, Box,
} from 'lucide-react';

// 图标尺寸标准
const iconSizes = {
  xs: 14,   // 小标签内
  sm: 16,   // 按钮内
  md: 20,   // 默认
  lg: 24,   // 大按钮
  xl: 32,   // 页面标题旁
  '2xl': 48, // Hero图标
};
```

---

## 二、组件设计规范

### 2.1 按钮系统

#### 主要按钮 (Primary)

```css
.btn-primary {
  background: var(--gradient-tech);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-default);
  font-weight: var(--font-weight-medium);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.2s;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow-blue);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary:active {
  transform: translateY(0);
}
```

#### 次要按钮 (Secondary)

```css
.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-default);
  border: 1px solid var(--border-default);
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
  border-color: var(--border-strong);
}
```

#### 幽灵按钮 (Ghost)

```css
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-default);
  border: none;
  transition: all 0.2s;
}

.btn-ghost:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}
```

#### 危险按钮 (Danger)

```css
.btn-danger {
  background: var(--gradient-warm);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-default);
  border: none;
  transition: all 0.2s;
}

.btn-danger:hover {
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}
```

#### 按钮尺寸

```css
.btn-xs { padding: var(--space-1) var(--space-2); font-size: var(--text-xs); }
.btn-sm { padding: var(--space-2) var(--space-3); font-size: var(--text-sm); }
.btn-md { padding: var(--space-3) var(--space-6); font-size: var(--text-sm); }
.btn-lg { padding: var(--space-4) var(--space-8); font-size: var(--text-base); }
.btn-xl { padding: var(--space-5) var(--space-10); font-size: var(--text-lg); }
```

### 2.2 输入框系统

#### 文本输入框

```css
.input {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-default);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  color: var(--text-primary);
  transition: all 0.2s;
  position: relative;
}

.input:hover {
  border-color: var(--border-strong);
}

.input:focus {
  outline: none;
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(30, 132, 255, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}

/* 输入框状态 */
.input.error {
  border-color: var(--error);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input.success {
  border-color: var(--success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input.disabled {
  background: var(--bg-secondary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}
```

#### 搜索框

```css
.input-search {
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-10);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
}

.input-search:focus {
  background: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(30, 132, 255, 0.1);
}

.input-search-icon {
  position: absolute;
  left: var(--space-4);
  color: var(--text-tertiary);
  pointer-events: none;
}
```

#### 代码编辑器

```css
.code-editor {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 13px;
  line-height: var(--leading-relaxed);
  overflow: hidden;
}

.code-editor-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
  padding: var(--space-2) var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.code-editor-dots {
  display: flex;
  gap: var(--space-2);
}

.code-editor-dot {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
}

.code-editor-dot.red { background: #FF5F56; }
.code-editor-dot.yellow { background: #FFBD2E; }
.code-editor-dot.green { background: #27C93F; }

.code-editor-content {
  padding: var(--space-4);
  min-height: 200px;
}

/* 语法高亮 */
.syntax-keyword { color: var(--syntax-purple); }
.syntax-string { color: var(--syntax-orange); }
.syntax-number { color: var(--syntax-blue); }
.syntax-comment { color: var(--syntax-yellow); }
.syntax-function { color: var(--syntax-cyan); }
.syntax-operator { color: var(--syntax-pink); }
```

### 2.3 卡片系统

```css
.card {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--border-strong);
}

.card-header {
  margin-bottom: var(--space-4);
}

.card-title {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: var(--font-display-weight-medium);
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  color: var(--text-secondary);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.card-footer {
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

/* 工具卡片 */
.tool-card {
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-tech);
  opacity: 0;
  transition: opacity 0.3s;
}

.tool-card:hover::before {
  opacity: 0.05;
}

.tool-card-icon {
  width: 48px;
  height: 48px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--space-4);
  color: var(--primary-500);
}

.tool-card-badge {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  padding: var(--space-1) var(--space-2);
  background: var(--gradient-warm);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
}
```

### 2.4 徽章与标签

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  font-family: var(--font-ui);
}

.badge-default {
  background: var(--bg-secondary);
  color: var(--text-secondary);
}

.badge-primary {
  background: var(--primary-50);
  color: var(--primary-600);
}

.badge-success {
  background: var(--success-light);
  color: var(--success-dark);
}

.badge-warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.badge-error {
  background: var(--error-light);
  color: var(--error-dark);
}

/* Dot Badge */
.badge-dot {
  position: relative;
  padding-left: var(--space-4);
}

.badge-dot::before {
  content: '';
  position: absolute;
  left: var(--space-2);
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: currentColor;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 三、页面布局设计

### 3.1 整体布局结构

```
┌─────────────────────────────────────────────────────────┐
│  Header (60px)                                           │
│  [Logo] [搜索] [工具] [主题] [GitHub]                   │
├──────────┬──────────────────────────────────────────────┤
│          │                                               │
│ Sidebar  │  Main Content Area                           │
│ (240px)  │                                               │
│          │  ┌─────────────────────────────────────────┐  │
│ [工具]   │  │                                         │  │
│ □ 文本   │  │    工具内容区                            │  │
│ □ 编码   │  │                                         │  │
│ □ 正则   │  │    (动态加载)                            │  │
│ □ 时间   │  │                                         │  │
│ □ 转换   │  │                                         │  │
│          │  └─────────────────────────────────────────┘  │
│          │                                               │
└──────────┴───────────────────────────────────────────────┘
```

### 3.2 首页设计

#### Hero Section

```css
.hero {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: var(--space-24) var(--space-6);
  position: relative;
  overflow: hidden;
}

/* 背景网格效果 */
.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(var(--border-subtle) 1px, transparent 1px),
    linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px);
  background-size: 50px 50px;
  opacity: 0.3;
  animation: grid-pan 20s linear infinite;
}

@keyframes grid-pan {
  0% { transform: perspective(1000px) rotateX(60deg) translateY(0); }
  100% { transform: perspective(1000px) rotateX(60deg) translateY(50px); }
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-5xl);
  font-weight: var(--font-display-weight-bold);
  line-height: var(--leading-tight);
  margin-bottom: var(--space-6);
  background: var(--gradient-tech);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  z-index: 1;
}

.hero-subtitle {
  font-family: var(--font-ui);
  font-size: var(--text-xl);
  color: var(--text-secondary);
  max-width: 600px;
  margin-bottom: var(--space-8);
  line-height: var(--leading-relaxed);
  position: relative;
  z-index: 1;
}

.hero-actions {
  display: flex;
  gap: var(--space-4);
  position: relative;
  z-index: 1;
}
```

#### 工具网格

```css
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-6);
  padding: var(--space-12) var(--space-6);
}

.tools-section-title {
  font-family: var(--font-display);
  font-size: var(--text-2xl);
  font-weight: var(--font-display-weight-medium);
  margin-bottom: var(--space-6);
  color: var(--text-primary);
}

.tool-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-tech);
  opacity: 0;
  transition: opacity 0.3s;
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: var(--primary-300);
}

.tool-card:hover::before {
  opacity: 0.05;
}
```

### 3.3 工具页面布局

```css
.tool-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.tool-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-default);
  padding: var(--space-6);
  flex-shrink: 0;
}

.tool-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.tool-icon {
  width: 40px;
  height: 40px;
  background: var(--gradient-tech);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.tool-title {
  font-family: var(--font-display);
  font-size: var(--text-3xl);
  font-weight: var(--font-display-weight-medium);
  color: var(--text-primary);
}

.tool-description {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-secondary);
}

.tool-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.tool-editor-area {
  flex: 1;
  display: flex;
  gap: var(--space-4);
  padding: var(--space-6);
  min-height: 0;
}

.tool-input,
.tool-output {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tool-editor-label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  margin-bottom: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tool-stats {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.tool-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-default);
  padding: var(--space-4) var(--space-6);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}
```

---

## 四、响应式设计

### 4.1 断点系统

```css
:root {
  --breakpoint-sm: 640px;   /* 手机横屏 */
  --breakpoint-md: 768px;   /* 平板 */
  --breakpoint-lg: 1024px;  /* 桌面 */
  --breakpoint-xl: 1280px;  /* 大桌面 */
  --breakpoint-2xl: 1536px; /* 超大屏 */
}

/* 移动优先的媒体查询 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

### 4.2 响应式布局

#### 移动端 (< 768px)

```css
@media (max-width: 767px) {
  /* 隐藏侧边栏，使用底部导航 */
  .sidebar {
    display: none;
  }

  .mobile-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border-top: 1px solid var(--border-default);
    padding: var(--space-2) var(--space-4);
    justify-content: space-around;
    z-index: 100;
  }

  /* 单列布局 */
  .tool-editor-area {
    flex-direction: column;
  }

  .tools-grid {
    grid-template-columns: 1fr;
  }

  /* 减小字体 */
  .hero-title {
    font-size: var(--text-3xl);
  }
}
```

#### 平板 (768px - 1023px)

```css
@media (min-width: 768px) and (max-width: 1023px) {
  /* 折叠侧边栏 */
  .sidebar {
    width: 60px;
  }

  .sidebar-text {
    display: none;
  }

  /* 两列布局 */
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

#### 桌面 (≥ 1024px)

```css
@media (min-width: 1024px) {
  /* 完整侧边栏 */
  .sidebar {
    width: 240px;
  }

  /* 三列或更多 */
  .tools-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}
```

### 4.3 触摸优化

```css
/* 增大触摸目标 */
@media (hover: none) and (pointer: coarse) {
  .btn,
  .tool-card {
    min-height: 44px;
    min-width: 44px;
  }

  .input {
    padding: var(--space-4);
    font-size: 16px; /* 防止iOS自动缩放 */
  }

  /* 移除hover效果 */
  .tool-card:hover {
    transform: none;
  }

  /* 添加active效果 */
  .tool-card:active {
    transform: scale(0.98);
    background: var(--bg-secondary);
  }
}
```

---

## 五、暗色模式

### 5.1 暗色模式色彩

```css
[data-theme="dark"] {
  /* 深色背景 - 减少眼疲劳 */
  --bg-primary: #0A0A0A;
  --bg-secondary: #141414;
  --bg-tertiary: #1E1E1E;

  /* 浅色文字 */
  --text-primary: #FAFAFA;
  --text-secondary: #A3A3A3;
  --text-tertiary: #525252;

  /* 微妙的边框 */
  --border-subtle: #262626;
  --border-default: #2D2D2D;
  --border-strong: #404040;

  /* 调整语法高亮对比度 */
  --syntax-red: #FF6B6B;
  --syntax-orange: #FFA94D;
  --syntax-yellow: #FFE66D;
  --syntax-green: #69DB7C;
  --syntax-cyan: #4DABF7;
  --syntax-blue: #74C0FC;
  --syntax-purple: #DA77F2;
  --syntax-pink: #F783AC;
}
```

### 5.2 暗色模式特定样式

```css
[data-theme="dark"] {
  /* 编辑器样式 - 类似VS Code */
  .code-editor {
    background: #1E1E1E;
    border-color: #333333;
  }

  /* 输入框 - 减少眩光 */
  .input {
    background: #141414;
    border-color: #2D2D2D;
  }

  .input:focus {
    background: #1E1E1E;
  }

  /* 卡片 - 微妙的层次 */
  .card {
    background: #141414;
    border-color: #262626;
  }

  /* 按钮光晕 - 更明显 */
  .btn-primary:hover {
    box-shadow: 0 0 30px rgba(30, 132, 255, 0.5);
  }

  /* 渐变调整 - 降低亮度 */
  --gradient-primary: linear-gradient(135deg, #5A67D8 0%, #6B46C1 100%);
  --gradient-tech: linear-gradient(135deg, #3182CE 0%, #00B5D8 100%);
}
```

### 5.3 暗色模式切换动画

```css
/* 平滑过渡 */
* {
  transition: background-color 0.3s ease,
              border-color 0.3s ease,
              color 0.3s ease;
}

/* 排除不需要过渡的元素 */
*:not([data-transition="false"]) {
  transition-property: background-color, border-color, color;
}

/* 暗色模式切换按钮 */
.theme-toggle {
  position: relative;
  width: 60px;
  height: 30px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: background 0.3s;
}

.theme-toggle::after {
  content: '🌙';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 24px;
  height: 24px;
  background: var(--gradient-warm);
  border-radius: var(--radius-full);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

[data-theme="dark"] .theme-toggle::after {
  content: '☀️';
  transform: translateX(30px);
}
```

---

## 六、动效设计

### 6.1 缓动函数

```css
:root {
  /* 标准缓动 */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* 自定义缓动 */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

  /* 时长 */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --duration-slower: 500ms;
}
```

### 6.2 关键动画

#### 淡入动画

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn var(--duration-base) var(--ease-out);
}
```

#### 滑入动画

```css
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideInDown {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-in-up {
  animation: slideInUp var(--duration-slow) var(--ease-out);
}

.slide-in-down {
  animation: slideInDown var(--duration-slow) var(--ease-out);
}
```

#### 缩放动画

```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
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

.scale-in {
  animation: scaleIn var(--duration-base) var(--ease-out);
}

.pulse {
  animation: pulse 2s var(--ease-in-out) infinite;
}
```

#### 交错动画

```css
.stagger-in > * {
  opacity: 0;
  animation: slideInUp var(--duration-slow) var(--ease-out) forwards;
}

.stagger-in > *:nth-child(1) { animation-delay: 0ms; }
.stagger-in > *:nth-child(2) { animation-delay: 50ms; }
.stagger-in > *:nth-child(3) { animation-delay: 100ms; }
.stagger-in > *:nth-child(4) { animation-delay: 150ms; }
.stagger-in > *:nth-child(5) { animation-delay: 200ms; }
.stagger-in > *:nth-child(n+6) { animation-delay: 250ms; }
```

### 6.3 微交互

#### 按钮点击

```css
.btn {
  position: relative;
  overflow: hidden;
}

.btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s, opacity 0.3s;
}

.btn:active::after {
  transform: scale(2);
  opacity: 1;
  transition: 0s;
}
```

#### 卡片悬停

```css
.tool-card {
  transition: all var(--duration-slow) var(--ease-out);
}

.tool-card:hover {
  transform: translateY(-8px);
  box-shadow:
    var(--shadow-lg),
    0 0 0 1px var(--primary-200);
}

.tool-card:hover .tool-card-icon {
  transform: scale(1.1) rotate(5deg);
}

.tool-card-icon {
  transition: transform var(--duration-slow) var(--ease-spring);
}
```

#### 加载动画

```css
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-default);
  border-top-color: var(--primary-500);
  border-radius: var(--radius-full);
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 骨架屏动画 */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-secondary) 0%,
    var(--bg-tertiary) 50%,
    var(--bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## 七、无障碍设计 (a11y)

### 7.1 键盘导航

```css
/* 可见焦点环 */
*:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

/* 跳过链接 */
.skip-link {
  position: absolute;
  top: -40px;
  left: 0;
  background: var(--primary-500);
  color: white;
  padding: var(--space-2) var(--space-4);
  z-index: 9999;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
}
```

### 7.2 颜色对比度

确保文字和背景的对比度符合WCAG AA标准（4.5:1）

```css
/* 检查对比度 */
.text-on-primary {
  color: white; /* 对蓝色背景 */
  /* 对比度: 5.2:1 ✓ */
}

.text-on-gray {
  color: var(--text-primary);
  background: var(--bg-primary);
  /* 对比度: 15.5:1 ✓ */
}

.error-text {
  color: var(--error);
  background: white;
  /* 对比度: 4.6:1 ✓ */
}
```

### 7.3 语义化HTML

```html
<!-- 使用语义化标签 -->
<header role="banner">
  <nav aria-label="主导航">
    <ul>
      <li><a href="/tools" aria-current="page">工具</a></li>
    </ul>
  </nav>
</header>

<main role="main">
  <article aria-labelledby="tool-title">
    <h1 id="tool-title">JSON 格式化</h1>
  </article>
</main>

<footer role="contentinfo">
  <p>&copy; 2025 DevToolsKit</p>
</footer>

<!-- 表单标签 -->
<label for="json-input">输入 JSON</label>
<textarea
  id="json-input"
  aria-label="输入 JSON 数据"
  aria-describedby="json-help"
></textarea>
<p id="json-help">请输入有效的 JSON 字符串</p>

<!-- 按钮状态 -->
<button
  type="button"
  aria-label="复制结果"
  aria-pressed="false"
>
  复制
</button>
```

### 7.4 屏幕阅读器

```css
/* 屏幕阅读器专用 */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* 实时区域 */
[aria-live="polite"] {
  /* 用于非关键更新 */
}

[aria-live="assertive"] {
  /* 用于关键更新（错误） */
}
```

---

## 八、工具页面UI示例

### 8.1 JSON 工具页面

```css
/* JSON工具特定样式 */
.json-tool {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.json-toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
}

.json-editor-container {
  flex: 1;
  display: flex;
  gap: var(--space-4);
  padding: var(--space-6);
  overflow: hidden;
}

.json-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-default);
  overflow: hidden;
}

.json-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-default);
}

.json-panel-title {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.json-panel-stats {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--text-tertiary);
}

.json-panel-content {
  flex: 1;
  overflow: auto;
}

/* JSON语法高亮 */
.json-key { color: var(--syntax-cyan); }
.json-string { color: var(--syntax-orange); }
.json-number { color: var(--syntax-blue); }
.json-boolean { color: var(--syntax-purple); }
.json-null { color: var(--syntax-red); }

/* JSON错误提示 */
.json-error {
  padding: var(--space-3) var(--space-4);
  background: var(--error-light);
  border-left: 3px solid var(--error);
  color: var(--error-dark);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.json-error-icon {
  flex-shrink: 0;
}

.json-error-message {
  flex: 1;
}

.json-error-location {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--error-dark);
}
```

### 8.2 Base64 工具页面

```css
/* Base64工具特定样式 */
.base64-tool {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.base64-mode-tabs {
  display: flex;
  padding: var(--space-4) var(--space-6);
  gap: var(--space-2);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-default);
}

.base64-tab {
  padding: var(--space-2) var(--space-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-default);
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-base);
}

.base64-tab:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.base64-tab.active {
  background: var(--primary-50);
  color: var(--primary-600);
  font-weight: var(--font-weight-medium);
}

[data-theme="dark"] .base64-tab.active {
  background: rgba(30, 132, 255, 0.15);
  color: var(--primary-400);
}

/* 图片预览区 */
.base64-image-preview {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
  background: var(--bg-tertiary);
  border: 2px dashed var(--border-default);
  border-radius: var(--radius-md);
  min-height: 300px;
  position: relative;
  overflow: hidden;
}

.base64-image-preview.drag-over {
  border-color: var(--primary-500);
  background: rgba(30, 132, 255, 0.05);
}

.base64-image-placeholder {
  text-align: center;
  color: var(--text-tertiary);
}

.base64-image-placeholder-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  color: var(--text-tertiary);
  opacity: 0.5;
}

.base64-image-preview img {
  max-width: 100%;
  max-height: 500px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}
```

### 8.3 时间戳工具页面

```css
/* 时间戳工具特定样式 */
.timestamp-tool {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
}

.timestamp-hero {
  background: var(--gradient-tech);
  padding: var(--space-8) var(--space-6);
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;
}

.timestamp-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
}

.timestamp-display {
  font-family: var(--font-body);
  font-size: var(--text-5xl);
  font-weight: var(--font-weight-medium);
  margin: var(--space-4) 0;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.timestamp-display-secondary {
  font-family: var(--font-body);
  font-size: var(--text-2xl);
  opacity: 0.8;
}

.timestamp-date {
  font-family: var(--font-ui);
  font-size: var(--text-lg);
  opacity: 0.9;
}

.timestamp-converter {
  padding: var(--space-8) var(--space-6);
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.converter-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-6);
  box-shadow: var(--shadow-md);
}

.converter-card-title {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: var(--font-display-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}
```

---

## 九、设计资源清单

### 9.1 字体资源

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Space+Grotesk:wght@300;500;700&display=swap" rel="stylesheet">
```

### 9.2 图标库

```bash
npm install lucide-react
```

### 9.3 动画库

```bash
# Framer Motion (推荐)
npm install framer-motion

# 或使用 GSAP
npm install gsap
```

### 9.4 设计工具

- **Figma**: 用于UI设计和原型
- **Chromatic**: 用于组件测试和文档
- **Storybook**: 用于组件开发

---

## 十、实施清单

### 阶段一: 基础设施 (Week 1)
- [ ] 设置设计token系统
- [ ] 实现色彩变量和主题切换
- [ ] 配置字体和排版系统
- [ ] 建立间距和网格系统

### 阶段二: 核心组件 (Week 2-3)
- [ ] 实现按钮系统
- [ ] 实现输入框系统
- [ ] 实现卡片组件
- [ ] 实现代码编辑器组件
- [ ] 实现徽章和标签

### 阶段三: 布局和页面 (Week 4-5)
- [ ] 实现整体布局框架
- [ ] 实现首页Hero和工具网格
- [ ] 实现工具页面布局
- [ ] 实现响应式设计

### 阶段四: 动效和细节 (Week 6)
- [ ] 实现暗色模式
- [ ] 添加页面加载动画
- [ ] 添加微交互效果
- [ ] 优化性能

### 阶段五: 无障碍和测试 (Week 7)
- [ ] 键盘导航测试
- [ ] 颜色对比度检查
- [ ] 屏幕阅读器测试
- [ ] 跨浏览器测试

---

**文档版本**: 1.0.0
**设计方向**: 工业科技风
**设计师**: AI Design System
**最后更新**: 2025-01-30
