import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const ScheduleManagementSection = ({
  showScheduleManagement,
  onToggleScheduleManagement,
  currentScheduleSourceLabel,
  hasManualScheduleChanges,
  onResetSchedule,
  resetStatus
}) => (
  <div className="space-y-3">
    <button
      onClick={onToggleScheduleManagement}
      className="w-full flex items-center justify-between rounded-[18px] border text-sm font-semibold transition-colors"
      style={{
        backgroundColor: "var(--surface-primary)",
        borderColor: "var(--outline-variant)",
        color: "var(--foreground-primary)",
        padding: "14px 16px"
      }}
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
            style={{ backgroundColor: "var(--surface-mid)" }}
          >
            <div className="space-y-2">
              <div className="text-sm font-semibold"
                   style={{ color: "var(--foreground-primary)" }}>
                当前课表状态
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl px-3 py-2"
                     style={{ backgroundColor: "var(--surface-elevated)" }}>
                  <div className="text-[11px]"
                       style={{ color: "var(--primary)" }}>
                    当前来源
                  </div>
                  <div className="mt-1 text-sm font-semibold"
                       style={{ color: "var(--foreground-primary)" }}>
                    {currentScheduleSourceLabel}
                  </div>
                </div>
                <div className="rounded-xl px-3 py-2"
                     style={{ backgroundColor: "var(--surface-elevated)" }}>
                  <div className="text-[11px]"
                       style={{ color: "var(--primary)" }}>
                    手动修改
                  </div>
                  <div className="mt-1 text-sm font-semibold"
                       style={{ color: "var(--foreground-primary)" }}>
                    {hasManualScheduleChanges ? "有" : "无"}
                  </div>
                </div>
              </div>
              <p className="text-xs leading-relaxed"
                 style={{ color: "var(--foreground-secondary)" }}>
                当前课表来源为"{currentScheduleSourceLabel}"，
                {hasManualScheduleChanges
                  ? "已包含你的手动编辑。"
                  : "当前没有检测到手动编辑记录。"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold"
                   style={{ color: "var(--foreground-primary)" }}>
                重置课表
              </div>
              <button
                onClick={onResetSchedule}
                className="w-full rounded-xl font-semibold text-sm transition-colors"
                style={{
                  backgroundColor: "var(--error-container)",
                  color: "var(--on-error-container)",
                  padding: "10px 16px"
                }}
              >
                重置课表
              </button>
              <p className="text-xs leading-relaxed"
                 style={{ color: "var(--foreground-secondary)" }}>
                清除所有自定义修改，恢复内置课表数据。
              </p>
              {resetStatus && (
                <div
                  className="text-xs p-2 rounded-xl"
                  style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground-secondary)" }}
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
