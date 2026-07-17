# State Management

## Authoritative schedule state

`useScheduleData` stores one normalized root object:

```js
{
  version: 2,
  semesterStartDate: "2026-07-13",
  updatedAt: "2026-07-17T00:00:00+08:00",
  events: []
}
```

- Never keep a second day/period representation in React state, storage, remote payloads, notifications, or widget snapshots.
- Every event carries separate string fields for `teacher` and `note`; never overload `note` with teaching staff.
- `normalizeSchedulePayload` may accept strict v1 events only for the explicit one-way migration `note → teacher`; normalized state is always v2. Remote publishing keeps `schedule.json` as the generated v1 compatibility projection and uses `schedule-v2.json` for current clients.
- Every manual mutation returns a new root object, updates `updatedAt`, and passes through `normalizeSchedulePayload` before entering state.
- Invalid custom or remote data is rejected as one payload. Do not drop bad events, accept legacy arrays, or silently fall back to old schedule keys.
- Schedule storage uses the `summerSchedule*` namespace. Theme uses the independent `summerTheme` key so the summer build starts in Minimal Blue instead of inheriting an old M3 choice. Notification plans and widget snapshots are also summer-specific; notification permission and lead-time preferences may remain shared.
- The semester start date is a fixed business constant, not user-editable state.

## Date navigation state

- Keep only `currentWeek` and `selectedDay`; do not add a parallel absolute-date state.
- Adjacent-day gestures resolve through one pure helper that returns the next `{ week, day }`, and `App` applies both values in the same interaction.
- Week selectors change only `currentWeek` and preserve the selected weekday.

## Audience state

- `userGroup` is exactly one of `1组` through `7组`.
- `group: null` means a shared event; a non-null event group matches only the same user group.
- Old A–D/class group values are invalid and normalize to the default user selection, never to “show all”.

## Application update checks

- On startup, check the latest application Release at most once per local calendar day. Recording a displayed prompt suppresses duplicate prompts for that day.
- Failed checks stay silent and may retry after three minutes. The Settings page remains the explicit manual-check path.
