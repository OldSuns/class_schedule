# Class_schedule

一个轻量的课程表应用，基于 React + Vite 构建，并通过 Capacitor 支持 Android 端。支持周次计算、A/B 组别过滤、课程详情弹窗与课前提醒。
课程表实例取自本人课表

## 功能特性

- 学期开始日期配置，自动计算当前周次与星期
- 周视图课表展示，连续课程自动合并
- 快速切换周次（1～16 周）
- 课程详情弹窗（课程名、地点、备注、组别）
- A/B 组别筛选（见习或分组课）
- Android 端本地通知：支持 10/15/20/30 分钟提前量、测试通知、精确闹钟权限状态与 30 天滚动排程
- GitHub Releases 更新检查

## 技术栈

- React 19 + Vite 6
- Tailwind CSS
- Capacitor 8（Android）
- framer-motion、lucide-react

## 运行环境

- Node.js `>=18`

## 快速开始

安装依赖：

```bash
npm install
```

本地启动：

```bash
npm run dev
```

生产构建与预览：

```bash
npm run build
npm run preview
```

## 可用脚本

- `npm run dev` 启动开发服务器
- `npm run build` 生产构建
- `npm run preview` 本地预览构建产物
- `npm run sync-version` 同步应用版本（用于更新检查）
- `npm run export-schedule` 生成 `schedule.json`（课表软更新远端源）


## 数据与配置

- `src/scheduleData.js` 课程表数据（周次、节次、地点、备注、组别等）
- `src/timeUtils.js` 节次时间与时间计算逻辑
- `src/constants.js` 周次范围、默认开学日期、版本号与更新地址
- `storage.js` 跨平台存储（Web: localStorage / Android: Capacitor Preferences）

## Android 构建

1. 构建 Web 资源并同步到 Android：

```bash
npm run sync-version; npm run build; npx cap sync android
```

2. 使用 Gradle 构建 APK：

```bash
cd android; .\gradlew.bat assembleDebug; cd ..
```

macOS/Linux 可使用：

```bash
cd android
./gradlew assembleDebug
cd ..
```

## 项目结构

- `App.jsx` 应用入口
- `src/` 页面与业务逻辑
- `src/notificationScheduler.js` 通知排程逻辑
- `src/updateChecker.js` 更新检查逻辑
- `scripts/` 构建与版本同步脚本

## 贡献指南

欢迎提交 Issue 或 PR。建议流程：

1. Fork 仓库并创建分支
2. 提交清晰的变更说明
3. 提交 PR 并描述改动背景与影响
