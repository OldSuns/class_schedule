export const EXAM_SEGMENTS = {
  ALL: "all",
  PENDING: "pending",
  COMPLETED: "completed"
};

export const DEFAULT_EXAM_SEGMENT = EXAM_SEGMENTS.PENDING;

export const EXAM_METHOD_OPTIONS = ["", "闭卷", "开卷", "半开卷"];

const DAY_MS = 24 * 60 * 60 * 1000;
const TWO_WEEKS_MS = 14 * DAY_MS;
const EXAM_TIME_ZONE_OFFSET = "+08:00";
const EXAM_ACTION_SWIPE_THRESHOLD = 48;
const EXAM_ACTION_VERTICAL_TOLERANCE = 1.2;
const EXAM_ACTION_CONTROL_SELECTOR = "[data-exam-action-control]";

export const EMPTY_EXAM_FORM = {
  name: "",
  date: "",
  time: "",
  location: "",
  seatNumber: "",
  method: "",
  durationMinutes: ""
};

const toDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getExamStart = (exam) => toDate(exam?.startsAt);

const padTwo = (value) => String(value).padStart(2, "0");

const formatExamDateTimeParts = ({ year, month, day, hour, minute }) =>
  `${year}-${padTwo(month)}-${padTwo(day)}T${padTwo(hour)}:${padTwo(minute)}:00${EXAM_TIME_ZONE_OFFSET}`;

const getStoredDateTimeFields = (startsAt) => {
  if (typeof startsAt === "string") {
    const match = startsAt.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if (match) {
      return { date: match[1], time: match[2] };
    }
  }

  const date = toDate(startsAt);
  if (!date) return { date: "", time: "" };
  return {
    date: `${date.getFullYear()}-${padTwo(date.getMonth() + 1)}-${padTwo(date.getDate())}`,
    time: `${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`
  };
};

const buildLocalDateTimeParts = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null;
  const [year, month, day] = String(dateValue).split("-").map(Number);
  const [hour, minute] = String(timeValue).split(":").map(Number);
  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    !Number.isInteger(hour) ||
    !Number.isInteger(minute)
  ) {
    return null;
  }
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }
  return { year, month, day, hour, minute };
};

const createExamId = () => {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `exam-${randomPart}`;
};

const trimText = (value) => (typeof value === "string" ? value.trim() : "");

const getExamEnd = (exam) => {
  const start = getExamStart(exam);
  if (!start) return null;
  const duration = Number(exam?.durationMinutes) || 0;
  return new Date(start.getTime() + Math.max(0, duration) * 60 * 1000);
};

export const isExamCompleted = (exam, now = new Date()) => {
  const current = toDate(now);
  const end = getExamEnd(exam);
  if (!current || !end) return false;
  return end.getTime() <= current.getTime();
};

export const sortExamsByStart = (exams) =>
  [...(Array.isArray(exams) ? exams : [])].sort((a, b) => {
    const aStart = getExamStart(a)?.getTime() ?? Number.POSITIVE_INFINITY;
    const bStart = getExamStart(b)?.getTime() ?? Number.POSITIVE_INFINITY;
    return aStart - bStart;
  });

export const buildExamFromForm = (values = {}, options = {}) => {
  const name = trimText(values.name);
  const dateValue = trimText(values.date);
  const timeValue = trimText(values.time);
  const durationMinutes = Number(values.durationMinutes);
  const errors = [];

  if (!name) {
    errors.push("考试名称不能为空");
  }
  if (!dateValue) {
    errors.push("请选择考试日期");
  }
  if (!timeValue) {
    errors.push("请选择开始时间");
  }
  if (!Number.isInteger(durationMinutes) || durationMinutes <= 0) {
    errors.push("考试时长必须大于 0 分钟");
  }

  const startsAtParts = buildLocalDateTimeParts(dateValue, timeValue);
  if (dateValue && timeValue && !startsAtParts) {
    errors.push("考试时间格式无效");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    exam: {
      id: options.id || values.id || options.createId?.() || createExamId(),
      name,
      startsAt: formatExamDateTimeParts(startsAtParts),
      location: trimText(values.location),
      seatNumber: trimText(values.seatNumber),
      method: trimText(values.method),
      durationMinutes
    }
  };
};

export const examToFormValues = (exam = {}) => {
  const { date, time } = getStoredDateTimeFields(exam.startsAt);
  return {
    name: trimText(exam.name),
    date,
    time,
    location: trimText(exam.location),
    seatNumber: trimText(exam.seatNumber),
    method: trimText(exam.method),
    durationMinutes:
      Number.isFinite(Number(exam.durationMinutes)) && Number(exam.durationMinutes) > 0
        ? String(Number(exam.durationMinutes))
        : ""
  };
};

export const upsertExam = (exams, exam) => {
  if (!exam?.id) {
    throw new Error("考试记录缺少 id");
  }
  const next = (Array.isArray(exams) ? exams : []).filter(
    (item) => item?.id !== exam.id
  );
  return sortExamsByStart([...next, { ...exam }]);
};

export const deleteExam = (exams, examId) =>
  (Array.isArray(exams) ? exams : []).filter((exam) => exam?.id !== examId);

const normalizeStoredExam = (exam, index) => {
  if (!exam || typeof exam !== "object") {
    throw new Error(`第 ${index + 1} 条考试记录格式无效`);
  }

  const name = trimText(exam.name);
  const { date, time } = getStoredDateTimeFields(exam.startsAt);
  const startsAtParts = buildLocalDateTimeParts(date, time);
  const durationMinutes = Number(exam.durationMinutes);
  if (
    !exam.id ||
    !name ||
    !startsAtParts ||
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new Error(`第 ${index + 1} 条考试记录缺少必要字段`);
  }

  return {
    id: String(exam.id),
    name,
    startsAt: formatExamDateTimeParts(startsAtParts),
    location: trimText(exam.location),
    seatNumber: trimText(exam.seatNumber),
    method: trimText(exam.method),
    durationMinutes
  };
};

export const parseStoredExams = (raw) => {
  if (raw == null || raw === "") return [];

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error("本地考试数据解析失败", { cause: error });
  }

  if (!Array.isArray(parsed)) {
    throw new Error("本地考试数据格式无效");
  }

  return sortExamsByStart(parsed.map(normalizeStoredExam));
};

export const stringifyExams = (exams) =>
  JSON.stringify(sortExamsByStart(exams));

export const getExamActionRevealOffset = (deltaX, actionWidth) => {
  const width = Math.max(0, Number(actionWidth) || 0);
  if (deltaX >= 0) return 0;
  return Math.max(-width, deltaX);
};

export const isExamActionControlTarget = (target) => {
  if (!target || typeof target.closest !== "function") return false;
  return Boolean(target.closest(EXAM_ACTION_CONTROL_SELECTOR));
};

export const shouldOpenExamActions = ({
  deltaX = 0,
  deltaY = 0,
  currentOffset = 0,
  threshold = EXAM_ACTION_SWIPE_THRESHOLD
} = {}) => {
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);
  const isHorizontal =
    horizontalDistance > verticalDistance * EXAM_ACTION_VERTICAL_TOLERANCE;
  if (!isHorizontal) return false;
  if (deltaX <= -threshold) return true;
  if (deltaX >= threshold) return false;
  return currentOffset <= -threshold;
};

export const filterExamsBySegment = (exams, segment, now = new Date()) => {
  const timeline = sortExamsByStart(exams);
  if (segment === EXAM_SEGMENTS.PENDING) {
    return timeline.filter((exam) => !isExamCompleted(exam, now));
  }
  if (segment === EXAM_SEGMENTS.COMPLETED) {
    return timeline.filter((exam) => isExamCompleted(exam, now));
  }
  return timeline;
};

export const buildExamSummary = (exams, now = new Date()) => {
  const current = toDate(now) ?? new Date();
  const timeline = sortExamsByStart(exams);
  const pending = timeline.filter((exam) => !isExamCompleted(exam, current));
  const completed = timeline.filter((exam) => isExamCompleted(exam, current));
  const withinTwoWeeks = pending.filter((exam) => {
    const start = getExamStart(exam);
    if (!start) return false;
    const delta = start.getTime() - current.getTime();
    return delta >= 0 && delta <= TWO_WEEKS_MS;
  });

  return {
    nextExam: pending[0] ?? null,
    pendingCount: pending.length,
    withinTwoWeeksCount: withinTwoWeeks.length,
    completedCount: completed.length,
    timeline
  };
};

export const getExamCountdownLabel = (exam, now = new Date()) => {
  const current = toDate(now);
  const start = getExamStart(exam);
  const end = getExamEnd(exam);
  if (!current || !start || !end) return "";
  if (end.getTime() <= current.getTime()) return "已结束";
  if (start.getTime() <= current.getTime()) return "进行中";

  const currentDay = new Date(current);
  currentDay.setHours(0, 0, 0, 0);
  const startDay = new Date(start);
  startDay.setHours(0, 0, 0, 0);
  const days = Math.round((startDay.getTime() - currentDay.getTime()) / DAY_MS);

  if (days <= 0) return "今天";
  if (days === 1) return "明天";
  return `${days}天后`;
};
