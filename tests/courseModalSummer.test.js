import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const event = {
  id: "lecture-w2-tue-2",
  name: "肺炎的诊断及治疗",
  day: "Tuesday",
  weeks: [2],
  startTime: "13:45",
  endTime: "14:25",
  group: null,
  location: "11号楼1楼教室",
  note: "魏湘"
};

test("course detail sheet renders one summer event without period language", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { default: CourseModal } = await server.ssrLoadModule(
      "/src/components/schedule/CourseModal/CourseModal.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(CourseModal, {
        isOpen: true,
        event,
        currentWeek: 2,
        onUpdateEvent: () => {},
        onDeleteEvent: () => {},
        onClose: () => {}
      })
    );

    assert.match(markup, /星期二 · 13:45–14:25/);
    assert.match(markup, /肺炎的诊断及治疗/);
    assert.match(markup, /上课时间/);
    assert.match(markup, /13:45 — 14:25/);
    assert.match(markup, /11号楼1楼教室/);
    assert.match(markup, /授课教师/);
    assert.match(markup, /魏湘/);
    assert.match(markup, /编辑/);
    assert.doesNotMatch(markup, /节次安排|当前周节次/);
  } finally {
    await server.close();
  }
});
