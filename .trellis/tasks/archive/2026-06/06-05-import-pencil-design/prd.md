# Import Pencil Mobile Design

## Goal

Import the completed Pencil mobile design from `designs/course_schedule.pen` into the React application.

## Requirements

- Implement a mobile-first application shell with three tabs: schedule, exams, and settings.
- Add the bottom navigation shown in the Pencil design, using existing `lucide-react` icons.
- Keep the existing schedule behavior: week switching, current class progress, swipe navigation, course merging, course add/edit/delete, notifications, widget snapshot updates, remote schedule update prompts, and toasts.
- Add a complete exams tab backed only by user-maintained local exam records.
- Exams must support adding, editing, and deleting records on device.
- Rework the settings UI from a side drawer into the settings tab page while preserving all current settings behavior.
- Align the M3 theme tokens, schedule table, settings cards, exam page, and course modal with the Pencil visual system.
- Preserve the existing minimal theme as an alternate theme option.

## Non-goals

- Do not add remote exam sync.
- Do not ship built-in exam records or sample exam data.
- Do not change the schedule JSON contract or notification/widget data contracts.
- Do not add third-party UI or test dependencies.

## Acceptance Criteria

- Users can switch between schedule, exams, and settings with the bottom navigation.
- Schedule tab continues to support week input, previous/next week, mobile swipe, course cell opening, and course editing.
- Exams tab starts empty until the user adds records.
- Exams tab shows a next-exam hero, metrics, segment filter, and timeline cards using locally saved user records.
- Users can add, edit, and delete exams without any cloud dependency.
- Settings tab exposes the existing settings sections and remote update confirmation behavior.
- Course modal visually matches the bottom-sheet design and remains fully functional.
- Unit tests cover exam derived-state and local CRUD behavior.
- `npm run test:unit` and `npm run build` pass.
