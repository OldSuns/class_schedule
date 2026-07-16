# 暑期课表设计

## Scope

本任务是结构性替换，不在现有“星期 × 固定节次 × 课程”模型上叠加暑期例外。教学日历同时存在 `08:00–12:00` 见习、`13:00–13:40` 讲座、`13:45–16:45` 技能培训和夜间课程；固定节次无法无损表达这些时段。

## Authoritative schedule model

内置课表、远端 JSON、本地自定义课表和小组件快照统一使用事件列表：

```js
{
  version: 1,
  semesterStartDate: "2026-07-13",
  updatedAt: "2026-07-16T00:00:00+08:00",
  events: [
    {
      id: "rotation-w2-mon-g1-am",
      name: "神经内科见习",
      day: "Monday",
      weeks: [2],
      startTime: "08:00",
      endTime: "12:00",
      group: "1组",
      location: "708A病区",
      note: ""
    }
  ]
}
```

- 根对象必须精确满足 `{ version: 1, semesterStartDate: "2026-07-13", updatedAt: ISO-8601, events: Event[] }`；缺少字段、额外的结构替代字段、`version !== 1`、无效 `updatedAt` 或不同学期起点均显式拒绝。
- `day` 与 `weeks` 表示重复规则；不为每个日期复制同一事件。
- `startTime` 和 `endTime` 是唯一时间来源；时间解析统一由调度工具提供。
- `group: null` 表示共同课程，`group: "1组"` 至 `"7组"` 表示轮转课程。
- 输入规范化严格要求：唯一非空 `id`、非空 `name`、`day ∈ Monday…Friday`、去重后的 `weeks ⊆ 1…8`、严格 `HH:mm`、`endTime > startTime`、以及 `group ∈ {null, "1组"…"7组"}`。远端、内置和手动输入任一事件不合法或 ID 重复时，整份载荷以“课表数据格式不兼容”显式失败；不得丢弃事件、接受 ABCD/旧组别或静默回退。

## Data construction

`src/data/scheduleData.js` 仅保留暑期事件。使用同文件内的小型数据构建函数从轮转矩阵生成见习事件，避免把相同的上午/下午课程手写数百次。

- 周起点为 2026-07-13；第 1 周仅录入 7 月 15–17 日岗前培训。
- 完整的课程、地点、单元格来源和逐日替代规则维护在 `research/excel-sources.md`；数据生成只引用这份脱敏清单。
- 周二下午按教学日历逐项录入共同课程并覆盖其来源时间；周四技能培训和考核为共同事件。
- 轮转事件按调研中的逐日规则生成；被共同课程占用的见习不生成，避免把来源未安排的重叠课程伪造为真实课程。
- 联系人和电话不写入事件数据。

## Group and storage boundaries

`groupUtils` 只识别 `1组` 至 `7组` 和共同课程。提醒、当前课程、小组件和事件详情共用这一受众判定；不保留 6A、6B、7C、7D、组合组或 A–D 的兼容分支。

课表专属存储键改用夏季命名空间：`summerScheduleCustom`、`summerScheduleSource`、`summerScheduleDefaultVersion`、`summerScheduleDefaultSignature`、`summerScheduleRemoteSnapshot`、`summerScheduleRemoteMeta`、`summerScheduleRemoteSkippedUpdate`、`summerScheduleRemoteLastCheckAt`、`summerScheduleRemoteLastForegroundCheckAt`、`summerScheduleRemoteLastErrorAt`。旧键保持不读、不删；新版本只从夏季键加载。

远端端点按下列顺序配置并发请求，所有地址均固定 `@summer-schedule` 分支：

1. `https://fastly.jsdelivr.net/gh/oldsuns/class_schedule@summer-schedule/schedule.json`
2. `https://gcore.jsdelivr.net/gh/oldsuns/class_schedule@summer-schedule/schedule.json`
3. `https://cdn.jsdelivr.net/gh/oldsuns/class_schedule@summer-schedule/schedule.json`

多个根 schema 有效响应按载荷中的最新 `updatedAt` 选择；相同时按上述顺序优先。远端快照必须通过完整根对象与事件规范化，签名覆盖 `version`、`semesterStartDate`、`updatedAt` 与规范化后的完整 `events`；旧数组/节次载荷拒绝缓存。网络失败或格式失败不得请求/回退 `main`、旧键或旧格式：保留已验证的夏季快照；若不存在该快照则保持内置暑期课表，并暴露本次检查失败状态。重置操作清除所有夏季课表键与远端快照，再加载内置事件；旧键不能重新进入加载路径。主题、通知开关和非课表设置不迁移，以避免无关数据丢失。

## Presentation and editing

首页沿用当前页面框架和主题变量，但以真实时间轴替换固定节次表格：

- 标题栏沿用当前 `Header` 的信息结构，显示暑期标题与今日状态；右上角保留唯一的 1–7 组选择。当前课程进度不得占用标题栏。
- 标题栏下依次为周次切换、周内日期切换和日期标题，主要组件的垂直间距统一为 12–16px。
- 主内容区先显示当前课程卡，包含课程名、真实时间、地点和进度；卡片上下留白高于普通日表行。演示时间固定为 14:15，对应 `13:45–14:25` 的“肺炎的诊断及治疗”，进度为 75%。
- 当前课程卡下方是一张当天全部课程的统一日表，列为“时间 / 课程 / 地点”。上午轮转见习和下午共同课程使用完全相同的行结构；长课程名允许居中换行，正在进行的课程行使用简约蓝浅色背景和左侧焦点条。
- 日表内容直接使用 Excel 课程名和合并单元格展开后的地点，不按上午/下午或课程类型凭空添加分区标题。真实时间文本本身已足够表达时段，不再显示“精确时段”徽标。
- 点击日表行打开底部详情弹层，展示名称、真实时间、地点、教师、适用对象，以及编辑/删除操作；弹层遮罩后的背景复用同一时间轴页面，而不是单独伪造一套课程背景。
- 课程编辑器改用原生 `input type="time"`，保留周次、地点、备注、组别和删除能力。
- 设置页复用当前 `SettingsPage` / `SettingsMenu` 的连续圆角卡片与折叠入口，移除选修课、A–D 与显示模式菜单；“分组”演示态展开为 4 列 × 2 行的 1–7 组按钮。暑期版本固定使用时间轴，主题作为直接的 M3/简约蓝双选项，默认选中简约蓝，另保留快速选周、提醒、更新和重置。

Pencil 已确认三个画板：`暑期课表 · 时间轴视图`（`o2h8NJ`）、`暑期课表 · 设置页`（`O3pwo`）与 `暑期课表 · 课程详情弹窗`（`t4NHI`），位于 `C:\Users\12395\.pencil\documents\b7af1e5a-d634-4f4f-b334-6490e7879b85\pencil-new.pen`。可复现 PNG 基线为 `research/pencil/o2h8NJ.png`、`research/pencil/O3pwo.png` 和 `research/pencil/t4NHI.png`；视觉验收以 390px 宽移动视口检查代码式标题栏、周内日期切换、唯一的组别入口、主内容当前课程、当天统一日表、真实时间与地点、当前代码同款设置卡、展开的 4×2 组别网格、默认简约蓝主题、复用时间轴背景的课程弹窗和底部导航。

## Notification and widget

通知调度器按事件的 `startTime` 计算提前提醒，并使用事件结束时间生成正文。相同开始时间的多门受众课程合并为一条通知，不同开始时间各自提醒；当前课程返回同一时间内所有匹配事件。Android 小组件快照改为事件结构及开始/结束分钟，复用同一组别受众字段；旧的 `periodRanges` 不再是时间依据。上述行为必须由纯 JS 快照/调度测试覆盖后再做 Gradle 编译检查。

## Compatibility and rollback

这是一条独立分支，不与旧课表数据格式兼容。课表专属新键与远端分支隔离意味着回到 `main` 时旧版仍读取自己的缓存；回滚暑期版本只需回到 `main` 或移除暑期应用构建。
