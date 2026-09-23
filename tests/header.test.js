import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("schedule header week input keeps a visible outline border", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true },
    appType: "custom"
  });

  try {
    const { default: Header } = await server.ssrLoadModule(
      "/src/components/layout/Header.jsx"
    );
    const markup = renderToStaticMarkup(
      React.createElement(Header, {
        todayInfo: null,
        displayWeekInfo: null,
        currentWeek: 6,
        currentClassProgress: null,
        onWeekChange: () => {}
      })
    );

    const weekInput = markup.match(/<input\b[^>]*type="number"[^>]*>/)?.[0] ?? "";

    assert.match(weekInput, /\bborder\b/);
    assert.doesNotMatch(weekInput, /\bborder-0\b/);
    assert.match(weekInput, /border-color:var\(--outline-variant\)/);
  } finally {
    await server.close();
  }
});
