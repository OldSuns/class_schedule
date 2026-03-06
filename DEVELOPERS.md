# 开发者文档

本文档说明主要文件的内容与作用，帮助快速定位修改点。

## 入口文件

- `App.jsx` 应用根组件，串联各类 Hook、标题栏、设置面板、课表与弹窗。
- `src/main.jsx` React 入口与全局样式加载。
- `index.html` Vite 页面模板。

## 组件（UI）

- `src/Header.jsx` 顶部栏与周次切换入口。
- `src/SettingsMenu.jsx` 开学日期、周次快速选择、组别、通知与更新检查。
- `src/CourseTable.jsx` 课表主视图与单元格渲染。
- `src/CourseModal.jsx` 课程详情弹窗。
- `src/WeekSelector.jsx` 顶部周次选择组件。

## Hooks（状态与行为）

- `src/useSemesterDate.js` 开学日期读取与保存，计算今天周次信息。
- `src/useWeekSelector.js` 周次选择状态与导航逻辑。
- `src/useCourseModal.js` 课程弹窗状态与选中单元格。
- `src/useNotifications.js` 通知开关、权限、排程与状态提示。
- `src/useMobileDetect.js` 设备检测辅助。

## 数据与工具

- `src/scheduleData.js` 课程数据表（课程、周次、地点、备注、组别）。
- `src/courseUtils.js` 课程合并、地点显示与课程名工具函数。
- `src/groupUtils.js` 组别解析与过滤（A/B）。
- `src/timeUtils.js` 节次时间表与日期/周次计算。
- `src/constants.js` 周次范围、默认开学日期、版本号与更新地址。
- `src/updateChecker.js` GitHub Releases 更新检查。
- `src/notificationScheduler.js` Android 通知排程与文案格式。
- `storage.js` 跨平台存储（Web localStorage / Android Preferences）。

## 常见修改位置

- 修改课程内容：编辑 `src/scheduleData.js`。
- 调整节次时间：编辑 `src/timeUtils.js`。
- 更改周次范围或默认开学日期：编辑 `src/constants.js`。
- 调整通知时间与内容：编辑 `src/notificationScheduler.js`。
- 发布版本更新：修改 `package.json` 并执行 `npm run sync-version`。
- 软更新课表源：执行 `npm run export-schedule` 生成根目录 `schedule.json` 并提交。

## 课表软更新发布说明

软更新使用仓库根目录 `schedule.json` 作为远端数据源（Raw URL 拉取）。
发布课表更新时必须先生成并提交该文件：

```bash
npm run export-schedule
git add schedule.json
git commit -m "chore: update schedule.json"
git push
```

## Android 注意事项

- 通知仅在 Android 原生构建可用（Capacitor）。
- Android 12+ 需要精确闹钟权限以确保准时提醒。
- 构建步骤见 `README.md`。

## 调试建议

- Web：使用浏览器 DevTools，检查 `src/constants.js` 中的本地存储 key。
- Android：使用 `adb logcat` 查看运行日志与权限问题。
