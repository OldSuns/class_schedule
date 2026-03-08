import { useState, useCallback } from "react";
import { MIN_WEEK, MAX_WEEK } from "./constants";

/**
 * 管理周数选择的 Hook
 */
export const useWeekSelector = (initialWeek = 1) => {
  const [currentWeek, setCurrentWeek] = useState(initialWeek);
  const [showWeekSelector, setShowWeekSelector] = useState(false);

  // 处理周数变化
  const handleWeekChange = useCallback((week) => {
    const weekNum = typeof week === "number" ? week : parseInt(week, 10);
    if (weekNum >= MIN_WEEK && weekNum <= MAX_WEEK) {
      setCurrentWeek(weekNum);
    }
  }, []);

  // 快速选择周数
  const handleQuickSelectWeek = useCallback((week) => {
    setCurrentWeek(week);
    setShowWeekSelector(false);
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

  // 切换周数选择器显示
  const toggleWeekSelector = useCallback(() => {
    setShowWeekSelector(prev => !prev);
  }, []);

  return {
    currentWeek,
    showWeekSelector,
    setCurrentWeek,
    handleWeekChange,
    handleQuickSelectWeek,
    handlePreviousWeek,
    handleNextWeek,
    toggleWeekSelector,
    setShowWeekSelector
  };
};
