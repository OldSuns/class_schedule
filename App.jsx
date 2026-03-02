import { useMemo, useEffect, useState } from "react";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

// 组件
import Header from "./src/Header";
import SettingsMenu from "./src/SettingsMenu";
import CourseTable from "./src/CourseTable";
import CourseModal from "./src/CourseModal";

// Hooks
import { useSemesterDate } from "./src/useSemesterDate";
import { useWeekSelector } from "./src/useWeekSelector";
import { useCourseModal } from "./src/useCourseModal";
import { useNotifications } from "./src/useNotifications";
import { useDisplayMode } from "./src/useDisplayMode";

// 数据和工具
import { scheduleData } from "./src/scheduleData";
import { mergeCellsByDay } from "./src/courseUtils";
import { shouldNotifyForGroup } from "./src/groupUtils";
import {
  getCurrentPeriod,
  getPeriodLabel,
  getPeriodRangeMinutes
} from "./src/timeUtils";

const App = () => {

  // 学期日期管理
  const { semesterStartDate, todayInfo, handleStartDateChange } = useSemesterDate();

  // 周数选择管理
  const {
    currentWeek,
    setCurrentWeek,
    handleWeekChange,
    handleQuickSelectWeek,
    handlePreviousWeek,
    handleNextWeek
  } = useWeekSelector(1);

  // 课程模态框管理
  const { isModalOpen, selectedCell, handleCellClick, closeModal } = useCourseModal();

  // 设置菜单状态
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // 显示模式设置
  const { displayMode, onDisplayModeChange } = useDisplayMode();

  // 当前时间（用于进度条刷新）
  const [now, setNow] = useState(() => new Date());

  // 通知设置
  const {
    notificationsEnabled,
    userGroup,
    statusMessage,
    exactAlarmStatus,
    exactAlarmMessage,
    onToggleNotifications,
    onGroupChange,
    onTestNotification,
    onOpenExactAlarmSettings
  } = useNotifications(semesterStartDate);

  // 配置移动端状态栏
  useEffect(() => {
    const setupStatusBar = async () => {
      // 仅原生端启用透明叠加的状态栏
      if (Capacitor.isNativePlatform()) {
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setOverlaysWebView({ overlay: true });
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: '#EFF6FF' });
            const info = await StatusBar.getInfo();
            const height = Number(info?.height);
            if (Number.isFinite(height) && height > 0) {
              document.documentElement.style.setProperty(
                "--android-statusbar",
                `${height}px`
              );
            } else {
              document.documentElement.style.setProperty(
                "--android-statusbar",
                "0px"
              );
            }
          }
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
      // 进入应用时跳转到今天所在的周次
      setCurrentWeek(todayInfo.week);
    }
  }, [todayInfo, setCurrentWeek]);

  // 每分钟刷新一次当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 合并课程单元格
  const mergedCellsByDay = useMemo(() => {
    // 将同日连续课程合并，便于表格渲染
    return mergeCellsByDay(scheduleData, currentWeek, displayMode, userGroup);
  }, [currentWeek, displayMode, userGroup]);

  const currentClassProgress = useMemo(() => {
    if (!todayInfo) return null;
    const period = getCurrentPeriod(now);
    if (!period) return null;

    const dayData = scheduleData.find((day) => day.day === todayInfo.day);
    const periodData = dayData?.periods.find((item) => item.period === period);
    const courses = (periodData?.courses ?? []).filter(
      (course) =>
        Array.isArray(course.weeks) &&
        course.weeks.includes(todayInfo.week) &&
        shouldNotifyForGroup(course.group, userGroup)
    );

    if (courses.length === 0) return null;

    const range = getPeriodRangeMinutes(period);
    if (!range) return null;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const duration = Math.max(1, range.endMin - range.startMin);
    const elapsed = Math.min(Math.max(nowMinutes - range.startMin, 0), duration);
    const remaining = Math.max(range.endMin - nowMinutes, 0);
    const percent = Math.min(
      100,
      Math.max(0, Math.round((elapsed / duration) * 100))
    );

    const labels = courses.map((course) =>
      course.group ? `${course.name}(${course.group})` : course.name
    );
    let courseLabel = labels[0];
    if (labels.length === 2) {
      courseLabel = `${labels[0]} / ${labels[1]}`;
    } else if (labels.length > 2) {
      courseLabel = `${labels[0]} 等`;
    }

    return {
      period,
      periodLabel: getPeriodLabel(period),
      courseLabel,
      elapsedMinutes: elapsed,
      remainingMinutes: remaining,
      percent
    };
  }, [now, todayInfo, userGroup]);

  // 处理开学日期变化
  const handleDateChange = async (date) => {
    const info = await handleStartDateChange(date);
    if (info) {
      // 手动修改开学日期后同步周次
      setCurrentWeek(info.week);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-2 sm:px-4 pt-[var(--safe-top)] pb-[var(--safe-bottom)]">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题和菜单按钮 */}
        <Header
          todayInfo={todayInfo}
          currentWeek={currentWeek}
          currentClassProgress={currentClassProgress}
          onOpenMenu={() => setIsSettingsMenuOpen(true)}
          onWeekChange={handleWeekChange}
          onPreviousWeek={handlePreviousWeek}
          onNextWeek={handleNextWeek}
        />

        {/* 设置菜单 */}
        <SettingsMenu
          isOpen={isSettingsMenuOpen}
          onClose={() => setIsSettingsMenuOpen(false)}
          semesterStartDate={semesterStartDate}
          onStartDateChange={handleDateChange}
          todayInfo={todayInfo}
          currentWeek={currentWeek}
          onSelectWeek={handleQuickSelectWeek}
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={onToggleNotifications}
          userGroup={userGroup}
          onGroupChange={onGroupChange}
          onTestNotification={onTestNotification}
          notificationStatus={statusMessage}
          exactAlarmStatus={exactAlarmStatus}
          exactAlarmMessage={exactAlarmMessage}
          onOpenExactAlarmSettings={onOpenExactAlarmSettings}
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
          currentWeek={currentWeek}
          onClose={closeModal}
        />
      </div>
    </div>
  );
};

export default App;
