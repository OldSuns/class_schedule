import test from "node:test";
import assert from "node:assert/strict";
import { scheduleData } from "../src/data/scheduleData.js";

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

// 第三周（9/28–10/2）的教师/教学内容/地点全部写在 weeks 含 3 的专属条目上。
const WEEK_3_CONTENT = [
  ["Monday", [1, 2], "麻醉学", null, "刘鹤｜呼吸功能的监测和临床应用，血流动力学监测", "1楼教室"],
  ["Monday", [3, 4], "眼科学", null, "何峰英｜结膜疾病", "1楼教室"],
  ["Monday", [6, 7, 8], "内科学见习", "6班A组", "吴国栋｜消化科见习1", "1期7号楼的9楼709病区示教室"],
  ["Tuesday", [1, 2], "内科学A(Ⅱ)", null, "赵辉｜胰腺炎", "1楼教室"],
  ["Tuesday", [3, 4], "外科学A(Ⅱ)", null, "孙旭｜门静脉高压症，胆道疾病(二)", "1楼教室"],
  ["Tuesday", [6, 7, 8], "内科学见习", "6班B组", "彭礼清｜消化科见习1", "1期7号楼的9楼709病区示教室"],
  ["Wednesday", [1, 2, 3], "精神病学", null, "赵徐东｜神经发育障碍、应激相关障碍", "1楼教室"]
];

// 拆分后其它周次的教师/地点必须保持不变。
const OTHER_WEEKS_CONTENT = [
  ["Monday", 3, 1, "眼科学", "", "未排地点"],
  ["Monday", 6, 6, "内科学见习", "", "未排地点"],
  ["Tuesday", 1, 6, "内科学A(Ⅱ)", "", "未排地点"],
  ["Tuesday", 3, 5, "外科学A(Ⅱ)", "", "未排地点"],
  ["Tuesday", 6, 5, "内科学见习", "", "未排地点"],
  ["Wednesday", 1, 9, "精神病学", "赵徐东、陈浙丽", "未排地点"]
];

test("week 3 carries its own teacher, topic and location without touching other weeks", () => {
  const periodMap = new Map(
    scheduleData.map(({ day, periods }) => [
      day,
      new Map(periods.map(({ period, courses }) => [period, courses]))
    ])
  );
  const expected = new Map();
  for (const [day, periods, name, group, note, location] of WEEK_3_CONTENT) {
    for (const period of periods) {
      expected.set(`${day}-${period}`, { name, group, note, location });
    }
  }

  for (const [day, periods] of periodMap) {
    for (const [period, courses] of periods) {
      const key = `${day}-${period}`;
      const week3Courses = courses.filter(({ weeks }) => weeks.includes(3));
      const want = expected.get(key);
      if (!want) {
        assert.deepEqual(week3Courses, [], `${key} 第 3 周不应有课程`);
        continue;
      }
      assert.equal(week3Courses.length, 1, `${key} 第 3 周只应有一条课程`);
      const [course] = week3Courses;
      assert.deepEqual(course.weeks, [3], key);
      assert.equal(course.name, want.name, key);
      assert.equal(course.group, want.group, key);
      assert.deepEqual(course.note, { default: want.note, weeks: {} }, key);
      assert.deepEqual(course.location, { default: want.location, weeks: {} }, key);
    }
  }

  for (const [day, period, week, name, note, location] of OTHER_WEEKS_CONTENT) {
    const course = periodMap
      .get(day)
      .get(period)
      .find(({ name: courseName, weeks }) => courseName === name && weeks.includes(week));
    assert.ok(course, `${day} p${period} 第 ${week} 周缺少 ${name}`);
    assert.deepEqual(course.note, { default: note, weeks: {} });
    assert.deepEqual(course.location, { default: location, weeks: {} });
  }
});
