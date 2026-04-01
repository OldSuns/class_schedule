# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Start the web dev server: `npm run dev`
- Build the web app: `npm run build`
  - This runs `npm run export-schedule` first and regenerates the root `schedule.json`.
- Preview the production build: `npm run preview`
- Export the remote schedule payload after editing `src/data/scheduleData.js`: `npm run export-schedule`
- Sync the app version from `package.json` into web + Android files: `npm run sync-version`
- Sync web assets into the Capacitor Android shell: `npx cap sync android`
- Build the Android debug APK: `cd android && ./gradlew assembleDebug`
- Run Android unit tests (only default scaffold tests are present): `cd android && ./gradlew testDebugUnitTest`
- Run one Android unit test: `cd android && ./gradlew testDebugUnitTest --tests "com.getcapacitor.myapp.ExampleUnitTest"`
- Run Android instrumentation tests on a device/emulator (only default scaffold tests are present): `cd android && ./gradlew connectedDebugAndroidTest`
- Run one Android instrumentation test: `cd android && ./gradlew connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.getcapacitor.myapp.ExampleInstrumentedTest`
- Lint: no ESLint script/config is currently checked in.
- Web app tests: no JS test runner is currently checked in.

## High-level architecture

- This repository is a React 19 + Vite 6 app with Tailwind CSS, `framer-motion`, `lucide-react`, and Capacitor 8 for Android. Despite the parent folder name, it is not a Vue project.
- `src/main.jsx` mounts `src/app/App.jsx`. There is no router; the app is a single-screen schedule UI driven by component state, hooks, dialogs, and week navigation.
- `src/app/App.jsx` is the orchestration layer. It wires together the header, settings drawer, course table, course modal, toasts, update checks, remote schedule checks, swipe navigation, and status-bar handling.
- There is no global state library. Most state lives in focused hooks under `src/hooks/`:
  - `semester/` for semester start date and derived current-week info
  - `ui/` for week selection, display mode, modal state, mobile detection, and swipe gestures
  - `notifications/` for Android reminder preferences and scheduling
  - `schedule/` for loading/persisting built-in, remote, and manually edited schedules
- `src/data/scheduleData.js` is the canonical built-in schedule source. Treat it as the source of truth for course content.
- `src/utils/schedule/` contains the pure schedule logic: cell merging, elective/group filtering, logical add/update/delete operations, normalization, and time calculations.
- Manual edits from the course modal flow back through `src/app/App.jsx` into `applyLogicalCourseUpdate` / `applyLogicalCourseDeletion` in `src/utils/schedule/scheduleUtils.js`, then persist through `useScheduleData`.
- Cross-platform persistence is centralized in `storage.js`: web uses `localStorage`, native uses Capacitor Preferences.

## Schedule update flow

- The app supports three schedule sources in `src/hooks/schedule/useScheduleData.js`: built-in, remote, and manual.
- Remote soft updates fetch the generated root `schedule.json` through `src/services/schedule/remoteSchedule.js`, using cached ETag / Last-Modified metadata when possible.
- `scripts/export-schedule.mjs` converts `src/data/scheduleData.js` into the root `schedule.json`. If you change built-in schedule data, commit both files.
- `src/config/constants.js` contains `DEFAULT_SCHEDULE_VERSION`, the remote schedule URLs, storage keys, and the default semester start date.
- Update checking for app releases is handled separately by `src/services/app/updateChecker.js`. The constants are still named `GITHUB_*`, but they actually point to Gitee release APIs.

## Android-specific architecture

- The Android shell lives under `android/`.
- `android/app/src/main/java/com/oldsun/classschedule/MainActivity.java` registers the custom widget bridge plugin and injects the status-bar inset into CSS.
- `android/app/src/main/java/com/oldsun/classschedule/WidgetBridgePlugin.java` exposes widget refresh to the web layer; the JS side calls it via `src/services/platform/widgetBridge.js`.
- Notification scheduling logic lives in `src/services/notifications/notificationScheduler.js` and `src/hooks/notifications/useNotifications.js`.
- `android/app/src/main/java/com/oldsun/classschedule/NotificationRestoreReceiver.java` restores scheduled local notifications from the stored snapshot after reboot / process loss on Android 12+.

## Project-specific gotchas

- `npm run build` is not a plain Vite build; it also regenerates `schedule.json` first.
- `npm run sync-version` updates `src/config/constants.js` (`APP_VERSION`) and `android/app/build.gradle` (`versionName` and date-based `versionCode`) from `package.json`.
- The checked-in Android tests are still the default Capacitor scaffold examples and use the old `com.getcapacitor.myapp` package name.
- `README.md` and `DEVELOPERS.md` still mention some old flat `src/*.js` paths; the current code is organized under `src/app`, `src/components`, `src/hooks`, `src/services`, `src/utils`, `src/data`, and `src/config`.
- If remote `schedule.json` changes do not appear immediately through jsDelivr, `DEVELOPERS.md` contains the purge workflow used by this project.
