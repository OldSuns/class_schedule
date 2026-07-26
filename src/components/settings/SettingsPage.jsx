import { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import {
  APP_VERSION,
  DISPLAY_MODES,
  GITHUB_RELEASES_URL
} from "../../config/constants";
import { GROUP_TYPES } from "../../utils/schedule/groupUtils";
import { checkForUpdates } from "../../services/app/updateChecker";
import QuickWeekSection from "./SettingsMenu/QuickWeekSection.jsx";
import DisplayModeSection from "./SettingsMenu/DisplayModeSection.jsx";
import ThemeSection from "./SettingsMenu/ThemeSection.jsx";
import ReminderSection from "./SettingsMenu/ReminderSection.jsx";
import UpdateSection from "./SettingsMenu/UpdateSection.jsx";
import ScheduleManagementSection from "./SettingsMenu/ScheduleManagementSection.jsx";
import RemoteUpdateConfirmDialog from "./SettingsMenu/RemoteUpdateConfirmDialog.jsx";

const SettingsPage = ({
  semesterStartDate,
  onStartDateChange,
  todayInfo,
  displayWeekInfo,
  currentWeek,
  onSelectWeek,
  displayMode = DISPLAY_MODES.ALL,
  onDisplayModeChange,
  theme,
  onThemeChange,
  notificationsEnabled = false,
  onToggleNotifications,
  userGroup = GROUP_TYPES.G6A,
  onGroupChange,
  selectedElectives = [],
  onSelectedElectivesChange,
  leadMinutes = 15,
  leadMinuteOptions = [10, 15, 20, 30],
  onLeadMinutesChange,
  onTestNotification,
  notificationStatus = "",
  onSoftUpdateSchedule,
  onConfirmRemoteUpdate,
  onCancelRemoteUpdate,
  pendingRemoteSnapshot = null,
  isSoftUpdating = false,
  remoteUpdatedAt = "",
  scheduleSource = "builtin",
  hasManualScheduleChanges = false,
  onResetSchedule
}) => {
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateResultType, setUpdateResultType] = useState("");
  const [updateUrl, setUpdateUrl] = useState("");
  const [apkUrl, setApkUrl] = useState("");
  const [releaseInfo, setReleaseInfo] = useState(null);
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [resetStatus, setResetStatus] = useState("");
  const [softUpdateStatus, setSoftUpdateStatus] = useState("");
  const [showRemoteConfirm, setShowRemoteConfirm] = useState(false);
  const [showAdvancedReminder, setShowAdvancedReminder] = useState(false);
  const [showGroupElectiveSection, setShowGroupElectiveSection] = useState(false);
  const [showUpdateSection, setShowUpdateSection] = useState(false);
  const [showScheduleManagement, setShowScheduleManagement] = useState(false);

  const getSourceHost = (sourceUrl) => {
    if (!sourceUrl) return "";
    try {
      return new URL(sourceUrl).host;
    } catch (error) {
      return "";
    }
  };

  const withSourceLabel = (message, sourceUrl) => {
    if (!message) return "";
    const host = getSourceHost(sourceUrl);
    return host ? `${message}（来源：${host}）` : message;
  };

  const scheduleSourceLabelMap = {
    builtin: "内置课表",
    remote: "远端课表",
    manual: "手动编辑课表"
  };

  const currentScheduleSourceLabel =
    scheduleSourceLabelMap[scheduleSource] || "未知来源";

  const weekStatusText = todayInfo
    ? `今天是第${todayInfo.week}周 星期${["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}`
    : displayWeekInfo?.isWeekendPreview
    ? `今天是周末，默认显示第${displayWeekInfo.week}周课表`
    : "";

  const weekStatusStyle = displayWeekInfo?.isWeekendPreview
    ? { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)" }
    : { backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)" };

  const formatReleasePublishedAt = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const releaseNotesTitle = releaseInfo
    ? updateResultType === "update"
      ? `新版本说明${releaseInfo.version ? ` v${releaseInfo.version}` : ""}`
      : releaseInfo.isFallback
      ? `最新版本说明${releaseInfo.version ? ` v${releaseInfo.version}` : ""}`
      : `当前版本说明${releaseInfo.version ? ` v${releaseInfo.version}` : ""}`
    : "";

  useEffect(() => {
    if (!pendingRemoteSnapshot) return;
    setShowUpdateSection(true);
    setShowRemoteConfirm(true);
    setSoftUpdateStatus((prev) => prev || "检测到远端课表更新，请确认是否应用");
  }, [pendingRemoteSnapshot]);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus("");
    setUpdateResultType("");
    setUpdateUrl("");
    setApkUrl("");
    setReleaseInfo(null);
    const result = await checkForUpdates(APP_VERSION, {
      includeReleaseNotes: true
    });
    setUpdateResultType(result.status || "");
    setUpdateStatus(result.message || "检查完成");
    if (
      result.releaseVersion ||
      result.releaseNotes ||
      result.releasePublishedAt ||
      result.releaseIsFallback
    ) {
      setReleaseInfo({
        version: result.releaseVersion || "",
        notes: result.releaseNotes || "",
        publishedAt: result.releasePublishedAt || "",
        isFallback: Boolean(result.releaseIsFallback)
      });
    }
    if (result.status === "update" && result.url) {
      setUpdateUrl(result.url);
      if (result.apkUrl) {
        setApkUrl(result.apkUrl);
      }
    }
    setIsCheckingUpdate(false);
  };

  const handleOpenReleasePage = async () => {
    const isAndroid =
      Capacitor.isNativePlatform() && Capacitor.getPlatform() === "android";
    const target = isAndroid && apkUrl ? apkUrl : updateUrl || GITHUB_RELEASES_URL;
    if (!target) return;

    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({ url: target });
        return;
      }
    } catch (error) {
      console.error("打开下载页失败:", error);
    }

    if (typeof window !== "undefined") {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  const handleResetSchedule = async () => {
    if (!onResetSchedule) return;
    const confirmed = window.confirm("确认重置课表为默认数据？此操作不可撤销。");
    if (!confirmed) return;

    try {
      const result = await onResetSchedule();
      setResetStatus(result?.message || "课表已恢复为默认数据");
    } catch (error) {
      console.error("重置课表失败:", error);
      setResetStatus("重置失败，请稍后重试");
    }
  };

  const handleSoftUpdateSchedule = async () => {
    if (!onSoftUpdateSchedule || isSoftUpdating) return;
    setSoftUpdateStatus("");
    const result = await onSoftUpdateSchedule({ trigger: "manual" });
    if (result?.status === "update-available") {
      setSoftUpdateStatus(
        withSourceLabel(result?.message || "检测到远端课表更新", result?.sourceUrl)
      );
      setShowRemoteConfirm(true);
      return;
    }
    setSoftUpdateStatus(
      withSourceLabel(result?.message || "检查完成", result?.sourceUrl)
    );
  };

  const handleConfirmRemoteUpdate = async () => {
    const result = await onConfirmRemoteUpdate?.();
    setShowRemoteConfirm(false);
    setSoftUpdateStatus(
      withSourceLabel(result?.message || "课表已更新", result?.sourceUrl)
    );
  };

  const handleCancelRemoteUpdate = async () => {
    const result = await onCancelRemoteUpdate?.();
    setShowRemoteConfirm(false);
    setSoftUpdateStatus(
      withSourceLabel(result?.message || "已暂不更新", result?.sourceUrl)
    );
  };

  return (
    <section className="min-h-screen bg-surface-low pb-24">
      <header className="px-4 pb-2 pt-5">
        <h1 className="text-xl font-extrabold leading-tight text-on-surface">
          设置
        </h1>
      </header>

      <main className="space-y-3 px-3">
        <QuickWeekSection
          showWeekSelector={showWeekSelector}
          onToggle={() => setShowWeekSelector((prev) => !prev)}
          currentWeek={currentWeek}
          onSelectWeek={(week) => {
            onSelectWeek(week);
            setShowWeekSelector(false);
          }}
        />

        <DisplayModeSection
          displayMode={displayMode}
          onDisplayModeChange={onDisplayModeChange}
        />

        <ThemeSection theme={theme} onThemeChange={onThemeChange} />

        <ReminderSection
          notificationsEnabled={notificationsEnabled}
          onToggleNotifications={onToggleNotifications}
          userGroup={userGroup}
          onGroupChange={onGroupChange}
          selectedElectives={selectedElectives}
          onSelectedElectivesChange={onSelectedElectivesChange}
          leadMinutes={leadMinutes}
          leadMinuteOptions={leadMinuteOptions}
          onLeadMinutesChange={onLeadMinutesChange}
          onTestNotification={onTestNotification}
          notificationStatus={notificationStatus}
          showGroupElectiveSection={showGroupElectiveSection}
          onToggleGroupElectiveSection={() =>
            setShowGroupElectiveSection((prev) => !prev)
          }
          showAdvancedReminder={showAdvancedReminder}
          onToggleAdvancedReminder={() => setShowAdvancedReminder((prev) => !prev)}
        />

        <UpdateSection
          appVersion={APP_VERSION}
          isCheckingUpdate={isCheckingUpdate}
          updateStatus={updateStatus}
          releaseInfo={releaseInfo}
          releaseNotesTitle={releaseNotesTitle}
          formatReleasePublishedAt={formatReleasePublishedAt}
          updateUrl={updateUrl}
          onCheckUpdate={handleCheckUpdate}
          onOpenReleasePage={handleOpenReleasePage}
          showUpdateSection={showUpdateSection}
          onToggleUpdateSection={() => setShowUpdateSection((prev) => !prev)}
          isSoftUpdating={isSoftUpdating}
          remoteUpdatedAt={remoteUpdatedAt}
          softUpdateStatus={softUpdateStatus}
          onSoftUpdateSchedule={handleSoftUpdateSchedule}
        />

        <ScheduleManagementSection
          showScheduleManagement={showScheduleManagement}
          onToggleScheduleManagement={() =>
            setShowScheduleManagement((prev) => !prev)
          }
          semesterStartDate={semesterStartDate}
          onStartDateChange={onStartDateChange}
          weekStatusText={weekStatusText}
          weekStatusStyle={weekStatusStyle}
          currentScheduleSourceLabel={currentScheduleSourceLabel}
          hasManualScheduleChanges={hasManualScheduleChanges}
          onResetSchedule={handleResetSchedule}
          resetStatus={resetStatus}
        />
      </main>

      <RemoteUpdateConfirmDialog
        isOpen={showRemoteConfirm && Boolean(pendingRemoteSnapshot)}
        onCancel={handleCancelRemoteUpdate}
        onConfirm={handleConfirmRemoteUpdate}
      />
    </section>
  );
};

export default SettingsPage;
