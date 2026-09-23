import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

test("notification plan groups same-start events and uses exact event times", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { buildNotificationPlan } = await server.ssrLoadModule(
      "/src/services/notifications/notificationScheduler.js"
    );
    const base = {
      day: "Tuesday",
      weeks: [2],
      group: null,
      location: "11号楼1楼教室",
      teacher: "",
      note: ""
    };
    const scheduleData = {
      version: 2,
      semesterStartDate: "2026-07-13",
      updatedAt: "2026-07-16T00:00:00+08:00",
      events: [
        { ...base, id: "a", name: "课程甲", startTime: "13:45", endTime: "14:25" },
        { ...base, id: "b", name: "课程乙", startTime: "13:45", endTime: "15:00" },
        { ...base, id: "c", name: "课程丙", startTime: "14:30", endTime: "15:10" }
      ]
    };

    let plan;
    assert.doesNotThrow(() => {
      plan = buildNotificationPlan({
        semesterStartDate: "2026-07-13",
        userGroup: "1组",
        scheduleData,
        leadMinutes: 15,
        fromDate: new Date("2026-07-21T12:00:00+08:00"),
        windowDays: 1
      });
    });

    assert.equal(plan.notifications.length, 2);
    assert.match(plan.notifications[0].body, /13:45–14:25 · 课程甲/);
    assert.match(plan.notifications[0].body, /13:45–15:00 · 课程乙/);
    assert.match(plan.notifications[1].body, /14:30–15:10 · 课程丙/);
    assert.doesNotMatch(plan.notifications[0].body, /第\d+节|节次/);
    for (const notification of plan.notifications) {
      assert.ok(Number.isInteger(notification.id));
      assert.ok(notification.id > 0 && notification.id <= 2_147_483_647);
    }
  } finally {
    await server.close();
  }
});
