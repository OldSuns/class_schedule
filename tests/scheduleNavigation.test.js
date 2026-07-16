import test from "node:test";
import assert from "node:assert/strict";

import {
  getAdjacentWorkday,
  getScheduleSelectionDirection,
  getWeekStartSelection,
  getSwipeDayDirection
} from "../src/utils/schedule/timeUtils.js";

test("adjacent workday navigation crosses weeks and stops at summer boundaries", () => {
  assert.deepEqual(
    getAdjacentWorkday({ week: 3, day: "Wednesday" }, "previous"),
    { week: 3, day: "Tuesday" }
  );
  assert.deepEqual(
    getAdjacentWorkday({ week: 3, day: "Monday" }, "previous"),
    { week: 2, day: "Friday" }
  );
  assert.deepEqual(
    getAdjacentWorkday({ week: 3, day: "Friday" }, "next"),
    { week: 4, day: "Monday" }
  );
  assert.deepEqual(
    getAdjacentWorkday({ week: 1, day: "Monday" }, "previous"),
    { week: 1, day: "Monday" }
  );
  assert.deepEqual(
    getAdjacentWorkday({ week: 8, day: "Friday" }, "next"),
    { week: 8, day: "Friday" }
  );
});

test("week selection always opens the selected week on Monday", () => {
  assert.deepEqual(getWeekStartSelection(4), { week: 4, day: "Monday" });
  assert.equal(getWeekStartSelection(0), null);
  assert.equal(getWeekStartSelection(9), null);
});

test("schedule selection direction remains correct across week boundaries", () => {
  assert.equal(
    getScheduleSelectionDirection(
      { week: 2, day: "Friday" },
      { week: 3, day: "Monday" }
    ),
    1
  );
  assert.equal(
    getScheduleSelectionDirection(
      { week: 3, day: "Monday" },
      { week: 2, day: "Friday" }
    ),
    -1
  );
  assert.equal(
    getScheduleSelectionDirection(
      { week: 3, day: "Wednesday" },
      { week: 3, day: "Wednesday" }
    ),
    0
  );
});

test("horizontal swipe resolves to a day direction without hijacking vertical scroll", () => {
  assert.equal(
    getSwipeDayDirection({ offsetX: 72, offsetY: 12, velocityX: 120 }),
    "previous"
  );
  assert.equal(
    getSwipeDayDirection({ offsetX: -20, offsetY: 4, velocityX: -620 }),
    "next"
  );
  assert.equal(
    getSwipeDayDirection({ offsetX: 48, offsetY: 64, velocityX: 700 }),
    null
  );
  assert.equal(
    getSwipeDayDirection({ offsetX: 24, offsetY: 3, velocityX: 180 }),
    null
  );
});
