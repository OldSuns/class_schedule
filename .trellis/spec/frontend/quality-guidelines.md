# Quality Guidelines

> Current code quality and validation conventions.

## Baseline

- Keep changes focused and reuse the existing component, hook, service, utility, and storage boundaries.
- Prefer short functions, guard clauses, shared constants, and pure transformations.
- Unexpected failures must remain visible through thrown errors, `console.error`, or an explicit error result. Do not add silent success fallbacks.
- Match surrounding formatting. The repository has no ESLint or formatter configuration, so there is no lint command to claim as a quality gate.

## Required Patterns

- Validate remote, persisted, and form input at its boundary. See `remoteSchedule.js`, `scheduleUtils.js`, and `examUtils.js`.
- Put shared values in `src/config/constants.js` and search all consumers before changing them.
- Use `storage.js` for cross-platform persistence and `src/services/platform/` for native bridges.
- Clean up timers and DOM/Capacitor listeners in effects.
- Return new React state values. Clone the schedule before passing it to in-place logical update/delete utilities.
- Use semantic controls, visible focus behavior, accessible names, `disabled`, and `aria-pressed` where applicable.
- Preserve reduced-motion behavior when changing week or screen animations.

## Testing Requirements

JavaScript unit tests use Node's built-in `node:test` and `node:assert/strict` under `tests/*.test.js`.

```js
import test from "node:test";
import assert from "node:assert/strict";

test("describes observable behavior", () => {
  assert.equal(actual, expected);
});
```

- Add or update a focused test for changed non-trivial utility/service behavior.
- `tests/examUtils.test.js` is the model for pure domain logic.
- `tests/startupUpdate.test.js` injects storage/network dependencies to test async orchestration without real I/O.
- `tests/header.test.js` uses Vite SSR only when JSX rendering is necessary.
- Run `npm run test:unit`, then `npm run build` for web changes. The build first regenerates root `schedule.json`.
- Android-specific changes additionally use the relevant Gradle compile/test command from `AGENTS.md`.

There is no browser end-to-end suite and no general component test framework. Do not introduce one for a single small test when a pure utility or SSR test covers the behavior.

## Generated and Cross-Platform Files

- After editing `src/data/scheduleData.js`, run `npm run export-schedule` and include root `schedule.json`.
- `npm run build` always runs that exporter and rewrites `schedule.json.updatedAt` to the local current date, even when schedule content is unchanged. Inspect the diff after every build; do not include a timestamp-only change in an unrelated task.
- After changing the package version, run `npm run sync-version` so web and Android versions stay aligned.
- After changing web assets for an Android release, sync the Capacitor shell as documented in `AGENTS.md`.
- Keep Android bridge contracts aligned between `src/services/platform/` and `android/app/src/main/java/com/oldsun/classschedule/`.

## Forbidden Patterns

- Duplicate business logic across components, hooks, services, or native bridges.
- Direct `localStorage`/Preferences access outside `storage.js`.
- Broad `try/catch` blocks that swallow malformed data or report success after failure.
- A second source of truth for schedule data, storage keys, modes, or versions.
- Unbounded effects, leaked listeners/timers, or overlapping remote/native operations.
- Placeholder tests that only restate the implementation or pass when the feature is removed.

## Review Checklist

- Does the change live in the existing owning layer and reuse current helpers?
- Are trust-boundary inputs validated and failures visible?
- Are React updates immutable and async races/listeners handled?
- Are theme tokens, semantic controls, focus, and reduced motion preserved?
- Are generated/cross-platform consumers updated together?
- Do targeted unit tests and the affected build pass?
- Does the diff avoid dead code, duplicated logic, hidden fallbacks, and unrelated cleanup?
