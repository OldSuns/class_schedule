# Quality Guidelines

## Required invariants

- `startTime` and `endTime` are the only course-time source. Fixed periods and `periodRanges` are forbidden as schedule logic.
- Event times use strict `HH:mm`; `endTime` must be later than `startTime`.
- Event IDs are unique, weeks are within 1–8, weekdays are Monday–Friday, and groups are `null` or `1组`–`7组`.
- Contacts and phone numbers from rotation spreadsheets must never enter schedule data. Teaching staff belongs in `teacher`; `note` is reserved for course remarks and operational details.
- Remote sources must target `@summer-schedule`; no request or fallback may target `main`.
- Current clients fetch `schedule-v2.json`; the generated `schedule.json` v1 projection is reserved for already-installed legacy clients and must remain derivable from the same source.
- Notifications merge visible events with the same start time, keep different start times separate, and use stable positive 32-bit IDs for the Android bridge.
- Widget snapshot v4 contains validated events with `startMin`/`endMin`; native code must not reinterpret fixed periods.
- Android `WindowInsets` values are physical pixels. Convert them by display density before injecting CSS safe-area variables; never write raw inset pixels as CSS pixels.

## Validation order

1. Add or update a failing `node:test` case for behavior changes.
2. Run the targeted test and confirm the expected failure.
3. Implement the minimum root-cause change and rerun the targeted test.
4. Run `npm run test:unit`.
5. Run `npm run build`.
6. For Android changes, run `android\\gradlew.bat :app:compileDebugJavaWithJavac --rerun-tasks --no-daemon`.
7. Run Trellis validation and `git diff --check`.

## Forbidden patterns

- Legacy day/period schedule arrays or compatibility branches.
- A–D, class-combination, or elective audience logic in the summer schedule.
- Duplicate audience/time filtering in UI, notifications, and widgets when a shared event utility can be used.
- Silent payload repair, partial-event fallback, or broad exception handling that hides invalid schedule data.
