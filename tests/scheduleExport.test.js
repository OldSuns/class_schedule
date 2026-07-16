import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

test("export script writes the authoritative event root", () => {
  const result = spawnSync(process.execPath, ["scripts/export-schedule.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const payload = JSON.parse(fs.readFileSync("schedule.json", "utf8"));
  assert.equal(payload.version, 1);
  assert.equal(payload.semesterStartDate, "2026-07-13");
  assert.match(payload.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(payload.events.length, 443);
  assert.equal("schedule" in payload, false);
});
