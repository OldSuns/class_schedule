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
  teacher: "",
  note: ""
};

const validPayload = {
  version: 2,
  semesterStartDate: "2026-07-13",
  updatedAt: "2026-07-16T00:00:00+08:00",
  events: [validEvent]
};

const EXPECTED_ROTATIONS = {
  2: ["神经内科", "消化内科", "甲状腺外科", "肛肠外科", "妇产科", "儿科", "仁皇山滨湖街道社区医院"],
  3: ["消化内科", "呼吸内科", "肛肠外科", "胸心外科", "环渚龙泉街道社区卫生服务中心", "妇产科", "儿科"],
  4: ["甲状腺外科", "神经外科", "妇产科", "仁皇山滨湖街道社区医院", "儿科", "心血管内科", "消化内科"],
  5: ["血管外科", "胃肠疝外科", "消化内科", "儿科", "神经内科", "环渚龙泉街道社区卫生服务中心", "妇产科"],
  6: ["儿科", "仁皇山滨湖街道社区医院", "神经内科", "妇产科", "呼吸内科", "肛肠外科", "神经外科"],
  7: ["妇产科", "儿科", "环渚龙泉街道社区卫生服务中心", "消化内科", "血管外科", "神经外科", "心血管内科"],
  8: ["仁皇山滨湖街道社区医院", "妇产科", "儿科", "神经内科", "神经外科", "呼吸内科", "血管外科"]
};

const EXPECTED_ROTATION_LOCATIONS = {
  呼吸内科: "805病区",
  心血管内科: "606A病区",
  神经内科: "708A病区",
  消化内科: "710B病区",
  胃肠疝外科: "607B",
  甲状腺外科: "511",
  肛肠外科: "608A",
  胸心外科: "711B",
  神经外科: "707A",
  血管外科: "711A",
  妇产科: "508",
  儿科: "506病区",
  环渚龙泉街道社区卫生服务中心: "吴兴区福莱福路1号",
  仁皇山滨湖街道社区医院: "吴兴区震泽路966号临床诊疗中心105室"
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

test("normalizeSchedulePayload explicitly migrates legacy v1 teacher notes", () => {
  const { teacher: _teacher, ...legacyEvent } = validEvent;
  const migrated = eventTools.normalizeSchedulePayload({
    ...validPayload,
    version: 1,
    events: [{ ...legacyEvent, note: "魏湘" }]
  });

  assert.deepEqual(migrated, {
    ...validPayload,
    events: [{ ...validEvent, teacher: "魏湘", note: "" }]
  });
});

test("normalizeSchedulePayload rejects incompatible roots and invalid events", () => {
  const invalidPayloads = [
    { ...validPayload, version: 3 },
    { ...validPayload, semesterStartDate: "2026-07-20" },
    { ...validPayload, updatedAt: "not-a-date" },
    { ...validPayload, updatedAt: "2026-02-30T00:00:00+08:00" },
    { ...validPayload, periods: [], events: validPayload.events },
    { ...validPayload, events: [{ ...validEvent, startTime: "8:00" }] },
    { ...validPayload, events: [{ ...validEvent, endTime: "13:45" }] },
    { ...validPayload, events: [{ ...validEvent, group: "A组" }] },
    { ...validPayload, events: [{ ...validEvent, teacher: null }] },
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
      const department = EXPECTED_ROTATIONS[week][group - 1];
      const groupEvents = rotationEvents.filter(
        (event) => event.weeks.includes(week) && event.group === `${group}组`
      );
      assert.equal(groupEvents.length, week === 3 || week === 5 ? 9 : 8);
      assert.ok(
        groupEvents.every((event) => event.name === `${department}见习`),
        `第${week}周${group}组应在${department}见习`
      );
      assert.ok(
        groupEvents.every(
          (event) => event.location === EXPECTED_ROTATION_LOCATIONS[department]
        ),
        `第${week}周${group}组地点应为${EXPECTED_ROTATION_LOCATIONS[department]}`
      );
    }
  }
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
    commonEvents.find((event) => event.name === "肺炎的诊断及治疗")?.teacher,
    "魏湘"
  );

  const correctedEvents = [
    {
      week: 1,
      day: "Friday",
      startTime: "13:45",
      endTime: "16:45",
      name: "岗前培训实操——心肺复苏、体格检查",
      teacher: "急诊科等",
      note: ""
    },
    {
      week: 2,
      day: "Thursday",
      startTime: "13:45",
      endTime: "16:45",
      name: "内科技能培训（骨髓/腰椎/胸腔/腹腔穿刺）",
      teacher: "曹丹、马德林、周凌燕、徐美灵",
      note: "1.骨髓穿刺术；2.腰椎穿刺术；3.胸腔穿刺术；4.腹腔穿刺术。（6-7班分成A、B、C、D四组，培训轮流进行，每个操作1课时）"
    },
    {
      week: 3,
      day: "Tuesday",
      startTime: "15:20",
      endTime: "16:00",
      name: "心力衰竭的规范化诊疗",
      teacher: "张栗",
      note: ""
    },
    {
      week: 4,
      day: "Thursday",
      startTime: "13:45",
      endTime: "16:45",
      name: "外科技能培训（洗手、缝合、换药、导尿）",
      teacher: "余胜、魏强、邵霞、肖鑫",
      note: "1.外科洗手、穿衣、戴手套、消毒、铺巾；2.切开、缝合、打结；3.换药；4.导尿术。（6-7班分成A、B、C、D四组，培训轮流进行，每个操作1课时）"
    },
    {
      week: 6,
      day: "Tuesday",
      startTime: "15:20",
      endTime: "16:45",
      name: "儿科常用治疗方法及药物计算",
      teacher: "陆玮芬",
      note: ""
    },
    {
      week: 6,
      day: "Thursday",
      startTime: "13:45",
      endTime: "16:45",
      name: "妇儿科技能培训（妇检、产科触诊、小儿腰穿/骨穿）",
      teacher: "马跃凤、唐杰、黄秋玲、陆玮芬",
      note: "1.妇科检查及阴道脱落细胞学检查等操作要点；2.产科四步触诊法；3.小儿腰椎穿刺术；4.小儿骨髓穿刺术。（6-7班分成A、B、C、D四组，培训轮流进行，每个操作1课时）"
    },
    {
      week: 7,
      day: "Tuesday",
      startTime: "15:20",
      endTime: "16:45",
      name: "儿科医患沟通",
      teacher: "黄秋玲",
      note: ""
    },
    {
      week: 8,
      day: "Tuesday",
      startTime: "13:45",
      endTime: "15:10",
      name: "影像报告判读",
      teacher: "何剑",
      note: ""
    },
    {
      week: 8,
      day: "Tuesday",
      startTime: "15:20",
      endTime: "16:45",
      name: "化验结果判读",
      teacher: "王笑颜",
      note: ""
    }
  ];

  for (const expected of correctedEvents) {
    const event = commonEvents.find(
      (candidate) =>
        candidate.weeks.includes(expected.week) &&
        candidate.day === expected.day &&
        candidate.startTime === expected.startTime
    );
    assert.ok(event, `缺少第${expected.week}周 ${expected.day} ${expected.startTime} 的课程`);
    assert.deepEqual(
      {
        endTime: event.endTime,
        name: event.name,
        teacher: event.teacher,
        note: event.note
      },
      {
        endTime: expected.endTime,
        name: expected.name,
        teacher: expected.teacher,
        note: expected.note
      }
    );
  }

  const serialized = JSON.stringify(scheduleData);
  assert.doesNotMatch(serialized, /联系人|联系电话|手机号|\b1\d{10}\b/);
  assert.doesNotMatch(serialized, /6班A组|6班B组|7班C组|7班D组/);
});
