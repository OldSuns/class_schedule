# Type Safety

> Runtime data-safety patterns in this JavaScript project.

## Current Type System

The application is JavaScript and JSX, not TypeScript. There is no checked-in `tsconfig`, schema library, or project-wide JSDoc typing convention. Safety comes from narrow module contracts, shared constants, normalization functions, and explicit runtime validation at data boundaries.

Do not add isolated TypeScript files or a type dependency for a local change. A TypeScript migration would be a separate project-wide task.

## Shared Shapes and Constants

- Define enum-like values and shared keys in `src/config/constants.js`, for example `DISPLAY_MODES`, `THEMES`, `ELECTIVE_TYPES`, and `STORAGE_KEYS`.
- Keep domain-specific constants next to their logic when they are not shared, as `EXAM_SEGMENTS` and `EMPTY_EXAM_FORM` are in `src/utils/exam/examUtils.js`.
- Pass objects with named fields across module boundaries. Existing service results use explicit `status`, `reason`, `message`, `snapshot`, and `meta` fields.
- Use optional chaining and nullish coalescing when a field is genuinely optional; do not use them to conceal a required-field failure.

## Runtime Validation

Validate external, persisted, and form data before domain logic consumes it.

```js
// src/services/schedule/remoteSchedule.js
if (!payload || typeof payload !== "object") {
  throw new Error("invalid-payload");
}
if (!Array.isArray(payload.schedule)) {
  throw new Error("invalid-schedule");
}
```

```js
// src/utils/schedule/scheduleUtils.js
const list = Array.isArray(weeks) ? weeks : [];
const num = Number(value);
if (!Number.isFinite(num)) continue;
```

```js
// src/utils/exam/examUtils.js
if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
  errors.push(/* user-facing validation message */);
}
```

- Normalize schedule records through `normalizeSchedule` and `normalizeCourse`.
- Normalize elective/group values through their existing utilities and constants.
- Parse stored exam JSON through `parseStoredExams`; malformed non-empty data throws an explicit error.
- Check `Date#getTime()`, `Number.isFinite`, or `Number.isInteger` before using parsed values.

## Function Contracts

- Pure utilities accept imperfect collection input only when they explicitly normalize it, such as `sortExamsByStart` and `normalizeSchedule`.
- Required invariants fail clearly. `upsertExam` throws when the record has no `id`.
- UI form builders return explicit result objects when validation errors are expected: `buildExamFromForm` returns `{ ok, errors }` or `{ ok, exam }`.
- Network services return documented status objects for expected transport outcomes and log/throw only unexpected failures at the owning boundary.

## Forbidden Patterns

- Do not assume `JSON.parse` output has the expected shape.
- Do not duplicate normalization with component-local casts or string cleanup.
- Do not convert invalid data to a plausible default when that would hide corruption.
- Do not add a second set of string literals for modes, storage keys, group types, or electives.
- Do not mutate inputs unless the function is an established in-place schedule operation and its caller passes a clone.
