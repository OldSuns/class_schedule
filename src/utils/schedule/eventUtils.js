import { SELECTABLE_GROUP_TYPES, shouldNotifyForGroup } from "./groupUtils.js";
import { parseTimeToMinutes } from "./timeUtils.js";

const ERROR_MESSAGE = "课表数据格式不兼容";
const ROOT_KEYS = ["events", "semesterStartDate", "updatedAt", "version"];
const LEGACY_EVENT_KEYS = [
  "day",
  "endTime",
  "group",
  "id",
  "location",
  "name",
  "note",
  "startTime",
  "weeks"
];
const EVENT_KEYS = [
  "day",
  "endTime",
  "group",
  "id",
  "location",
  "name",
  "note",
  "startTime",
  "teacher",
  "weeks"
];
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const ISO_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{3})?(?:Z|[+-](\d{2}):(\d{2}))$/;

const incompatible = () => {
  throw new Error(ERROR_MESSAGE);
};

const hasExactKeys = (value, expected) => {
  const keys = Object.keys(value).sort();
  return keys.length === expected.length && keys.every((key, index) => key === expected[index]);
};

const isValidIsoTimestamp = (value) => {
  const match = ISO_DATE_TIME.exec(value);
  if (!match) return false;
  const [year, month, day, hour, minute, second] = match.slice(1, 7).map(Number);
  const offsetHour = Number(match[7] ?? 0);
  const offsetMinute = Number(match[8] ?? 0);
  const calendarDate = new Date(Date.UTC(year, month - 1, day));
  return (
    calendarDate.getUTCFullYear() === year &&
    calendarDate.getUTCMonth() === month - 1 &&
    calendarDate.getUTCDate() === day &&
    hour <= 23 &&
    minute <= 59 &&
    second <= 59 &&
    offsetHour <= 23 &&
    offsetMinute <= 59 &&
    Number.isFinite(Date.parse(value))
  );
};

export const normalizeEvent = (event) => {
  if (!event || typeof event !== "object" || Array.isArray(event)) incompatible();
  if (!hasExactKeys(event, EVENT_KEYS)) incompatible();

  const id = typeof event.id === "string" ? event.id.trim() : "";
  const name = typeof event.name === "string" ? event.name.trim() : "";
  const weeks = Array.isArray(event.weeks) ? [...new Set(event.weeks)] : [];
  const group = event.group === null ? null : event.group?.trim?.();
  const start = parseTimeToMinutes(event.startTime);
  const end = parseTimeToMinutes(event.endTime);

  if (
    !id ||
    !name ||
    !DAYS.includes(event.day) ||
    weeks.length === 0 ||
    weeks.some((week) => !Number.isInteger(week) || week < 1 || week > 8) ||
    start === null ||
    end === null ||
    end <= start ||
    (group !== null && !SELECTABLE_GROUP_TYPES.includes(group)) ||
    typeof event.location !== "string" ||
    typeof event.teacher !== "string" ||
    typeof event.note !== "string"
  ) {
    incompatible();
  }

  return {
    id,
    name,
    day: event.day,
    weeks: weeks.sort((a, b) => a - b),
    startTime: event.startTime,
    endTime: event.endTime,
    group,
    location: event.location.trim(),
    teacher: event.teacher.trim(),
    note: event.note.trim()
  };
};

const normalizeLegacyEvent = (event) => {
  if (!event || typeof event !== "object" || Array.isArray(event)) incompatible();
  if (!hasExactKeys(event, LEGACY_EVENT_KEYS) || typeof event.note !== "string") {
    incompatible();
  }
  return normalizeEvent({
    ...event,
    teacher: event.note,
    note: ""
  });
};

export const normalizeSchedulePayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) incompatible();
  if (!hasExactKeys(payload, ROOT_KEYS)) incompatible();
  if (
    ![1, 2].includes(payload.version) ||
    payload.semesterStartDate !== "2026-07-13" ||
    typeof payload.updatedAt !== "string" ||
    !isValidIsoTimestamp(payload.updatedAt) ||
    !Array.isArray(payload.events)
  ) {
    incompatible();
  }

  const normalize = payload.version === 1 ? normalizeLegacyEvent : normalizeEvent;
  const events = payload.events.map(normalize);
  if (new Set(events.map((event) => event.id)).size !== events.length) incompatible();

  return {
    version: 2,
    semesterStartDate: "2026-07-13",
    updatedAt: payload.updatedAt,
    events
  };
};

export const filterScheduleEvents = (events, { week, day, group } = {}) =>
  (Array.isArray(events) ? events : [])
    .filter(
      (event) =>
        event.weeks?.includes(week) &&
        event.day === day &&
        (group == null || shouldNotifyForGroup(event.group, group))
    )
    .sort(
      (left, right) =>
        parseTimeToMinutes(left.startTime) - parseTimeToMinutes(right.startTime) ||
        parseTimeToMinutes(left.endTime) - parseTimeToMinutes(right.endTime) ||
        left.name.localeCompare(right.name, "zh-CN")
    );

export const getCurrentEvents = (events, options = {}) => {
  const at = parseTimeToMinutes(options.atTime);
  if (at === null) return [];
  return filterScheduleEvents(events, options).filter(
    (event) =>
      at >= parseTimeToMinutes(event.startTime) &&
      at < parseTimeToMinutes(event.endTime)
  );
};

export const getEventProgress = (event, atTime) => {
  const start = parseTimeToMinutes(event?.startTime);
  const end = parseTimeToMinutes(event?.endTime);
  const at = parseTimeToMinutes(atTime);
  if (start === null || end === null || at === null || end <= start) return 0;
  return Math.round(Math.max(0, Math.min(1, (at - start) / (end - start))) * 100);
};

export const buildWidgetScheduleSnapshot = (payload) => {
  const schedule = normalizeSchedulePayload(payload);
  return {
    version: 4,
    semesterStartDate: schedule.semesterStartDate,
    events: schedule.events.map((event) => ({
      id: event.id,
      name: event.name,
      day: event.day,
      weeks: event.weeks,
      startMin: parseTimeToMinutes(event.startTime),
      endMin: parseTimeToMinutes(event.endTime),
      group: event.group,
      location: event.location,
      note: event.note
    }))
  };
};
