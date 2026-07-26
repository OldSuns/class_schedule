import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ELECTIVE_OPTIONS } from "../../../config/constants";
import { GROUP_TYPES } from "../../../utils/schedule/groupUtils";

const GROUP_OPTIONS = [
  GROUP_TYPES.G6A,
  GROUP_TYPES.G6B,
  GROUP_TYPES.G7C,
  GROUP_TYPES.G7D
];

const ReminderSection = ({
  notificationsEnabled,
  onToggleNotifications,
  userGroup,
  onGroupChange,
  selectedElectives,
  onSelectedElectivesChange,
  leadMinutes,
  leadMinuteOptions,
  onLeadMinutesChange,
  onTestNotification,
  notificationStatus,
  showGroupElectiveSection,
  onToggleGroupElectiveSection,
  showAdvancedReminder,
  onToggleAdvancedReminder
}) => {
  const toggleElective = (value) => {
    const next = selectedElectives.includes(value)
      ? selectedElectives.filter((item) => item !== value)
      : [...selectedElectives, value];
    onSelectedElectivesChange?.(next);
  };

  return (
    <>
      <div
        className="space-y-2 rounded-[18px] border p-4"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--outline-variant)"
        }}
      >
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold"
                 style={{ color: "var(--foreground-primary)" }}>
            课程提醒
          </label>
          <button
            type="button"
            onClick={() => onToggleNotifications(!notificationsEnabled)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
            style={{ backgroundColor: notificationsEnabled ? "var(--primary)" : "var(--outline-variant)" }}
            aria-pressed={notificationsEnabled}
          >
          <span
            className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
            style={{ transform: notificationsEnabled ? "translateX(24px)" : "translateX(4px)" }}
          />
          </button>
        </div>
        <p className="text-xs leading-relaxed"
           style={{ color: "var(--foreground-secondary)" }}>
          每节课开始前 {leadMinutes} 分钟提醒（仅 Android）
        </p>
      </div>

      <div className="space-y-2">
        <button
          onClick={onToggleGroupElectiveSection}
          className="w-full flex items-center justify-between rounded-[18px] border transition-colors text-sm font-semibold"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--outline-variant)",
            color: "var(--foreground-primary)",
            padding: "14px 16px"
          }}
        >
          <span>分组与选修</span>
          {showGroupElectiveSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <AnimatePresence>
          {showGroupElectiveSection && (
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
                    组别
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {GROUP_OPTIONS.map((group) => (
                      <button
                        key={group}
                        onClick={() => onGroupChange?.(group)}
                        className="py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={
                          userGroup === group
                            ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
                            : { backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }
                        }
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-semibold"
                       style={{ color: "var(--foreground-primary)" }}>
                    选修课（可不选 / 可多选）
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {ELECTIVE_OPTIONS.map((option) => {
                      const isSelected = selectedElectives.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => toggleElective(option.value)}
                          className="py-2.5 rounded-xl text-sm font-semibold transition-colors"
                          style={
                            isSelected
                              ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
                              : { backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }
                          }
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs leading-relaxed"
                     style={{ color: "var(--foreground-secondary)" }}>
                    勾选后，该选修课会参与课表、课程详情、提醒和小组件的显示。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-2">
        <button
          onClick={onToggleAdvancedReminder}
          className="w-full flex items-center justify-between rounded-[18px] border transition-colors text-sm font-semibold"
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
              <div
                className="rounded-2xl p-3 space-y-4"
                style={{ backgroundColor: "var(--surface-mid)" }}
              >
                <div className="space-y-2">
                  <div className="text-sm font-semibold"
                       style={{ color: "var(--foreground-primary)" }}>
                    提前量（分钟）
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {leadMinuteOptions.map((minutes) => (
                      <button
                        key={minutes}
                        onClick={() => onLeadMinutesChange?.(minutes)}
                        className="py-2 rounded-xl text-sm font-semibold transition-colors"
                        style={
                          leadMinutes === minutes
                            ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
                            : { backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }
                        }
                      >
                        {minutes}
                      </button>
                    ))}
                  </div>
                </div>

                <button
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
                  <div
                    className="text-xs p-2 rounded-xl bg-surface-high text-on-surface-variant"
                  >
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
};

export default ReminderSection;
