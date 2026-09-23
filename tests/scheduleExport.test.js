import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";

test("export script writes current and legacy-compatible schedule roots", () => {
  const result = spawnSync(process.execPath, ["scripts/export-schedule.mjs"], {
    cwd: process.cwd(),
    encoding: "utf8"
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const current = JSON.parse(fs.readFileSync("schedule-v2.json", "utf8"));
  assert.equal(current.version, 2);
  assert.equal(current.semesterStartDate, "2026-07-13");
  assert.match(current.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(current.events.length, 443);
  assert.equal("schedule" in current, false);
  assert.ok(current.events.every((event) => "teacher" in event && "note" in event));

  const legacy = JSON.parse(fs.readFileSync("schedule.json", "utf8"));
  assert.equal(legacy.version, 1);
  assert.equal(legacy.semesterStartDate, current.semesterStartDate);
  assert.equal(legacy.updatedAt, current.updatedAt);
  assert.equal(legacy.events.length, current.events.length);
  assert.ok(legacy.events.every((event) => !("teacher" in event)));
  const currentLecture = current.events.find((event) => event.name === "肺炎的诊断及治疗");
  const legacyLecture = legacy.events.find((event) => event.id === currentLecture.id);
  assert.equal(legacyLecture.note, currentLecture.teacher);

  const legacyWeek4Group5 = legacy.events.filter(
    (event) => event.weeks.includes(4) && event.group === "5组"
  );
  assert.ok(legacyWeek4Group5.every((event) => event.name === "儿科见习"));
  assert.ok(legacyWeek4Group5.every((event) => event.location === "506病区"));

  const correctedEndTimes = new Map([
    ["儿科常用治疗方法及药物计算", "16:45"],
    ["儿科医患沟通", "16:45"],
    ["影像报告判读", "15:10"],
    ["化验结果判读", "16:45"]
  ]);
  for (const [name, endTime] of correctedEndTimes) {
    assert.equal(legacy.events.find((event) => event.name === name)?.endTime, endTime);
  }
});
