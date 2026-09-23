import { useEffect, useState } from "react";
import { DEFAULT_SEMESTER_START_DATE } from "../../config/constants";
import {
  calculateDisplayTodayInfo,
  calculateTodayInfo
} from "../../utils/schedule/timeUtils";

const getDateInfos = () => ({
  todayInfo: calculateTodayInfo(DEFAULT_SEMESTER_START_DATE),
  displayWeekInfo: calculateDisplayTodayInfo(DEFAULT_SEMESTER_START_DATE)
});

export const useSemesterDate = () => {
  const [dateInfos, setDateInfos] = useState(getDateInfos);

  useEffect(() => {
    const refresh = () => setDateInfos(getDateInfos());
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    let intervalId = null;
    const timeoutId = setTimeout(() => {
      refresh();
      intervalId = setInterval(refresh, 24 * 60 * 60 * 1000);
    }, Math.max(1000, nextMidnight.getTime() - now.getTime()));

    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId != null) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return {
    semesterStartDate: DEFAULT_SEMESTER_START_DATE,
    todayInfo: dateInfos.todayInfo,
    displayWeekInfo: dateInfos.displayWeekInfo
  };
};
