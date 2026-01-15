/**
 * 课程合并相关工具函数
 */

// 获取课程唯一标识
export const getCourseKey = (course) =>
  `${course.name}::${course.group ?? ""}::${course.note ?? ""}::${course.weeks.join(",")}`;

// 获取显示课程的唯一标识
export const getDisplayKey = (courses) => {
  const keys = [];
  const seen = new Set();
  for (const course of courses) {
    const key = `${course.name}::${course.group ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    keys.push(key);
  }
  keys.sort();
  return keys.join("||");
};

// 获取需要显示的课程（去重，最多显示2条）
export const getDisplayCourses = (courses) => {
  const result = [];
  const seen = new Set();
  for (const course of courses) {
    const key = `${course.name}::${course.group ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(course);
  }
  // 同一时间 A/B 组都上课时同时显示（最多显示 2 条，剩余用"其他课程"提示）
  return result.slice(0, 2);
};

// 合并同一天内连续的同一课程
export const mergeCellsByDay = (scheduleData, currentWeek) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = Array.from({ length: 13 }, (_, i) => i + 1);
  const result = {};

  for (const day of days) {
    const dayData = scheduleData.find(d => d.day === day);
    const raw = {};

    for (const period of periods) {
      const periodData = dayData?.periods.find(p => p.period === period);
      const courses = periodData?.courses ?? [];

      if (courses.length === 0) {
        raw[period] = { empty: true };
        continue;
      }

      const filteredCourses = courses.map(course => ({
        ...course,
        isCurrentWeek: course.weeks.includes(currentWeek),
      }));

      const currentWeekCourses = filteredCourses.filter(c => c.isCurrentWeek);
      const displayCourses =
        currentWeekCourses.length > 0 ? getDisplayCourses(currentWeekCourses) : (filteredCourses[0] ? [filteredCourses[0]] : []);
      const displayKey = currentWeekCourses.length > 0 ? getDisplayKey(currentWeekCourses) : "";
      const otherCoursesCount = Math.max(0, filteredCourses.length - displayCourses.length);

      raw[period] = {
        empty: false,
        filteredCourses,
        displayCourses,
        displayKey,
        hasCurrentWeekCourse: currentWeekCourses.length > 0,
        otherCoursesCount,
      };
    }

    const merged = {};
    let period = 1;
    while (period <= 13) {
      const cell = raw[period];
      if (!cell || cell.empty) {
        merged[period] = { empty: true };
        period += 1;
        continue;
      }

      // 不是本周课程：不做跨节次合并（保持每节独立显示）
      if (!cell.hasCurrentWeekCourse) {
        merged[period] = {
          ...cell,
          periodStart: period,
          periodEnd: period,
          rowSpan: 1,
        };
        period += 1;
        continue;
      }

      let end = period;
      const combinedCoursesMap = new Map();
      const addCourses = (list) => {
        for (const course of list) {
          const key = getCourseKey(course);
          const existing = combinedCoursesMap.get(key);
          if (!existing) {
            combinedCoursesMap.set(key, course);
            continue;
          }
          if (!existing.isCurrentWeek && course.isCurrentWeek) {
            combinedCoursesMap.set(key, { ...existing, isCurrentWeek: true });
          }
        }
      };

      addCourses(cell.filteredCourses);
      let hasCurrentWeekCourse = cell.hasCurrentWeekCourse;

      while (end + 1 <= 13) {
        const next = raw[end + 1];
        if (!next || next.empty) break;
        if (!next.hasCurrentWeekCourse) break;
        if (next.displayKey !== cell.displayKey) break;
        addCourses(next.filteredCourses);
        hasCurrentWeekCourse = hasCurrentWeekCourse || next.hasCurrentWeekCourse;
        end += 1;
      }

      const mergedCourses = Array.from(combinedCoursesMap.values());
      const mergedCurrentWeekCourses = mergedCourses.filter(c => c.isCurrentWeek);
      const displayCourses = getDisplayCourses(mergedCurrentWeekCourses);
      const otherCoursesCount = Math.max(0, mergedCourses.length - displayCourses.length);

      merged[period] = {
        ...cell,
        filteredCourses: mergedCourses,
        displayCourses,
        hasCurrentWeekCourse,
        otherCoursesCount,
        periodStart: period,
        periodEnd: end,
        rowSpan: end - period + 1,
      };

      for (let p = period + 1; p <= end; p += 1) {
        merged[p] = { skip: true };
      }

      period = end + 1;
    }

    result[day] = merged;
  }

  return result;
};
