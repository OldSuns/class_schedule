import { useState, useEffect, useCallback } from "react";
import * as storage from "../storage";
import { calculateTodayInfo } from "./timeUtils";
import { DEFAULT_SEMESTER_START_DATE, STORAGE_KEYS } from "./constants";

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

  // 初始化时计算今天的信息
  useEffect(() => {
    const loadSavedDate = async () => {
      const savedDate = await storage.getItem(STORAGE_KEYS.SEMESTER_START_DATE);
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
  }, []);

  // 处理开学日期变化
  const handleStartDateChange = useCallback(async (date) => {
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
