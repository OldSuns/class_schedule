import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import * as storage from "../storage";
import {
  DEFAULT_NOTIFICATION_LEAD_MINUTES,
  NOTIFICATION_LEAD_MINUTE_OPTIONS,
  STORAGE_KEYS
} from "./constants";
import { scheduleData as defaultScheduleData } from "./scheduleData";
import {
  calculateDateInfo,
  getPeriodLabel,
  getPeriodRangeLabel,
  getPeriodStartTime
} from "./timeUtils";
import { shouldNotifyForGroup } from "./groupUtils";
import { getCourseLocation, getDisplayKey } from "./courseUtils";

export const NOTIFICATION_CHANNEL_ID = "course-reminders";
export const NOTIFICATION_WINDOW_DAYS = 30;
const NOTIFICATION_PLAN_VERSION = 1;

export const checkPostNotificationsPermission = async () => {
  if (!Capacitor.isNativePlatform()) return { granted: true };

  if (Capacitor.getPlatform() === "android") {
    try {
      const result = await LocalNotifications.checkPermissions();
      return { granted: result.display === "granted" };
    } catch (error) {
      return { granted: false, error };
    }
  }

  return { granted: true };
};

export const requestPostNotificationsPermission = async () => {
  if (!Capacitor.isNativePlatform()) return { granted: true };

  if (Capacitor.getPlatform() === "android") {
    try {
      const result = await LocalNotifications.requestPermissions();
      return { granted: result.display === "granted" };
    } catch (error) {
      return { granted: false, error };
    }
  }

  return { granted: true };
};

const toYyyyMmDd = (date) => {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const buildNotificationId = (date, period, suffix = "") => {
  const base = `${toYyyyMmDd(date)}${String(period).padStart(2, "0")}${suffix}`;
  return Number(base);
};

const toEpochMs = (value) => {
  if (value instanceof Date) return value.getTime();
  const timestamp = Number(value);
  return Number.isFinite(timestamp) ? timestamp : NaN;
};

export const sanitizeLeadMinutes = (value) => {
  const parsed = Number(value);
  return NOTIFICATION_LEAD_MINUTE_OPTIONS.includes(parsed)
    ? parsed
    : DEFAULT_NOTIFICATION_LEAD_MINUTES;
};

const buildPlanSignature = ({ id, title, body, channelId, at }) =>
  `${id}|${title ?? ""}|${body ?? ""}|${channelId ?? ""}|${at}`;

const normalizeSnapshot = (snapshot) => {
  if (!snapshot || typeof snapshot !== "object") return null;
  const notificationsRaw = Array.isArray(snapshot.notifications)
    ? snapshot.notifications
    : [];

  const notifications = notificationsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const id = Number(item.id);
      const at = toEpochMs(item.at);
      if (!Number.isInteger(id) || !Number.isFinite(at) || at <= 0) return null;
      const title = item.title ?? "上课提醒";
      const body = item.body ?? "";
      const channelId = item.channelId ?? NOTIFICATION_CHANNEL_ID;
      const signature =
        typeof item.signature === "string" && item.signature.length > 0
          ? item.signature
          : buildPlanSignature({ id, title, body, channelId, at });
      return { id, title, body, channelId, at, signature };
    })
    .filter(Boolean)
    .sort((a, b) => a.at - b.at || a.id - b.id);

  return {
    version: Number(snapshot.version) || NOTIFICATION_PLAN_VERSION,
    generatedAt: Number(snapshot.generatedAt) || Date.now(),
    windowDays: Number(snapshot.windowDays) || NOTIFICATION_WINDOW_DAYS,
    leadMinutes: sanitizeLeadMinutes(snapshot.leadMinutes),
    notifications
  };
};

const buildNotificationPayload = (notification) => ({
  id: notification.id,
  title: notification.title,
  body: notification.body,
  schedule: { at: new Date(notification.at), allowWhileIdle: true },
  channelId: notification.channelId,
  extra: { planSignature: notification.signature }
});

const getStartTimeParts = (period) => {
  const startTime = getPeriodStartTime(period);
  if (!startTime) return null;
  const [hour, minute] = startTime.split(":").map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return { hour, minute, startTime };
};

const formatCourseLabels = (courses) => {
  const labels = [];
  const seen = new Set();
  for (const course of courses) {
    const label = course.group ? `${course.name}(${course.group})` : course.name;
    if (seen.has(label)) continue;
    seen.add(label);
    labels.push(label);
  }
  return labels.join("、");
};

const buildCourseNotificationBody = (
  periodStart,
  periodEnd,
  startTimeParts,
  courses,
  locationText
) => {
  const courseLabel = formatCourseLabels(courses);
  const periodLabel =
    periodStart === periodEnd
      ? getPeriodLabel(periodStart)
      : getPeriodRangeLabel(periodStart, periodEnd);
  const spanText =
    periodStart === periodEnd ? "" : `（共${periodEnd - periodStart + 1}节）`;
  const locationSuffix = locationText ? ` · ${locationText}` : "";
  return `${periodLabel} ${startTimeParts.startTime} · ${courseLabel}${spanText}${locationSuffix}`;
};

const buildDayCourseBlocks = ({
  semesterStartDate,
  userGroup,
  currentDate,
  scheduleData
}) => {
  const info = calculateDateInfo(semesterStartDate, currentDate);
  if (!info) return [];

  const dataSource = scheduleData ?? defaultScheduleData;
  const daySchedule = dataSource.find((entry) => entry.day === info.day);
  if (!daySchedule) return [];

  // 按节次整理当日课程，便于后续合并连续节次
  const periodMap = new Map();
  for (const periodEntry of daySchedule.periods) {
    const startTimeParts = getStartTimeParts(periodEntry.period);
    if (!startTimeParts) continue;

    const matchingCourses = (periodEntry.courses || [])
      .filter((course) => course.weeks.includes(info.week))
      .filter((course) => shouldNotifyForGroup(course.group, userGroup));

    if (!matchingCourses.length) continue;

    // 课程地点去重后参与合并判断
    const locations = matchingCourses
      .map((course) => getCourseLocation(course.location, info.week))
      .filter((location) => location && location.trim().length > 0);
    const uniqueLocations = Array.from(new Set(locations));
    const locationKey = [...uniqueLocations].sort().join("||");

    periodMap.set(periodEntry.period, {
      courses: matchingCourses,
      startTimeParts,
      key: `${getDisplayKey(matchingCourses)}::${locationKey}`,
      locationText: uniqueLocations.join(" / ")
    });
  }

  const blocks = [];
  let period = 1;
  while (period <= 13) {
    const entry = periodMap.get(period);
    if (!entry) {
      period += 1;
      continue;
    }

    let end = period;
    while (end + 1 <= 13) {
      const next = periodMap.get(end + 1);
      if (!next) break;
      if (next.key !== entry.key) break;
      end += 1;
    }

    // 将连续相同课程合并为一个提醒
    const classStart = new Date(currentDate);
    classStart.setHours(entry.startTimeParts.hour, entry.startTimeParts.minute, 0, 0);
    const body = buildCourseNotificationBody(
      period,
      end,
      entry.startTimeParts,
      entry.courses,
      entry.locationText
    );

    blocks.push({
      classStart,
      date: currentDate,
      periodStart: period,
      periodEnd: end,
      body
    });

    period = end + 1;
  }

  return blocks;
};

const collectUpcomingClasses = ({
  semesterStartDate,
  userGroup,
  fromDate,
  windowDays,
  scheduleData
}) => {
  if (!semesterStartDate) return [];
  const now = new Date(fromDate);
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const upcoming = [];

  for (let offset = 0; offset < windowDays; offset += 1) {
    const currentDate = new Date(startOfDay);
    currentDate.setDate(startOfDay.getDate() + offset);

    const blocks = buildDayCourseBlocks({
      semesterStartDate,
      userGroup,
      currentDate,
      scheduleData
    });

    for (const block of blocks) {
      if (block.classStart <= now) continue;
      upcoming.push(block);
    }
  }

  upcoming.sort((a, b) => a.classStart - b.classStart);
  return upcoming;
};

const buildSnapshotFromNotifications = ({
  notifications,
  leadMinutes,
  windowDays
}) => {
  const normalized = notifications
    .map((notification) => {
      const id = Number(notification.id);
      const at = toEpochMs(notification.at);
      if (!Number.isInteger(id) || !Number.isFinite(at)) return null;
      const title = notification.title ?? "上课提醒";
      const body = notification.body ?? "";
      const channelId = notification.channelId ?? NOTIFICATION_CHANNEL_ID;
      return {
        id,
        title,
        body,
        channelId,
        at,
        signature: buildPlanSignature({ id, title, body, channelId, at })
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.at - b.at || a.id - b.id);

  return normalizeSnapshot({
    version: NOTIFICATION_PLAN_VERSION,
    generatedAt: Date.now(),
    leadMinutes: sanitizeLeadMinutes(leadMinutes),
    windowDays,
    notifications: normalized
  });
};

export const ensureNotificationChannel = async () => {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await LocalNotifications.createChannel({
      id: NOTIFICATION_CHANNEL_ID,
      name: "课程提醒",
      description: "上课前提醒",
      importance: 4
    });
  } catch (error) {
    console.warn("通知渠道创建失败:", error);
  }
};

export const cancelAllScheduledNotifications = async () => {
  if (!Capacitor.isNativePlatform()) return 0;
  try {
    const pending = await LocalNotifications.getPending();
    if (!pending?.notifications?.length) return 0;
    const toCancel = pending.notifications.map((notification) => ({
      id: notification.id
    }));
    await LocalNotifications.cancel({ notifications: toCancel });
    return toCancel.length;
  } catch (error) {
    console.warn("取消通知失败:", error);
    return 0;
  }
};

export const checkExactAlarmPermission = async () => {
  if (!Capacitor.isNativePlatform()) return "unsupported";
  try {
    const status = await LocalNotifications.checkExactNotificationSetting();
    return status?.exact_alarm ?? "unknown";
  } catch (error) {
    console.warn("精确闹钟权限检查失败:", error);
    return "unknown";
  }
};

export const openExactAlarmPermissionSettings = async () => {
  if (!Capacitor.isNativePlatform()) return "unsupported";
  try {
    const status = await LocalNotifications.changeExactNotificationSetting();
    return status?.exact_alarm ?? "unknown";
  } catch (error) {
    console.warn("打开精确闹钟设置失败:", error);
    return "unknown";
  }
};

export const buildNotificationPlan = ({
  semesterStartDate,
  userGroup,
  scheduleData,
  leadMinutes = DEFAULT_NOTIFICATION_LEAD_MINUTES,
  fromDate = new Date(),
  windowDays = NOTIFICATION_WINDOW_DAYS
}) => {
  const normalizedLeadMinutes = sanitizeLeadMinutes(leadMinutes);
  if (!semesterStartDate) {
    return buildSnapshotFromNotifications({
      notifications: [],
      leadMinutes: normalizedLeadMinutes,
      windowDays
    });
  }

  const now = new Date(fromDate);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const notifications = [];

  for (let offset = 0; offset < windowDays; offset += 1) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + offset);

    const blocks = buildDayCourseBlocks({
      semesterStartDate,
      userGroup,
      currentDate,
      scheduleData
    });

    for (const block of blocks) {
      const notifyAt = new Date(
        block.classStart.getTime() - normalizedLeadMinutes * 60 * 1000
      );
      if (notifyAt <= now) continue;
      notifications.push({
        id: buildNotificationId(currentDate, block.periodStart),
        title: "上课提醒",
        body: block.body,
        channelId: NOTIFICATION_CHANNEL_ID,
        at: notifyAt.getTime()
      });
    }
  }

  return buildSnapshotFromNotifications({
    notifications,
    leadMinutes: normalizedLeadMinutes,
    windowDays
  });
};

export const loadNotificationPlanSnapshot = async () => {
  const raw = await storage.getItem(STORAGE_KEYS.NOTIFICATION_PLAN_SNAPSHOT);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return normalizeSnapshot(parsed);
  } catch (error) {
    console.warn("通知计划快照解析失败:", error);
    return null;
  }
};

export const persistNotificationPlanSnapshot = async (snapshot) => {
  const normalized = normalizeSnapshot(snapshot);
  if (!normalized) return;
  await storage.setItem(
    STORAGE_KEYS.NOTIFICATION_PLAN_SNAPSHOT,
    JSON.stringify(normalized)
  );
};

export const clearNotificationPlanSnapshot = async () => {
  await storage.removeItem(STORAGE_KEYS.NOTIFICATION_PLAN_SNAPSHOT);
};

export const reconcileScheduledNotifications = async ({
  planSnapshot,
  previousSnapshot,
  force = false
}) => {
  if (!Capacitor.isNativePlatform()) {
    return { scheduled: 0, canceled: 0, planned: 0, reason: "unsupported" };
  }
  const normalizedPlan = normalizeSnapshot(planSnapshot);
  if (!normalizedPlan) {
    return { scheduled: 0, canceled: 0, planned: 0, reason: "invalid-plan" };
  }

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") {
    return {
      scheduled: 0,
      canceled: 0,
      planned: normalizedPlan.notifications.length,
      reason: "permission-denied"
    };
  }

  await ensureNotificationChannel();

  const pending = await LocalNotifications.getPending();
  const pendingNotifications = Array.isArray(pending?.notifications)
    ? pending.notifications
    : [];
  const pendingIds = new Set();
  const pendingSignatureMap = new Map();
  for (const pendingNotification of pendingNotifications) {
    const id = Number(pendingNotification?.id);
    if (!Number.isInteger(id)) continue;
    pendingIds.add(id);
    const signature = pendingNotification?.extra?.planSignature;
    if (typeof signature === "string" && signature.length > 0) {
      pendingSignatureMap.set(id, signature);
    }
  }

  const previousMap = new Map();
  const normalizedPrevious = normalizeSnapshot(previousSnapshot);
  for (const notification of normalizedPrevious?.notifications ?? []) {
    previousMap.set(notification.id, notification.signature);
  }

  const desiredMap = new Map();
  for (const notification of normalizedPlan.notifications) {
    desiredMap.set(notification.id, notification);
  }

  const changedIds = new Set();
  if (force) {
    for (const notification of normalizedPlan.notifications) {
      changedIds.add(notification.id);
    }
  } else {
    for (const notification of normalizedPlan.notifications) {
      if (!pendingIds.has(notification.id)) continue;
      const pendingSignature = pendingSignatureMap.get(notification.id);
      if (pendingSignature) {
        if (pendingSignature !== notification.signature) {
          changedIds.add(notification.id);
        }
        continue;
      }
      const previousSignature = previousMap.get(notification.id);
      if (!previousSignature || previousSignature !== notification.signature) {
        changedIds.add(notification.id);
      }
    }
  }

  const idsToCancel = [];
  for (const pendingId of pendingIds) {
    if (force || !desiredMap.has(pendingId) || changedIds.has(pendingId)) {
      idsToCancel.push(pendingId);
    }
  }

  const notificationsToSchedule = [];
  for (const notification of normalizedPlan.notifications) {
    if (force || !pendingIds.has(notification.id) || changedIds.has(notification.id)) {
      notificationsToSchedule.push(notification);
    }
  }

  if (idsToCancel.length > 0) {
    await LocalNotifications.cancel({
      notifications: idsToCancel.map((id) => ({ id }))
    });
  }

  if (notificationsToSchedule.length > 0) {
    await LocalNotifications.schedule({
      notifications: notificationsToSchedule.map(buildNotificationPayload)
    });
  }

  return {
    scheduled: notificationsToSchedule.length,
    canceled: idsToCancel.length,
    planned: normalizedPlan.notifications.length,
    reason: "scheduled"
  };
};

export const scheduleCourseNotifications = async ({
  semesterStartDate,
  userGroup,
  scheduleData,
  leadMinutes = DEFAULT_NOTIFICATION_LEAD_MINUTES,
  force = false,
  previousSnapshot = null
}) => {
  if (!Capacitor.isNativePlatform()) {
    return { scheduled: 0, canceled: 0, planned: 0, reason: "unsupported" };
  }
  if (!semesterStartDate) {
    return { scheduled: 0, canceled: 0, planned: 0, reason: "no-start-date" };
  }

  // 检查并请求 POST_NOTIFICATIONS 权限
  const permCheck = await checkPostNotificationsPermission();
  if (!permCheck.granted) {
    const permRequest = await requestPostNotificationsPermission();
    if (!permRequest.granted) {
      return {
        scheduled: 0,
        canceled: 0,
        planned: 0,
        reason: "notification-permission-denied"
      };
    }
  }

  const planSnapshot = buildNotificationPlan({
    semesterStartDate,
    userGroup,
    scheduleData,
    leadMinutes
  });

  const result = await reconcileScheduledNotifications({
    planSnapshot,
    previousSnapshot,
    force
  });

  if (result.reason !== "scheduled") {
    return { ...result, snapshot: planSnapshot };
  }

  return { ...result, snapshot: planSnapshot };
};

export const sendTestNotification = async ({
  semesterStartDate,
  userGroup,
  scheduleData,
  leadMinutes = DEFAULT_NOTIFICATION_LEAD_MINUTES
}) => {
  if (!Capacitor.isNativePlatform()) {
    return { sent: false, reason: "unsupported" };
  }

  if (!semesterStartDate) {
    return { sent: false, reason: "no-start-date" };
  }

  // 检查并请求 POST_NOTIFICATIONS 权限
  const permCheck = await checkPostNotificationsPermission();
  if (!permCheck.granted) {
    const permRequest = await requestPostNotificationsPermission();
    if (!permRequest.granted) {
      return { sent: false, reason: "notification-permission-denied" };
    }
  }

  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") {
    return { sent: false, reason: "permission-denied" };
  }

  await ensureNotificationChannel();

  const now = new Date();
  const fireAt = new Date(now.getTime() + 1000 * 5);
  const id = buildNotificationId(now, 99);
  const upcoming = collectUpcomingClasses({
    semesterStartDate,
    userGroup,
    fromDate: now,
    windowDays: NOTIFICATION_WINDOW_DAYS,
    scheduleData
  });
  const nextClass = upcoming[0];
  const body = nextClass
    ? nextClass.body
    : "暂无近期课程（请检查开学日期与周次）";
  const signature = buildPlanSignature({
    id,
    title: "上课提醒",
    body,
    channelId: NOTIFICATION_CHANNEL_ID,
    at: fireAt.getTime()
  });

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: "上课提醒",
        body,
        schedule: { at: fireAt, allowWhileIdle: true },
        channelId: NOTIFICATION_CHANNEL_ID,
        extra: {
          planSignature: signature,
          leadMinutes: sanitizeLeadMinutes(leadMinutes)
        }
      }
    ]
  });

  return { sent: true, reason: nextClass ? "scheduled" : "no-course" };
};
