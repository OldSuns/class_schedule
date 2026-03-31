import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const ScheduleManagementSection = ({
  showScheduleManagement,
  onToggleScheduleManagement,
  semesterStartDate,
  onStartDateChange,
  weekStatusText,
  weekStatusStyle,
  currentScheduleSourceLabel,
  hasManualScheduleChanges,
  onResetSchedule,
  resetStatus
}) => (
  <div className="space-y-3">
    <button
      onClick={onToggleScheduleManagement}
      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
      style={{ backgroundColor: "#E8DEF8", color: "#1D192B" }}
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
          <div
            className="rounded-2xl p-3 space-y-4"
            style={{ backgroundColor: "#F3EDF7", border: "1px solid #CAC4D0" }}
          >
            <div className="space-y-2">
              <div className="text-sm font-semibold" style={{ color: "#1C1B1F" }}>
                开学日期
              </div>
              <input
                type="date"
                value={semesterStartDate}
                onChange={(event) => onStartDateChange(event.target.value)}
                lang="zh-CN"
                placeholder="选择开学日期"
                className="w-full px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: "#ECE6F0",
                  color: "#1C1B1F",
                  border: "1px solid #CAC4D0",
                  colorScheme: "light"
                }}
              />
              {weekStatusText && (
                <div className="text-sm font-medium p-2.5 rounded-xl" style={weekStatusStyle}>
                  {weekStatusText}
                </div>
              )}
              {!weekStatusText && semesterStartDate && (
                <div
                  className="text-sm font-medium p-2.5 rounded-xl"
                  style={{ backgroundColor: "#ECE6F0", color: "#49454F" }}
                >
                  今天不在上课时间
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold" style={{ color: "#1C1B1F" }}>
                当前课表状态
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2" style={{ backgroundColor: "#ECE6F0" }}>
                  <div className="text-[11px]" style={{ color: "#6750A4" }}>
                    当前来源
                  </div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: "#1C1B1F" }}>
                    {currentScheduleSourceLabel}
                  </div>
                </div>
                <div className="rounded-xl px-3 py-2" style={{ backgroundColor: "#ECE6F0" }}>
                  <div className="text-[11px]" style={{ color: "#6750A4" }}>
                    手动修改
                  </div>
                  <div className="mt-1 text-sm font-semibold" style={{ color: "#1C1B1F" }}>
                    {hasManualScheduleChanges ? "有" : "无"}
                  </div>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#49454F" }}>
                当前课表来源为"{currentScheduleSourceLabel}"，
                {hasManualScheduleChanges
                  ? "已包含你的手动编辑。"
                  : "当前没有检测到手动编辑记录。"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold" style={{ color: "#1C1B1F" }}>
                重置课表
              </div>
              <button
                onClick={onResetSchedule}
                className="w-full px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                style={{ backgroundColor: "#FFDAD6", color: "#410002" }}
              >
                重置课表
              </button>
              <p className="text-xs" style={{ color: "#49454F" }}>
                清除所有自定义修改，恢复内置课表数据。
              </p>
              {resetStatus && (
                <div
                  className="text-xs p-2 rounded-xl"
                  style={{ backgroundColor: "#ECE6F0", color: "#49454F" }}
                >
                  {resetStatus}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default ScheduleManagementSection;
