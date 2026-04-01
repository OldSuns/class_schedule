# 开发者文档

本文档说明当前代码结构、常见修改入口与发布维护流程，帮助快速定位改动位置。

## 入口与整体结构

- `src/main.jsx`：React 入口与全局样式加载。
- `src/app/App.jsx`：应用根组件，负责串联 Header、SettingsMenu、CourseTable、CourseModal、Toast，以及周次切换、软更新、版本检查、状态栏适配等逻辑。
- 当前项目没有路由，属于单页面课表应用，主要通过 Hook 状态、弹窗和设置面板驱动交互。

## 主要目录

### 组件（UI）

- `src/components/layout/`：顶部栏与 Toast。
- `src/components/settings/SettingsMenu/`：设置菜单及各功能分区。
- `src/components/schedule/`：课表表格与课程详情/编辑弹窗。
- `src/components/shared/`：周次多选等复用组件。

### Hooks（状态与行为）

- `src/hooks/semester/useSemesterDate.js`：开学日期读取/保存，计算当前周次与日期信息。
- `src/hooks/ui/useWeekSelector.js`：周次选择与切换逻辑。
- `src/hooks/ui/useWeekSwipe.js`：移动端左右滑动切周。
- `src/hooks/ui/useCourseModal.js`：课程弹窗状态。
- `src/hooks/ui/useDisplayMode.js`：课表显示模式。
- `src/hooks/schedule/useScheduleData.js`：内置课表、远端课表、自定义课表的加载、持久化与切换。
- `src/hooks/notifications/useNotifications.js`：通知设置、权限检查与排程协调。

### 数据、服务与工具

- `src/data/scheduleData.js`：内置课表数据源。
- `src/utils/schedule/courseUtils.js`：课程展示与单元格合并辅助。
- `src/utils/schedule/scheduleUtils.js`：课表规范化、逻辑增删改。
- `src/utils/schedule/timeUtils.js`：节次时间、日期与当前课程计算。
- `src/utils/schedule/groupUtils.js`：分组解析与过滤。
- `src/utils/schedule/electiveUtils.js`：选修项过滤逻辑。
- `src/config/constants.js`：周次范围、默认开学日期、版本号、远端课表地址、存储键名。
- `src/services/schedule/remoteSchedule.js`：远端 `schedule.json` 拉取与缓存校验。
- `src/services/app/updateChecker.js`：版本检查。常量名保留 `GITHUB_*`，实际请求的是 Gitee Releases API。
- `src/services/notifications/notificationScheduler.js`：Android 本地通知构建、去重、重排与快照持久化。
- `src/services/platform/widgetBridge.js`：调用 Android 原生小组件刷新桥接。
- `storage.js`：跨平台存储封装（Web: `localStorage`；Android: Capacitor Preferences）。

## 常见修改位置

- 修改课程内容：编辑 `src/data/scheduleData.js`
- 调整课表编辑行为：查看 `src/components/schedule/CourseModal/` 与 `src/utils/schedule/scheduleUtils.js`
- 调整节次时间、当前节次计算：编辑 `src/utils/schedule/timeUtils.js`
- 修改周次范围、默认开学日期、版本号、远端地址或存储键：编辑 `src/config/constants.js`
- 调整通知排程、提醒文案或权限逻辑：编辑 `src/hooks/notifications/useNotifications.js` 与 `src/services/notifications/notificationScheduler.js`
- 调整远端课表拉取与软更新逻辑：编辑 `src/hooks/schedule/useScheduleData.js` 与 `src/services/schedule/remoteSchedule.js`
- 调整版本检查：编辑 `src/services/app/updateChecker.js`
- 调整桌面小组件刷新桥：编辑 `src/services/platform/widgetBridge.js`，对应原生实现位于 `android/app/src/main/java/com/oldsun/classschedule/WidgetBridgePlugin.java`

## 课表软更新发布说明

软更新使用仓库根目录 `schedule.json` 作为远端数据源。该文件由 `src/data/scheduleData.js` 生成。

当前线上地址：
- `https://fastly.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json`
- `https://cdn.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json`
- `https://gcore.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json`

发布课表更新时需要：

```bash
npm run export-schedule
git add src/data/scheduleData.js schedule.json
git commit -m "chore: update schedule"
git push
```

## 刷新 jsDelivr 缓存

- 工具页：[jsDelivr purge](https://www.jsdelivr.com/tools/purge)
- Purge URL：`https://purge.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json`
- 测试地址：
  - `https://cdn.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json`
  - `https://fastly.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json`

## Android 注意事项

- 通知仅在 Android 原生构建中可用。
- Android 12+ 需要精确闹钟权限才能尽量保证提醒准时。
- `android/app/src/main/java/com/oldsun/classschedule/MainActivity.java` 负责注册 `WidgetBridgePlugin`，并将状态栏高度注入到 Web CSS 变量。
- `android/app/src/main/java/com/oldsun/classschedule/NotificationRestoreReceiver.java` 会根据持久化的通知快照恢复本地通知。

## 调试建议

- Web：使用浏览器 DevTools，结合 `src/config/constants.js` 中的 `STORAGE_KEYS` 排查本地存储状态。
- Android：使用 `adb logcat` 查看通知、原生桥接与权限相关日志。

## 测试现状

- 当前未接入前端测试框架。
- `android/app/src/test/` 与 `android/app/src/androidTest/` 仍是 Capacitor 默认示例测试，包名仍为旧的 `com.getcapacitor.myapp`。
