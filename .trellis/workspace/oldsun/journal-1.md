# Journal - oldsun (Part 1)

> AI development session journal
> Started: 2026-05-15

---



## Session 1: 更新第12周课表内容

**Date**: 2026-05-15
**Task**: 更新第12周课表内容
**Branch**: `main`

### Summary

根据用户提供的第12周（5.18-5.22）课表内容，更新了 scheduleData.js 中第12周所有课程的 note.weeks 和 location.weeks，移除了星期五儿科学见习(6班A组)的第12周，并重新导出了 schedule.json。

### Main Changes

- Updated `src/data/scheduleData.js` for week 15 only and regenerated `schedule.json`.
- Removed Wednesday week 15 `形势与政策A` entries.
- Corrected Thursday afternoon so period 8 is `形势与政策A`, while `内科学A(I)` covers periods 6-7.

### Git Commits

| Hash | Message |
|------|---------|
| `5264fab` | (see git log) |

### Testing

- [OK] Targeted week 15 source-data assertion passed.
- [OK] Targeted `schedule.json` week 15 assertion passed.
- [OK] Non-week-15 schedule snapshot comparison against `HEAD` showed no changes.
- [OK] `npm run export-schedule` passed.
- [OK] `npm run build` passed outside the sandbox after sandboxed build hit `esbuild spawn EPERM`.

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 2: 前端极简风 UI 优化

**Date**: 2026-05-18
**Task**: 前端极简风 UI 优化
**Branch**: `refactor/simplify-ui`

### Summary

暖白柔和极简风 UI 刷新：减少阴影/分割线、降低非当天课程色彩饱和度、当天课程保留原饱和度、增加留白间距。14 个文件改动，纯视觉优化，无功能逻辑变更。

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `f2473d1` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 3: Finish week 14 schedule task

**Date**: 2026-05-30
**Task**: Finish week 14 schedule task
**Branch**: `main`

### Summary

Phase 3 wrap-up: verify build, regenerate schedule.json, archive task

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `bfb4598` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 4: Update week 15 schedule

**Date**: 2026-06-05
**Task**: Update week 15 schedule
**Branch**: `main`

### Summary

Updated built-in week 15 schedule data from the supplied 6/08-6/12 timetable, removed Wednesday policy classes, corrected Thursday period 8 to policy class, regenerated schedule.json, and validated week 15 plus build.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `7b88b7f` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 5: Finish exam page updates

**Date**: 2026-06-06
**Task**: Finish exam page updates
**Branch**: `main`

### Summary

Added seat number support and fixed exam method options, committed the app change, and archived the Trellis task.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `ee7aab4` | (see git log) |
| `6dcbc16` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete


## Session 6: Update week 16 schedule

**Date**: 2026-06-12
**Task**: Update week 16 schedule

### Summary

Updated src/data/scheduleData.js so week 16 matches the provided timetable; validated with a week-16 assertion and npm run test:unit.

### Main Changes

(Add details)

### Git Commits

| Hash | Message |
|------|---------|
| `790ca05` | (see git log) |

### Testing

- [OK] (Add test results)

### Status

[OK] **Completed**

### Next Steps

- None - task complete
