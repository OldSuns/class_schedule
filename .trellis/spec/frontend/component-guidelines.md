# Component Guidelines

> How React components are built in this project.

## Component Structure

Components are function components, usually declared as `const` values with destructured props and exported as the default value. Small event handlers stay near the render code; persistent state, platform effects, and reusable domain logic belong in hooks, services, or utilities.

```jsx
// src/components/shared/WeekMultiSelect.jsx
const WeekMultiSelect = ({
  weeks = [],
  onChange,
  minWeek = 1,
  maxWeek = 16,
  allowedWeeks
}) => {
  // derive render state, handle the local interaction, return JSX
};

export default WeekMultiSelect;
```

`src/app/App.jsx` is the composition boundary. It wires `Header`, `CourseTable`, `CourseModal`, `ExamPage`, and `SettingsPage` together; leaf components should not recreate that orchestration.

## Props Conventions

- Destructure props in the function parameter.
- Callback props use `on...` names such as `onWeekChange`, `onThemeChange`, and `onSelectedElectivesChange`.
- Use defaults only when the component has a real local default, as `weeks = []` does in `WeekMultiSelect`.
- Optional callbacks are invoked with optional chaining, for example `onChange?.(sorted)` and `onGroupChange?.(group)`.
- Keep props as the component contract. Do not read cross-feature state from a new singleton or global object.

## State and Composition

- Keep transient, component-only UI state in the component. `src/components/settings/SettingsPage.jsx` owns expanded-section state; `src/components/exams/ExamPage.jsx` owns its form and action-row state.
- Lift state when siblings share it. `src/app/App.jsx` owns the selected tab, selected course cell, and modal visibility because several components participate in those flows.
- Put reusable stateful behavior in a hook. `src/hooks/ui/useWeekSwipe.js` handles gestures and `src/hooks/ui/useDisplayMode.js` handles a persisted preference.
- Put schedule mutations in `src/utils/schedule/scheduleUtils.js`; the modal describes the edit and `App.jsx` applies it to a cloned schedule.

## Styling Patterns

The UI uses Tailwind utility classes for layout and typography, CSS custom properties from `src/styles/theme.css` for theme colors, and occasional inline styles where a CSS variable or calculated value is dynamic.

```jsx
// Pattern used by src/components/layout/Header.jsx
<div
  className="h-full rounded-pill transition-[width] duration-500"
  style={{ width: `${percent}%`, backgroundColor: "var(--primary)" }}
/>
```

- Reuse existing theme variables such as `--surface-primary`, `--foreground-primary`, and `--primary` instead of adding hard-coded theme colors.
- Use `lucide-react` for standard icons and `framer-motion` for existing animated interactions.
- Match the surrounding component's Tailwind and inline-style balance; there is no CSS Modules or CSS-in-JS layer.
- Global behavior belongs in `src/index.css`; theme tokens belong in `src/styles/theme.css`.

## Accessibility

- Use native interactive elements. Existing controls use `button`, `input`, `select`, and `label` rather than clickable `div` elements.
- Add `type="button"` when a button is not a form submission control.
- Expose toggle state with `aria-pressed`, as in `WeekMultiSelect.jsx` and `ReminderSection.jsx`.
- Preserve disabled state with the native `disabled` attribute.
- Provide an accessible name for icon-only actions and keep the global `:focus-visible` treatment in `src/index.css` effective.
- Respect reduced motion for cross-screen animation; `src/app/App.jsx` uses `useReducedMotion()` for week transitions.

## Common Mistakes

- Do not put storage, remote fetch, or Capacitor notification calls directly into a presentational component; use the existing hook or service boundary.
- Do not mutate arrays received through props. `WeekMultiSelect.jsx` creates a new `Set` and passes a new sorted array to `onChange`.
- Do not duplicate schedule filtering in a component; reuse helpers such as `shouldIncludeCourseForAudience` and `mergeCellsByDay`.
- Do not introduce a second styling system. Extend the existing Tailwind and theme-token approach.
