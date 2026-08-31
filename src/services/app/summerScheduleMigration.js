import * as storage from "../../../storage.js";
import {
  STORAGE_KEYS,
  SUMMER_SCHEDULE_MIGRATION_VERSION,
  SUMMER_STORAGE_KEYS,
  THEMES
} from "../../config/constants.js";

export const CURRENT_SEMESTER_RESET_KEYS = [
  STORAGE_KEYS.SEMESTER_START_DATE,
  STORAGE_KEYS.NOTIFICATIONS_LAST_SCHEDULED_AT,
  STORAGE_KEYS.NOTIFICATIONS_LAST_RECONCILED_AT,
  STORAGE_KEYS.NOTIFICATION_PLAN_SNAPSHOT,
  STORAGE_KEYS.USER_GROUP,
  STORAGE_KEYS.SELECTED_ELECTIVES,
  STORAGE_KEYS.DISPLAY_MODE,
  STORAGE_KEYS.WIDGET_SCHEDULE_SNAPSHOT,
  STORAGE_KEYS.CUSTOM_SCHEDULE,
  STORAGE_KEYS.SCHEDULE_SOURCE,
  STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT,
  STORAGE_KEYS.REMOTE_SCHEDULE_META,
  STORAGE_KEYS.REMOTE_SKIPPED_UPDATE,
  STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION,
  STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE,
  STORAGE_KEYS.REMOTE_LAST_CHECK_AT,
  STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT,
  STORAGE_KEYS.REMOTE_LAST_ERROR_AT,
  STORAGE_KEYS.USER_EXAMS
];

export const SUMMER_SEMESTER_RESET_KEYS = Object.values(
  SUMMER_STORAGE_KEYS
).filter(
  (key) =>
    key !== SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION &&
    key !== SUMMER_STORAGE_KEYS.THEME
);

const isValidTheme = (theme) =>
  theme === THEMES.M3 || theme === THEMES.MINIMAL;

const assertStorageResults = (results) => {
  if (results.some((result) => result === false)) {
    throw new Error("summer-schedule-migration-storage-failed");
  }
};

export const migrateSummerScheduleStorage = async ({
  getItem = storage.getItem,
  setItem = storage.setItem,
  removeItem = storage.removeItem
} = {}) => {
  const [sourceVersion, source, completedVersion, summerTheme] =
    await Promise.all([
      getItem(SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION),
      getItem(SUMMER_STORAGE_KEYS.SCHEDULE_SOURCE),
      getItem(STORAGE_KEYS.SUMMER_SCHEDULE_MIGRATION_VERSION),
      getItem(SUMMER_STORAGE_KEYS.THEME)
    ]);

  if (completedVersion === SUMMER_SCHEDULE_MIGRATION_VERSION) {
    return { status: "already-migrated" };
  }
  if (sourceVersion == null && source == null) {
    return { status: "not-needed" };
  }

  const resetResults = await Promise.all(
    [...CURRENT_SEMESTER_RESET_KEYS, ...SUMMER_SEMESTER_RESET_KEYS].map(
      (key) => removeItem(key)
    )
  );
  assertStorageResults(resetResults);

  const themeResult = isValidTheme(summerTheme)
    ? await setItem(STORAGE_KEYS.THEME, summerTheme)
    : await removeItem(STORAGE_KEYS.THEME);
  assertStorageResults([themeResult]);

  const completedResult = await setItem(
    STORAGE_KEYS.SUMMER_SCHEDULE_MIGRATION_VERSION,
    SUMMER_SCHEDULE_MIGRATION_VERSION
  );
  assertStorageResults([completedResult]);

  await Promise.all([
    removeItem(SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION),
    removeItem(SUMMER_STORAGE_KEYS.THEME)
  ]);

  return {
    status: "migrated",
    theme: isValidTheme(summerTheme) ? summerTheme : null
  };
};
