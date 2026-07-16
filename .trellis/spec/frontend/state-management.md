# State Management

## Authoritative schedule state

`useScheduleData` stores one normalized root object:

```js
{
  version: 1,
  semesterStartDate: "2026-07-13",
  updatedAt: "2026-07-16T00:00:00+08:00",
  events: []
}
```

- Never keep a second day/period representation in React state, storage, remote payloads, notifications, or widget snapshots.
- Every manual mutation returns a new root object, updates `updatedAt`, and passes through `normalizeSchedulePayload` before entering state.
- Invalid custom or remote data is rejected as one payload. Do not drop bad events, accept legacy arrays, or silently fall back to old schedule keys.
- Schedule storage uses the `summerSchedule*` namespace. Theme and notification preferences may remain shared, but schedule snapshots, notification plans, and widget snapshots are summer-specific.
- The semester start date is a fixed business constant, not user-editable state.

## Audience state

- `userGroup` is exactly one of `1组` through `7组`.
- `group: null` means a shared event; a non-null event group matches only the same user group.
- Old A–D/class group values are invalid and normalize to the default user selection, never to “show all”.
