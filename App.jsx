import { useMemo, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from "@capacitor/app";

// 组件
import Header from "./src/Header";
import SettingsMenu from "./src/SettingsMenu";
import CourseTable from "./src/CourseTable";
import CourseModal from "./src/CourseModal";
import Toast from "./src/Toast";

// Hooks
import { useSemesterDate } from "./src/useSemesterDate";
import { useWeekSelector } from "./src/useWeekSelector";
import { useCourseModal } from "./src/useCourseModal";
import { useNotifications } from "./src/useNotifications";
import { useDisplayMode } from "./src/useDisplayMode";
import { useMobileDetect } from "./src/useMobileDetect";
import { useScheduleData } from "./src/useScheduleData";
import { useWeekSwipe } from "./src/useWeekSwipe";

// 数据和工具
import { mergeCellsByDay } from "./src/courseUtils";
import { shouldNotifyForGroup } from "./src/groupUtils";
import { buildCourseIdentity, cloneSchedule } from "./src/scheduleUtils";
import {
  getCurrentPeriod,
  getPeriodLabel,
  getPeriodRangeMinutes
} from "./src/timeUtils";
import { checkForUpdates } from "./src/updateChecker";
import { APP_VERSION, STORAGE_KEYS } from "./src/constants";
import { getItem, setItem } from "./storage";

const UPDATE_CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;
const REMOTE_SCHEDULE_CHECK_INTERVAL_MS = 8 * 60 * 60 * 1000;
const REMOTE_SCHEDULE_FOREGROUND_CHECK_INTERVAL_MS = 10 * 60 * 1000;
const REMOTE_SCHEDULE_ERROR_RETRY_INTERVAL_MS = 3 * 60 * 1000;
const WEEK_SWITCH_OFFSET_PX = 12;
const WEEK_SWITCH_TRANSITION = {
  duration: 0.16,
  ease: [0.22, 1, 0.36, 1]
};

const isFiniteTimestamp = (value) => Number.isFinite(value) && value > 0;

const hasElapsed = (lastAt, intervalMs, now = Date.now()) =>
  !isFiniteTimestamp(lastAt) || now - lastAt >= intervalMs;

const isRemoteCheckSuccessful = (status) =>
  status && status !== "error" && status !== "busy";

const getTodayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

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

  // 课表数据（支持本地自定义）
  const {
    scheduleData,
    setScheduleData,
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

  // 设置菜单状态
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);

  // 显示模式设置
  const { displayMode, onDisplayModeChange } = useDisplayMode();
  const isMobile = useMobileDetect();

  // 当前时间（用于进度条刷新）
  const [now, setNow] = useState(() => new Date());

  const [updateToast, setUpdateToast] = useState({ isOpen: false, message: "" });
  const [scheduleUpdateToast, setScheduleUpdateToast] = useState({
    isOpen: false,
    message: ""
  });
  const previousWeekRef = useRef(currentWeek);
  const weekSwitchControls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!builtInUpdateNotice) return;
    setScheduleUpdateToast((prev) =>
      prev.isOpen
        ? prev
        : { isOpen: true, message: builtInUpdateNotice }
    );
  }, [builtInUpdateNotice]);

  // 通知设置
  const {
    notificationsEnabled,
    userGroup,
    leadMinutes,
    leadMinuteOptions,
    statusMessage,
    exactAlarmStatus,
    reliabilityMode,
    exactAlarmMessage,
    onToggleNotifications,
    onGroupChange,
    onLeadMinutesChange,
    onTestNotification,
    onOpenExactAlarmSettings
  } = useNotifications(semesterStartDate, scheduleData);

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

  // 前台恢复时刷新当前时间，避免后台暂停导致进度条不更新
  useEffect(() => {
    const refreshNow = () => {
      setNow(new Date());
    };

    let listenerHandle = null;
    const setupListener = async () => {
      if (Capacitor.isNativePlatform()) {
        listenerHandle = await CapacitorApp.addListener(
          "appStateChange",
          ({ isActive }) => {
            if (isActive) {
              refreshNow();
            }
          }
        );
      }
    };

    setupListener();

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  // 每分钟刷新一次当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let inFlight = false;

    const checkUpdates = async () => {
      if (inFlight) return;
      inFlight = true;
      const today = getTodayKey();
      const lastCheck = await getItem(STORAGE_KEYS.UPDATE_LAST_CHECK_DATE);
      if (lastCheck === today) {
        inFlight = false;
        return;
      }

      const result = await checkForUpdates(APP_VERSION);
      await setItem(STORAGE_KEYS.UPDATE_LAST_CHECK_DATE, today);

      if (!cancelled && result?.status === "update") {
        const lastToast = await getItem(STORAGE_KEYS.UPDATE_LAST_TOAST_DATE);
        if (lastToast !== today) {
          const versionLabel = result.latestVersion ? ` v${result.latestVersion}` : "";
          setUpdateToast({
            isOpen: true,
            message: `发现新版本${versionLabel}`
          });
          await setItem(STORAGE_KEYS.UPDATE_LAST_TOAST_DATE, today);
        }
      }

      inFlight = false;
    };

    checkUpdates();
    const timer = setInterval(checkUpdates, UPDATE_CHECK_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // 自动检测远端课表更新（仅前台可见时）
  useEffect(() => {
    if (!isScheduleLoaded) return;

    let cancelled = false;
    let inFlight = false;
    let appIsActive = true;

    const isVisible = () => {
      if (Capacitor.isNativePlatform()) {
        return appIsActive;
      }
      return document.visibilityState === "visible";
    };

    const shouldCheck = async (reason) => {
      if (reason === "startup") {
        return true;
      }

      const now = Date.now();
      const [
        lastCheckRaw,
        lastForegroundCheckRaw,
        lastErrorRaw
      ] = await Promise.all([
        getItem(STORAGE_KEYS.REMOTE_LAST_CHECK_AT),
        getItem(STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT),
        getItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT)
      ]);

      const lastCheck = Number(lastCheckRaw);
      const lastForegroundCheck = Number(lastForegroundCheckRaw);
      const lastError = Number(lastErrorRaw);

      if (!hasElapsed(lastError, REMOTE_SCHEDULE_ERROR_RETRY_INTERVAL_MS, now)) {
        return false;
      }

      if (reason === "foreground") {
        return hasElapsed(
          lastForegroundCheck,
          REMOTE_SCHEDULE_FOREGROUND_CHECK_INTERVAL_MS,
          now
        );
      }

      return hasElapsed(lastCheck, REMOTE_SCHEDULE_CHECK_INTERVAL_MS, now);
    };

    const persistCheckState = async (result, reason) => {
      const status = result?.status || "";
      const now = String(Date.now());

      if (isRemoteCheckSuccessful(status)) {
        const writes = [
          setItem(STORAGE_KEYS.REMOTE_LAST_CHECK_AT, now),
          setItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT, "")
        ];
        if (reason === "foreground") {
          writes.push(
            setItem(STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT, now)
          );
        }
        await Promise.all(writes);
        return;
      }

      if (status === "error") {
        await setItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT, now);
      }
    };

    const checkRemoteSchedule = async (reason = "interval") => {
      if (cancelled || inFlight) return;
      if (!isVisible()) return;

      inFlight = true;
      try {
        const ok = await shouldCheck(reason);
        if (!ok) return;
        const result = await softUpdateSchedule();
        await persistCheckState(result, reason);
        if (!cancelled && result?.status === "update-available") {
          setScheduleUpdateToast({
            isOpen: true,
            message: "检测到远端课表更新，可在设置中应用"
          });
        }
      } finally {
        inFlight = false;
      }
    };

    checkRemoteSchedule("startup");
    const timer = setInterval(
      () => checkRemoteSchedule("interval"),
      REMOTE_SCHEDULE_CHECK_INTERVAL_MS
    );

    let listenerHandle = null;
    const setupListener = async () => {
      if (Capacitor.isNativePlatform()) {
        listenerHandle = await CapacitorApp.addListener(
          "appStateChange",
          ({ isActive }) => {
            appIsActive = isActive;
            if (isActive) {
              checkRemoteSchedule("foreground");
            }
          }
        );
      }
    };

    setupListener();

    let handleVisibility = null;
    if (!Capacitor.isNativePlatform()) {
      handleVisibility = () => {
        if (document.visibilityState === "visible") {
          checkRemoteSchedule("foreground");
        }
      };
      document.addEventListener("visibilitychange", handleVisibility);
    }

    return () => {
      cancelled = true;
      clearInterval(timer);
      if (listenerHandle) {
        listenerHandle.remove();
      }
      if (handleVisibility) {
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, [isScheduleLoaded, softUpdateSchedule]);

  // 合并课程单元格
  const mergedCellsByDay = useMemo(() => {
    // 将同日连续课程合并，便于表格渲染
    return mergeCellsByDay(scheduleData, currentWeek, displayMode, userGroup);
  }, [scheduleData, currentWeek, displayMode, userGroup]);

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
  }, [now, todayInfo, userGroup, scheduleData]);

  const updateSchedule = (mutate) => {
    setScheduleData((prev) => {
      const next = cloneSchedule(prev);
      mutate(next);
      return next;
    });
  };

  const normalizePeriods = (periods) =>
    Array.from(new Set(Array.isArray(periods) ? periods : [])).sort((a, b) => a - b);

  const handleAddCourse = (day, periods, course) => {
    const targets = normalizePeriods(periods);
    if (targets.length === 0) return;
    updateSchedule((next) => {
      const dayEntry = next.find((entry) => entry.day === day);
      if (!dayEntry) return;
      for (const period of targets) {
        const periodEntry = dayEntry.periods.find((entry) => entry.period === period);
        if (!periodEntry) continue;
        periodEntry.courses = [...periodEntry.courses, course];
      }
    });
  };

  const handleUpdateCourse = (day, periods, courseId, course) => {
    const targets = normalizePeriods(periods);
    if (targets.length === 0) return;
    updateSchedule((next) => {
      const dayEntry = next.find((entry) => entry.day === day);
      if (!dayEntry) return;
      for (const period of targets) {
        const periodEntry = dayEntry.periods.find((entry) => entry.period === period);
        if (!periodEntry) continue;
        periodEntry.courses = periodEntry.courses.map((item) =>
          buildCourseIdentity(item) === courseId ? course : item
        );
      }
    });
  };

  const handleDeleteCourse = (day, periods, courseId) => {
    const targets = normalizePeriods(periods);
    if (targets.length === 0) return;
    updateSchedule((next) => {
      const dayEntry = next.find((entry) => entry.day === day);
      if (!dayEntry) return;
      for (const period of targets) {
        const periodEntry = dayEntry.periods.find((entry) => entry.period === period);
        if (!periodEntry) continue;
        periodEntry.courses = periodEntry.courses.filter(
          (item) => buildCourseIdentity(item) !== courseId
        );
      }
    });
  };

  // 处理开学日期变化
  const handleDateChange = async (date) => {
    const info = await handleStartDateChange(date);
    if (info) {
      // 手动修改开学日期后同步周次
      setCurrentWeek(info.week);
    }
  };

  const closeUpdateToast = () => {
    setUpdateToast((prev) => (prev.isOpen ? { ...prev, isOpen: false } : prev));
  };

  const closeScheduleUpdateToast = () => {
    setScheduleUpdateToast((prev) =>
      prev.isOpen ? { ...prev, isOpen: false } : prev
    );
  };

  const weekSwipeEnabled = isMobile && !isSettingsMenuOpen && !isModalOpen;
  const { handlers: weekSwipeHandlers, isSwipeLocked } = useWeekSwipe({
    enabled: weekSwipeEnabled,
    onSwipeLeft: handleNextWeek,
    onSwipeRight: handlePreviousWeek
  });

  const handleScheduleCellClick = (day, periodStart, periodEnd) => {
    if (!isScheduleLoaded || isSwipeLocked()) return;
    handleCellClick(day, periodStart, periodEnd);
  };

  useEffect(() => {
    const previousWeek = previousWeekRef.current;
    if (previousWeek === currentWeek) {
      weekSwitchControls.set({ opacity: 1, x: 0 });
      return;
    }

    previousWeekRef.current = currentWeek;

    if (prefersReducedMotion) {
      weekSwitchControls.set({ opacity: 1, x: 0 });
      return;
    }

    const direction = currentWeek > previousWeek ? 1 : -1;
    weekSwitchControls.set({
      opacity: 0.96,
      x: direction > 0 ? WEEK_SWITCH_OFFSET_PX : -WEEK_SWITCH_OFFSET_PX
    });

    const animationFrame = window.requestAnimationFrame(() => {
      weekSwitchControls.start({
        opacity: 1,
        x: 0,
        transition: WEEK_SWITCH_TRANSITION
      });
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [currentWeek, prefersReducedMotion, weekSwitchControls]);

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
          leadMinutes={leadMinutes}
          leadMinuteOptions={leadMinuteOptions}
          onLeadMinutesChange={onLeadMinutesChange}
          onTestNotification={onTestNotification}
          notificationStatus={statusMessage}
          exactAlarmStatus={exactAlarmStatus}
          reliabilityMode={reliabilityMode}
          exactAlarmMessage={exactAlarmMessage}
          onOpenExactAlarmSettings={onOpenExactAlarmSettings}
          onSoftUpdateSchedule={softUpdateSchedule}
          onConfirmRemoteUpdate={confirmRemoteUpdate}
          onCancelRemoteUpdate={cancelRemoteUpdate}
          pendingRemoteSnapshot={pendingRemoteSnapshot}
          isSoftUpdating={isCheckingRemote}
          remoteUpdatedAt={remoteUpdatedAt}
          onResetSchedule={resetSchedule}
        />

        {/* 课表 */}
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
              todayInfo={todayInfo}
              currentWeek={currentWeek}
              onCellClick={handleScheduleCellClick}
              isScheduleLoaded={isScheduleLoaded}
            />
          </motion.div>
        </div>

        {/* 课程详情模态框 */}
        <CourseModal
          isOpen={isModalOpen}
          selectedCell={selectedCell}
          currentWeek={currentWeek}
          displayMode={displayMode}
          userGroup={userGroup}
          scheduleData={scheduleData}
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
          onDeleteCourse={handleDeleteCourse}
          onClose={closeModal}
        />

        <Toast
          isOpen={updateToast.isOpen}
          message={updateToast.message}
          onClose={closeUpdateToast}
        />
        <Toast
          isOpen={scheduleUpdateToast.isOpen}
          message={scheduleUpdateToast.message}
          onClose={closeScheduleUpdateToast}
        />
      </div>
    </div>
  );
};

export default App;
