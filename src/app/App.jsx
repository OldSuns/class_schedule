import { useEffect, useMemo, useRef, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
import Header from "../components/layout/Header.jsx";
import BottomNavigation, { APP_TABS } from "../components/layout/BottomNavigation.jsx";
import Toast from "../components/layout/Toast.jsx";
import ExamPage from "../components/exams/ExamPage.jsx";
import SettingsPage from "../components/settings/SettingsPage.jsx";
import CourseTable from "../components/schedule/CourseTable.jsx";
import CourseModal from "../components/schedule/CourseModal/CourseModal.jsx";
import { useSemesterDate } from "../hooks/semester/useSemesterDate.js";
import { useWeekSelector } from "../hooks/ui/useWeekSelector.js";
import { useNotifications } from "../hooks/notifications/useNotifications.js";
import { useTheme } from "../hooks/ui/useTheme.js";
import { useScheduleData } from "../hooks/schedule/useScheduleData.js";
import { STORAGE_KEYS } from "../config/constants.js";
import { getItem, setItem } from "../../storage.js";
import { hasElapsed, isRemoteCheckSuccessful } from "../utils/schedule/dateUtils.js";

const REMOTE_CHECK_INTERVAL_MS = 8 * 60 * 60 * 1000;
const REMOTE_FOREGROUND_INTERVAL_MS = 10 * 60 * 1000;
const REMOTE_ERROR_RETRY_INTERVAL_MS = 3 * 60 * 1000;

const App = () => {
  const { semesterStartDate, todayInfo, displayWeekInfo } = useSemesterDate();
  const {
    currentWeek,
    setCurrentWeek,
    handleWeekChange,
    handlePreviousWeek,
    handleNextWeek
  } = useWeekSelector(1);
  const { theme, onThemeChange } = useTheme();
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
  const {
    notificationsEnabled,
    userGroup,
    leadMinutes,
    leadMinuteOptions,
    statusMessage,
    onToggleNotifications,
    onGroupChange,
    onLeadMinutesChange,
    onTestNotification
  } = useNotifications(semesterStartDate, scheduleData);

  const [activeTab, setActiveTab] = useState(APP_TABS.SCHEDULE);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState({ isOpen: false, message: "" });
  const softUpdateScheduleRef = useRef(softUpdateSchedule);

  const selectedEvent = useMemo(
    () => scheduleData.events.find((event) => event.id === selectedEventId) ?? null,
    [scheduleData.events, selectedEventId]
  );

  useEffect(() => {
    if (displayWeekInfo?.week) setCurrentWeek(displayWeekInfo.week);
    if (todayInfo?.day) setSelectedDay(todayInfo.day);
  }, [displayWeekInfo?.week, setCurrentWeek, todayInfo?.day]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!builtInUpdateNotice) return;
    setToast({ isOpen: true, message: builtInUpdateNotice });
  }, [builtInUpdateNotice]);

  useEffect(() => {
    softUpdateScheduleRef.current = softUpdateSchedule;
  }, [softUpdateSchedule]);

  useEffect(() => {
    if (!isScheduleLoaded) return undefined;
    let cancelled = false;

    const checkRemote = async (trigger) => {
      const nowMs = Date.now();
      const [lastCheckRaw, lastForegroundRaw, lastErrorRaw] = await Promise.all([
        getItem(STORAGE_KEYS.REMOTE_LAST_CHECK_AT),
        getItem(STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT),
        getItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT)
      ]);
      if (cancelled) return;
      if (!hasElapsed(Number(lastErrorRaw), REMOTE_ERROR_RETRY_INTERVAL_MS, nowMs)) return;
      if (
        trigger === "foreground" &&
        !hasElapsed(Number(lastForegroundRaw), REMOTE_FOREGROUND_INTERVAL_MS, nowMs)
      ) {
        return;
      }
      if (
        trigger !== "foreground" &&
        !hasElapsed(Number(lastCheckRaw), REMOTE_CHECK_INTERVAL_MS, nowMs)
      ) {
        return;
      }

      const result = await softUpdateScheduleRef.current({ trigger: "auto" });
      if (cancelled) return;
      if (isRemoteCheckSuccessful(result?.status)) {
        await Promise.all([
          setItem(STORAGE_KEYS.REMOTE_LAST_CHECK_AT, String(nowMs)),
          setItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT, ""),
          trigger === "foreground"
            ? setItem(STORAGE_KEYS.REMOTE_LAST_FOREGROUND_CHECK_AT, String(nowMs))
            : Promise.resolve()
        ]);
      } else if (result?.status === "error") {
        await setItem(STORAGE_KEYS.REMOTE_LAST_ERROR_AT, String(nowMs));
      }
    };

    void checkRemote("launch");
    const timer = setInterval(() => void checkRemote("interval"), REMOTE_CHECK_INTERVAL_MS);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void checkRemote("foreground");
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isScheduleLoaded]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    void StatusBar.setStyle({ style: Style.Light });
    void StatusBar.setOverlaysWebView({ overlay: true });
    void StatusBar.setBackgroundColor({
      color: theme === "minimal" ? "#FFFFFF" : "#FFFBFE"
    });
    return undefined;
  }, [theme]);

  const updateEvent = (nextEvent) => {
    setScheduleData((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      events: current.events.map((event) =>
        event.id === nextEvent.id ? nextEvent : event
      )
    }));
  };

  const deleteEvent = (eventId) => {
    setScheduleData((current) => ({
      ...current,
      updatedAt: new Date().toISOString(),
      events: current.events.filter((event) => event.id !== eventId)
    }));
    setSelectedEventId(null);
  };

  return (
    <div className="min-h-screen bg-surface-low pt-[var(--safe-top)]">
      <div className="mx-auto min-h-screen max-w-[430px] bg-surface-low sm:max-w-5xl">
        {activeTab === APP_TABS.SCHEDULE && (
          <section className="min-h-screen px-2 pb-28 pt-2 sm:px-4 sm:pt-4">
            <Header
              todayInfo={todayInfo}
              userGroup={userGroup}
              onGroupChange={onGroupChange}
            />
            <CourseTable
              events={scheduleData.events}
              semesterStartDate={semesterStartDate}
              currentWeek={currentWeek}
              selectedDay={selectedDay}
              userGroup={userGroup}
              now={now}
              onSelectDay={setSelectedDay}
              onPreviousWeek={handlePreviousWeek}
              onNextWeek={handleNextWeek}
              onEventClick={(event) => setSelectedEventId(event.id)}
              isScheduleLoaded={isScheduleLoaded}
            />
          </section>
        )}

        {activeTab === APP_TABS.EXAMS && <ExamPage currentWeek={currentWeek} now={now} />}

        {activeTab === APP_TABS.SETTINGS && (
          <SettingsPage
            currentWeek={currentWeek}
            onSelectWeek={handleWeekChange}
            theme={theme}
            onThemeChange={onThemeChange}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={onToggleNotifications}
            userGroup={userGroup}
            onGroupChange={onGroupChange}
            leadMinutes={leadMinutes}
            leadMinuteOptions={leadMinuteOptions}
            onLeadMinutesChange={onLeadMinutesChange}
            onTestNotification={onTestNotification}
            notificationStatus={statusMessage}
            onSoftUpdateSchedule={softUpdateSchedule}
            onConfirmRemoteUpdate={confirmRemoteUpdate}
            onCancelRemoteUpdate={cancelRemoteUpdate}
            pendingRemoteSnapshot={pendingRemoteSnapshot}
            isSoftUpdating={isCheckingRemote}
            remoteUpdatedAt={remoteUpdatedAt}
            scheduleSource={scheduleSource}
            hasManualScheduleChanges={hasManualScheduleChanges}
            onResetSchedule={resetSchedule}
          />
        )}
      </div>

      <CourseModal
        isOpen={Boolean(selectedEvent)}
        event={selectedEvent}
        currentWeek={currentWeek}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onClose={() => setSelectedEventId(null)}
      />

      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      <Toast
        isOpen={toast.isOpen}
        message={toast.message}
        onClose={() => setToast({ isOpen: false, message: "" })}
      />
    </div>
  );
};

export default App;
