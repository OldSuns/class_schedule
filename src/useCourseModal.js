import { useState, useCallback } from "react";

/**
 * 管理课程详情模态框的 Hook
 */
export const useCourseModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  // 处理单元格点击
  const handleCellClick = useCallback((day, periodStart, periodEnd, courses) => {
    setSelectedCell({ day, periodStart, periodEnd, courses });
    setIsModalOpen(true);
  }, []);

  // 关闭模态框
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return {
    isModalOpen,
    selectedCell,
    handleCellClick,
    closeModal
  };
};
