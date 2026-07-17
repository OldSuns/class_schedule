import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  DEFAULT_SEMESTER_START_DATE,
  MAX_WEEK,
  SCHEDULE_REMOTE_URLS,
  STORAGE_KEYS,
  THEMES
} from "../src/config/constants.js";
import * as config from "../src/config/constants.js";

test("summer build uses the eight-week 2026 practice calendar", () => {
  assert.equal(DEFAULT_SEMESTER_START_DATE, "2026-07-13");
  assert.equal(MAX_WEEK, 8);
});

test("summer schedule remote sources never request the main branch", () => {
  assert.equal(SCHEDULE_REMOTE_URLS.length, 3);
  for (const url of SCHEDULE_REMOTE_URLS) {
    assert.match(url, /@summer-schedule\/schedule-v2\.json$/);
    assert.doesNotMatch(url, /@main\//);
  }
});

test("schedule persistence uses summer-only keys", () => {
  assert.equal(STORAGE_KEYS.CUSTOM_SCHEDULE, "summerScheduleCustom");
  assert.equal(STORAGE_KEYS.SCHEDULE_SOURCE, "summerScheduleSource");
  assert.equal(
    STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT,
    "summerScheduleRemoteSnapshot"
  );
  assert.equal(
    STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE,
    "summerScheduleDefaultSignature"
  );
  assert.equal(
    STORAGE_KEYS.NOTIFICATION_PLAN_SNAPSHOT,
    "summerNotificationPlanSnapshot"
  );
  assert.equal(
    STORAGE_KEYS.WIDGET_SCHEDULE_SNAPSHOT,
    "summerWidgetScheduleSnapshot"
  );
});

test("schedule reset clears every summer schedule storage key", () => {
  assert.deepEqual(config.SCHEDULE_RESET_KEYS, [
    "summerScheduleCustom",
    "summerScheduleSource",
    "summerScheduleDefaultVersion",
    "summerScheduleDefaultSignature",
    "summerScheduleRemoteSnapshot",
    "summerScheduleRemoteMeta",
    "summerScheduleRemoteSkippedUpdate",
    "summerScheduleRemoteLastCheckAt",
    "summerScheduleRemoteLastForegroundCheckAt",
    "summerScheduleRemoteLastErrorAt"
  ]);
});

test("minimal blue remains a supported theme and is the summer default", () => {
  assert.equal(THEMES.MINIMAL, "minimal");
  assert.equal(THEMES.DEFAULT, THEMES.MINIMAL);
  assert.equal(STORAGE_KEYS.THEME, "summerTheme");
});

test("minimal theme uses one calmer blue across all primary accents", () => {
  const themeCss = readFileSync(
    new URL("../src/styles/theme.css", import.meta.url),
    "utf8"
  );
  assert.match(themeCss, /--primary:\s*#3976D2;/);
  assert.doesNotMatch(themeCss, /#0066FF/i);
});
