import { useMemo, useEffect } from "react";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// 组件
import Header from "./src/Header";
import WeekSelector from "./src/WeekSelector";
import CourseTable from "./src/CourseTable";
import CourseModal from "./src/CourseModal";

// Hooks
import { useSemesterDate } from "./src/useSemesterDate";
import { useWeekSelector } from "./src/useWeekSelector";
import { useCourseModal } from "./src/useCourseModal";

// 数据和工具
import { scheduleData } from "./src/scheduleData";
import { mergeCellsByDay } from "./src/courseUtils";

const App = () => {

  // 学期日期管理
  const { semesterStartDate, todayInfo, handleStartDateChange } = useSemesterDate();

  // 周数选择管理
  const {
    currentWeek,
    showWeekSelector,
    setCurrentWeek,
    handleWeekChange,
    handleQuickSelectWeek,
    handlePreviousWeek,
    handleNextWeek,
    toggleWeekSelector,
    setShowWeekSelector
  } = useWeekSelector(1);

  // 课程模态框管理
  const { isModalOpen, selectedCell, handleCellClick, closeModal } = useCourseModal();

  // 配置移动端状态栏
  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#00000000' });
          await StatusBar.setOverlaysWebView({ overlay: true });
          await StatusBar.show();
        } catch (error) {
          console.error('状态栏配置失败:', error);
        }
      }
    };

    setupStatusBar();
  }, []);

  // 当 todayInfo 更新时，自动设置当前周
  useEffect(() => {
    if (todayInfo) {
      setCurrentWeek(todayInfo.week);
    }
  }, [todayInfo, setCurrentWeek]);

  // 合并课程单元格
  const mergedCellsByDay = useMemo(() => {
    return mergeCellsByDay(scheduleData, currentWeek);
  }, [currentWeek]);

  // 处理开学日期变化
  const handleDateChange = async (date) => {
    const info = await handleStartDateChange(date);
    if (info) {
      setCurrentWeek(info.week);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-2 sm:px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题和周数选择 */}
        <Header
          semesterStartDate={semesterStartDate}
          onStartDateChange={handleDateChange}
          todayInfo={todayInfo}
          currentWeek={currentWeek}
          onWeekChange={handleWeekChange}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
          onToggleWeekSelector={toggleWeekSelector}
        />

        {/* 周数快速选择器 */}
        <WeekSelector
          show={showWeekSelector}
          currentWeek={currentWeek}
          onSelectWeek={handleQuickSelectWeek}
          onClose={() => setShowWeekSelector(false)}
        />

        {/* 课表 */}
        <CourseTable
          mergedCellsByDay={mergedCellsByDay}
          todayInfo={todayInfo}
          currentWeek={currentWeek}
          onCellClick={handleCellClick}
        />

        {/* 课程详情模态框 */}
        <CourseModal
          isOpen={isModalOpen}
          selectedCell={selectedCell}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default App;
