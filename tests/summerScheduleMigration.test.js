import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  STORAGE_KEYS,
  SUMMER_SCHEDULE_MIGRATION_VERSION,
  SUMMER_STORAGE_KEYS
} from "../src/config/constants.js";
import {
  CURRENT_SEMESTER_RESET_KEYS,
  SUMMER_SEMESTER_RESET_KEYS,
  migrateSummerScheduleStorage
} from "../src/services/app/summerScheduleMigration.js";

const createMemoryStorage = (initialValues = {}, failedRemoval = "") => {
  const values = new Map(Object.entries(initialValues));
  return {
    values,
    getItem: async (key) => values.get(key) ?? null,
    setItem: async (key, value) => {
      values.set(key, value);
      return true;
    },
    removeItem: async (key) => {
      if (key === failedRemoval) return false;
      values.delete(key);
      return true;
    }
  };
};

test("summer migration replaces all semester data with the current built-in defaults", async () => {
  const initialValues = Object.fromEntries(
    [...CURRENT_SEMESTER_RESET_KEYS, ...SUMMER_SEMESTER_RESET_KEYS].map(
      (key) => [key, `old:${key}`]
    )
  );
  Object.assign(initialValues, {
    [SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION]: "2",
    [SUMMER_STORAGE_KEYS.THEME]: "minimal",
    [STORAGE_KEYS.THEME]: "m3",
    [STORAGE_KEYS.NOTIFICATIONS_ENABLED]: "false",
    [STORAGE_KEYS.NOTIFICATION_LEAD_MINUTES]: "20",
    [STORAGE_KEYS.UPDATE_LAST_CHECK_DATE]: "2026-07-26"
  });
  const memory = createMemoryStorage(initialValues);

  assert.deepEqual(await migrateSummerScheduleStorage(memory), {
    status: "migrated",
    theme: "minimal"
  });

  for (const key of [
    ...CURRENT_SEMESTER_RESET_KEYS,
    ...SUMMER_SEMESTER_RESET_KEYS,
    SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION,
    SUMMER_STORAGE_KEYS.THEME
  ]) {
    assert.equal(memory.values.has(key), false, key);
  }
  assert.equal(memory.values.get(STORAGE_KEYS.THEME), "minimal");
  assert.equal(memory.values.get(STORAGE_KEYS.NOTIFICATIONS_ENABLED), "false");
  assert.equal(memory.values.get(STORAGE_KEYS.NOTIFICATION_LEAD_MINUTES), "20");
  assert.equal(memory.values.get(STORAGE_KEYS.UPDATE_LAST_CHECK_DATE), "2026-07-26");
  assert.equal(
    memory.values.get(STORAGE_KEYS.SUMMER_SCHEDULE_MIGRATION_VERSION),
    SUMMER_SCHEDULE_MIGRATION_VERSION
  );
});

test("summer migration is scoped, idempotent and rejects an invalid summer theme", async () => {
  const untouched = createMemoryStorage({ [STORAGE_KEYS.CUSTOM_SCHEDULE]: "keep" });
  assert.deepEqual(await migrateSummerScheduleStorage(untouched), {
    status: "not-needed"
  });
  assert.equal(untouched.values.get(STORAGE_KEYS.CUSTOM_SCHEDULE), "keep");

  const memory = createMemoryStorage({
    [SUMMER_STORAGE_KEYS.SCHEDULE_SOURCE]: "builtin",
    [SUMMER_STORAGE_KEYS.THEME]: "invalid",
    [STORAGE_KEYS.THEME]: "m3"
  });
  assert.deepEqual(await migrateSummerScheduleStorage(memory), {
    status: "migrated",
    theme: null
  });
  assert.equal(memory.values.has(STORAGE_KEYS.THEME), false);

  memory.values.set(STORAGE_KEYS.CUSTOM_SCHEDULE, "new-manual-schedule");
  assert.deepEqual(await migrateSummerScheduleStorage(memory), {
    status: "already-migrated"
  });
  assert.equal(
    memory.values.get(STORAGE_KEYS.CUSTOM_SCHEDULE),
    "new-manual-schedule"
  );
});

test("summer migration fails closed before writing its completion marker", async () => {
  const memory = createMemoryStorage(
    {
      [SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION]: "2",
      [STORAGE_KEYS.CUSTOM_SCHEDULE]: "legacy-manual-schedule"
    },
    STORAGE_KEYS.CUSTOM_SCHEDULE
  );

  await assert.rejects(
    migrateSummerScheduleStorage(memory),
    /summer-schedule-migration-storage-failed/
  );
  assert.equal(
    memory.values.has(STORAGE_KEYS.SUMMER_SCHEDULE_MIGRATION_VERSION),
    false
  );
  assert.equal(
    memory.values.get(SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION),
    "2"
  );
});

test("Android and JavaScript migration keys stay aligned", () => {
  const source = readFileSync(
    new URL(
      "../android/app/src/main/java/com/oldsun/classschedule/SummerScheduleMigration.java",
      import.meta.url
    ),
    "utf8"
  );
  const sharedKeys = [
    ...CURRENT_SEMESTER_RESET_KEYS,
    ...SUMMER_SEMESTER_RESET_KEYS,
    SUMMER_STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION,
    SUMMER_STORAGE_KEYS.THEME,
    STORAGE_KEYS.THEME,
    STORAGE_KEYS.SUMMER_SCHEDULE_MIGRATION_VERSION
  ];

  for (const key of sharedKeys) {
    assert.match(source, new RegExp(`"${key}"`), key);
  }
});
