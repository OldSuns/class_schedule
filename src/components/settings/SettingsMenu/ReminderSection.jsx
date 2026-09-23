import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const GROUP_OPTIONS = Array.from({ length: 7 }, (_, index) => `${index + 1}组`);

const ReminderSection = ({
  notificationsEnabled,
  onToggleNotifications,
  userGroup,
  onGroupChange,
  leadMinutes,
  leadMinuteOptions,
  onLeadMinutesChange,
  onTestNotification,
  notificationStatus,
  showGroupSection,
  onToggleGroupSection,
  showAdvancedReminder,
  onToggleAdvancedReminder
}) => (
  <>
    <div
      className="space-y-2 rounded-[18px] border p-4"
      style={{
        backgroundColor: "var(--surface-primary)",
        borderColor: "var(--outline-variant)"
      }}
    >
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold" style={{ color: "var(--foreground-primary)" }}>
          课程提醒
        </label>
        <button
          type="button"
          onClick={() => onToggleNotifications?.(!notificationsEnabled)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{
            backgroundColor: notificationsEnabled
              ? "var(--primary)"
              : "var(--outline-variant)"
          }}
          aria-pressed={notificationsEnabled}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            style={{
              transform: notificationsEnabled ? "translateX(24px)" : "translateX(4px)"
            }}
          />
        </button>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground-secondary)" }}>
        每门课程开始前 {leadMinutes} 分钟提醒（仅 Android）
      </p>
    </div>

    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggleGroupSection}
        className="flex w-full items-center justify-between rounded-[18px] border text-sm font-semibold transition-colors"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--outline-variant)",
          color: "var(--foreground-primary)",
          padding: "14px 16px"
        }}
      >
        <span>分组</span>
        {showGroupSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {showGroupSection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-4 gap-2 rounded-2xl bg-surface-mid p-3">
              {GROUP_OPTIONS.map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => onGroupChange?.(group)}
                  className="rounded-xl py-2 text-sm font-semibold transition-colors"
                  style={
                    userGroup === group
                      ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
                      : {
                          backgroundColor: "var(--surface-elevated)",
                          color: "var(--foreground-primary)"
                        }
                  }
                >
                  {group}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>

    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggleAdvancedReminder}
        className="flex w-full items-center justify-between rounded-[18px] border text-sm font-semibold transition-colors"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--outline-variant)",
          color: "var(--foreground-primary)",
          padding: "14px 16px"
        }}
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
            <div className="space-y-4 rounded-2xl bg-surface-mid p-3">
              <div className="space-y-2">
                <div className="text-sm font-semibold" style={{ color: "var(--foreground-primary)" }}>
                  提前量（分钟）
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {leadMinuteOptions.map((minutes) => (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => onLeadMinutesChange?.(minutes)}
                      className="rounded-xl py-2 text-sm font-semibold transition-colors"
                      style={
                        leadMinutes === minutes
                          ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
                          : {
                              backgroundColor: "var(--surface-elevated)",
                              color: "var(--foreground-primary)"
                            }
                      }
                    >
                      {minutes}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={onTestNotification}
                className="w-full rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "var(--secondary-container)",
                  color: "var(--on-secondary-container)",
                  padding: "10px 16px"
                }}
              >
                发送测试通知
              </button>
              {notificationStatus && (
                <div className="rounded-xl bg-surface-high p-2 text-xs text-on-surface-variant">
                  {notificationStatus}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </>
);

export default ReminderSection;
