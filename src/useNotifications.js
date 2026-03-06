import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import * as storage from "../storage";
import {
  DEFAULT_NOTIFICATION_LEAD_MINUTES,
  NOTIFICATION_LEAD_MINUTE_OPTIONS,
  STORAGE_KEYS
} from "./constants";
import { GROUP_TYPES, SELECTABLE_GROUP_TYPES } from "./groupUtils";
import {
  cancelAllScheduledNotifications,
  checkExactAlarmPermission,
  clearNotificationPlanSnapshot,
  loadNotificationPlanSnapshot,
  openExactAlarmPermissionSettings,
  persistNotificationPlanSnapshot,
  sanitizeLeadMinutes,
  scheduleCourseNotifications,
  sendTestNotification
} from "./notificationScheduler";

const APP_ACTIVE_RESCHEDULE_INTERVAL_MS = 2 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const DAILY_RECONCILE_HOUR = 0;
const DAILY_RECONCILE_MINUTE = 5;
const DEFAULT_USER_GROUP = GROUP_TYPES.G6A;
const LEGACY_GROUP_VALUES = new Set(["A", "B"]);
const EXACT_ALARM_MESSAGES = {
  granted: "精确闹钟权限：已开启（高可靠）",
  denied: "精确闹钟权限未开启，提醒可能延迟",
  unknown: "精确闹钟权限状态未知",
  unsupported: "精确闹钟权限仅限 Android 12+"
};

const isSelectableGroupType = (group) =>
  SELECTABLE_GROUP_TYPES.includes(group);

const getMsUntilNextDailyReconcile = () => {
  const now = new Date();
  const next = new Date(now);
  next.setHours(DAILY_RECONCILE_HOUR, DAILY_RECONCILE_MINUTE, 0, 0);
  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }
  return Math.max(1_000, next.getTime() - now.getTime());
};

export const useNotifications = (semesterStartDate, scheduleData) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userGroup, setUserGroup] = useState(DEFAULT_USER_GROUP);
  const [leadMinutes, setLeadMinutes] = useState(
    DEFAULT_NOTIFICATION_LEAD_MINUTES
  );
  const [statusMessage, setStatusMessage] = useState("");
  const [exactAlarmStatus, setExactAlarmStatus] = useState("unknown");
  const [isLoaded, setIsLoaded] = useState(false);
  const schedulingRef = useRef(false);
  const pendingScheduleRef = useRef(null);
  const scheduleIfNeededRef = useRef(null);
  const initialRunRef = useRef(true);
  const prevScheduleRef = useRef(scheduleData);

  useEffect(() => {
    const loadSettings = async () => {
      const [savedEnabled, savedGroup, savedLeadMinutes] = await Promise.all([
        storage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED),
        storage.getItem(STORAGE_KEYS.USER_GROUP),
        storage.getItem(STORAGE_KEYS.NOTIFICATION_LEAD_MINUTES)
      ]);

      if (savedEnabled != null) {
        setNotificationsEnabled(savedEnabled === "true");
      }
      if (isSelectableGroupType(savedGroup)) {
        setUserGroup(savedGroup);
      } else if (LEGACY_GROUP_VALUES.has(savedGroup)) {
        setUserGroup(DEFAULT_USER_GROUP);
      }
      if (savedLeadMinutes != null) {
        setLeadMinutes(sanitizeLeadMinutes(savedLeadMinutes));
      }

      setIsLoaded(true);
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const loadExactAlarmStatus = async () => {
      const status = await checkExactAlarmPermission();
      setExactAlarmStatus(status);
    };
    loadExactAlarmStatus();
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    storage.setItem(
      STORAGE_KEYS.NOTIFICATIONS_ENABLED,
      String(notificationsEnabled)
    );
  }, [notificationsEnabled, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    storage.setItem(STORAGE_KEYS.USER_GROUP, userGroup);
  }, [userGroup, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    storage.setItem(
      STORAGE_KEYS.NOTIFICATION_LEAD_MINUTES,
      String(sanitizeLeadMinutes(leadMinutes))
    );
  }, [leadMinutes, isLoaded]);

  const scheduleIfNeeded = useCallback(
    async ({ force = false, showMessage = false, source = "manual" } = {}) => {
      if (schedulingRef.current) {
        pendingScheduleRef.current = { force, showMessage, source };
        return;
      }
      // 避免并发排程，确保一次只跑一个任务
      schedulingRef.current = true;
      try {
        if (!notificationsEnabled) {
          await cancelAllScheduledNotifications();
          await clearNotificationPlanSnapshot();
          await storage.removeItem(STORAGE_KEYS.NOTIFICATIONS_LAST_RECONCILED_AT);
          if (showMessage) {
            setStatusMessage("已关闭课程提醒");
          }
          return;
        }

        if (!semesterStartDate) {
          await cancelAllScheduledNotifications();
          await clearNotificationPlanSnapshot();
          await storage.removeItem(STORAGE_KEYS.NOTIFICATIONS_LAST_RECONCILED_AT);
          if (showMessage) {
            setStatusMessage("请先设置开学日期");
          }
          return;
        }

        const alarmStatus = await checkExactAlarmPermission();
        setExactAlarmStatus(alarmStatus);

        if (!force && source === "app-active") {
          // 前台补排轻节流：2 小时内不重复
          const lastReconciled = await storage.getItem(
            STORAGE_KEYS.NOTIFICATIONS_LAST_RECONCILED_AT
          );
          if (lastReconciled) {
            const lastTime = Number(lastReconciled);
            if (!Number.isNaN(lastTime)) {
              const diff = Date.now() - lastTime;
              if (diff < APP_ACTIVE_RESCHEDULE_INTERVAL_MS) return;
            }
          }
        }

        const previousSnapshot = await loadNotificationPlanSnapshot();
        const result = await scheduleCourseNotifications({
          semesterStartDate,
          userGroup,
          scheduleData,
          leadMinutes,
          force,
          previousSnapshot
        });

        if (result.reason === "permission-denied") {
          if (showMessage) {
            setStatusMessage("请在系统设置中允许通知权限");
          }
          return;
        }

        if (result.reason === "unsupported") {
          if (showMessage) {
            setStatusMessage("通知仅支持 Android 设备");
          }
          return;
        }

        if (result.reason !== "scheduled") {
          if (showMessage) {
            setStatusMessage("提醒同步失败，请稍后重试");
          }
          return;
        }

        if (result.snapshot) {
          await persistNotificationPlanSnapshot(result.snapshot);
        }
        await storage.setItem(
          STORAGE_KEYS.NOTIFICATIONS_LAST_RECONCILED_AT,
          String(Date.now())
        );

        if (showMessage) {
          if (result.planned > 0) {
            setStatusMessage(
              `已同步 ${result.planned} 条提醒（新增 ${result.scheduled}，清理 ${result.canceled}）`
            );
          } else {
            setStatusMessage("未来 30 天暂无可排程课程提醒");
          }
        }
      } catch (error) {
        console.error("通知排程失败:", error);
        if (showMessage) {
          setStatusMessage("通知排程失败，请稍后重试");
        }
      } finally {
        schedulingRef.current = false;
        const pending = pendingScheduleRef.current;
        if (pending) {
          pendingScheduleRef.current = null;
          const runner = scheduleIfNeededRef.current;
          if (runner) {
            void runner(pending);
          }
        }
      }
    },
    [notificationsEnabled, semesterStartDate, userGroup, scheduleData, leadMinutes]
  );

  scheduleIfNeededRef.current = scheduleIfNeeded;

  useEffect(() => {
    if (!isLoaded) return;

    const showMessage = !initialRunRef.current;
    const scheduleChanged = prevScheduleRef.current !== scheduleData;
    if (initialRunRef.current) {
      initialRunRef.current = false;
    }
    scheduleIfNeeded({
      force: true,
      showMessage: showMessage && !scheduleChanged,
      source: "settings-change"
    });
  }, [isLoaded, notificationsEnabled, semesterStartDate, userGroup, leadMinutes, scheduleIfNeeded, scheduleData]);

  useEffect(() => {
    prevScheduleRef.current = scheduleData;
  }, [scheduleData]);

  useEffect(() => {
    if (!isLoaded || !Capacitor.isNativePlatform()) return;

    let listenerHandle = null;
    const setupListener = async () => {
      listenerHandle = await App.addListener(
        "appStateChange",
        async ({ isActive }) => {
          if (isActive) {
            await scheduleIfNeeded({
              force: false,
              showMessage: false,
              source: "app-active"
            });
          }
        }
      );
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [isLoaded, scheduleIfNeeded]);

  useEffect(() => {
    if (!isLoaded || !Capacitor.isNativePlatform() || !notificationsEnabled) return;

    let timeoutId = null;
    let intervalId = null;

    const scheduleDailyReconcile = () => {
      const delay = getMsUntilNextDailyReconcile();
      timeoutId = setTimeout(() => {
        scheduleIfNeeded({ force: false, showMessage: false, source: "daily" });
        intervalId = setInterval(() => {
          scheduleIfNeeded({ force: false, showMessage: false, source: "daily" });
        }, DAY_MS);
      }, delay);
    };

    scheduleDailyReconcile();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoaded, notificationsEnabled, scheduleIfNeeded]);

  const handleToggleNotifications = useCallback((enabled) => {
    setNotificationsEnabled(enabled);
  }, []);

  const handleGroupChange = useCallback((group) => {
    if (isSelectableGroupType(group)) {
      setUserGroup(group);
    }
  }, []);

  const handleLeadMinutesChange = useCallback((minutes) => {
    setLeadMinutes(sanitizeLeadMinutes(minutes));
  }, []);

  const handleTestNotification = useCallback(async () => {
    setStatusMessage("");
    try {
      const alarmStatus = await checkExactAlarmPermission();
      setExactAlarmStatus(alarmStatus);
      const result = await sendTestNotification({
        semesterStartDate,
        userGroup,
        scheduleData,
        leadMinutes
      });
      if (result.reason === "permission-denied") {
        setStatusMessage("请在系统设置中允许通知权限");
      } else if (result.reason === "unsupported") {
        setStatusMessage("通知仅支持 Android 设备");
      } else if (result.reason === "no-start-date") {
        setStatusMessage("请先设置开学日期");
      } else if (result.sent) {
        setStatusMessage(
          result.reason === "no-course"
            ? "测试通知已发送（无近期课程）"
            : "测试通知已发送"
        );
      }
    } catch (error) {
      console.error("发送测试通知失败:", error);
      setStatusMessage("测试通知发送失败");
    }
  }, [semesterStartDate, userGroup, scheduleData, leadMinutes]);

  const handleOpenExactAlarmSettings = useCallback(async () => {
    const status = await openExactAlarmPermissionSettings();
    setExactAlarmStatus(status);
    if (status === "granted") {
      await scheduleIfNeeded({
        force: true,
        showMessage: false,
        source: "settings-change"
      });
      setStatusMessage("已开启精确闹钟权限并重新同步提醒");
    } else if (status === "denied") {
      setStatusMessage("精确闹钟权限仍未开启");
    }
  }, [scheduleIfNeeded]);

  const reliabilityMode = useMemo(
    () => (exactAlarmStatus === "granted" ? "high" : "degraded"),
    [exactAlarmStatus]
  );

  return {
    notificationsEnabled,
    userGroup,
    leadMinutes,
    leadMinuteOptions: NOTIFICATION_LEAD_MINUTE_OPTIONS,
    statusMessage,
    exactAlarmStatus,
    reliabilityMode,
    exactAlarmMessage:
      EXACT_ALARM_MESSAGES[exactAlarmStatus] || EXACT_ALARM_MESSAGES.unknown,
    onToggleNotifications: handleToggleNotifications,
    onGroupChange: handleGroupChange,
    onLeadMinutesChange: handleLeadMinutesChange,
    onTestNotification: handleTestNotification,
    onOpenExactAlarmSettings: handleOpenExactAlarmSettings
  };
};
