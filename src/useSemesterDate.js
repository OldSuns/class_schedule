import { useState, useEffect, useCallback, useRef } from "react";
import * as storage from "../storage";
import { calculateTodayInfo } from "./timeUtils";
import { DEFAULT_SEMESTER_START_DATE, STORAGE_KEYS } from "./constants";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 管理学期开始日期和今天信息的 Hook
 */
export const useSemesterDate = () => {
  const initialDate =
    storage.getItemSync(STORAGE_KEYS.SEMESTER_START_DATE) ||
    DEFAULT_SEMESTER_START_DATE;
  const [semesterStartDate, setSemesterStartDate] = useState(initialDate);
  const [todayInfo, setTodayInfo] = useState(() =>
    initialDate ? calculateTodayInfo(initialDate) : null
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
        const info = calculateTodayInfo(savedDate);
        setTodayInfo(info);
      } else if (DEFAULT_SEMESTER_START_DATE) {
        setSemesterStartDate(DEFAULT_SEMESTER_START_DATE);
        const info = calculateTodayInfo(DEFAULT_SEMESTER_START_DATE);
        setTodayInfo(info);
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
      return;
    }

    const updateTodayInfo = () => {
      setTodayInfo(calculateTodayInfo(semesterStartDate));
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

  // 处理开学日期变化
  const handleStartDateChange = useCallback(async (date) => {
    hasUserChangedDateRef.current = true;
    setSemesterStartDate(date);

    if (date) {
      await storage.setItem(STORAGE_KEYS.SEMESTER_START_DATE, date);
      const info = calculateTodayInfo(date);
      setTodayInfo(info);
      return info;
    } else {
      await storage.removeItem(STORAGE_KEYS.SEMESTER_START_DATE);
      setTodayInfo(null);
      return null;
    }
  }, []);

  return {
    semesterStartDate,
    todayInfo,
    handleStartDateChange
  };
};
