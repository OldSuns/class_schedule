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

// 内置课表版本（更新内置课表时递增）
export const DEFAULT_SCHEDULE_VERSION = 1;

// 课程显示模式
export const DISPLAY_MODES = {
  ALL: "all",
  CURRENT_ONLY: "currentOnly"
};

export const ELECTIVE_TYPES = {
  INNOVATION_CAMP: "innovationCamp",
  CLINICAL_SKILLS: "clinicalSkills"
};

export const ELECTIVE_OPTIONS = [
  { value: ELECTIVE_TYPES.INNOVATION_CAMP, label: "科创营" },
  { value: ELECTIVE_TYPES.CLINICAL_SKILLS, label: "临床技能班" }
];

// 当前应用版本（用于更新检查）
export const APP_VERSION = "1.9.15";

// Gitee Releases
export const GITHUB_RELEASES_URL =
  "https://gitee.com/oldsuns/class_schedule/releases";
export const GITHUB_RELEASES_API_LATEST =
  "https://gitee.com/api/v5/repos/oldsuns/class_schedule/releases/latest";
export const GITHUB_RELEASES_API_LIST =
  "https://gitee.com/api/v5/repos/oldsuns/class_schedule/releases";

// 远端课表更新（软更新）地址（按优先级依次回退）
export const SCHEDULE_REMOTE_URLS = [
  "https://fastly.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json",
  "https://cdn.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json",
  "https://gcore.jsdelivr.net/gh/oldsuns/class_schedule@main/schedule.json"
]; 


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
  SELECTED_ELECTIVES: "selectedElectives",
  DISPLAY_MODE: "displayMode",
  WIDGET_SCHEDULE_SNAPSHOT: "widgetScheduleSnapshot",
  CUSTOM_SCHEDULE: "customSchedule",
  SCHEDULE_SOURCE: "scheduleSource",
  REMOTE_SCHEDULE_SNAPSHOT: "remoteScheduleSnapshot",
  REMOTE_SCHEDULE_META: "remoteScheduleMeta",
  REMOTE_SKIPPED_UPDATE: "remoteSkippedUpdate",
  DEFAULT_SCHEDULE_VERSION: "defaultScheduleVersion",
  DEFAULT_SCHEDULE_SIGNATURE: "defaultScheduleSignature",
  REMOTE_LAST_CHECK_AT: "remoteScheduleLastCheckAt",
  REMOTE_LAST_FOREGROUND_CHECK_AT: "remoteScheduleLastForegroundCheckAt",
  REMOTE_LAST_ERROR_AT: "remoteScheduleLastErrorAt",
  UPDATE_LAST_CHECK_DATE: "updateLastCheckDate",
  UPDATE_LAST_ERROR_AT: "updateLastErrorAt",
  UPDATE_LAST_TOAST_DATE: "updateLastToastDate"
};
