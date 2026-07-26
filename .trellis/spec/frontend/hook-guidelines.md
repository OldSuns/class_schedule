# Hook Guidelines

> How hooks are used in this project.

## Custom Hook Patterns

Custom hooks are named exports whose names start with `use`. Each hook owns one focused stateful concern and returns named values and action callbacks.

```js
// src/hooks/ui/useWeekSelector.js
export const useWeekSelector = (initialWeek = 1) => {
  const [currentWeek, setCurrentWeek] = useState(initialWeek);
  const handleNextWeek = useCallback(() => {
    setCurrentWeek((week) => (week < MAX_WEEK ? week + 1 : week));
  }, []);
  return { currentWeek, setCurrentWeek, handleNextWeek };
};
```

- Use `useState` for observable state, `useMemo` for expensive derived values, `useCallback` for callbacks returned to consumers, and `useRef` for mutable coordination that must not render.
- Use guard clauses in effects, such as `if (!isLoaded) return`, so persistence and native work start only after initialization.
- Return domain names rather than generic setters when validation or side effects are involved. Examples include `onThemeChange`, `handleStartDateChange`, and `softUpdateSchedule`.

## Persistence and Async Initialization

Persisted hooks use the root `storage.js` adapter so the same code works with browser `localStorage` and Capacitor Preferences.

`src/hooks/ui/useTheme.js` and `src/hooks/semester/useSemesterDate.js` demonstrate the initialization pattern:

1. Use `getItemSync` only for a browser-friendly initial render.
2. Load the authoritative value asynchronously in an effect.
3. Track whether the user changed the value while loading so stale async data cannot overwrite current input.
4. Persist changes only after loading is complete when needed.

`src/hooks/schedule/useScheduleData.js` applies the same ideas to built-in, remote, and manual schedule sources. Reuse it instead of adding parallel schedule persistence.

## Effects and Cleanup

- Effects that register timers, DOM listeners, or Capacitor listeners return cleanup functions. See `useSemesterDate.js`, `useWeekSwipe.js`, and `useNotifications.js`.
- Use a local `cancelled` flag when an async effect may resolve after unmount.
- Use refs for in-flight locks or latest callbacks when concurrency matters. `useScheduleData.js` prevents overlapping remote checks; `useNotifications.js` queues one pending reconciliation while scheduling is active.
- Keep dependency arrays complete. If an effect needs the latest changing function without re-registering a listener, mirror it into a ref explicitly, as `App.jsx` does for remote checks.

## Data Fetching

There is no React Query, SWR, or shared server-state cache. Hooks coordinate service functions:

- `useScheduleData.js` calls `src/services/schedule/remoteSchedule.js` and persists ETag/Last-Modified metadata.
- `App.jsx` calls `src/services/app/startupUpdate.js` for release checks.
- `useNotifications.js` calls `src/services/notifications/notificationScheduler.js` for native notification operations.

Keep request parsing and platform API details in services. Hooks translate service results into UI state and user actions.

## Common Mistakes

- Do not write a second hook for state already owned by `useScheduleData`, `useSemesterDate`, `useTheme`, or `useNotifications`.
- Do not let async initialization overwrite a user change made during startup.
- Do not omit listener/timer cleanup or allow concurrent scheduling/fetch calls without the existing lock pattern.
- Do not hide actionable failures. Log unexpected errors and expose the existing status/result shape to the UI.
