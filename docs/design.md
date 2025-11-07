# 设计文档

本文档描述心迹泡泡应用的设计理念、用户体验和视觉设计。

## 设计理念

### 核心价值

**心迹泡泡**旨在通过游戏化的方式，让日常反思变得轻松有趣。我们的设计理念基于以下原则：

- **轻松无压力**: 通过戳泡泡的简单动作降低反思的心理门槛
- **即时反馈**: 每次互动都有视觉和数据反馈
- **个性化成长**: 根据用户行为提供个性化的成长路径
- **跨平台一致性**: 在所有平台上保持一致的用户体验

### 目标用户

- **主要用户**: 18-35岁的年轻专业人士
- **次要用户**: 关注个人成长和心理健康的人群
- **使用场景**: 日常情绪记录、工作反思、生活感悟

## 用户体验设计

### 用户旅程

#### 新用户引导

1. **欢迎界面**: 简洁的应用介绍和引导
2. **首次互动**: 自动展示泡泡，引导用户第一次点击
3. **成就激励**: 第一次完成泡泡后立即获得奖励和鼓励
4. **功能探索**: 通过泡泡数量引导用户发现更多功能

#### 日常使用流程

```
打开应用 → 查看泡泡状态 → 戳泡泡 → 完成互动 → 获得奖励 → 查看进度 → 继续探索
```

### 交互设计

#### 泡泡交互

**点击反馈**:
- 视觉：泡泡破碎动画 + 经验值飘出效果
- 触觉：震动反馈（移动端）
- 声音：清脆的泡泡破裂声

**不同类型交互**:
- **普通泡泡**: 点击即完成
- **写一局泡泡**: 点击弹出输入框
- **行动泡泡**: 点击开始倒计时
- **金色泡泡**: 特殊动画效果

#### 倒计时交互

**视觉反馈**:
- 环形进度条显示剩余时间
- 数字倒计时大字体显示
- 背景色渐变营造专注氛围

**控制交互**:
- 点击暂停/继续按钮
- 倒计时完成自动处理
- 支持中途退出

### 响应式设计

#### 屏幕适配

**移动优先设计**:
- 小屏幕（< 768px）：紧凑布局，大触摸目标
- 平板屏幕（768px - 1024px）：平衡布局
- 大屏幕（> 1024px）：充分利用空间

**设备特性**:
- **触控优化**: 最小触摸目标 44px
- **震动反馈**: 倒计时完成时震动提醒
- **手势支持**: 左右滑动切换页面

## 视觉设计

### 设计语言

#### 色彩系统

**主色调**:
```css
--primary-color: #667eea;        /* 紫蓝色 */
--secondary-color: #764ba2;      /* 紫罗兰色 */
--accent-color: #fbbf24;         /* 金黄色 */
--success-color: #10b981;         /* 绿色 */
--warning-color: #f59e0b;         /* 橙色 */
--error-color: #ef4444;           /* 红色 */
```

**中性色**:
```css
--text-primary: #374151;         /* 深灰 */
--text-secondary: #6b7280;       /* 中灰 */
--text-light: #9ca3af;           /* 浅灰 */
--bg-primary: #ffffff;           /* 白色 */
--bg-secondary: #f3f4f6;         /* 浅灰 */
--bg-tertiary: #e5e7eb;         /* 更浅灰 */
```

**渐变色**:
```css
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--success-gradient: linear-gradient(135deg, #10b981 0%, #059669 100%);
--warning-gradient: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
--glass-gradient: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
```

### 视觉风格

#### 玻璃态设计 (Glassmorphism)

**核心特征**:
- 半透明背景
- 毛玻璃模糊效果
- 细微的边框和阴影
- 光影效果和渐变

**应用场景**:
- 泡泡容器
- 模态弹窗
- 卡片组件
- 按钮样式

#### 气泡视觉系统

**泡泡大小**:
- **小**: 60px（直径）
- **中**: 80px（直径）
- **大**: 100px（直径）

**泡泡样式**:
- **普通泡泡**: 单色渐变，柔和光泽
- **写一局泡泡**: 青色调渐变
- **行动泡泡**: 橙色调渐变
- **金色泡泡**: 金色渐变 + 特殊光泽效果

### 动画设计

#### 微交互

**悬停效果**:
- 悬停时轻微放大（scale: 1.05）
- 阴影加深
- 颜色加深

**点击效果**:
- 点击时缩小（scale: 0.95）
- 快速震动效果
- 粒子飞散效果

#### 页面动画

**入场动画**:
```css
/* 整体入场 */
.bubble-page {
  animation: pageEntry 1s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 泡泡浮动入场 */
.bubble-wrapper {
  animation: bubbleFloat 5s ease-in-out infinite;
}
```

**转场动画**:
```css
/* 页面切换 */
.page-transition {
  animation: slideIn 0.3s ease-out;
}

/* 模态弹窗 */
.modal-container {
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 图标系统

#### 泡泡图标

使用 Unicode Emoji 和自定义 SVG 图标：

- **情绪类**: 😊😎😔😰😴🤔
- **动作类**: ✍️⚡🏃💪🧘️📚
- **奖励类**: 🏆⭐🌟💎🎁🎉

#### 功能图标

- **导航**: 返回、设置、用户
- **操作**: 添加、编辑、删除
- **状态**: 加载、成功、错误

## 组件设计系统

### 按钮设计

#### 主要按钮
```css
.btn-primary {
  background: var(--primary-gradient);
  color: white;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}
```

#### 次要按钮
```css
.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  padding: 12px 24px;
}
```

### 卡片设计

#### 玻璃态卡片
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

### 进度显示

#### 等级进度
```css
.level-progress {
  background: var(--glass-gradient);
  border-radius: 8px;
  padding: 8px 12px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary-gradient);
  border-radius: 2px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 无障碍设计

### 可访问性

**色彩对比**:
- 所有文本对比度符合 WCAG AA 标准（4.5:1）
- 重要信息对比度达到 WCAG AAA 标准（7:1）

**键盘导航**:
- 支持 Tab 键导航
- 明确的焦点指示器
- 跳过链接功能

**屏幕阅读器**:
- 语义化 HTML 标签
- ARIA 标签和属性
- 图片 alt 文本

### 国际化

**多语言支持**:
- 界面文本使用翻译函数
- 支持中文、英文等多种语言
- 考虑文本长度变化

**文化适应性**:
- 考虑不同文化的颜色含义
- 适应不同的阅读习惯
- 尊重文化差异

## 设计系统维护

### 组件库

**命名规范**:
- 使用 BEM 命名规范
- 组件名使用 PascalCase
- 使用有意义的类名

**版本控制**:
- 设计系统版本与代码版本同步
- 重大变更记录变更日志
- 向后兼容性考虑

### 设计工具

**Figma 设计稿**:
- 维护完整的设计系统
- 组件库设计规范
- 原型设计文件

**设计规范文档**:
- 颜色使用指南
- 字体排版规范
- 图标使用规范
- 动画设计原则

---

设计文档将持续更新，以确保心迹泡泡应用始终提供最佳的用户体验。🫧✨