import { DAYS, MAX_PERIOD, MAX_WEEK, MIN_PERIOD, MIN_WEEK } from "./constants";

const normalizeWeeks = (weeks) => {
  const list = Array.isArray(weeks) ? weeks : [];
  const seen = new Set();
  const result = [];
  for (const value of list) {
    const num = Number(value);
    if (!Number.isFinite(num)) continue;
    const week = Math.trunc(num);
    if (week < MIN_WEEK || week > MAX_WEEK) continue;
    if (seen.has(week)) continue;
    seen.add(week);
    result.push(week);
  }
  result.sort((a, b) => a - b);
  return result;
};

export const normalizeCourse = (course) => {
  if (!course || typeof course !== "object") {
    return {
      name: "",
      group: null,
      weeks: [],
      note: "",
      location: ""
    };
  }
  const name = typeof course.name === "string" ? course.name.trim() : "";
  const group = typeof course.group === "string" ? course.group.trim() : "";
  const note = course.note ?? "";
  const location = course.location ?? "";
  return {
    ...course,
    name,
    group: group.length > 0 ? group : null,
    weeks: normalizeWeeks(course.weeks),
    note,
    location
  };
};

export const normalizeSchedule = (schedule) => {
  const list = Array.isArray(schedule) ? schedule : [];
  return DAYS.map((day) => {
    const dayEntry = list.find((entry) => entry.day === day) || {
      day,
      periods: []
    };
    const periodMap = new Map(
      (Array.isArray(dayEntry.periods) ? dayEntry.periods : []).map((entry) => [
        entry.period,
        entry
      ])
    );

    const periods = [];
    for (let period = MIN_PERIOD; period <= MAX_PERIOD; period += 1) {
      const periodEntry = periodMap.get(period);
      const courses = Array.isArray(periodEntry?.courses)
        ? periodEntry.courses.map(normalizeCourse)
        : [];
      periods.push({ period, courses });
    }

    return { day, periods };
  });
};

const stableStringify = (value) => {
  if (value == null) return "";
  if (typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
};

export const buildCourseIdentity = (course) => {
  const name = typeof course?.name === "string" ? course.name : "";
  const group = typeof course?.group === "string" ? course.group : "";
  const weeks = normalizeWeeks(course?.weeks ?? []);
  const note = stableStringify(course?.note);
  const location = stableStringify(course?.location);
  return `${name}::${group}::${weeks.join(",")}::${note}::${location}`;
};

export const collectCoursesForRange = (
  scheduleData,
  day,
  periodStart,
  periodEnd
) => {
  if (!Array.isArray(scheduleData)) return [];
  const dayEntry = scheduleData.find((entry) => entry.day === day);
  if (!dayEntry || !Array.isArray(dayEntry.periods)) return [];
  const start = Math.min(periodStart, periodEnd);
  const end = Math.max(periodStart, periodEnd);
  const courseMap = new Map();

  for (let period = start; period <= end; period += 1) {
    const periodEntry = dayEntry.periods.find((entry) => entry.period === period);
    const courses = periodEntry?.courses ?? [];
    for (const course of courses) {
      const key = buildCourseIdentity(course);
      if (courseMap.has(key)) continue;
      courseMap.set(key, course);
    }
  }

  return Array.from(courseMap.values());
};

export const cloneSchedule = (schedule) => {
  if (!Array.isArray(schedule)) return [];
  return schedule.map((day) => ({
    ...day,
    periods: Array.isArray(day.periods)
      ? day.periods.map((period) => ({
          ...period,
          courses: Array.isArray(period.courses)
            ? period.courses.map((course) => ({ ...course }))
            : []
        }))
      : []
  }));
};
