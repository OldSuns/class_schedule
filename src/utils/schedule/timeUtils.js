/**
 * 时间相关工具函数
 */

import { DAYS, MAX_WEEK } from "../../config/constants";

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

// 获取节次时间
export const getPeriodTime = (period) => {
  const timeMap = {
    1: "8:15-8:55",
    2: "9:00-9:40",
    3: "9:55-10:35",
    4: "10:40-11:20",
    5: "11:25-12:05",
    6: "13:45-14:25",
    7: "14:30-15:10",
    8: "15:20-16:00",
    9: "16:05-16:45",
    10: "16:45-17:55",
    11: "18:00-18:40",
    12: "18:45-19:25",
    13: "19:30-20:10"
  };
  return timeMap[period] || "";
};

export const parseTimeToMinutes = (time) => {
  if (!time) return null;
  const [hours, minutes] = String(time).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

export const getPeriodRangeMinutes = (period) => {
  const time = getPeriodTime(period);
  if (!time || !time.includes("-")) return null;
  const [start, end] = time.split("-");
  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);
  if (startMin == null || endMin == null) return null;
  return { startMin, endMin };
};

export const getPeriodDurationMinutes = (period) => {
  const range = getPeriodRangeMinutes(period);
  if (!range) return 0;
  return Math.max(0, range.endMin - range.startMin);
};

export const getCurrentPeriod = (now = new Date()) => {
  const current = now instanceof Date ? now : new Date(now);
  const nowMinutes = current.getHours() * 60 + current.getMinutes();
  for (let period = 1; period <= 13; period += 1) {
    const range = getPeriodRangeMinutes(period);
    if (!range) continue;
    if (nowMinutes >= range.startMin && nowMinutes < range.endMin) {
      return period;
    }
  }
  return null;
};

// 获取节次开始时间（HH:mm）
export const getPeriodStartTime = (period) => {
  const time = getPeriodTime(period);
  if (!time) return "";
  return time.split("-")[0];
};

// 获取节次名称
export const getPeriodLabel = (period) => {
  if (period >= 11 && period <= 13) {
    return `晚${period - 10}节`;
  }
  return `${period}节`;
};

// 获取节次范围标签
export const getPeriodRangeLabel = (periodStart, periodEnd) => {
  if (periodStart === periodEnd) return getPeriodLabel(periodStart);
  return `${getPeriodLabel(periodStart)}～${getPeriodLabel(periodEnd)}`;
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
