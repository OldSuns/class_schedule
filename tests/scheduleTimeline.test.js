import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const events = [
  {
    id: "rotation-w2-tue-am-g1",
    name: "神经内科见习",
    day: "Tuesday",
    weeks: [2],
    startTime: "08:00",
    endTime: "12:00",
    group: "1组",
    location: "708A病区",
    teacher: "",
    note: ""
  },
  {
    id: "lecture-w2-tue-2",
    name: "肺炎的诊断及治疗",
    day: "Tuesday",
    weeks: [2],
    startTime: "13:45",
    endTime: "14:25",
    group: null,
    location: "11号楼1楼教室",
    teacher: "魏湘",
    note: ""
  }
];

test("summer schedule renders current course above one unified daily list", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { default: CourseTable } = await server.ssrLoadModule(
      "/src/components/schedule/CourseTable.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(CourseTable, {
        events,
        semesterStartDate: "2026-07-13",
        currentWeek: 2,
        selectedDay: "Tuesday",
        userGroup: "1组",
        now: new Date("2026-07-21T14:15:00+08:00"),
        onSelectDay: () => {},
        onSelectWeek: () => {},
        onEventClick: () => {}
      })
    );

    assert.match(markup, /当前课程/);
    assert.match(markup, /当天全部课程/);
    assert.match(markup, /肺炎的诊断及治疗/);
    assert.match(markup, /13:45–14:25/);
    assert.match(markup, /11号楼1楼教室/);
    assert.match(markup, /aria-current="true"/);
    assert.match(markup, /aria-label="快速选择周数"/);
    assert.match(markup, /aria-haspopup="listbox"/);
    assert.equal((markup.match(/data-week-option=/g) ?? []).length, 8);
    assert.doesNotMatch(markup, />节次</);
    assert.doesNotMatch(markup, /专题讲座/);
  } finally {
    await server.close();
  }
});

test("summer app wires the proven move-phase swipe handlers to the schedule", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  const previousLocalStorage = globalThis.localStorage;
  try {
    globalThis.localStorage = {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };
    const { default: App } = await server.ssrLoadModule("/src/app/App.jsx");
    const markup = renderToStaticMarkup(React.createElement(App));
    assert.match(
      markup,
      /<section[^>]*data-swipe-surface="schedule-page"[^>]*data-swipe-enabled="true"/
    );
    assert.match(markup, /data-day-transition="schedule"/);
  } finally {
    if (previousLocalStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousLocalStorage;
    await server.close();
  }
});
