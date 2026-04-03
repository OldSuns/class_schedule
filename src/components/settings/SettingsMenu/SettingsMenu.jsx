import React, { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  APP_VERSION,
  DISPLAY_MODES,
  GITHUB_RELEASES_URL
} from "../../../config/constants";
import { GROUP_TYPES } from "../../../utils/schedule/groupUtils";
import { checkForUpdates } from "../../../services/app/updateChecker";
import QuickWeekSection from "./QuickWeekSection.jsx";
import DisplayModeSection from "./DisplayModeSection.jsx";
import ReminderSection from "./ReminderSection.jsx";
import UpdateSection from "./UpdateSection.jsx";
import ScheduleManagementSection from "./ScheduleManagementSection.jsx";
import RemoteUpdateConfirmDialog from "./RemoteUpdateConfirmDialog.jsx";

const SettingsMenu = ({
  isOpen,
  onClose,
  semesterStartDate,
  onStartDateChange,
  todayInfo,
  displayWeekInfo,
  currentWeek,
  onSelectWeek,
  displayMode = DISPLAY_MODES.ALL,
  onDisplayModeChange,
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
    ? { backgroundColor: "#E8DEF8", color: "#1D192B" }
    : { backgroundColor: "#EADDFF", color: "#21005D" };

  const formatReleasePublishedAt = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

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
    if (!isOpen) {
      setResetStatus("");
      setSoftUpdateStatus("");
      setShowRemoteConfirm(false);
      setShowAdvancedReminder(false);
      setShowGroupElectiveSection(false);
      setShowUpdateSection(false);
      setShowScheduleManagement(false);
      setApkUrl("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !pendingRemoteSnapshot) return;
    setShowUpdateSection(true);
    setShowRemoteConfirm(true);
    setSoftUpdateStatus((prev) => prev || "检测到远端课表更新，请确认是否应用");
  }, [isOpen, pendingRemoteSnapshot]);

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
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
          />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 sm:w-80 z-50 overflow-y-auto flex flex-col"
            style={{ backgroundColor: "#FFFBFE", boxShadow: "2px 0 24px rgba(103,80,164,0.14)" }}
          >
            <div
              className="sticky top-0 z-10 flex justify-between items-center p-4 pt-[var(--safe-top)]"
              style={{ backgroundColor: "#6750A4" }}
            >
              <h2 className="text-xl font-bold" style={{ color: "#FFFFFF" }}>
                设置
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-opacity hover:opacity-75"
                style={{ color: "#FFFFFF" }}
                title="关闭"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 p-4 space-y-6" style={{ backgroundColor: "#FFFBFE" }}>
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
            </div>
          </motion.div>

          <RemoteUpdateConfirmDialog
            isOpen={showRemoteConfirm && Boolean(pendingRemoteSnapshot)}
            onCancel={handleCancelRemoteUpdate}
            onConfirm={handleConfirmRemoteUpdate}
          />
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
