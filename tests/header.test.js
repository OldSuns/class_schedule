import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("summer header keeps the app title and the single group selector", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false },
    appType: "custom"
  });

  try {
    const { default: Header } = await server.ssrLoadModule(
      "/src/components/layout/Header.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(Header, {
        todayInfo: { week: 2, dayOfWeek: 2 },
        currentWeek: 2,
        userGroup: "1组",
        onGroupChange: () => {}
      })
    );

    assert.match(markup, /WL课表（2026暑期）/);
    assert.match(markup, /今天是第2周 星期二/);
    assert.match(markup, />1组</);
    assert.match(markup, /aria-label="选择分组"/);
    assert.doesNotMatch(markup, /已过|剩余|type="number"/);
  } finally {
    await server.close();
  }
});
