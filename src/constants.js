/**
 * 课程表常量配置
 */

// 星期映射
export const DAY_NAMES = {
  Monday: { zh: "星期一", short: "周一" },
  Tuesday: { zh: "星期二", short: "周二" },
  Wednesday: { zh: "星期三", short: "周三" },
  Thursday: { zh: "星期四", short: "周四" },
  Friday: { zh: "星期五", short: "周五" }
};

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// 周数范围
export const MIN_WEEK = 1;
export const MAX_WEEK = 16;

// 节次范围
export const MIN_PERIOD = 1;
export const MAX_PERIOD = 13;

// 默认开学日期
export const DEFAULT_SEMESTER_START_DATE = "2026-03-02";

// 本地存储键名
export const STORAGE_KEYS = {
  SEMESTER_START_DATE: "semesterStartDate",
  NOTIFICATIONS_ENABLED: "notificationsEnabled",
  NOTIFICATIONS_LAST_SCHEDULED_AT: "notificationsLastScheduledAt",
  USER_GROUP: "userGroup"
};
