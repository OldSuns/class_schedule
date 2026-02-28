import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { scheduleData } from "./scheduleData";
import {
  calculateDateInfo,
  getPeriodLabel,
  getPeriodRangeLabel,
  getPeriodStartTime
} from "./timeUtils";
import { shouldNotifyForGroup } from "./groupUtils";
import { getCourseLocation, getDisplayKey } from "./courseUtils";

export const NOTIFICATION_CHANNEL_ID = "course-reminders";
// 未来多少天内生成提醒
const NOTIFICATION_WINDOW_DAYS = 14;
// 提前多少分钟提醒
const NOTIFICATION_LEAD_MINUTES = 15;

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
  currentDate
}) => {
  const info = calculateDateInfo(semesterStartDate, currentDate);
  if (!info) return [];

  const daySchedule = scheduleData.find((entry) => entry.day === info.day);
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
  windowDays
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
      currentDate
    });

    for (const block of blocks) {
      if (block.classStart <= now) continue;
      upcoming.push(block);
    }
  }

  upcoming.sort((a, b) => a.classStart - b.classStart);
  return upcoming;
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

export const scheduleCourseNotifications = async ({
  semesterStartDate,
  userGroup
}) => {
  if (!Capacitor.isNativePlatform()) {
    return { scheduled: 0, reason: "unsupported" };
  }
  if (!semesterStartDate) {
    return { scheduled: 0, reason: "no-start-date" };
  }

  // 先清理旧通知，再重新生成
  await cancelAllScheduledNotifications();

  // 必须先请求通知权限
  const permission = await LocalNotifications.requestPermissions();
  if (permission.display !== "granted") {
    return { scheduled: 0, reason: "permission-denied" };
  }

  await ensureNotificationChannel();

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notifications = [];

  for (let offset = 0; offset < NOTIFICATION_WINDOW_DAYS; offset += 1) {
    // 逐日生成未来课程提醒
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + offset);

    const blocks = buildDayCourseBlocks({
      semesterStartDate,
      userGroup,
      currentDate
    });

    for (const block of blocks) {
      const notifyAt = new Date(
        block.classStart.getTime() - NOTIFICATION_LEAD_MINUTES * 60 * 1000
      );
      if (notifyAt <= now) continue;

      notifications.push({
        id: buildNotificationId(currentDate, block.periodStart),
        title: "上课提醒",
        body: block.body,
        schedule: { at: notifyAt, allowWhileIdle: true },
        channelId: NOTIFICATION_CHANNEL_ID
      });
    }
  }

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications });
  }

  return { scheduled: notifications.length, reason: "scheduled" };
};

export const sendTestNotification = async ({
  semesterStartDate,
  userGroup
}) => {
  if (!Capacitor.isNativePlatform()) {
    return { sent: false, reason: "unsupported" };
  }

  if (!semesterStartDate) {
    return { sent: false, reason: "no-start-date" };
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
    windowDays: NOTIFICATION_WINDOW_DAYS
  });
  const nextClass = upcoming[0];
  const body = nextClass
    ? nextClass.body
    : "暂无近期课程（请检查开学日期与周次）";

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: "上课提醒",
        body,
        schedule: { at: fireAt, allowWhileIdle: true },
        channelId: NOTIFICATION_CHANNEL_ID
      }
    ]
  });

  return { sent: true, reason: nextClass ? "scheduled" : "no-course" };
};
