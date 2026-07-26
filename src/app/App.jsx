import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

// 组件
import Header from "../components/layout/Header.jsx";
import BottomNavigation, { APP_TABS } from "../components/layout/BottomNavigation.jsx";
import ExamPage from "../components/exams/ExamPage.jsx";
import SettingsPage from "../components/settings/SettingsPage.jsx";
import CourseTable from "../components/schedule/CourseTable.jsx";
import CourseModal from "../components/schedule/CourseModal/CourseModal.jsx";
import Toast from "../components/layout/Toast.jsx";
import AppUpdateDialog from "../components/layout/AppUpdateDialog.jsx";

// Hooks
import { useSemesterDate } from "../hooks/semester/useSemesterDate.js";
import { useWeekSelector } from "../hooks/ui/useWeekSelector.js";
import { useNotifications } from "../hooks/notifications/useNotifications.js";
import { useDisplayMode } from "../hooks/ui/useDisplayMode.js";
import { useTheme } from "../hooks/ui/useTheme.js";
import { useMobileDetect } from "../hooks/ui/useMobileDetect.js";
import { useScheduleData } from "../hooks/schedule/useScheduleData.js";
import { useWeekSwipe } from "../hooks/ui/useWeekSwipe.js";
import { useNow } from "../hooks/ui/useNow.js";
import { useStatusBar } from "../hooks/ui/useStatusBar.js";
import { useWeekSwitchAnimation } from "../hooks/ui/useWeekSwitchAnimation.js";
import { useCurrentClassProgress } from "../hooks/schedule/useCurrentClassProgress.js";
import { useCourseMutations } from "../hooks/schedule/useCourseMutations.js";
import { useRemoteScheduleAutoCheck } from "../hooks/schedule/useRemoteScheduleAutoCheck.js";

// 数据和工具
import { mergeCellsByDay } from "../utils/schedule/courseUtils.js";
import { APP_VERSION } from "../config/constants.js";
import { checkForStartupUpdate } from "../services/app/startupUpdate.js";
import { openUpdateTarget } from "../services/app/updateOpener.js";

const App = () => {

  // 学期日期管理
  const {
    semesterStartDate,
    todayInfo,
    displayWeekInfo,
    handleStartDateChange
  } = useSemesterDate();

  // 周数选择管理
  const {
    currentWeek,
    setCurrentWeek,
    handleWeekChange,
    handlePreviousWeek,
    handleNextWeek
  } = useWeekSelector(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const closeModal = () => setIsModalOpen(false);

  // 课表数据（支持本地自定义）
  const {
    scheduleData,
    setScheduleData,
    scheduleSource,
    hasManualScheduleChanges,
    resetSchedule,
    isScheduleLoaded,
    softUpdateSchedule,
    confirmRemoteUpdate,
    cancelRemoteUpdate,
    pendingRemoteSnapshot,
    isCheckingRemote,
    remoteUpdatedAt,
    builtInUpdateNotice
  } = useScheduleData();

  const [activeTab, setActiveTab] = useState(APP_TABS.SCHEDULE);

  // 显示模式设置
  const { displayMode, onDisplayModeChange } = useDisplayMode();
  const { theme, onThemeChange } = useTheme();
  const isMobile = useMobileDetect();

  // 当前时间（用于进度条刷新），每分钟及回前台时刷新
  const now = useNow();

  const [appUpdate, setAppUpdate] = useState(null);
  const [scheduleUpdateToast, setScheduleUpdateToast] = useState({
    isOpen: false,
    message: ""
  });

  const showScheduleUpdateToast = (message) => {
    setScheduleUpdateToast((prev) =>
      prev.isOpen ? prev : { isOpen: true, message }
    );
  };

  useEffect(() => {
    if (!builtInUpdateNotice) return;
    showScheduleUpdateToast(builtInUpdateNotice);
  }, [builtInUpdateNotice]);

  // 通知设置
  const {
    notificationsEnabled,
    userGroup,
    selectedElectives,
    leadMinutes,
    leadMinuteOptions,
    statusMessage,
    onToggleNotifications,
    onGroupChange,
    onSelectedElectivesChange,
    onLeadMinutesChange,
    onTestNotification
  } = useNotifications(semesterStartDate, scheduleData);

  useStatusBar(theme);

  // 当显示周更新时，仅在首次加载时自动设置当前周
  const hasInitializedWeek = useRef(false);
  useEffect(() => {
    if (displayWeekInfo && !hasInitializedWeek.current) {
      setCurrentWeek(displayWeekInfo.week);
      hasInitializedWeek.current = true;
    }
  }, [displayWeekInfo, setCurrentWeek]);

  useEffect(() => {
    let cancelled = false;
    void checkForStartupUpdate({ currentVersion: APP_VERSION }).then((result) => {
      if (!cancelled && result?.shouldPrompt) setAppUpdate(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // 自动检测远端课表更新（仅前台可见时）
  useRemoteScheduleAutoCheck({
    enabled: isScheduleLoaded,
    softUpdateSchedule,
    hasPendingRemoteSnapshot: Boolean(pendingRemoteSnapshot),
    onUpdateAvailable: () =>
      showScheduleUpdateToast("检测到远端课表更新，可在设置中应用")
  });

  // 合并课程单元格：将同日连续课程合并，便于表格渲染
  const mergedCellsByDay = useMemo(
    () =>
      mergeCellsByDay(
        scheduleData,
        currentWeek,
        displayMode,
        userGroup,
        selectedElectives
      ),
    [scheduleData, currentWeek, displayMode, userGroup, selectedElectives]
  );

  const currentClassProgress = useCurrentClassProgress({
    now,
    todayInfo,
    scheduleData,
    userGroup,
    selectedElectives
  });

  const { handleAddCourse, handleUpdateCourse, handleDeleteCourse } =
    useCourseMutations(setScheduleData);

  // 处理开学日期变化
  const handleDateChange = async (date) => {
    const infos = await handleStartDateChange(date);
    if (infos?.displayWeekInfo) {
      // 手动修改开学日期后同步周次
      setCurrentWeek(infos.displayWeekInfo.week);
    }
  };

  const closeScheduleUpdateToast = () => {
    setScheduleUpdateToast((prev) =>
      prev.isOpen ? { ...prev, isOpen: false } : prev
    );
  };

  const weekSwipeEnabled =
    isMobile && activeTab === APP_TABS.SCHEDULE && !isModalOpen;
  const { handlers: weekSwipeHandlers, isSwipeLocked } = useWeekSwipe({
    enabled: weekSwipeEnabled,
    onSwipeLeft: handleNextWeek,
    onSwipeRight: handlePreviousWeek
  });

  const handleScheduleCellClick = (day, periodStart, periodEnd) => {
    if (!isScheduleLoaded || isSwipeLocked()) return;
    setSelectedCell({ day, periodStart, periodEnd });
    setIsModalOpen(true);
  };

  const weekSwitchControls = useWeekSwitchAnimation(currentWeek);

  return (
    <div className="min-h-screen bg-surface-low pt-[var(--safe-top)]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-surface-low sm:max-w-5xl">
        {activeTab === APP_TABS.SCHEDULE && (
          <section className="min-h-screen px-2 pb-24 pt-2 sm:px-4 sm:pt-4">
            <Header
              todayInfo={todayInfo}
              displayWeekInfo={displayWeekInfo}
              currentWeek={currentWeek}
              currentClassProgress={currentClassProgress}
              onWeekChange={handleWeekChange}
            />

            <div
              {...weekSwipeHandlers}
              className="overflow-x-hidden"
              style={weekSwipeEnabled ? { touchAction: "pan-y" } : undefined}
            >
              <motion.div
                initial={false}
                animate={weekSwitchControls}
                style={{ willChange: "transform, opacity" }}
              >
                <CourseTable
                  mergedCellsByDay={mergedCellsByDay}
                  semesterStartDate={semesterStartDate}
                  todayInfo={todayInfo}
                  currentWeek={currentWeek}
                  onCellClick={handleScheduleCellClick}
                  isScheduleLoaded={isScheduleLoaded}
                  theme={theme}
                />
              </motion.div>
            </div>
          </section>
        )}

        {activeTab === APP_TABS.EXAMS && (
          <ExamPage currentWeek={currentWeek} now={now} />
        )}

        {activeTab === APP_TABS.SETTINGS && (
          <SettingsPage
            semesterStartDate={semesterStartDate}
            onStartDateChange={handleDateChange}
            todayInfo={todayInfo}
            displayWeekInfo={displayWeekInfo}
            currentWeek={currentWeek}
            onSelectWeek={handleWeekChange}
            displayMode={displayMode}
            onDisplayModeChange={onDisplayModeChange}
            theme={theme}
            onThemeChange={onThemeChange}
            notifications={{
              enabled: notificationsEnabled,
              userGroup,
              selectedElectives,
              leadMinutes,
              leadMinuteOptions,
              statusMessage,
              onToggle: onToggleNotifications,
              onGroupChange,
              onSelectedElectivesChange,
              onLeadMinutesChange,
              onTest: onTestNotification
            }}
            remoteUpdate={{
              onSoftUpdate: softUpdateSchedule,
              onConfirm: confirmRemoteUpdate,
              onCancel: cancelRemoteUpdate,
              pendingSnapshot: pendingRemoteSnapshot,
              isUpdating: isCheckingRemote,
              updatedAt: remoteUpdatedAt
            }}
            scheduleSource={scheduleSource}
            hasManualScheduleChanges={hasManualScheduleChanges}
            onResetSchedule={resetSchedule}
          />
        )}
      </div>

      <CourseModal
        isOpen={isModalOpen}
        selectedCell={selectedCell}
        currentWeek={currentWeek}
        displayMode={displayMode}
        userGroup={userGroup}
        selectedElectives={selectedElectives}
        scheduleData={scheduleData}
        onAddCourse={handleAddCourse}
        onUpdateCourse={handleUpdateCourse}
        onDeleteCourse={handleDeleteCourse}
        onClose={closeModal}
      />

      <AppUpdateDialog
        isOpen={Boolean(appUpdate)}
        version={appUpdate?.latestVersion}
        notes={appUpdate?.releaseNotes}
        onLater={() => setAppUpdate(null)}
        onUpdate={() => {
          const target = appUpdate;
          setAppUpdate(null);
          void openUpdateTarget({
            apkUrl: target?.apkUrl,
            releaseUrl: target?.url
          });
        }}
      />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <Toast
        isOpen={scheduleUpdateToast.isOpen}
        message={scheduleUpdateToast.message}
        onClose={closeScheduleUpdateToast}
      />
    </div>
  );
};

export default App;
