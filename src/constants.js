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
export const MAX_WEEK = 17;

// 节次范围
export const MIN_PERIOD = 1;
export const MAX_PERIOD = 13;

// 默认开学日期
export const DEFAULT_SEMESTER_START_DATE = "2026-03-02";

// 课程显示模式
export const DISPLAY_MODES = {
  ALL: "all",
  CURRENT_ONLY: "currentOnly"
};

// 当前应用版本（用于更新检查）
export const APP_VERSION = "1.9.7";

// GitHub Releases
export const GITHUB_RELEASES_URL =
  "https://github.com/OldSuns/class_schedule/releases";
export const GITHUB_RELEASES_API_LATEST =
  "https://api.github.com/repos/OldSuns/class_schedule/releases/latest";

// 远端课表更新（软更新）
export const SCHEDULE_REMOTE_URL =
  "https://raw.githubusercontent.com/OldSuns/class_schedule/refs/heads/main/schedule.json";

// 通知提前量（分钟）
export const DEFAULT_NOTIFICATION_LEAD_MINUTES = 15;
export const NOTIFICATION_LEAD_MINUTE_OPTIONS = [10, 15, 20, 30];

// 本地存储键名
export const STORAGE_KEYS = {
  SEMESTER_START_DATE: "semesterStartDate",
  NOTIFICATIONS_ENABLED: "notificationsEnabled",
  NOTIFICATIONS_LAST_SCHEDULED_AT: "notificationsLastScheduledAt",
  NOTIFICATIONS_LAST_RECONCILED_AT: "notificationsLastReconciledAt",
  NOTIFICATION_PLAN_SNAPSHOT: "notificationPlanSnapshot",
  NOTIFICATION_LEAD_MINUTES: "notificationLeadMinutes",
  USER_GROUP: "userGroup",
  DISPLAY_MODE: "displayMode",
  CUSTOM_SCHEDULE: "customSchedule",
  REMOTE_SCHEDULE_SNAPSHOT: "remoteScheduleSnapshot",
  REMOTE_SCHEDULE_META: "remoteScheduleMeta",
  UPDATE_LAST_CHECK_DATE: "updateLastCheckDate",
  UPDATE_LAST_TOAST_DATE: "updateLastToastDate"
};
