# 更新 2026-2 学期课表

## Goal

将 `D:\Download\五临23级课表.xlsx` 中第五临床医学院临床医学 2023 级 6 班、7 班的 2026-2 学期课表替换为应用内置课表，使各班组能按星期、节次和周次看到正确课程。

## Background

- Excel 工作簿只有 `2023` 工作表，课程区为 5 个工作日、13 节课。
- `officecli` 已确认工作簿 OpenXML 结构有效。
- 源表包含 53 条带周次的课程块；合并单元格的纵向范围表示连续节次，同一天的并行列表示同一时段的不同课程或班组课程。两条合班共同见习各计一个课程块。
- 当前 `src/data/scheduleData.js` 仍是上一批课程内容；它是内置课表唯一数据源，根目录 `schedule.json` 是生成文件。

## Requirements

1. 将 Excel 中 53 条课程块完整映射到 `src/data/scheduleData.js`，保留星期、起始节次、连续节数、周次和班组；展开后共 166 个节次课程记录。
2. 将周次表达式（如 `1-3、5-13周`）展开为有序周次数组；所有周次必须在 1 至 17 周内。
3. 使用系统已支持的班组规范名：`6班A组`、`6班B组`、`7班C组`、`7班D组`、`6班A、B组`、`7班C、D组`。
4. 统一源表中的明显同课程异名：`外科学(Ⅱ)` 归一为 `外科学A(Ⅱ)`，`麻醉科学见习` 归一为 `麻醉学见习`。
5. 保留源表明确列出的授课教师，将教师姓名写入课程备注。
6. 源表未提供教室时使用 `未排地点`；明确标注为网课的课程使用 `网课` 作为地点。
7. 将 `DEFAULT_SEMESTER_START_DATE` 更新为 `2026-09-07`；已存日期恰好为旧默认值 `2026-03-02` 时自动迁移，其他用户自定义日期保持不变。
8. 保持 `DEFAULT_SCHEDULE_VERSION = 2`，不得递增课表版本号。
9. 将应用版本更新为 `2.2.0`，以 `package.json` 为版本源，并同步 `package-lock.json`、`APP_VERSION`、Android `versionName` 和日期型 `versionCode`。
10. 通过现有导出流程重新生成根目录 `schedule.json`，不得手工维护第二份课表数据。
11. 不修改用户提供的 Excel 原件；除学期标题外，不更改 UI、通知、远程更新或手工编辑流程。
12. `src/data/scheduleData.js` 必须保持显式的 `{ day, periods, courses }` 字面量结构，不使用课程块、构造函数或展开函数简写；每条课程显式提供可逐周填写的 `note.default` / `note.weeks` 和 `location.default` / `location.weeks`。`weeks` 数组与空的逐周对象保持单行紧凑格式，有具体逐周内容时再展开。
13. 将应用标题从 `WL课表（2026-1）` 更新为 `WL课表（2026-2）`。

## Technical Notes

- 受影响文件：`src/data/scheduleData.js`、`src/config/constants.js`、`src/hooks/semester/useSemesterDate.js`、`package.json`、`package-lock.json`、`android/app/build.gradle`、`schedule.json`，以及聚焦的数据测试文件。
- 这是数据源替换，不是跨模块结构修复。按项目原有格式直接维护完整的 `{ day, periods, courses }` 字面量，便于后续逐周补充教师和教室；不引入课程块或展开辅助函数。
- 展开后每个工作日必须包含 1 至 13 节；空节次保留空 `courses` 数组。
- 版本同步使用现有 `npm run sync-version`，不新增版本维护逻辑。
- 学期日期只做旧默认值到新默认值的一次性窄迁移，不新增通用迁移框架或存储键。

## Acceptance Criteria

- [x] 应用内置课表包含 Excel 的全部 53 条课程块（展开后 166 个节次课程记录），没有重复合班课程或上一学期残留课程。
- [x] 合并单元格对应的课程出现在其覆盖的每个连续节次，且没有扩展到范围外。
- [x] 1 至 17 周、四个单班组和两个合班组的筛选语义正确。
- [x] 教师备注、网课标记及未排地点策略按 Requirements 体现。
- [x] `DEFAULT_SCHEDULE_VERSION` 保持为 2，`DEFAULT_SEMESTER_START_DATE` 为 `2026-09-07`；旧默认日期会迁移，其他自定义日期不会被覆盖。
- [x] `package.json`、`package-lock.json`、`APP_VERSION` 和 Android `versionName` 均为 `2.2.0`，Android `versionCode` 由现有同步脚本生成。
- [x] `schedule.json` 由 `npm run export-schedule` 生成，并与 `scheduleData.js` 内容一致。
- [x] 聚焦数据测试、`npm run test:unit` 和 `npm run build` 全部通过。
- [x] 最终差异不包含 Excel 原件改动、无关重构、隐藏回退或第二份课表源。
- [x] `scheduleData.js` 不含 `course`、`block`、`scheduleBlocks`、`expandDay` 等生成式简写，所有课程均显式包含可编辑的逐周备注与地点对象，且空周次字段使用紧凑单行格式。
- [x] 应用标题显示为 `WL课表（2026-2）`。

## Out Of Scope

- 补充 Excel 未提供的教室、逐周教学主题或其他教师信息。
- 修改 Android 业务代码或资源；仅同步 `build.gradle` 中的版本元数据。
- 修改周末、考试、通知、界面布局和远程更新机制。
