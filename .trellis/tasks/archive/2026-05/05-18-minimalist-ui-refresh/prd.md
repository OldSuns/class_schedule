# 前端极简风 UI 优化

## Goal

对课表应用的整体前端界面进行极简化优化，去除冗余视觉元素，强化信息层次，保持精致感避免单调。当前设计基 M3（Material You）+ Apple Minimalist 混合风格，需在此基础上进一步精简。

## What I already know

- 项目是 React 19 + Vite + Tailwind CSS 3.4，单页面应用，无路由
- 现有设计基 M3 Tonal Palette（种子色 #6750A4），搭配 Apple 极简 Token
- 组件：Header、CourseTable（原生 `<table>`）、CourseModal（底部弹窗）、SettingsMenu（左侧抽屉）、Toast、WeekMultiSelect（Chip 选择器）、折叠面板等
- 动画库：framer-motion
- 图标库：lucide-react
- 已定义 CSS 变量（--surface-header、--surface-separator、--safe-top/bottom）
- 字体：系统原生中文优先（PingFang SC 等）
- 课程单元格使用 8 色调色板（紫/蓝/绿/橙/粉/黄/青/薰衣草）

## Assumptions (temporary)

- 不改动功能逻辑，纯视觉/UI 优化
- 保持现有技术栈（React 19、Tailwind、framer-motion）
- 优先移动端体验（Capacitor 打包）

## Decisions

1. **风格方向**: 暖白柔和极简 — 保留暖白基调（`#FFFBFE`），降低饱和度，留白代替分割线

2. **课表单元格色彩**: 保留 8 色区分。非当天课程降低饱和度（背景淡色、文字加深至 ~#4A2D70 级别），当天课程保持原始饱和度

3. **动画**: 维持现状，仅调整视觉风格，不改动画量

4. **字体**: 保留系统字体（零成本、渲染快），靠间距和排版体现极简气质

## Open Questions

（已全部确认）



## Requirements (evolving)

- 方向：暖白柔和极简 — 保留暖白基调，降低色板饱和度，减少阴影/分割线，用留白代替边界
- 整体视觉更简洁、更有呼吸感
- 去除不必要的视觉装饰（多余分割线、阴影等）
- 强化信息层级：标题 > 课程信息 > 辅助信息
- 保持精致感而非单调

## Acceptance Criteria (evolving)

- [ ] 页面视觉一致性：字体、间距、圆角、色彩统一，无杂乱的阴影和分割线
- [ ] 课程单元格 8 色饱和度大幅降低（背景 ~10% opacity），文字对比度 ≥4.5:1
- [ ] 移动端（375px）+ 桌面端（1440px）视觉均通过验证
- [ ] SettingsMenu、CourseModal、Toast 等所有组件风格一致
- [ ] 与现有功能完全兼容（不改功能逻辑）
- [ ] Lint / typecheck 通过

## Technical Approach

**策略**: 从 Token 层改起，自底向上推进。
1. `tailwind.config.js` — 调淡阴影、统一圆角、柔化色彩
2. `src/index.css` — 更新全局 CSS 变量
3. `src/components/schedule/CourseTable.jsx` — 调淡课程单元格颜色
4. 各组件文件 — 移除多余分割线/视觉装饰，增加间距留白

## Definition of Done

- Lint / typecheck 通过
- 至少一种屏幕尺寸上视觉效果通过人工审查

## Out of Scope (explicit)

- 功能逻辑改动
- 新增功能
- 技术栈更换

## Technical Notes

- 核心文件：`src/index.css`、`tailwind.config.js`、`src/app/App.jsx`
- 组件目录：`src/components/layout/`、`src/components/schedule/`、`src/components/settings/`、`src/components/shared/`
- 当前设计 Token 分布在 `tailwind.config.js`（颜色/圆角/阴影）和 `src/index.css`（CSS 变量）
