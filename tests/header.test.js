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
        isViewingToday: true,
        currentWeek: 2,
        userGroup: "1组",
        onGroupChange: () => {}
      })
    );

    assert.match(markup, /WL课表（2026暑期）/);
    assert.match(markup, /今天是第2周 星期二/);
    assert.match(markup, />1组</);
    assert.match(markup, /aria-label="选择分组"/);
    assert.match(markup, /aria-haspopup="listbox"/);
    assert.match(markup, /data-slot="group-trigger"/);
    assert.match(markup, /rounded-full/);
    assert.match(markup, /background-color:var\(--primary\)/);
    assert.equal((markup.match(/role="option"/g) ?? []).length, 7);
    assert.doesNotMatch(markup, /<select/);
    assert.doesNotMatch(markup, /已过|剩余|type="number"/);

    const returnTodayMarkup = renderToStaticMarkup(
      React.createElement(Header, {
        todayInfo: { week: 2, day: "Tuesday", dayOfWeek: 2 },
        isViewingToday: false,
        userGroup: "1组",
        onReturnToday: () => {}
      })
    );
    assert.match(returnTodayMarkup, /aria-label="返回今天"/);
    assert.match(returnTodayMarkup, />今天</);
    assert.doesNotMatch(returnTodayMarkup, /aria-haspopup="listbox"/);
  } finally {
    await server.close();
  }
});
