import { useState, useCallback } from "react";
import { MIN_WEEK, MAX_WEEK } from "../../config/constants";

/**
 * 管理周数选择的 Hook
 */
export const useWeekSelector = (initialWeek = 1) => {
  const [currentWeek, setCurrentWeek] = useState(initialWeek);

  // 处理周数变化
  const handleWeekChange = useCallback((week) => {
    const weekNum = typeof week === "number" ? week : parseInt(week, 10);
    if (weekNum >= MIN_WEEK && weekNum <= MAX_WEEK) {
      setCurrentWeek(weekNum);
    }
  }, []);

  // 上一周
  const handlePreviousWeek = useCallback(() => {
    setCurrentWeek((prevWeek) =>
      prevWeek > MIN_WEEK ? prevWeek - 1 : prevWeek
    );
  }, []);

  // 下一周
  const handleNextWeek = useCallback(() => {
    setCurrentWeek((prevWeek) =>
      prevWeek < MAX_WEEK ? prevWeek + 1 : prevWeek
    );
  }, []);

  return {
    currentWeek,
    setCurrentWeek,
    handleWeekChange,
    handlePreviousWeek,
    handleNextWeek
  };
};
