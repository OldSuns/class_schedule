/**
 * 时间相关工具函数
 */

import { DAYS, MAX_WEEK, MIN_WEEK } from "../../config/constants.js";

const SWIPE_DISTANCE_THRESHOLD = 56;
const SWIPE_VELOCITY_THRESHOLD = 500;
const HORIZONTAL_SWIPE_RATIO = 1.15;

const createDateAtMidnight = (year, month, day) => {
  const date = new Date(year, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
};

const parseLocalDate = (value) => {
  const [year, month, day] = String(value).split("-").map(Number);
  if (!year || !month || !day) return null;
  return createDateAtMidnight(year, month - 1, day);
};

const calculateBaseDateInfo = (startDate, targetDate) => {
  if (!startDate) return null;

  const start = parseLocalDate(startDate);
  if (!start) return null;
  const target = new Date(targetDate);

  if (Number.isNaN(target.getTime())) return null;

  start.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target - start;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;

  const week = Math.floor(diffDays / 7) + 1;
  if (week > MAX_WEEK) return null;

  return {
    week,
    dayOfWeek: target.getDay()
  };
};

export const parseTimeToMinutes = (time) => {
  if (typeof time !== "string" || !/^\d{2}:\d{2}$/.test(time)) return null;
  const [hours, minutes] = time.split(":").map(Number);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
};

// 计算指定日期是第几周的星期几
export const calculateDateInfo = (startDate, targetDate) => {
  const baseInfo = calculateBaseDateInfo(startDate, targetDate);
  if (!baseInfo) return null;

  const { week, dayOfWeek } = baseInfo;

  if (dayOfWeek === 0 || dayOfWeek === 6) return null; // 周末无课

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayName = dayNames[dayOfWeek - 1];

  return { week, day: dayName, dayOfWeek, isWeekendPreview: false };
};

export const calculateDisplayWeekInfo = (startDate, targetDate) => {
  const baseInfo = calculateBaseDateInfo(startDate, targetDate);
  if (!baseInfo) return null;

  const { week, dayOfWeek } = baseInfo;

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      week: Math.min(week + 1, MAX_WEEK),
      day: null,
      dayOfWeek: null,
      isWeekendPreview: true
    };
  }

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const dayName = dayNames[dayOfWeek - 1];

  return { week, day: dayName, dayOfWeek, isWeekendPreview: false };
};

export const getScheduleDate = (startDate, week, day) => {
  const semesterStart = parseLocalDate(startDate);
  const weekNum = Number(week);
  const dayIndex = DAYS.indexOf(day);

  if (
    !semesterStart ||
    !Number.isInteger(weekNum) ||
    weekNum < 1 ||
    weekNum > MAX_WEEK ||
    dayIndex === -1
  ) {
    return null;
  }

  return createDateAtMidnight(
    semesterStart.getFullYear(),
    semesterStart.getMonth(),
    semesterStart.getDate() + (weekNum - 1) * 7 + dayIndex
  );
};

export const getAdjacentWorkday = ({ week, day }, direction) => {
  const weekNumber = Number(week);
  const dayIndex = DAYS.indexOf(day);
  if (
    !Number.isInteger(weekNumber) ||
    weekNumber < MIN_WEEK ||
    weekNumber > MAX_WEEK ||
    dayIndex === -1 ||
    (direction !== "previous" && direction !== "next")
  ) {
    return null;
  }

  if (direction === "previous") {
    if (dayIndex > 0) return { week: weekNumber, day: DAYS[dayIndex - 1] };
    return weekNumber > MIN_WEEK
      ? { week: weekNumber - 1, day: DAYS.at(-1) }
      : { week: weekNumber, day };
  }

  if (dayIndex < DAYS.length - 1) {
    return { week: weekNumber, day: DAYS[dayIndex + 1] };
  }
  return weekNumber < MAX_WEEK
    ? { week: weekNumber + 1, day: DAYS[0] }
    : { week: weekNumber, day };
};

export const getWeekStartSelection = (week) => {
  const weekNumber = Number(week);
  if (!Number.isInteger(weekNumber) || weekNumber < MIN_WEEK || weekNumber > MAX_WEEK) {
    return null;
  }
  return { week: weekNumber, day: DAYS[0] };
};

export const getScheduleSelectionDirection = (previous, next) => {
  const getIndex = (selection) => {
    const week = Number(selection?.week);
    const dayIndex = DAYS.indexOf(selection?.day);
    if (!Number.isInteger(week) || week < MIN_WEEK || week > MAX_WEEK || dayIndex < 0) {
      return null;
    }
    return (week - 1) * DAYS.length + dayIndex;
  };
  const previousIndex = getIndex(previous);
  const nextIndex = getIndex(next);
  if (previousIndex == null || nextIndex == null) return 0;
  return Math.sign(nextIndex - previousIndex);
};

export const getSwipeDayDirection = ({ offsetX, offsetY, velocityX }) => {
  const horizontal = Number(offsetX);
  const vertical = Number(offsetY);
  const velocity = Number(velocityX);
  if (![horizontal, vertical, velocity].every(Number.isFinite)) return null;
  if (Math.abs(horizontal) <= Math.abs(vertical) * HORIZONTAL_SWIPE_RATIO) {
    return null;
  }
  if (
    horizontal >= SWIPE_DISTANCE_THRESHOLD ||
    velocity >= SWIPE_VELOCITY_THRESHOLD
  ) {
    return "previous";
  }
  if (
    horizontal <= -SWIPE_DISTANCE_THRESHOLD ||
    velocity <= -SWIPE_VELOCITY_THRESHOLD
  ) {
    return "next";
  }
  return null;
};

export const formatMonthDay = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 计算今天是第几周的星期几
export const calculateTodayInfo = (startDate) => {
  return calculateDateInfo(startDate, new Date());
};

export const calculateDisplayTodayInfo = (startDate) => {
  return calculateDisplayWeekInfo(startDate, new Date());
};
