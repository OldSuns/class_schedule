import React, { useEffect, useState } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { APP_VERSION, DISPLAY_MODES, GITHUB_RELEASES_URL, MIN_WEEK, MAX_WEEK } from "./constants";
import { GROUP_TYPES } from "./groupUtils";
import { checkForUpdates } from "./updateChecker";

/**
 * 设置菜单组件 - 包含开学日期设置和快速周数选择
 */
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
  leadMinutes = 15,
  leadMinuteOptions = [10, 15, 20, 30],
  onLeadMinutesChange,
  onTestNotification,
  notificationStatus = "",
  exactAlarmStatus = "unknown",
  reliabilityMode = "degraded",
  exactAlarmMessage = "",
  onOpenExactAlarmSettings,
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
    const target = (isAndroid && apkUrl) ? apkUrl : (updateUrl || GITHUB_RELEASES_URL);
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
    if (confirmed) {
      try {
        const result = await onResetSchedule();
        setResetStatus(result?.message || "课表已恢复为默认数据");
      } catch (error) {
        console.error("重置课表失败:", error);
        setResetStatus("重置失败，请稍后重试");
      }
    }
  };

  const handleSoftUpdateSchedule = async () => {
    if (!onSoftUpdateSchedule) return;
    if (isSoftUpdating) return;
    setSoftUpdateStatus("");
    const result = await onSoftUpdateSchedule({ trigger: "manual" });
    if (result?.status === "update-available") {
      setSoftUpdateStatus(
        withSourceLabel(
          result?.message || "检测到远端课表更新",
          result?.sourceUrl
        )
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
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{backgroundColor:"rgba(0,0,0,0.45)"}}
            onClick={onClose}
          />

          {/* 菜单面板 */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 sm:w-80 z-50 overflow-y-auto flex flex-col"
            style={{backgroundColor:"#FFFBFE",boxShadow:"2px 0 24px rgba(103,80,164,0.14)"}}
          >
            {/* 菜单头部 */}
            <div className="sticky top-0 z-10 flex justify-between items-center p-4 pt-[var(--safe-top)]" style={{backgroundColor:"#6750A4"}}>
              <h2 className="text-xl font-bold" style={{color:"#FFFFFF"}}>设置</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl transition-opacity hover:opacity-75"
                style={{color:"#FFFFFF"}}
                title="关闭"
              >
                <X size={24} />
              </button>
            </div>

            {/* 菜单内容 */}
            <div className="flex-1 p-4 space-y-6" style={{backgroundColor:"#FFFBFE"}}>


              {/* 快速周数选择 */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowWeekSelector(!showWeekSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                  style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                >
                  <span>快速选择周数</span>
                  {showWeekSelector ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>

                {/* 周数选择器网格 */}
                <AnimatePresence>
                  {showWeekSelector && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl p-3" style={{backgroundColor:"#F3EDF7",border:"1px solid #CAC4D0"}}>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                          {Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => i + MIN_WEEK).map((week) => (
                            <button
                              key={week}
                              onClick={() => {
                                onSelectWeek(week);
                                setShowWeekSelector(false);
                              }}
                              className="py-1.5 px-2 rounded-lg font-bold text-xs transition-colors"
                              style={
                                week === currentWeek
                                  ? {backgroundColor:"#6750A4",color:"#FFFFFF"}
                                  : {backgroundColor:"#ECE6F0",color:"#49454F"}
                              }
                            >
                              {week}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 显示模式 */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold" style={{color:"#1C1B1F"}}>显示模式</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onDisplayModeChange?.(DISPLAY_MODES.ALL)}
                    className="py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={displayMode === DISPLAY_MODES.ALL
                      ? {backgroundColor:"#6750A4",color:"#FFFFFF"}
                      : {backgroundColor:"#E8DEF8",color:"#1D192B"}}
                  >
                    显示全部
                  </button>
                  <button
                    onClick={() => onDisplayModeChange?.(DISPLAY_MODES.CURRENT_ONLY)}
                    className="py-2 rounded-xl text-sm font-semibold transition-colors"
                    style={displayMode === DISPLAY_MODES.CURRENT_ONLY
                      ? {backgroundColor:"#6750A4",color:"#FFFFFF"}
                      : {backgroundColor:"#E8DEF8",color:"#1D192B"}}
                  >
                    仅本周
                  </button>
                </div>
                <p className="text-xs" style={{color:"#49454F"}}>显示全部时，非本周课程将以灰色显示。</p>
              </div>

              {/* 课程提醒 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold" style={{color:"#1C1B1F"}}>课程提醒</label>
                  <button
                    type="button"
                    onClick={() => onToggleNotifications(!notificationsEnabled)}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    style={{backgroundColor: notificationsEnabled ? "#6750A4" : "#CAC4D0"}}
                    aria-pressed={notificationsEnabled}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      style={{transform: notificationsEnabled ? "translateX(24px)" : "translateX(4px)"}}
                    />
                  </button>
                </div>
                <p className="text-xs" style={{color:"#49454F"}}>每节课开始前 {leadMinutes} 分钟提醒（仅 Android）</p>
                <p className="text-xs font-medium" style={{color: reliabilityMode === "high" ? "#386A20" : "#7D5700"}}>
                  {reliabilityMode === "high" ? "可靠性：高" : "可靠性：受系统限制"}
                </p>
              </div>

              {/* 检查更新 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-base font-semibold" style={{color:"#1C1B1F"}}>
                    检查更新
                  </label>
                  <span className="text-xs" style={{color:"#49454F"}}>v{APP_VERSION}</span>
                </div>
                <button
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                  className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  style={isCheckingUpdate
                    ? {backgroundColor:"#E8DEF8",color:"#9E9E9E",cursor:"not-allowed"}
                    : {backgroundColor:"#E8DEF8",color:"#1D192B"}}
                >
                  {isCheckingUpdate ? "检查中..." : "检查更新"}
                </button>
                {updateStatus && (
                  <div className="text-xs p-2 rounded-xl" style={{backgroundColor:"#ECE6F0",color:"#49454F"}}>
                    {updateStatus}
                  </div>
                )}
                {releaseInfo && (
                  <div className="rounded-2xl p-3 space-y-2" style={{backgroundColor:"#F3EDF7",border:"1px solid #CAC4D0"}}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>
                        {releaseNotesTitle}
                      </div>
                      {releaseInfo.publishedAt && (
                        <div className="text-[11px] text-right" style={{color:"#49454F"}}>
                          发布于 {formatReleasePublishedAt(releaseInfo.publishedAt)}
                        </div>
                      )}
                    </div>
                    {releaseInfo.isFallback && (
                      <div className="rounded-xl px-2.5 py-2 text-xs" style={{backgroundColor:"#FFF3CD",color:"#7D5700"}}>
                        未找到当前版本说明，已显示最新版本说明。
                      </div>
                    )}
                    <div className="max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-6" style={{backgroundColor:"#ECE6F0",color:"#1C1B1F"}}>
                      {releaseInfo.notes || "暂无更新说明"}
                    </div>
                  </div>
                )}
                {updateUrl && (
                  <button
                    onClick={handleOpenReleasePage}
                    className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={{backgroundColor:"#6750A4",color:"#FFFFFF"}}
                  >
                    前往下载页
                  </button>
                )}
              </div>

              {/* 提醒高级 */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowAdvancedReminder(!showAdvancedReminder)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                  style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                >
                  <span>提醒高级</span>
                  {showAdvancedReminder ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <AnimatePresence>
                  {showAdvancedReminder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl p-3 space-y-4" style={{backgroundColor:"#F3EDF7",border:"1px solid #CAC4D0"}}>
                        <div className="space-y-2">
                          <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>我的组别</div>
                          <div className="grid grid-cols-2 gap-2">
                            {[GROUP_TYPES.G6A, GROUP_TYPES.G6B, GROUP_TYPES.G7C, GROUP_TYPES.G7D].map((g) => (
                              <button
                                key={g}
                                onClick={() => onGroupChange(g)}
                                className="py-2 rounded-xl text-sm font-semibold transition-colors"
                                style={userGroup === g
                                  ? {backgroundColor:"#6750A4",color:"#FFFFFF"}
                                  : {backgroundColor:"#ECE6F0",color:"#1D192B"}}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>提前量（分钟）</div>
                          <div className="grid grid-cols-4 gap-2">
                            {leadMinuteOptions.map((minutes) => (
                              <button
                                key={minutes}
                                onClick={() => onLeadMinutesChange?.(minutes)}
                                className="py-2 rounded-xl text-sm font-semibold transition-colors"
                                style={leadMinutes === minutes
                                  ? {backgroundColor:"#6750A4",color:"#FFFFFF"}
                                  : {backgroundColor:"#ECE6F0",color:"#1D192B"}}
                              >
                                {minutes}
                              </button>
                            ))}
                          </div>
                        </div>

                        {exactAlarmMessage && (
                          <div className="flex items-center justify-between gap-2 text-xs font-medium p-2 rounded-xl" style={{backgroundColor:"#FFF3CD",color:"#7D5700"}}>
                            <span>{exactAlarmMessage}</span>
                            {exactAlarmStatus === "denied" && (
                              <button
                                onClick={onOpenExactAlarmSettings}
                                className="px-2 py-1 rounded-lg text-xs font-semibold"
                                style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                              >
                                去开启
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={onTestNotification}
                          className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                          style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                        >
                          发送测试通知
                        </button>
                        {notificationStatus && (
                          <div className="text-xs p-2 rounded-xl" style={{backgroundColor:"#ECE6F0",color:"#49454F"}}>
                            {notificationStatus}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 更新与发布 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowUpdateSection(!showUpdateSection)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                  style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                >
                  <span>更新与发布</span>
                  {showUpdateSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <AnimatePresence>
                  {showUpdateSection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl p-3 space-y-3" style={{backgroundColor:"#F3EDF7",border:"1px solid #CAC4D0"}}>
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>
                            课表软更新
                          </div>
                          {remoteUpdatedAt && (
                            <span className="text-xs" style={{color:"#49454F"}}>
                              更新时间 {remoteUpdatedAt}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleSoftUpdateSchedule}
                          disabled={isSoftUpdating}
                          className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                          style={isSoftUpdating
                            ? {backgroundColor:"#E8DEF8",color:"#9E9E9E",cursor:"not-allowed"}
                            : {backgroundColor:"#E8DEF8",color:"#1D192B"}}
                        >
                          {isSoftUpdating ? "更新中..." : "软更新课表"}
                        </button>
                        {softUpdateStatus && (
                          <div className="text-xs p-2 rounded-xl" style={{backgroundColor:"#ECE6F0",color:"#49454F"}}>
                            {softUpdateStatus}
                          </div>
                        )}
                        <p className="text-xs" style={{color:"#49454F"}}>
                          点击后从远端拉取最新课表，检测到更新时会提示确认。
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 课表管理 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowScheduleManagement(!showScheduleManagement)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
                  style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                >
                  <span>课表管理</span>
                  {showScheduleManagement ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                <AnimatePresence>
                  {showScheduleManagement && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl p-3 space-y-4" style={{backgroundColor:"#F3EDF7",border:"1px solid #CAC4D0"}}>
                        <div className="space-y-2">
                          <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>
                            开学日期
                          </div>
                          <input
                            type="date"
                            value={semesterStartDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            lang="zh-CN"
                            placeholder="选择开学日期"
                            className="w-full px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                            style={{backgroundColor:"#ECE6F0",color:"#1C1B1F",border:"1px solid #CAC4D0",colorScheme:"light"}}
                          />
                          {weekStatusText && (
                            <div className="text-sm font-medium p-2.5 rounded-xl" style={weekStatusStyle}>
                              {weekStatusText}
                            </div>
                          )}
                          {!weekStatusText && semesterStartDate && (
                            <div className="text-sm font-medium p-2.5 rounded-xl" style={{backgroundColor:"#ECE6F0",color:"#49454F"}}>
                              今天不在上课时间
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>
                            当前课表状态
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl px-3 py-2" style={{backgroundColor:"#ECE6F0"}}>
                              <div className="text-[11px]" style={{color:"#6750A4"}}>
                                当前来源
                              </div>
                              <div className="mt-1 text-sm font-semibold" style={{color:"#1C1B1F"}}>
                                {currentScheduleSourceLabel}
                              </div>
                            </div>
                            <div className="rounded-xl px-3 py-2" style={{backgroundColor:"#ECE6F0"}}>
                              <div className="text-[11px]" style={{color:"#6750A4"}}>
                                手动修改
                              </div>
                              <div className="mt-1 text-sm font-semibold" style={{color:"#1C1B1F"}}>
                                {hasManualScheduleChanges ? "有" : "无"}
                              </div>
                            </div>
                          </div>
                          <p className="text-xs" style={{color:"#49454F"}}>
                            当前课表来源为"{currentScheduleSourceLabel}"，
                            {hasManualScheduleChanges
                              ? "已包含你的手动编辑。"
                              : "当前没有检测到手动编辑记录。"}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>
                            重置课表
                          </div>
                          <button
                            onClick={handleResetSchedule}
                            className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                            style={{backgroundColor:"#FFDAD6",color:"#410002"}}
                          >
                            重置课表
                          </button>
                          <p className="text-xs" style={{color:"#49454F"}}>
                            清除所有自定义修改，恢复内置课表数据。
                          </p>
                          {resetStatus && (
                            <div className="text-xs p-2 rounded-xl" style={{backgroundColor:"#ECE6F0",color:"#49454F"}}>
                              {resetStatus}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* 软更新确认弹窗 */}
          <AnimatePresence>
            {showRemoteConfirm && pendingRemoteSnapshot && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{backgroundColor:"rgba(0,0,0,0.45)"}}
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm rounded-3xl p-5 shadow-xl"
                  style={{backgroundColor:"#FFFBFE"}}
                >
                  <div className="text-base font-semibold" style={{color:"#1C1B1F"}}>
                    检测到远端课表更新
                  </div>
                  <div className="mt-2 text-sm" style={{color:"#49454F"}}>
                    是否应用远端课表更新？当前课表将被替换。
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleCancelRemoteUpdate}
                      className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                      style={{backgroundColor:"#E8DEF8",color:"#1D192B"}}
                    >
                      暂不更新
                    </button>
                    <button
                      onClick={handleConfirmRemoteUpdate}
                      className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                      style={{backgroundColor:"#6750A4",color:"#FFFFFF"}}
                    >
                      应用更新
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
