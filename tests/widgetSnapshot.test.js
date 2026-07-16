import test from "node:test";
import assert from "node:assert/strict";
import * as eventUtils from "../src/utils/schedule/eventUtils.js";

test("widget snapshot serializes validated events with exact minutes", async () => {
    assert.equal(typeof eventUtils.buildWidgetScheduleSnapshot, "function");
    const snapshot = eventUtils.buildWidgetScheduleSnapshot({
      version: 1,
      semesterStartDate: "2026-07-13",
      updatedAt: "2026-07-16T00:00:00+08:00",
      events: [
        {
          id: "event-1",
          name: "神经内科见习",
          day: "Tuesday",
          weeks: [2],
          startTime: "08:00",
          endTime: "12:00",
          group: "1组",
          location: "708A病区",
          note: ""
        }
      ]
    });

    assert.deepEqual(snapshot, {
      version: 4,
      semesterStartDate: "2026-07-13",
      events: [
        {
          id: "event-1",
          name: "神经内科见习",
          day: "Tuesday",
          weeks: [2],
          startMin: 480,
          endMin: 720,
          group: "1组",
          location: "708A病区",
          note: ""
        }
      ]
    });
    assert.equal("periodRanges" in snapshot, false);
    assert.equal("schedule" in snapshot, false);
});
