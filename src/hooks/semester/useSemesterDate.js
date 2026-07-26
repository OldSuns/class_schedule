import { useState, useEffect, useCallback, useRef } from "react";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import * as storage from "../../../storage";
import { calculateDisplayTodayInfo, calculateTodayInfo } from "../../utils/schedule/timeUtils";
import { DEFAULT_SEMESTER_START_DATE, STORAGE_KEYS } from "../../config/constants";
import { refreshWidget } from "../../services/platform/widgetBridge";

const DAY_MS = 24 * 60 * 60 * 1000;

const getDateInfos = (date) => ({
  todayInfo: date ? calculateTodayInfo(date) : null,
  displayWeekInfo: date ? calculateDisplayTodayInfo(date) : null
});

/**
 * 管理学期开始日期和今天信息的 Hook
 */
export const useSemesterDate = () => {
  const initialDate =
    storage.getItemSync(STORAGE_KEYS.SEMESTER_START_DATE) ||
    DEFAULT_SEMESTER_START_DATE;
  const [semesterStartDate, setSemesterStartDate] = useState(initialDate);
  const [todayInfo, setTodayInfo] = useState(() => getDateInfos(initialDate).todayInfo);
  const [displayWeekInfo, setDisplayWeekInfo] = useState(
    () => getDateInfos(initialDate).displayWeekInfo
  );
  const hasUserChangedDateRef = useRef(false);

  // 初始化时计算今天的信息
  useEffect(() => {
    let cancelled = false;

    const loadSavedDate = async () => {
      const savedDate = await storage.getItem(STORAGE_KEYS.SEMESTER_START_DATE);
      if (cancelled || hasUserChangedDateRef.current) return;

      if (savedDate) {
        setSemesterStartDate(savedDate);
        const infos = getDateInfos(savedDate);
        setTodayInfo(infos.todayInfo);
        setDisplayWeekInfo(infos.displayWeekInfo);
      } else if (DEFAULT_SEMESTER_START_DATE) {
        setSemesterStartDate(DEFAULT_SEMESTER_START_DATE);
        const infos = getDateInfos(DEFAULT_SEMESTER_START_DATE);
        setTodayInfo(infos.todayInfo);
        setDisplayWeekInfo(infos.displayWeekInfo);
        await storage.setItem(
          STORAGE_KEYS.SEMESTER_START_DATE,
          DEFAULT_SEMESTER_START_DATE
        );
      }
    };

    loadSavedDate();

    return () => {
      cancelled = true;
    };
  }, []);

  // 跨天后自动刷新“今天”信息，避免长时间不重启导致日期过期
  useEffect(() => {
    if (!semesterStartDate) {
      setTodayInfo(null);
      setDisplayWeekInfo(null);
      return;
    }

    const updateTodayInfo = () => {
      const infos = getDateInfos(semesterStartDate);
      setTodayInfo(infos.todayInfo);
      setDisplayWeekInfo(infos.displayWeekInfo);
    };

    updateTodayInfo();

    let timeoutId = null;
    let intervalId = null;
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delay = Math.max(1000, nextMidnight.getTime() - now.getTime());

    timeoutId = setTimeout(() => {
      updateTodayInfo();
      intervalId = setInterval(updateTodayInfo, DAY_MS);
    }, delay);

    return () => {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
      }
      if (intervalId != null) {
        clearInterval(intervalId);
      }
    };
  }, [semesterStartDate]);

  // 前台恢复时刷新今天信息，避免跨天后状态过期
  useEffect(() => {
    if (!semesterStartDate) return;

    const refreshTodayInfo = () => {
      const infos = getDateInfos(semesterStartDate);
      setTodayInfo(infos.todayInfo);
      setDisplayWeekInfo(infos.displayWeekInfo);
    };

    let listenerHandle = null;
    const setupListener = async () => {
      if (Capacitor.isNativePlatform()) {
        listenerHandle = await App.addListener(
          "appStateChange",
          ({ isActive }) => {
            if (isActive) {
              refreshTodayInfo();
            }
          }
        );
      }
    };

    setupListener();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshTodayInfo();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [semesterStartDate]);

  // 处理开学日期变化
  const handleStartDateChange = useCallback(async (date) => {
    hasUserChangedDateRef.current = true;
    setSemesterStartDate(date);

    if (date) {
      await storage.setItem(STORAGE_KEYS.SEMESTER_START_DATE, date);
      const infos = getDateInfos(date);
      setTodayInfo(infos.todayInfo);
      setDisplayWeekInfo(infos.displayWeekInfo);
      await refreshWidget();
      return infos;
    } else {
      await storage.removeItem(STORAGE_KEYS.SEMESTER_START_DATE);
      setTodayInfo(null);
      setDisplayWeekInfo(null);
      await refreshWidget();
      return { todayInfo: null, displayWeekInfo: null };
    }
  }, []);

  return {
    semesterStartDate,
    todayInfo,
    displayWeekInfo,
    handleStartDateChange
  };
};
