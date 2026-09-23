import { CalendarDays, FileText, Settings } from "lucide-react";

export const APP_TABS = {
  SCHEDULE: "schedule",
  EXAMS: "exams",
  SETTINGS: "settings"
};

const NAV_ITEMS = [
  {
    value: APP_TABS.SCHEDULE,
    label: "日程",
    icon: CalendarDays
  },
  {
    value: APP_TABS.EXAMS,
    label: "考试",
    icon: FileText
  },
  {
    value: APP_TABS.SETTINGS,
    label: "设置",
    icon: Settings
  }
];

const BottomNavigation = ({ activeTab, onTabChange }) => (
  <nav
    className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(8px,var(--safe-bottom))] pointer-events-none"
    aria-label="主导航"
  >
    <div
      className="mx-auto flex h-16 max-w-[430px] items-center gap-1 rounded-[28px] p-1.5 pointer-events-auto"
      style={{
        backgroundColor: "rgba(255, 251, 254, 0.95)",
        boxShadow: "0 -2px 12px rgba(0, 0, 0, 0.08)"
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onTabChange?.(item.value)}
            className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 rounded-[22px] px-1 transition-colors"
            style={{
              backgroundColor: isActive ? "var(--primary-container)" : "transparent",
              color: isActive ? "var(--primary)" : "var(--foreground-secondary)"
            }}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-semibold leading-none">
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNavigation;
