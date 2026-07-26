import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { scheduleData } from "../src/data/scheduleData.js";

const scheduleSource = readFileSync(
  new URL("../src/data/scheduleData.js", import.meta.url),
  "utf8"
);

const courseKey = (course) =>
  JSON.stringify([
    course.name,
    course.weeks,
    course.group,
    course.note,
    course.location
  ]);

const getBlockStarts = () =>
  scheduleData.flatMap((day) =>
    day.periods.flatMap((period, index) => {
      const previousKeys = new Set(
        index > 0 ? day.periods[index - 1].courses.map(courseKey) : []
      );
      return period.courses.filter((course) => !previousKeys.has(courseKey(course)));
    })
  );

test("built-in schedule expands all 53 source blocks into 166 period records", () => {
  assert.match(scheduleSource, /export const scheduleData = \[/);
  assert.doesNotMatch(scheduleSource, /^\s*import\s/m);
  assert.doesNotMatch(scheduleSource, /^\s*(?:const|let|var|function)\s/m);
  assert.doesNotMatch(
    scheduleSource,
    /\b(?:course|block|scheduleBlocks|expandDay|Array\.from|Object\.entries|flatMap)\b|=>|\.\.\./
  );
  assert.equal(scheduleSource.match(/^\s+name:/gm)?.length, 166);
  assert.equal(scheduleSource.match(/^\s+weeks: \[/gm)?.length, 166);
  assert.equal(scheduleSource.match(/^\s+group:/gm)?.length, 166);
  assert.equal(
    scheduleSource.match(/^\s+note: \{ default: .+, weeks: \{\} \},$/gm)
      ?.length,
    166
  );
  assert.equal(
    scheduleSource.match(/^\s+location: \{ default: .+, weeks: \{\} \}$/gm)
      ?.length,
    166
  );
  assert.doesNotMatch(scheduleSource, /weeks: \[\s*\n/);

  assert.deepEqual(
    scheduleData.map(({ day, periods }) => [day, periods.map(({ period }) => period)]),
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => [
      day,
      Array.from({ length: 13 }, (_, index) => index + 1)
    ])
  );

  const records = scheduleData.flatMap((day) =>
    day.periods.flatMap((period) => period.courses)
  );
  const blocks = getBlockStarts();

  assert.equal(records.length, 166);
  assert.equal(blocks.length, 53);
  const groupCounts = {};
  for (const { group } of blocks) {
    const key = group ?? "all";
    groupCounts[key] = (groupCounts[key] ?? 0) + 1;
  }
  assert.deepEqual(groupCounts, {
      all: 25,
      "6班A组": 6,
      "7班C组": 7,
      "6班B组": 6,
      "7班D组": 7,
      "6班A、B组": 1,
      "7班C、D组": 1
  });
});

test("built-in schedule preserves source weeks, normalized names, teachers and locations", () => {
  const records = scheduleData.flatMap((day) =>
    day.periods.flatMap((period) => period.courses)
  );
  const blocks = getBlockStarts();

  for (const course of records) {
    assert.ok(course.weeks.length > 0);
    assert.deepEqual(course.weeks, [...course.weeks].sort((a, b) => a - b));
    assert.ok(course.weeks.every((week) => week >= 1 && week <= 17));
    assert.deepEqual(Object.keys(course.note).sort(), ["default", "weeks"]);
    assert.equal(typeof course.note.default, "string");
    assert.deepEqual(course.note.weeks, {});
    assert.deepEqual(Object.keys(course.location).sort(), ["default", "weeks"]);
    assert.ok(["未排地点", "网课"].includes(course.location.default));
    assert.deepEqual(course.location.weeks, {});
  }

  assert.equal(blocks.some(({ name }) => name === "外科学(Ⅱ)"), false);
  assert.equal(blocks.some(({ name }) => name === "麻醉科学见习"), false);
  assert.deepEqual(
    [
      ...new Set(
        blocks
          .filter(({ note }) => note.default)
          .map(({ note }) => note.default)
      )
    ].sort(),
    ["王士良", "苏伟", "赵徐东、陈浙丽", "那万秋", "那万秋、孙枞昊"].sort()
  );
  assert.deepEqual(
    [...new Set(records.map(({ location }) => location.default))].sort(),
    ["未排地点", "网课"]
  );
  assert.equal(
    records.filter(({ location }) => location.default === "网课").length,
    5
  );
});

test("combined-group placements cover only their merged source ranges", () => {
  const thursday = scheduleData.find(({ day }) => day === "Thursday");
  const friday = scheduleData.find(({ day }) => day === "Friday");
  const periodsForGroup = (day, group) =>
    day.periods
      .filter(({ courses }) => courses.some((course) => course.group === group))
      .map(({ period }) => period);

  assert.deepEqual(periodsForGroup(thursday, "6班A、B组"), [2, 3, 4, 5, 6, 7, 8, 9]);
  assert.deepEqual(periodsForGroup(friday, "7班C、D组"), [2, 3, 4, 5, 6, 7, 8, 9]);
});
