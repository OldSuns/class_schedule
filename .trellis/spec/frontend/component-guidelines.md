# Component Guidelines

## Schedule composition

- Keep the existing `App -> Header / CourseTable / SettingsPage / CourseModal` composition. Do not create a parallel schedule page hierarchy.
- `Header` owns only the product title, current-day status, and the single 1–7 group selector. Current-course progress belongs in the main schedule content.
- `CourseTable` is the real-time daily view despite its historical filename. It renders week navigation, weekday navigation, current events, and one unified `time / course / location` list.
- Morning rotations and shared afternoon events must use the same row component. Do not branch the layout by course type or invent section labels such as “special lecture”.
- `CourseModal` receives one normalized event. Editing uses native time inputs and must preserve the event root contract.

## Styling and accessibility

- Use the existing theme variables and Tailwind mappings. Minimal Blue is the default; M3 remains selectable.
- Keep primary vertical gaps in the 12–16px range. Current-course cards may use slightly larger vertical padding than ordinary rows.
- Interactive rows, week/day controls, group selection, modal controls, and edit/delete actions require semantic buttons or native controls and accessible labels.
