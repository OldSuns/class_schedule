# Update Week 15 Schedule

## Goal

Update only week 15 built-in schedule content to match the user's supplied 6/08-6/12 schedule.

## Requirements

- Modify week 15 only; do not change the schedule membership, notes, or locations for any other week.
- Treat `src/data/scheduleData.js` as the source of truth, then regenerate root `schedule.json`.
- Fully cover the previous week 15 content with the supplied week 15 courses.
- Remove the existing Wednesday afternoon and evening `形势与政策A` entries from week 15.
- Thursday period 8 belongs to `形势与政策A`; `内科学A(I)` on Thursday afternoon covers periods 6-7 only.
- Keep canonical course names already used by the project:
  - `内科学A(I)` for `内科学A(I)-0002/0005`
  - `外科学A(I)` for `外科学(I)-0005`
  - `儿科学A` / `儿科学见习`
  - `神经病学B` / `神经病学见习`
  - `形势与政策A`

## Validation

- A targeted week 15 assertion must fail before data edits and pass after data edits.
- `npm run export-schedule` must regenerate `schedule.json` from `src/data/scheduleData.js`.
- `npm run build` must pass.
- Diff review must confirm changes are limited to week 15 schedule content and generated export output.
