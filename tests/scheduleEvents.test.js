import test from "node:test";
import assert from "node:assert/strict";

const eventTools = await import("../src/utils/schedule/eventUtils.js");
const timeTools = await import("../src/utils/schedule/timeUtils.js");
const groupTools = await import("../src/utils/schedule/groupUtils.js");
const { scheduleData } = await import("../src/data/scheduleData.js");

const validEvent = {
  id: "lecture-w2-tue-1345",
  name: "肺炎的诊断及治疗",
  day: "Tuesday",
  weeks: [2],
  startTime: "13:45",
  endTime: "14:25",
  group: null,
  location: "11号楼1楼教室",
  note: ""
};

const validPayload = {
  version: 1,
  semesterStartDate: "2026-07-13",
  updatedAt: "2026-07-16T00:00:00+08:00",
  events: [validEvent]
};

test("normalizeSchedulePayload accepts and normalizes the summer event schema", () => {
  const normalized = eventTools.normalizeSchedulePayload({
    ...validPayload,
    events: [{ ...validEvent, name: "  肺炎的诊断及治疗  ", weeks: [2, 2] }]
  });

  assert.deepEqual(normalized, validPayload);
  assert.equal(
    eventTools.normalizeSchedulePayload({
      ...validPayload,
      updatedAt: "2026-07-16T00:00:00Z"
    }).updatedAt,
    "2026-07-16T00:00:00Z"
  );
});

test("normalizeSchedulePayload rejects incompatible roots and invalid events", () => {
  const invalidPayloads = [
    { ...validPayload, version: 2 },
    { ...validPayload, semesterStartDate: "2026-07-20" },
    { ...validPayload, updatedAt: "not-a-date" },
    { ...validPayload, updatedAt: "2026-02-30T00:00:00+08:00" },
    { ...validPayload, periods: [], events: validPayload.events },
    { ...validPayload, events: [{ ...validEvent, startTime: "8:00" }] },
    { ...validPayload, events: [{ ...validEvent, endTime: "13:45" }] },
    { ...validPayload, events: [{ ...validEvent, group: "A组" }] },
    { ...validPayload, events: [{ ...validEvent, weeks: [0, 2] }] },
    { ...validPayload, events: [validEvent, { ...validEvent }] }
  ];

  for (const payload of invalidPayloads) {
    assert.throws(
      () => eventTools.normalizeSchedulePayload(payload),
      /课表数据格式不兼容/
    );
  }
});

test("HH:mm utilities reject loose times and calculate exact progress", () => {
  assert.equal(timeTools.parseTimeToMinutes("08:00"), 480);
  assert.equal(timeTools.parseTimeToMinutes("8:00"), null);
  assert.equal(timeTools.parseTimeToMinutes("24:00"), null);
  assert.equal(timeTools.parseTimeToMinutes("12:60"), null);
  assert.equal(eventTools.getEventProgress(validEvent, "14:15"), 75);
});

test("group utilities expose only 1组 through 7组", () => {
  assert.deepEqual(groupTools.SELECTABLE_GROUP_TYPES, [
    "1组",
    "2组",
    "3组",
    "4组",
    "5组",
    "6组",
    "7组"
  ]);
  assert.equal(groupTools.getGroupType(" 3组 "), "3组");
  assert.equal(groupTools.getGroupType("6班A组"), null);
  assert.equal(groupTools.shouldNotifyForGroup(null, "4组"), true);
  assert.equal(groupTools.shouldNotifyForGroup("4组", "4组"), true);
  assert.equal(groupTools.shouldNotifyForGroup("4组", "5组"), false);
});

test("event queries include common courses and only the selected rotation group", () => {
  const events = [
    validEvent,
    { ...validEvent, id: "g1", name: "神经内科见习", group: "1组" },
    { ...validEvent, id: "g2", name: "消化内科见习", group: "2组" },
    { ...validEvent, id: "monday", day: "Monday", group: "1组" }
  ];

  assert.deepEqual(
    eventTools
      .filterScheduleEvents(events, { week: 2, day: "Tuesday", group: "1组" })
      .map((event) => event.id),
    ["lecture-w2-tue-1345", "g1"]
  );
});

test("current event query returns every overlapping event for the audience", () => {
  const events = [
    validEvent,
    { ...validEvent, id: "overlap", name: "并行课程", startTime: "14:00", endTime: "15:00" },
    { ...validEvent, id: "ended", startTime: "13:00", endTime: "14:15" }
  ];

  assert.deepEqual(
    eventTools
      .getCurrentEvents(events, {
        week: 2,
        day: "Tuesday",
        group: "1组",
        atTime: "14:15"
      })
      .map((event) => event.id),
    ["lecture-w2-tue-1345", "overlap"]
  );
});

test("summer schedule starts on 2026-07-13 and maps 7/15 to week 1 Wednesday", () => {
  assert.deepEqual(eventTools.normalizeSchedulePayload(scheduleData), scheduleData);
  assert.equal(scheduleData.semesterStartDate, "2026-07-13");
  assert.deepEqual(
    timeTools.calculateDateInfo(
      scheduleData.semesterStartDate,
      new Date("2026-07-15T12:00:00+08:00")
    ),
    { week: 1, day: "Wednesday", dayOfWeek: 3, isWeekendPreview: false }
  );
});

test("summer schedule contains the complete 7-week by 7-group rotation matrix", () => {
  const rotationEvents = scheduleData.events.filter((event) => event.group);

  assert.equal(rotationEvents.length, 406);
  for (let week = 2; week <= 8; week += 1) {
    for (let group = 1; group <= 7; group += 1) {
      const groupEvents = rotationEvents.filter(
        (event) => event.weeks.includes(week) && event.group === `${group}组`
      );
      assert.equal(groupEvents.length, week === 3 || week === 5 ? 9 : 8);
    }
  }

  const week2Group1 = rotationEvents.filter(
    (event) => event.weeks.includes(2) && event.group === "1组"
  );
  assert.ok(week2Group1.every((event) => event.name === "神经内科见习"));
  assert.ok(week2Group1.every((event) => event.location === "708A病区"));
});

test("summer schedule preserves every Excel common event with exact times and locations", () => {
  const commonEvents = scheduleData.events.filter((event) => event.group === null);

  assert.equal(commonEvents.length, 37);
  assert.deepEqual(
    commonEvents
      .filter((event) => event.weeks.includes(2) && event.day === "Tuesday")
      .map(({ name, startTime, endTime, location }) => ({
        name,
        startTime,
        endTime,
        location
      })),
    [
      {
        name: "病历书写点评",
        startTime: "13:00",
        endTime: "13:40",
        location: "11号楼1楼教室"
      },
      {
        name: "肺炎的诊断及治疗",
        startTime: "13:45",
        endTime: "14:25",
        location: "11号楼1楼教室"
      },
      {
        name: "白血病化疗",
        startTime: "14:30",
        endTime: "15:10",
        location: "11号楼1楼教室"
      },
      {
        name: "糖尿病的诊治",
        startTime: "15:20",
        endTime: "16:00",
        location: "11号楼1楼教室"
      },
      {
        name: "慢性肾功能不全的治疗对策和疗效评价",
        startTime: "16:05",
        endTime: "16:45",
        location: "11号楼1楼教室"
      }
    ]
  );

  assert.equal(
    commonEvents.find((event) => event.name === "肺炎的诊断及治疗")?.note,
    "魏湘"
  );

  const serialized = JSON.stringify(scheduleData);
  assert.doesNotMatch(serialized, /联系人|联系电话|手机号|\b1\d{10}\b/);
  assert.doesNotMatch(serialized, /6班A组|6班B组|7班C组|7班D组/);
});
