import { DISPLAY_MODES } from "./constants";
import {
  normalizeElectives,
  shouldIncludeCourseForAudience
} from "./electiveUtils";
import { buildCourseIdentity } from "./scheduleUtils";

/**
 * 课程合并相关工具函数
 */

const getNearestWeekInfo = (weeks, currentWeek) => {
  let next = null;
  let prev = null;
  for (const week of weeks) {
    if (week >= currentWeek) {
      if (next == null || week < next) next = week;
    } else {
      if (prev == null || week > prev) prev = week;
    }
  }
  return { next, prev };
};

const getCourseWeekPriority = (course, currentWeek) => {
  const weeks = Array.isArray(course.weeks) ? course.weeks : [];
  const { next, prev } = getNearestWeekInfo(weeks, currentWeek);
  if (next != null) {
    return { rank: 0, dist: next - currentWeek };
  }
  if (prev != null) {
    return { rank: 1, dist: currentWeek - prev };
  }
  return { rank: 2, dist: Number.MAX_SAFE_INTEGER };
};

const sortCoursesByNearestWeek = (courses, currentWeek) =>
  courses
    .map((course, index) => {
      const { rank, dist } = getCourseWeekPriority(course, currentWeek);
      return { course, rank, dist, index };
    })
    .sort((a, b) => a.rank - b.rank || a.dist - b.dist || a.index - b.index)
    .map((item) => item.course);

/**
 * 获取课程在指定周次的地点
 * @param {Object|string} location - 地点信息，可以是字符串或对象
 * @param {number} week - 周次
 * @returns {string} 该周次的地点
 *
 * 支持两种格式：
 * 1. 字符串格式：所有周次使用相同地点
 *    location: "教学楼A101"
 *
 * 2. 对象格式：为不同周次指定不同地点
 *    location: {
 *      default: "教学楼A101",  // 默认地点（可选）
 *      weeks: {
 *        1: "教学楼B202",      // 第1周的地点
 *        3: "教学楼C303",      // 第3周的地点
 *        "5-8": "实验楼D404"   // 第5-8周的地点
 *      }
 *    }
 */
export const getCourseLocation = (location, week) => {
  // 如果是字符串，直接返回
  if (typeof location === "string") {
    return location;
  }

  // 如果是对象格式
  if (location && typeof location === "object" && location.weeks) {
    // 遍历 weeks 对象，查找匹配的周次
    for (const [key, value] of Object.entries(location.weeks)) {
      // 处理单个周次，如 "1", "3"
      if (!key.includes("-")) {
        if (parseInt(key) === week) {
          return value;
        }
      } else {
        // 处理周次范围，如 "5-8"
        const [start, end] = key.split("-").map(Number);
        if (week >= start && week <= end) {
          return value;
        }
      }
    }

    // 如果没有匹配的周次，返回默认地点
    return location.default || "未排地点";
  }

  // 其他情况返回空字符串
  return "";
};

const getCourseAudienceKey = (course) =>
  `${course.name}::${course.group ?? ""}::${normalizeElectives(
    course.electives
  ).join(",")}`;

/**
 * 获取课程在指定周次的备注
 * @param {Object|string} note - 备注信息，可以是字符串或对象
 * @param {number} week - 周次
 * @returns {string} 该周次的备注
 */
export const getCourseNote = (note, week) => {
  // 如果是字符串，直接返回
  if (typeof note === "string") {
    return note;
  }

  // 如果是对象格式
  if (note && typeof note === "object" && note.weeks) {
    // 遍历 weeks 对象，查找匹配的周次
    for (const [key, value] of Object.entries(note.weeks)) {
      // 处理单个周次，如 "1", "3"
      if (!key.includes("-")) {
        if (parseInt(key) === week) {
          return value;
        }
      } else {
        // 处理周次范围，如 "5-8"
        const [start, end] = key.split("-").map(Number);
        if (week >= start && week <= end) {
          return value;
        }
      }
    }

    // 如果没有匹配的周次，返回默认备注
    return note.default || "";
  }

  // 其他情况返回空字符串
  return "";
};

const serializeNoteForKey = (note) => {
  if (note == null) return "";
  if (typeof note === "string") return note;
  if (typeof note === "object") {
    try {
      return JSON.stringify(note);
    } catch {
      return "";
    }
  }
  return String(note);
};

// 获取课程唯一标识
export const getCourseKey = (course) =>
  `${getCourseAudienceKey(course)}::${serializeNoteForKey(
    course.note
  )}::${course.weeks.join(",")}`;

// 获取显示课程的唯一标识
export const getDisplayKey = (courses) => {
  const keys = [];
  const seen = new Set();
  for (const course of courses) {
    const key = getCourseAudienceKey(course);
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
    const key = getCourseAudienceKey(course);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(course);
  }
  // 同一时间 A/B 组都上课时同时显示（最多显示 2 条，剩余用"其他课程"提示）
  return result.slice(0, 2);
};

// 合并同一天内连续的同一课程
export const mergeCellsByDay = (
  scheduleData,
  currentWeek,
  displayMode = DISPLAY_MODES.ALL,
  userGroup,
  selectedElectives = []
) => {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = Array.from({ length: 13 }, (_, i) => i + 1);
  const dayMap = new Map(
    (Array.isArray(scheduleData) ? scheduleData : []).map((entry) => [
      entry.day,
      entry
    ])
  );
  const result = {};
  const isCurrentOnly = displayMode === DISPLAY_MODES.CURRENT_ONLY;

  for (const day of days) {
    const dayData = dayMap.get(day);
    const periodMap = new Map(
      (dayData?.periods ?? []).map((entry) => [entry.period, entry])
    );
    const raw = {};

    for (const period of periods) {
      const periodData = periodMap.get(period);
      const courses = periodData?.courses ?? [];

      if (courses.length === 0) {
        raw[period] = { empty: true, allCourses: [], hasAnyCourse: false };
        continue;
      }

      const annotatedCourses = courses.map(course => ({
        ...course,
        isCurrentWeek:
          Array.isArray(course.weeks) && course.weeks.includes(currentWeek),
        isAudienceMatch: shouldIncludeCourseForAudience(
          course,
          userGroup,
          selectedElectives
        )
      }));
      const hasAnyCourse = annotatedCourses.length > 0;

      const currentWeekCourses = annotatedCourses.filter(
        (course) => course.isCurrentWeek && course.isAudienceMatch
      );
      const audienceFilteredCourses = annotatedCourses.filter(
        (course) => course.isAudienceMatch
      );

      if (isCurrentOnly) {
        if (currentWeekCourses.length === 0) {
          raw[period] = {
            empty: true,
            allCourses: annotatedCourses,
            hasAnyCourse,
            hasCurrentWeekCourse: false
          };
          continue;
        }
        const displayCourses = getDisplayCourses(currentWeekCourses);
        raw[period] = {
          empty: false,
          allCourses: annotatedCourses,
          hasAnyCourse,
          filteredCourses: currentWeekCourses,
          displayCourses,
          displayKey: getDisplayKey(currentWeekCourses),
          hasCurrentWeekCourse: true,
          otherCoursesCount: Math.max(
            0,
            currentWeekCourses.length - displayCourses.length
          ),
        };
        continue;
      }

      if (audienceFilteredCourses.length === 0) {
        raw[period] = {
          empty: true,
          allCourses: annotatedCourses,
          hasAnyCourse,
          hasCurrentWeekCourse: false
        };
        continue;
      }

      const orderedCourses =
        currentWeekCourses.length > 0
          ? audienceFilteredCourses
          : sortCoursesByNearestWeek(audienceFilteredCourses, currentWeek);

      // 优先显示本周课程；无本周课程时优先显示最近未来周次
      const displayCourses =
        currentWeekCourses.length > 0
          ? getDisplayCourses(currentWeekCourses)
          : orderedCourses.slice(0, 1);
      const displayKey =
        currentWeekCourses.length > 0 ? getDisplayKey(currentWeekCourses) : "";
      const otherCoursesCount = Math.max(
        0,
        orderedCourses.length - displayCourses.length
      );

      raw[period] = {
        empty: false,
        allCourses: annotatedCourses,
        hasAnyCourse,
        filteredCourses: orderedCourses,
        displayCourses,
        displayKey,
        hasCurrentWeekCourse: currentWeekCourses.length > 0,
        otherCoursesCount,
      };
    }

    // 将同一天的连续节次合并，减少重复渲染
    const merged = {};
    let period = 1;
    while (period <= 13) {
      const cell = raw[period];
      if (!cell || cell.empty) {
        merged[period] = {
          empty: true,
          allCourses: cell?.allCourses ?? [],
          hasAnyCourse: cell?.hasAnyCourse ?? false
        };
        period += 1;
        continue;
      }

      // 不是本周课程：不做跨节次合并（保持每节独立显示）
      if (!cell.hasCurrentWeekCourse) {
        merged[period] = {
          ...cell,
          allCourses: cell.allCourses ?? cell.filteredCourses ?? [],
          periodStart: period,
          periodEnd: period,
          rowSpan: 1,
        };
        period += 1;
        continue;
      }

      let end = period;
      const combinedCoursesMap = new Map();
      const combinedAllCoursesMap = new Map();
      const addCourses = (list) => {
        // 以课程唯一标识去重，保留“本周课程”标记
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
      const addAllCourses = (list) => {
        for (const course of list) {
          const key = buildCourseIdentity(course);
          if (combinedAllCoursesMap.has(key)) continue;
          combinedAllCoursesMap.set(key, course);
        }
      };

      addCourses(cell.filteredCourses ?? []);
      addAllCourses(cell.allCourses ?? cell.filteredCourses ?? []);
      let hasCurrentWeekCourse = cell.hasCurrentWeekCourse;

      while (end + 1 <= 13) {
        const next = raw[end + 1];
        if (!next || next.empty) break;
        if (!next.hasCurrentWeekCourse) break;
        if (next.displayKey !== cell.displayKey) break;
        addCourses(next.filteredCourses ?? []);
        addAllCourses(next.allCourses ?? next.filteredCourses ?? []);
        hasCurrentWeekCourse = hasCurrentWeekCourse || next.hasCurrentWeekCourse;
        end += 1;
      }

      const mergedCourses = Array.from(combinedCoursesMap.values());
      const mergedAllCourses = Array.from(combinedAllCoursesMap.values());
      const mergedCurrentWeekCourses = mergedCourses.filter(c => c.isCurrentWeek);
      const displayCourses = getDisplayCourses(mergedCurrentWeekCourses);
      const otherCoursesCount = Math.max(0, mergedCourses.length - displayCourses.length);

      merged[period] = {
        ...cell,
        filteredCourses: mergedCourses,
        displayCourses,
        hasCurrentWeekCourse,
        otherCoursesCount,
        allCourses: mergedAllCourses,
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
