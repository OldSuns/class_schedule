import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";

test("semester date migrates only previous built-in defaults", async () => {
  const server = await createServer({
    logLevel: "error",
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom"
  });

  try {
    const { getSemesterStartDateMigration } = await server.ssrLoadModule(
      "/src/hooks/semester/useSemesterDate.js"
    );

    assert.deepEqual(getSemesterStartDateMigration("2026-03-02"), {
      date: "2026-09-14",
      shouldPersist: true
    });
    assert.deepEqual(getSemesterStartDateMigration("2026-09-07"), {
      date: "2026-09-14",
      shouldPersist: true
    });
    assert.deepEqual(getSemesterStartDateMigration(null), {
      date: "2026-09-14",
      shouldPersist: true
    });
    assert.deepEqual(getSemesterStartDateMigration("2026-09-14"), {
      date: "2026-09-14",
      shouldPersist: false
    });
    assert.deepEqual(getSemesterStartDateMigration("2026-09-01"), {
      date: "2026-09-01",
      shouldPersist: false
    });
  } finally {
    await server.close();
  }
});
