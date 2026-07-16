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
export const MAX_WEEK = 8;

// 默认开学日期
export const DEFAULT_SEMESTER_START_DATE = "2026-07-13";

// 内置课表版本（更新内置课表时递增）
export const DEFAULT_SCHEDULE_VERSION = 2;

// 主题模式
export const THEMES = {
  M3: "m3",
  MINIMAL: "minimal",
  DEFAULT: "minimal"
};

// 当前应用版本（用于更新检查）
export const APP_VERSION = "2.0.8";

// Gitee Releases
export const GITHUB_RELEASES_URL =
  "https://gitee.com/oldsuns/class_schedule/releases";
export const GITHUB_RELEASES_API_LATEST =
  "https://gitee.com/api/v5/repos/oldsuns/class_schedule/releases/latest";
export const GITHUB_RELEASES_API_LIST =
  "https://gitee.com/api/v5/repos/oldsuns/class_schedule/releases";

// 远端课表更新（软更新）地址（并发请求，按 payload.updatedAt 选最新；平手时按数组顺序优先）
export const SCHEDULE_REMOTE_URLS = [
  "https://fastly.jsdelivr.net/gh/oldsuns/class_schedule@summer-schedule/schedule.json",
  "https://gcore.jsdelivr.net/gh/oldsuns/class_schedule@summer-schedule/schedule.json",
  "https://cdn.jsdelivr.net/gh/oldsuns/class_schedule@summer-schedule/schedule.json"
]; 


// 通知提前量（分钟）
export const DEFAULT_NOTIFICATION_LEAD_MINUTES = 15;
export const NOTIFICATION_LEAD_MINUTE_OPTIONS = [10, 15, 20, 30];

// 本地存储键名
export const STORAGE_KEYS = {
  NOTIFICATIONS_ENABLED: "notificationsEnabled",
  NOTIFICATIONS_LAST_SCHEDULED_AT: "summerNotificationsLastScheduledAt",
  NOTIFICATIONS_LAST_RECONCILED_AT: "summerNotificationsLastReconciledAt",
  NOTIFICATION_PLAN_SNAPSHOT: "summerNotificationPlanSnapshot",
  NOTIFICATION_LEAD_MINUTES: "notificationLeadMinutes",
  USER_GROUP: "userGroup",
  WIDGET_SCHEDULE_SNAPSHOT: "summerWidgetScheduleSnapshot",
  CUSTOM_SCHEDULE: "summerScheduleCustom",
  SCHEDULE_SOURCE: "summerScheduleSource",
  REMOTE_SCHEDULE_SNAPSHOT: "summerScheduleRemoteSnapshot",
  REMOTE_SCHEDULE_META: "summerScheduleRemoteMeta",
  REMOTE_SKIPPED_UPDATE: "summerScheduleRemoteSkippedUpdate",
  DEFAULT_SCHEDULE_VERSION: "summerScheduleDefaultVersion",
  DEFAULT_SCHEDULE_SIGNATURE: "summerScheduleDefaultSignature",
  REMOTE_LAST_CHECK_AT: "summerScheduleRemoteLastCheckAt",
  REMOTE_LAST_FOREGROUND_CHECK_AT: "summerScheduleRemoteLastForegroundCheckAt",
  REMOTE_LAST_ERROR_AT: "summerScheduleRemoteLastErrorAt",
  UPDATE_LAST_CHECK_DATE: "updateLastCheckDate",
  UPDATE_LAST_ERROR_AT: "updateLastErrorAt",
  UPDATE_LAST_TOAST_DATE: "updateLastToastDate",
  THEME: "theme",
  USER_EXAMS: "userExams"
};

export const SCHEDULE_RESET_KEYS = [
  STORAGE_KEYS.CUSTOM_SCHEDULE,
  STORAGE_KEYS.SCHEDULE_SOURCE,
  STORAGE_KEYS.DEFAULT_SCHEDULE_VERSION,
  STORAGE_KEYS.DEFAULT_SCHEDULE_SIGNATURE,
  STORAGE_KEYS.REMOTE_SCHEDULE_SNAPSHOT,
  STORAGE_KEYS.REMOTE_SCHEDULE_META,
  STORAGE_KEYS.REMOTE_SKIPPED_UPDATE,
  STORAGE_KEYS.REMOTE_LAST_CHECK_AT,
  STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT,
  STORAGE_KEYS.REMOTE_LAST_ERROR_AT
];
