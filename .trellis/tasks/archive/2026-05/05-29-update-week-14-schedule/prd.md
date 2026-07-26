# Update Week 14 Schedule

## Goal

Update only week 14 non-elective course content to match the user's supplied schedule.

## Requirements

- Modify only week 14 course details in the built-in schedule.
- Do not change elective courses, including the existing week 14 clinical skills course.
- Keep the existing schedule data shape: course names remain canonical short names, and week-specific topics/teachers/locations live in `note.weeks[14]` and `location.weeks[14]` where applicable.
- Regenerate root `schedule.json` from `src/data/scheduleData.js`.

## Validation

- A targeted week 14 assertion must pass.
- `npm run build` must pass.
- Diff review must confirm no unrelated schedule weeks or elective courses were changed.
