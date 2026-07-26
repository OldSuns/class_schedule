# Update Week 16 Schedule Data

## Goal

Update only week 16 course data in `src/data/scheduleData.js` so the displayed schedule for 2026-06-15 through 2026-06-19 matches the user-provided timetable.

## Requirements

- Preserve the existing data shape: `name`, `weeks`, `group`, `note`, and `location`.
- Reuse existing multi-week course objects when the course name already matches the target name; in that case keep week `16` and add week-specific `note.weeks[16]` / `location.weeks[16]` as needed.
- If an existing course name differs from the target timetable name, remove week `16` from that old object and add a week-16-only course object with the exact target name.
- Map evening period labels to internal periods: `晚1-3节` is periods `11-13`.
- Do not modify other week behavior intentionally.

## Target Week 16 Timetable

- Monday 6.15:
  - 1-2: 内科学A 类风湿关节炎 许瑜佳 11号楼1楼大教室
  - 6-7: 内科学A (B组) 风湿科见习 殷丽娟 二期8号楼13楼813病区示教室
  - 6-9: 儿科学A (A组) 小儿心肺复苏（含惊厥）（实操） 邹小杰 11号楼2楼医学模拟中心AHA培训室（东）
  - 6-7: 口腔科学A (7班C组和D组) 实验四 牙列缺损/缺失的修复治疗 刘重远 门诊3楼B1区口腔科示教室
- Tuesday 6.16:
  - 1-2: 内科学A 系统性红斑狼疮 许瑜佳 11号楼1楼大教室
  - 3-4: 外科学 阑尾疾病 结肠、直肠、肛管疾病（含慕课学习） 张津瑜 11号楼1楼大教室
  - 6-9: 儿科学A (D组) 小儿腹泻及液体疗法 陈晓霞 5号楼7楼507病区示教室
- Wednesday 6.17:
  - 晚1-3: 口腔科学期末考试
- Thursday 6.18:
  - 1-2: 内科学A (D组) 风湿科见习 殷丽娟 二期8号楼13楼813病区示教室
  - 1-4: 儿科学A (B组) 小儿心肺复苏（含惊厥）（实操） 邹小杰 11号楼2楼医学模拟中心AHA培训室（东）
  - 8-9: 外科学 结肠、直肠、肛管疾病（含慕课学习） 余胜 11号楼1楼大教室
- Friday 6.19:
  - No courses.

## Validation

- Run a Node assertion script that imports `scheduleData.js` and compares all week 16 active courses against the target timetable.
- Run `npm run test:unit`.
- Do not run `npm run build` unless explicitly requested, because it rewrites `schedule.json`.
