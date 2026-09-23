# Class_schedule

一个面向 2023 级暑期社会实践的独立课表版本，基于 React + Vite 构建，并通过 Capacitor 支持 Android 端。课程使用真实起止时间，支持 1–7 组轮转、课程详情与编辑、课前提醒、桌面小组件和远端课表软更新。

## 功能特性

- 固定从 2026-07-13 计算 8 周暑期安排
- 周次与周内日期切换，统一日表展示真实时间、课程和地点
- 当前课程进度与对应日表行高亮
- 课程详情弹窗，支持修改 / 删除课程
- 1组至7组轮转过滤，共同课程对所有组可见
- Android 桌面小组件：显示今日课程
- Android 端本地通知：支持 10 / 15 / 20 / 30 分钟提前量与 30 天滚动排程
- 远端 `schedule.json` 软更新
- Gitee Releases 更新检查

## 技术栈

- React 19 + Vite 6
- Tailwind CSS + PostCSS
- Capacitor 8（Android）
- framer-motion
- lucide-react

## 运行环境

- Node.js `>=18`

## 快速开始

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

## 构建与预览

```bash
npm run build
npm run preview
```

说明：`npm run build` 会先执行 `npm run export-schedule`，同步生成根目录 `schedule.json`。

## 可用脚本

- `npm run dev`：启动 Vite 开发服务器
- `npm run build`：生成生产构建，并先导出 `schedule.json`
- `npm run preview`：本地预览构建产物
- `npm run export-schedule`：将 `src/data/scheduleData.js` 导出为根目录 `schedule.json`
- `npm run sync-version`：将 `package.json` 中的版本号同步到 Web 常量与 Android Gradle 配置

目前仓库未配置前端 ESLint 脚本；JS 单元测试使用 Node.js 内置测试运行器。

## 项目结构

- `src/main.jsx`：React 入口
- `src/app/App.jsx`：应用根组件，负责串联主要状态、界面与副作用
- `src/components/`：界面组件（顶部栏、设置面板、课表、课程弹窗、Toast 等）
- `src/hooks/`：业务状态与交互逻辑（学期日期、周次、通知、课表、移动端手势等）
- `src/services/`：远端更新、通知、平台桥接等服务
- `src/utils/schedule/`：事件规范化、受众筛选、时间和日期计算等纯逻辑
- `src/data/scheduleData.js`：内置课表数据源
- `src/config/constants.js`：暑期周次范围、固定起点、版本号、远端地址、存储键名
- `storage.js`：跨平台存储封装（Web 使用 `localStorage`，原生端使用 Capacitor Preferences）
- `scripts/`：版本同步与课表导出脚本
- `android/`：Capacitor Android 原生工程

## 数据与更新

- 内置课表数据维护在 `src/data/scheduleData.js`
- 远端软更新使用仓库根目录 `schedule.json` 作为发布产物
- 修改内置课表后，请执行：

```bash
npm run export-schedule
```

- 发布新版本前，如需同步版本号到 Android，请执行：

```bash
npm run sync-version
```

## Android 构建

先构建 Web 资源并同步到 Android：

```bash
npm run sync-version
npm run build
npx cap sync android
```

在 macOS / Linux 下构建调试 APK：

```bash
cd android
./gradlew assembleDebug
cd ..
```

在 Windows 下可使用：

```bash
cd android
./gradlew.bat assembleDebug
cd ..
```

```bash
npm run sync-version; npm run build; npx cap sync android
cd android; .\gradlew.bat assembleDebug; cd ..
```

## 测试

运行 JS 单元测试：

```bash
npm run test:unit
```

Android 应用模块当前没有自动化测试。
