# State Management

> How state is managed in this project.

## Overview

The application uses React state and focused custom hooks. It has no global state library, React context store, or URL/router state. Shared state is lifted to `src/app/App.jsx`; persistent domain state is encapsulated by hooks and `storage.js`.

## State Categories

| Category | Owner | Examples |
|---|---|---|
| Local UI state | The component that renders it | Exam form/action state in `ExamPage.jsx`; expanded settings sections in `SettingsPage.jsx` |
| Cross-component UI state | `src/app/App.jsx` | Active tab, selected course cell, modal visibility, schedule update toast |
| Persistent domain state | Focused hooks | Theme in `useTheme.js`, semester date in `useSemesterDate.js`, schedule source/data in `useScheduleData.js` |
| Derived state | `useMemo` or pure utilities | Merged timetable cells, filtered courses, exam summaries, current period |
| Non-render coordination | `useRef` | In-flight remote checks, pending notification schedules, latest callback references |

## Sources of Truth

- `src/data/scheduleData.js` is the canonical built-in schedule. Root `schedule.json` is generated output.
- `useScheduleData.js` is the runtime owner of built-in, remote, and manually edited schedule selection and persistence.
- `src/config/constants.js` owns shared ranges, mode values, URLs, versions, and `STORAGE_KEYS`.
- `storage.js` is the only Web/Capacitor persistence adapter.
- Pure domain transformations live in `src/utils/`; components should consume their results rather than store duplicate derived values.

## Update Patterns

Use immutable React state updates. For deeply nested schedule edits, the established flow is to clone once at the state boundary, apply the logical operation to that working copy, and set the new root value:

```js
// src/app/App.jsx
const updateSchedule = (mutate) => {
  setScheduleData((prev) => {
    const next = cloneSchedule(prev);
    mutate(next);
    return next;
  });
};
```

Small collection updates also return new values. `upsertExam` and `deleteExam` in `src/utils/exam/examUtils.js` never mutate the input list.

## Remote and Native State

There is no general server-state abstraction. Remote schedule state is explicit in `useScheduleData.js`: the service fetches and validates payloads, while the hook stores the snapshot, metadata, skipped-update marker, and pending confirmation state. Release checks use the separate `src/services/app/` flow.

Native notification state is coordinated by `useNotifications.js`, with durable plan snapshots handled by `notificationScheduler.js`. Do not mirror these records in component state unless the component owns a temporary editing view.

## Common Mistakes

- Do not add a global store for a single-screen flow that existing hooks and lifted state already cover.
- Do not keep both raw and derived schedule/exam collections in state; derive them from the source collection.
- Do not mutate a React state object in place. The schedule utilities may mutate only the explicit clone passed to them.
- Do not bypass `storage.js` with direct `localStorage` or Preferences calls.
- Do not create new literal storage keys outside `STORAGE_KEYS`.
- Do not persist before async initialization completes when that can overwrite saved data.
