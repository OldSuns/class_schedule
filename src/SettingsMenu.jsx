import React, { useEffect, useState } from "react";
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
  onResetSchedule
}) => {
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [updateStatus, setUpdateStatus] = useState("");
  const [updateUrl, setUpdateUrl] = useState("");
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

  useEffect(() => {
    if (!isOpen) {
      setResetStatus("");
      setSoftUpdateStatus("");
      setShowRemoteConfirm(false);
      setShowAdvancedReminder(false);
      setShowUpdateSection(false);
      setShowScheduleManagement(false);
    }
  }, [isOpen]);

  const handleCheckUpdate = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus("");
    setUpdateUrl("");
    const result = await checkForUpdates(APP_VERSION);
    setUpdateStatus(result.message || "检查完成");
    if (result.status === "update" && result.url) {
      setUpdateUrl(result.url);
    }
    setIsCheckingUpdate(false);
  };

  const handleOpenReleasePage = () => {
    const target = updateUrl || GITHUB_RELEASES_URL;
    if (typeof window !== "undefined") {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  const handleResetSchedule = async () => {
    if (!onResetSchedule) return;
    const confirmed = window.confirm("确认重置课表为默认数据？此操作不可撤销。");
    if (confirmed) {
      try {
        await onResetSchedule();
        setResetStatus("课表已恢复为默认数据");
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
    const result = await onSoftUpdateSchedule();
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

  const handleConfirmRemoteUpdate = () => {
    const result = onConfirmRemoteUpdate?.();
    setShowRemoteConfirm(false);
    setSoftUpdateStatus(
      withSourceLabel(result?.message || "课表已更新", result?.sourceUrl)
    );
  };

  const handleCancelRemoteUpdate = () => {
    const result = onCancelRemoteUpdate?.();
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* 菜单面板 */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 sm:w-80 bg-white/20 backdrop-blur-md shadow-2xl z-50 overflow-y-auto"
          >
            {/* 菜单头部 */}
            <div className="sticky top-0 bg-indigo-600/15 backdrop-blur-sm text-white p-4 flex justify-between items-center pt-[var(--safe-top)]">
              <h2 className="text-xl font-bold">设置</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
                title="关闭"
              >
                <X size={24} />
              </button>
            </div>

            {/* 菜单内容 */}
            <div className="p-6 space-y-8">


              {/* 快速周数选择 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowWeekSelector(!showWeekSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span>快速选择周数</span>
                  {showWeekSelector ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
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
                      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-indigo-300">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                          {Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => i + MIN_WEEK).map((week) => (
                            <button
                              key={week}
                              onClick={() => {
                                onSelectWeek(week);
                                setShowWeekSelector(false);
                              }}
                              className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm transition-all ${
                                week === currentWeek
                                  ? "bg-indigo-600 text-white shadow-lg scale-105"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105"
                              }`}
                            >
                              <span className="hidden sm:inline">{week}</span>
                              <span className="inline sm:hidden">{week}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 显示模式 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-semibold text-indigo-900">
                    显示模式
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onDisplayModeChange?.(DISPLAY_MODES.ALL)}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      displayMode === DISPLAY_MODES.ALL
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    显示全部
                  </button>
                  <button
                    onClick={() => onDisplayModeChange?.(DISPLAY_MODES.CURRENT_ONLY)}
                    className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                      displayMode === DISPLAY_MODES.CURRENT_ONLY
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                    }`}
                  >
                    仅本周
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  显示全部时，非本周课程将以灰色显示。
                </p>
              </div>

              {/* 课程提醒 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-semibold text-indigo-900">
                    课程提醒
                  </label>
                  <button
                    type="button"
                    onClick={() => onToggleNotifications(!notificationsEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      notificationsEnabled ? "bg-indigo-600" : "bg-gray-300"
                    }`}
                    aria-pressed={notificationsEnabled}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notificationsEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-xs text-gray-600">
                  每节课开始前 {leadMinutes} 分钟提醒（仅 Android）
                </p>
                <p
                  className={`text-xs font-medium ${
                    reliabilityMode === "high" ? "text-green-700" : "text-amber-700"
                  }`}
                >
                  {reliabilityMode === "high" ? "可靠性：高" : "可靠性：受系统限制"}
                </p>
              </div>

              {/* 检查更新 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-lg font-semibold text-indigo-900">
                    检查更新
                  </label>
                  <span className="text-xs text-gray-500">v{APP_VERSION}</span>
                </div>
                <button
                  onClick={handleCheckUpdate}
                  disabled={isCheckingUpdate}
                  className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                    isCheckingUpdate
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
                >
                  {isCheckingUpdate ? "检查中..." : "检查更新"}
                </button>
                {updateStatus && (
                  <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    {updateStatus}
                  </div>
                )}
                {updateUrl && (
                  <button
                    onClick={handleOpenReleasePage}
                    className="w-full px-4 py-2.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold text-sm hover:bg-emerald-100 transition-colors"
                  >
                    前往下载页
                  </button>
                )}
              </div>

              {/* 提醒高级 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowAdvancedReminder(!showAdvancedReminder)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-100 text-indigo-700 text-base font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <span>提醒高级</span>
                  {showAdvancedReminder ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {showAdvancedReminder && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-indigo-300 space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-indigo-900">
                            我的组别
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => onGroupChange(GROUP_TYPES.G6A)}
                              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                                userGroup === GROUP_TYPES.G6A
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              6班A组
                            </button>
                            <button
                              onClick={() => onGroupChange(GROUP_TYPES.G6B)}
                              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                                userGroup === GROUP_TYPES.G6B
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              6班B组
                            </button>
                            <button
                              onClick={() => onGroupChange(GROUP_TYPES.G7C)}
                              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                                userGroup === GROUP_TYPES.G7C
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              7班C组
                            </button>
                            <button
                              onClick={() => onGroupChange(GROUP_TYPES.G7D)}
                              className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                                userGroup === GROUP_TYPES.G7D
                                  ? "bg-indigo-600 text-white"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                              }`}
                            >
                              7班D组
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm font-medium text-indigo-900">
                            提前量（分钟）
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            {leadMinuteOptions.map((minutes) => (
                              <button
                                key={minutes}
                                onClick={() => onLeadMinutesChange?.(minutes)}
                                className={`py-2 rounded-lg text-sm font-semibold transition-colors ${
                                  leadMinutes === minutes
                                    ? "bg-indigo-600 text-white"
                                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                }`}
                              >
                                {minutes}
                              </button>
                            ))}
                          </div>
                        </div>

                        {exactAlarmMessage && (
                          <div className="flex items-center justify-between gap-2 bg-amber-50 text-amber-700 text-xs font-medium p-2 rounded-lg">
                            <span>{exactAlarmMessage}</span>
                            {exactAlarmStatus === "denied" && (
                              <button
                                onClick={onOpenExactAlarmSettings}
                                className="px-2 py-1 rounded-md bg-amber-200 text-amber-900 hover:bg-amber-300 transition-colors"
                              >
                                去开启
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          onClick={onTestNotification}
                          className="w-full px-4 py-2.5 rounded-lg bg-indigo-100 text-indigo-700 font-semibold text-sm hover:bg-indigo-200 transition-colors"
                        >
                          发送测试通知
                        </button>
                        {notificationStatus && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
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
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-100 text-indigo-700 text-base font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <span>更新与发布</span>
                  {showUpdateSection ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {showUpdateSection && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-indigo-300 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-indigo-900">
                            课表软更新
                          </div>
                          {remoteUpdatedAt && (
                            <span className="text-xs text-gray-500">
                              更新时间 {remoteUpdatedAt}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={handleSoftUpdateSchedule}
                          disabled={isSoftUpdating}
                          className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
                            isSoftUpdating
                              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {isSoftUpdating ? "更新中..." : "软更新课表"}
                        </button>
                        {softUpdateStatus && (
                          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                            {softUpdateStatus}
                          </div>
                        )}
                        <p className="text-xs text-gray-600">
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
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-100 text-indigo-700 text-base font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <span>课表管理</span>
                  {showScheduleManagement ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
                <AnimatePresence>
                  {showScheduleManagement && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-indigo-300 space-y-4">
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-indigo-900">
                            开学日期
                          </div>
                          <input
                            type="date"
                            value={semesterStartDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            lang="zh-CN"
                            placeholder="选择开学日期"
                            className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                            style={{
                              colorScheme: 'light'
                            }}
                          />
                          {todayInfo && (
                            <div className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                              今天是第{todayInfo.week}周 星期{["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}
                            </div>
                          )}
                          {!todayInfo && semesterStartDate && (
                            <div className="text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg">
                              今天不在上课时间
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-indigo-900">
                            重置课表
                          </div>
                          <button
                            onClick={handleResetSchedule}
                            className="w-full px-4 py-2.5 rounded-lg bg-rose-100 text-rose-700 font-semibold text-sm hover:bg-rose-200 transition-colors"
                          >
                            重置课表
                          </button>
                          <p className="text-xs text-gray-600">
                            清除所有自定义修改，恢复内置课表数据。
                          </p>
                          {resetStatus && (
                            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
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
                className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
              >
                <motion.div
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.96, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-sm rounded-2xl bg-white/90 backdrop-blur p-5 shadow-xl"
                >
                  <div className="text-base font-semibold text-indigo-900">
                    检测到远端课表更新
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    是否应用远端课表更新？当前课表将被替换。
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={handleCancelRemoteUpdate}
                      className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold text-sm hover:bg-gray-200 transition-colors"
                    >
                      暂不更新
                    </button>
                    <button
                      onClick={handleConfirmRemoteUpdate}
                      className="flex-1 px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-colors"
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
