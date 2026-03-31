import { DAYS, MAX_PERIOD, MAX_WEEK, MIN_PERIOD, MIN_WEEK } from "../../config/constants";
import { normalizeElectives } from "./electiveUtils";

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

const normalizePeriods = (periods) => {
  const list = Array.isArray(periods) ? periods : [];
  const seen = new Set();
  const result = [];
  for (const value of list) {
    const num = Number(value);
    if (!Number.isFinite(num)) continue;
    const period = Math.trunc(num);
    if (period < MIN_PERIOD || period > MAX_PERIOD) continue;
    if (seen.has(period)) continue;
    seen.add(period);
    result.push(period);
  }
  result.sort((a, b) => a - b);
  return result;
};

const mergeSortedNumbers = (...lists) =>
  Array.from(
    new Set(
      lists.flatMap((list) =>
        Array.isArray(list) ? list.map((value) => Number(value)) : []
      )
    )
  )
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => a - b);

const intersectSortedNumbers = (source, filter) => {
  const filterSet = new Set(Array.isArray(filter) ? filter : []);
  return (Array.isArray(source) ? source : []).filter((value) =>
    filterSet.has(value)
  );
};

const subtractSortedNumbers = (source, removed) => {
  const removedSet = new Set(Array.isArray(removed) ? removed : []);
  return (Array.isArray(source) ? source : []).filter(
    (value) => !removedSet.has(value)
  );
};

const hasAnyOverlap = (left, right) => {
  const rightSet = new Set(Array.isArray(right) ? right : []);
  return (Array.isArray(left) ? left : []).some((value) => rightSet.has(value));
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

const getDayEntry = (scheduleData, day) =>
  Array.isArray(scheduleData)
    ? scheduleData.find((entry) => entry.day === day) || null
    : null;

const getDayPeriodEntries = (dayEntry) =>
  new Map(
    (Array.isArray(dayEntry?.periods) ? dayEntry.periods : []).map((entry) => [
      entry.period,
      entry
    ])
  );

export const normalizeCourse = (course) => {
  if (!course || typeof course !== "object") {
    return {
      name: "",
      group: null,
      electives: [],
      weeks: [],
      note: "",
      location: ""
    };
  }
  const name = typeof course.name === "string" ? course.name.trim() : "";
  const group = typeof course.group === "string" ? course.group.trim() : "";
  const electives = normalizeElectives(course.electives);
  const note = course.note ?? "";
  const location = course.location ?? "";
  return {
    ...course,
    name,
    group: group.length > 0 ? group : null,
    electives,
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

export const buildCourseIdentity = (course) => {
  const name = typeof course?.name === "string" ? course.name : "";
  const group = typeof course?.group === "string" ? course.group : "";
  const electives = normalizeElectives(course?.electives ?? []);
  const weeks = normalizeWeeks(course?.weeks ?? []);
  const note = stableStringify(course?.note);
  const location = stableStringify(course?.location);
  return `${name}::${group}::${electives.join(",")}::${weeks.join(
    ","
  )}::${note}::${location}`;
};

export const buildLogicalCourseIdentity = (course) => {
  const name = typeof course?.name === "string" ? course.name : "";
  const group = typeof course?.group === "string" ? course.group : "";
  const electives = normalizeElectives(course?.electives ?? []);
  return `${name}::${group}::${electives.join(",")}`;
};

const buildFragmentMergeKey = (course, periods) => {
  const name = typeof course?.name === "string" ? course.name : "";
  const group = typeof course?.group === "string" ? course.group : "";
  const electives = normalizeElectives(course?.electives ?? []);
  const note = stableStringify(course?.note);
  const location = stableStringify(course?.location);
  const normalizedPeriods = normalizePeriods(periods);
  return `${name}::${group}::${electives.join(",")}::${note}::${location}::${normalizedPeriods.join(
    ","
  )}`;
};

const collectCourseFragmentsForPeriods = (dayEntry, targetPeriods) => {
  const periodMap = getDayPeriodEntries(dayEntry);
  const normalizedTargetPeriods = normalizePeriods(targetPeriods);
  const fragmentMap = new Map();

  for (const period of normalizedTargetPeriods) {
    const periodEntry = periodMap.get(period);
    const courses = periodEntry?.courses ?? [];
    for (const rawCourse of courses) {
      const course = normalizeCourse(rawCourse);
      const fragmentId = buildCourseIdentity(course);
      const existing = fragmentMap.get(fragmentId);
      if (existing) {
        existing.periods = mergeSortedNumbers(existing.periods, [period]);
        continue;
      }
      fragmentMap.set(fragmentId, {
        fragmentId,
        logicalId: buildLogicalCourseIdentity(course),
        periods: [period],
        periodStart: period,
        periodEnd: period,
        course
      });
    }
  }

  return Array.from(fragmentMap.values())
    .map((fragment) => ({
      ...fragment,
      periods: normalizePeriods(fragment.periods),
      periodStart: fragment.periods[0] ?? fragment.periodStart,
      periodEnd:
        fragment.periods[fragment.periods.length - 1] ?? fragment.periodEnd
    }))
    .sort(
      (a, b) =>
        a.periodStart - b.periodStart ||
        a.periodEnd - b.periodEnd ||
        a.fragmentId.localeCompare(b.fragmentId)
    );
};

export const collectCoursesForRange = (
  scheduleData,
  day,
  periodStart,
  periodEnd
) => {
  const dayEntry = getDayEntry(scheduleData, day);
  if (!dayEntry) return [];
  const periods = normalizePeriods(
    Array.from(
      { length: Math.abs(periodEnd - periodStart) + 1 },
      (_, index) => Math.min(periodStart, periodEnd) + index
    )
  );
  return collectCourseFragmentsForPeriods(dayEntry, periods).map(
    (fragment) => fragment.course
  );
};

const expandFragmentsByOverlap = (fragments, seedPeriods) => {
  const selected = [];
  const selectedIds = new Set();
  const activePeriods = new Set(normalizePeriods(seedPeriods));
  let changed = true;

  while (changed) {
    changed = false;
    for (const fragment of fragments) {
      if (selectedIds.has(fragment.fragmentId)) continue;
      if (!hasAnyOverlap(fragment.periods, Array.from(activePeriods))) continue;
      selectedIds.add(fragment.fragmentId);
      selected.push(fragment);
      for (const period of fragment.periods) {
        if (activePeriods.has(period)) continue;
        activePeriods.add(period);
        changed = true;
      }
    }
  }

  return {
    fragments: selected.sort(
      (a, b) =>
        a.periodStart - b.periodStart ||
        a.periodEnd - b.periodEnd ||
        a.fragmentId.localeCompare(b.fragmentId)
    ),
    periods: Array.from(activePeriods).sort((a, b) => a - b)
  };
};

const aggregateLogicalCourse = (logicalId, fragments) => {
  const normalizedFragments = fragments.map((fragment) => ({
    ...fragment,
    periods: normalizePeriods(fragment.periods),
    periodStart: fragment.periods[0],
    periodEnd: fragment.periods[fragment.periods.length - 1]
  }));
  const firstCourse = normalizedFragments[0]?.course ?? {};
  const allWeeks = [];
  const weekPeriodMap = {};
  const availablePeriods = [];

  for (const fragment of normalizedFragments) {
    const weeks = normalizeWeeks(fragment.course?.weeks ?? []);
    for (const week of weeks) {
      allWeeks.push(week);
      weekPeriodMap[week] = mergeSortedNumbers(
        weekPeriodMap[week] ?? [],
        fragment.periods
      );
    }
    availablePeriods.push(...fragment.periods);
  }

  const sortedWeeks = mergeSortedNumbers(allWeeks);
  const sortedPeriods = mergeSortedNumbers(availablePeriods);

  return {
    logicalId,
    baseCourse: {
      name: firstCourse.name ?? "",
      group: firstCourse.group ?? null,
      electives: normalizeElectives(firstCourse.electives ?? [])
    },
    fragments: normalizedFragments,
    weekPeriodMap,
    allWeeks: sortedWeeks,
    availablePeriods: sortedPeriods,
    periodStart: sortedPeriods[0] ?? MIN_PERIOD,
    periodEnd: sortedPeriods[sortedPeriods.length - 1] ?? MIN_PERIOD
  };
};

export const collectLogicalCoursesForRange = (
  scheduleData,
  day,
  periodStart,
  periodEnd
) => {
  const dayEntry = getDayEntry(scheduleData, day);
  if (!dayEntry) return [];

  const targetPeriods = normalizePeriods(
    Array.from(
      { length: Math.abs(periodEnd - periodStart) + 1 },
      (_, index) => Math.min(periodStart, periodEnd) + index
    )
  );
  const allDayPeriods = Array.from(
    { length: MAX_PERIOD - MIN_PERIOD + 1 },
    (_, index) => MIN_PERIOD + index
  );
  const fragments = collectCourseFragmentsForPeriods(dayEntry, allDayPeriods);
  const logicalCourseMap = new Map();

  for (const fragment of fragments) {
    if (!logicalCourseMap.has(fragment.logicalId)) {
      logicalCourseMap.set(fragment.logicalId, []);
    }
    logicalCourseMap.get(fragment.logicalId).push(fragment);
  }

  const logicalCourses = [];
  for (const [logicalId, logicalFragments] of logicalCourseMap.entries()) {
    if (!logicalFragments.some((fragment) => hasAnyOverlap(fragment.periods, targetPeriods))) {
      continue;
    }
    const expanded = expandFragmentsByOverlap(logicalFragments, targetPeriods);
    if (expanded.fragments.length === 0) continue;
    logicalCourses.push(aggregateLogicalCourse(logicalId, expanded.fragments));
  }

  return logicalCourses.sort(
    (a, b) =>
      a.periodStart - b.periodStart ||
      a.periodEnd - b.periodEnd ||
      a.logicalId.localeCompare(b.logicalId)
  );
};

const rebuildPeriodsFromFragments = (dayEntry, scopePeriods) => {
  const normalizedScopePeriods = normalizePeriods(scopePeriods);
  if (normalizedScopePeriods.length === 0) return;

  const currentFragments = collectCourseFragmentsForPeriods(
    dayEntry,
    normalizedScopePeriods
  );
  const mergedFragments = new Map();

  for (const fragment of currentFragments) {
    const key = buildFragmentMergeKey(fragment.course, fragment.periods);
    const existing = mergedFragments.get(key);
    if (!existing) {
      mergedFragments.set(key, {
        ...fragment,
        course: {
          ...fragment.course,
          electives: normalizeElectives(fragment.course?.electives ?? []),
          weeks: normalizeWeeks(fragment.course?.weeks ?? [])
        },
        periods: normalizePeriods(fragment.periods)
      });
      continue;
    }
    existing.course = {
      ...existing.course,
      weeks: mergeSortedNumbers(
        existing.course?.weeks ?? [],
        fragment.course?.weeks ?? []
      )
    };
  }

  const coursesByPeriod = new Map(
    normalizedScopePeriods.map((period) => [period, []])
  );
  const mergedList = Array.from(mergedFragments.values()).sort(
    (a, b) =>
      a.periodStart - b.periodStart ||
      a.periodEnd - b.periodEnd ||
      a.fragmentId.localeCompare(b.fragmentId)
  );

  for (const fragment of mergedList) {
    const course = normalizeCourse(fragment.course);
    for (const period of fragment.periods) {
      const list = coursesByPeriod.get(period);
      if (!list) continue;
      list.push(course);
    }
  }

  const periodMap = getDayPeriodEntries(dayEntry);
  for (const period of normalizedScopePeriods) {
    const periodEntry = periodMap.get(period);
    if (!periodEntry) continue;
    periodEntry.courses = coursesByPeriod.get(period) ?? [];
  }
};

const removeWeeksFromLogicalCoursePeriods = (
  dayEntry,
  logicalId,
  targetPeriods,
  selectedWeeks
) => {
  const normalizedTargetPeriods = normalizePeriods(targetPeriods);
  const normalizedSelectedWeeks = normalizeWeeks(selectedWeeks);
  if (normalizedTargetPeriods.length === 0 || normalizedSelectedWeeks.length === 0) {
    return;
  }

  const periodMap = getDayPeriodEntries(dayEntry);
  for (const period of normalizedTargetPeriods) {
    const periodEntry = periodMap.get(period);
    if (!periodEntry) continue;
    periodEntry.courses = (periodEntry.courses ?? [])
      .map((rawCourse) => {
        const course = normalizeCourse(rawCourse);
        if (buildLogicalCourseIdentity(course) !== logicalId) {
          return course;
        }
        const nextWeeks = subtractSortedNumbers(
          course.weeks,
          normalizedSelectedWeeks
        );
        if (nextWeeks.length === 0) return null;
        return { ...course, weeks: nextWeeks };
      })
      .filter(Boolean);
  }
};

const addCourseFragmentToPeriods = (dayEntry, targetPeriods, course) => {
  const normalizedTargetPeriods = normalizePeriods(targetPeriods);
  const normalizedCourse = normalizeCourse(course);
  if (normalizedTargetPeriods.length === 0 || normalizedCourse.weeks.length === 0) {
    return;
  }
  const periodMap = getDayPeriodEntries(dayEntry);
  for (const period of normalizedTargetPeriods) {
    const periodEntry = periodMap.get(period);
    if (!periodEntry) continue;
    periodEntry.courses = [...(periodEntry.courses ?? []), normalizedCourse];
  }
};

export const applyLogicalCourseUpdate = (
  schedule,
  {
    day,
    logicalId,
    scopePeriods,
    selectedWeeks,
    selectedPeriods,
    course,
    preserveLocation = false,
    preserveNote = false
  }
) => {
  const dayEntry = getDayEntry(schedule, day);
  if (!dayEntry) return;

  const normalizedScopePeriods = normalizePeriods(scopePeriods);
  const normalizedSelectedWeeks = normalizeWeeks(selectedWeeks);
  const normalizedSelectedPeriods = normalizePeriods(selectedPeriods);
  if (
    normalizedScopePeriods.length === 0 ||
    normalizedSelectedWeeks.length === 0 ||
    normalizedSelectedPeriods.length === 0
  ) {
    return;
  }

  const existingFragments = collectCourseFragmentsForPeriods(
    dayEntry,
    normalizedScopePeriods
  ).filter((fragment) => fragment.logicalId === logicalId);

  removeWeeksFromLogicalCoursePeriods(
    dayEntry,
    logicalId,
    normalizedScopePeriods,
    normalizedSelectedWeeks
  );

  for (const fragment of existingFragments) {
    const fragmentWeeks = intersectSortedNumbers(
      fragment.course?.weeks ?? [],
      normalizedSelectedWeeks
    );
    if (fragmentWeeks.length === 0) continue;
    const nextCourse = normalizeCourse({
      ...fragment.course,
      ...course,
      electives: normalizeElectives(course?.electives ?? []),
      location: preserveLocation ? fragment.course?.location ?? "" : course?.location,
      note: preserveNote ? fragment.course?.note ?? "" : course?.note,
      weeks: fragmentWeeks
    });
    addCourseFragmentToPeriods(dayEntry, normalizedSelectedPeriods, nextCourse);
  }

  rebuildPeriodsFromFragments(dayEntry, normalizedScopePeriods);
};

export const applyLogicalCourseDeletion = (
  schedule,
  { day, logicalId, scopePeriods, selectedWeeks, selectedPeriods }
) => {
  const dayEntry = getDayEntry(schedule, day);
  if (!dayEntry) return;

  const normalizedScopePeriods = normalizePeriods(scopePeriods);
  const normalizedSelectedWeeks = normalizeWeeks(selectedWeeks);
  const normalizedSelectedPeriods = normalizePeriods(selectedPeriods);
  if (
    normalizedScopePeriods.length === 0 ||
    normalizedSelectedWeeks.length === 0 ||
    normalizedSelectedPeriods.length === 0
  ) {
    return;
  }

  removeWeeksFromLogicalCoursePeriods(
    dayEntry,
    logicalId,
    normalizedSelectedPeriods,
    normalizedSelectedWeeks
  );
  rebuildPeriodsFromFragments(dayEntry, normalizedScopePeriods);
};

export const cloneSchedule = (schedule) => {
  if (!Array.isArray(schedule)) return [];
  return schedule.map((day) => ({
    ...day,
    periods: Array.isArray(day.periods)
      ? day.periods.map((period) => ({
          ...period,
          courses: Array.isArray(period.courses)
            ? period.courses.map((course) => ({
                ...course,
                electives: Array.isArray(course?.electives)
                  ? [...course.electives]
                  : []
              }))
            : []
        }))
      : []
  }));
};
