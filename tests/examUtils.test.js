import test from "node:test";
import assert from "node:assert/strict";

import {
  DEFAULT_EXAM_SEGMENT,
  EXAM_METHOD_OPTIONS,
  EXAM_SEGMENTS,
  buildExamSummary,
  filterExamsBySegment,
  getExamCountdownLabel
} from "../src/utils/exam/examUtils.js";

const examTools = await import("../src/utils/exam/examUtils.js");

const NOW = new Date("2026-06-05T08:00:00+08:00");

const exams = [
  {
    id: "past",
    name: "已结束课程",
    startsAt: "2026-06-01T09:00:00+08:00",
    durationMinutes: 120,
    location: "A101",
    seatNumber: "12",
    method: "闭卷"
  },
  {
    id: "next",
    name: "内科学A(I)",
    startsAt: "2026-06-08T09:00:00+08:00",
    durationMinutes: 120,
    location: "教学楼 A302",
    seatNumber: "08",
    method: "闭卷"
  },
  {
    id: "later",
    name: "外科学A(I)",
    startsAt: "2026-06-21T14:00:00+08:00",
    durationMinutes: 90,
    location: "教学楼 B201",
    seatNumber: "",
    method: "闭卷"
  }
];

test("exam page defaults to pending segment and uses fixed method options", () => {
  assert.equal(DEFAULT_EXAM_SEGMENT, EXAM_SEGMENTS.PENDING);
  assert.deepEqual(EXAM_METHOD_OPTIONS, ["", "闭卷", "开卷", "半开卷"]);
});

test("buildExamSummary derives next exam and metric counts", () => {
  const summary = buildExamSummary(exams, NOW);

  assert.equal(summary.nextExam.id, "next");
  assert.equal(summary.pendingCount, 2);
  assert.equal(summary.withinTwoWeeksCount, 1);
  assert.equal(summary.completedCount, 1);
  assert.deepEqual(
    summary.timeline.map((exam) => exam.id),
    ["past", "next", "later"]
  );
});

test("filterExamsBySegment returns pending and completed subsets", () => {
  assert.deepEqual(
    filterExamsBySegment(exams, EXAM_SEGMENTS.PENDING, NOW).map((exam) => exam.id),
    ["next", "later"]
  );
  assert.deepEqual(
    filterExamsBySegment(exams, EXAM_SEGMENTS.COMPLETED, NOW).map((exam) => exam.id),
    ["past"]
  );
  assert.deepEqual(
    filterExamsBySegment(exams, EXAM_SEGMENTS.ALL, NOW).map((exam) => exam.id),
    ["past", "next", "later"]
  );
});

test("getExamCountdownLabel formats useful relative labels", () => {
  assert.equal(getExamCountdownLabel(exams[1], NOW), "3天后");
  assert.equal(
    getExamCountdownLabel(
      {
        ...exams[1],
        startsAt: "2026-06-05T09:00:00+08:00"
      },
      NOW
    ),
    "今天"
  );
  assert.equal(getExamCountdownLabel(exams[0], NOW), "已结束");
});

test("buildExamSummary handles empty exam lists", () => {
  const summary = buildExamSummary([], NOW);

  assert.equal(summary.nextExam, null);
  assert.equal(summary.pendingCount, 0);
  assert.equal(summary.withinTwoWeeksCount, 0);
  assert.equal(summary.completedCount, 0);
  assert.deepEqual(summary.timeline, []);
});

test("buildExamFromForm creates a normalized user exam from local form input", () => {
  assert.equal(typeof examTools.buildExamFromForm, "function");

  const result = examTools.buildExamFromForm(
    {
      name: "  内科学A(I)  ",
      date: "2026-06-08",
      time: "09:05",
      location: " 教学楼 A302 ",
      seatNumber: " 08 ",
      method: " 闭卷 ",
      durationMinutes: "120"
    },
    { createId: () => "local-exam-1" }
  );

  assert.equal(result.ok, true);
  assert.deepEqual(result.exam, {
    id: "local-exam-1",
    name: "内科学A(I)",
    startsAt: "2026-06-08T09:05:00+08:00",
    location: "教学楼 A302",
    seatNumber: "08",
    method: "闭卷",
    durationMinutes: 120
  });
});

test("buildExamFromForm reports required local user input", () => {
  assert.equal(typeof examTools.buildExamFromForm, "function");

  const result = examTools.buildExamFromForm({
    name: "",
    date: "",
    time: "",
    durationMinutes: "0"
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, [
    "考试名称不能为空",
    "请选择考试日期",
    "请选择开始时间",
    "考试时长必须大于 0 分钟"
  ]);
});

test("upsertExam replaces only the edited local exam and keeps exams sorted", () => {
  assert.equal(typeof examTools.upsertExam, "function");

  const next = examTools.upsertExam(exams, {
    id: "next",
    name: "内科学A(I)重排",
    startsAt: "2026-06-07T10:00:00+08:00",
    durationMinutes: 100,
    location: "新教室",
    method: "机考"
  });

  assert.deepEqual(
    next.map((exam) => exam.id),
    ["past", "next", "later"]
  );
  assert.equal(next[1].name, "内科学A(I)重排");
  assert.equal(exams[1].name, "内科学A(I)");
});

test("deleteExam removes a local exam without mutating the source list", () => {
  assert.equal(typeof examTools.deleteExam, "function");

  const next = examTools.deleteExam(exams, "next");

  assert.deepEqual(
    next.map((exam) => exam.id),
    ["past", "later"]
  );
  assert.equal(exams.length, 3);
});

test("parseStoredExams treats missing storage as an empty user-owned list", () => {
  assert.equal(typeof examTools.parseStoredExams, "function");

  assert.deepEqual(examTools.parseStoredExams(null), []);
  assert.deepEqual(examTools.parseStoredExams(""), []);
});

test("examToFormValues maps an existing exam into editable form fields", () => {
  assert.equal(typeof examTools.examToFormValues, "function");

  assert.deepEqual(examTools.examToFormValues(exams[1]), {
    name: "内科学A(I)",
    date: "2026-06-08",
    time: "09:00",
    location: "教学楼 A302",
    seatNumber: "08",
    method: "闭卷",
    durationMinutes: "120"
  });
});

test("shouldOpenExamActions opens only for a clear left swipe", () => {
  assert.equal(typeof examTools.shouldOpenExamActions, "function");

  assert.equal(
    examTools.shouldOpenExamActions({
      deltaX: -72,
      deltaY: 8,
      currentOffset: -72
    }),
    true
  );
  assert.equal(
    examTools.shouldOpenExamActions({
      deltaX: 72,
      deltaY: 8,
      currentOffset: -20
    }),
    false
  );
  assert.equal(
    examTools.shouldOpenExamActions({
      deltaX: -72,
      deltaY: 96,
      currentOffset: -72
    }),
    false
  );
});

test("getExamActionRevealOffset clamps swipe distance to the action width", () => {
  assert.equal(typeof examTools.getExamActionRevealOffset, "function");

  assert.equal(examTools.getExamActionRevealOffset(-24, 112), -24);
  assert.equal(examTools.getExamActionRevealOffset(-180, 112), -112);
  assert.equal(examTools.getExamActionRevealOffset(24, 112), 0);
});

test("isExamActionControlTarget detects touches inside revealed exam actions", () => {
  assert.equal(typeof examTools.isExamActionControlTarget, "function");

  const actionTarget = {
    closest: (selector) =>
      selector === "[data-exam-action-control]" ? { tagName: "BUTTON" } : null
  };
  const cardTarget = {
    closest: () => null
  };

  assert.equal(examTools.isExamActionControlTarget(actionTarget), true);
  assert.equal(examTools.isExamActionControlTarget(cardTarget), false);
  assert.equal(examTools.isExamActionControlTarget(null), false);
});
