import { useCallback, useEffect, useRef, useState } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import * as storage from "../storage";
import { STORAGE_KEYS } from "./constants";
import { GROUP_TYPES } from "./groupUtils";
import {
  cancelAllScheduledNotifications,
  checkExactAlarmPermission,
  openExactAlarmPermissionSettings,
  scheduleCourseNotifications,
  sendTestNotification
} from "./notificationScheduler";

// 12 小时内不重复排程，避免频繁写入
const RESCHEDULE_INTERVAL_MS = 12 * 60 * 60 * 1000;
const EXACT_ALARM_MESSAGES = {
  granted: "精确闹钟权限：已开启",
  denied: "精确闹钟权限未开启，提醒可能延迟",
  unknown: "精确闹钟权限状态未知",
  unsupported: "精确闹钟权限仅限 Android 12+"
};

export const useNotifications = (semesterStartDate) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [userGroup, setUserGroup] = useState(GROUP_TYPES.A);
  const [statusMessage, setStatusMessage] = useState("");
  const [exactAlarmStatus, setExactAlarmStatus] = useState("unknown");
  const [isLoaded, setIsLoaded] = useState(false);
  const schedulingRef = useRef(false);
  const initialRunRef = useRef(true);

  useEffect(() => {
    const loadSettings = async () => {
      const savedEnabled = await storage.getItem(
        STORAGE_KEYS.NOTIFICATIONS_ENABLED
      );
      const savedGroup = await storage.getItem(STORAGE_KEYS.USER_GROUP);

      if (savedEnabled != null) {
        setNotificationsEnabled(savedEnabled === "true");
      }
      if (savedGroup === GROUP_TYPES.A || savedGroup === GROUP_TYPES.B) {
        setUserGroup(savedGroup);
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

  const scheduleIfNeeded = useCallback(
    async ({ force = false, showMessage = false } = {}) => {
      if (schedulingRef.current) return;
      // 避免并发排程，确保一次只跑一个任务
      schedulingRef.current = true;
      try {
        if (!notificationsEnabled) {
          await cancelAllScheduledNotifications();
          if (showMessage) {
            setStatusMessage("已关闭课程提醒");
          }
          return;
        }

        if (!semesterStartDate) {
          await cancelAllScheduledNotifications();
          if (showMessage) {
            setStatusMessage("请先设置开学日期");
          }
          return;
        }

        const alarmStatus = await checkExactAlarmPermission();
        setExactAlarmStatus(alarmStatus);

        if (!force) {
          // 非强制模式下，按时间窗口决定是否需要重新排程
          const lastScheduled = await storage.getItem(
            STORAGE_KEYS.NOTIFICATIONS_LAST_SCHEDULED_AT
          );
          if (lastScheduled) {
            const lastTime = Number(lastScheduled);
            if (!Number.isNaN(lastTime)) {
              const diff = Date.now() - lastTime;
              if (diff < RESCHEDULE_INTERVAL_MS) return;
            }
          }
        }

        const result = await scheduleCourseNotifications({
          semesterStartDate,
          userGroup
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

        await storage.setItem(
          STORAGE_KEYS.NOTIFICATIONS_LAST_SCHEDULED_AT,
          String(Date.now())
        );

        if (showMessage) {
          setStatusMessage(`已排程 ${result.scheduled} 条提醒`);
        }
      } catch (error) {
        console.error("通知排程失败:", error);
        if (showMessage) {
          setStatusMessage("通知排程失败，请稍后重试");
        }
      } finally {
        schedulingRef.current = false;
      }
    },
    [notificationsEnabled, semesterStartDate, userGroup]
  );

  useEffect(() => {
    if (!isLoaded) return;

    const showMessage = !initialRunRef.current;
    if (initialRunRef.current) {
      initialRunRef.current = false;
    }
    scheduleIfNeeded({ force: true, showMessage });
  }, [isLoaded, notificationsEnabled, semesterStartDate, userGroup, scheduleIfNeeded]);

  useEffect(() => {
    if (!isLoaded || !Capacitor.isNativePlatform()) return;

    let listenerHandle = null;
    const setupListener = async () => {
      listenerHandle = await App.addListener(
        "appStateChange",
        async ({ isActive }) => {
          if (isActive) {
            // 回到前台时补齐近期通知
            await scheduleIfNeeded({ force: false, showMessage: false });
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

  const handleToggleNotifications = useCallback(
    (enabled) => {
      setNotificationsEnabled(enabled);
    },
    []
  );

  const handleGroupChange = useCallback((group) => {
    if (group === GROUP_TYPES.A || group === GROUP_TYPES.B) {
      setUserGroup(group);
    }
  }, []);

  const handleTestNotification = useCallback(async () => {
    setStatusMessage("");
    try {
      const alarmStatus = await checkExactAlarmPermission();
      setExactAlarmStatus(alarmStatus);
      const result = await sendTestNotification({
        semesterStartDate,
        userGroup
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
  }, [semesterStartDate, userGroup]);

  const handleOpenExactAlarmSettings = useCallback(async () => {
    const status = await openExactAlarmPermissionSettings();
    setExactAlarmStatus(status);
    if (status === "granted") {
      setStatusMessage("已开启精确闹钟权限");
    } else if (status === "denied") {
      setStatusMessage("精确闹钟权限仍未开启");
    }
  }, []);

  return {
    notificationsEnabled,
    userGroup,
    statusMessage,
    exactAlarmStatus,
    exactAlarmMessage:
      EXACT_ALARM_MESSAGES[exactAlarmStatus] || EXACT_ALARM_MESSAGES.unknown,
    onToggleNotifications: handleToggleNotifications,
    onGroupChange: handleGroupChange,
    onTestNotification: handleTestNotification,
    onOpenExactAlarmSettings: handleOpenExactAlarmSettings
  };
};
