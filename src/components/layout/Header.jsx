import { CalendarDays, Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const GROUP_OPTIONS = Array.from({ length: 7 }, (_, index) => `${index + 1}组`);

const Header = ({
  todayInfo,
  isViewingToday = true,
  userGroup = "1组",
  onGroupChange,
  onReturnToday
}) => {
  const [isGroupOpen, setIsGroupOpen] = useState(false);
  const groupRootRef = useRef(null);
  const triggerRef = useRef(null);
  const statusText = todayInfo
    ? `今天是第${todayInfo.week}周 星期${["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}`
    : "暑期社会实践课表";
  const showReturnToday = Boolean(todayInfo?.day) && !isViewingToday;

  useEffect(() => {
    if (!isGroupOpen) return undefined;
    const closeOnOutsidePress = (event) => {
      if (!groupRootRef.current?.contains(event.target)) setIsGroupOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setIsGroupOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isGroupOpen]);

  const selectGroup = (group) => {
    onGroupChange?.(group);
    setIsGroupOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <header className="mb-3 flex items-start justify-between px-1 pt-1">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold leading-tight text-on-surface">
          WL课表（2026暑期）
        </h1>
        <p className="mt-1 text-[10px] font-medium leading-tight text-on-surface-variant">
          {statusText}
        </p>
      </div>
      {showReturnToday ? (
        <button
          type="button"
          aria-label="返回今天"
          onClick={onReturnToday}
          className="flex h-9 w-[78px] shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-sm font-bold outline-none transition-[background-color,box-shadow,transform] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--primary)",
            borderColor: "var(--primary)",
            color: "var(--on-primary)",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.12)"
          }}
        >
          <CalendarDays aria-hidden="true" size={14} />
          <span>今天</span>
        </button>
      ) : (
        <div ref={groupRootRef} className="relative shrink-0">
        <button
          ref={triggerRef}
          type="button"
          data-slot="group-trigger"
          aria-label="选择分组"
          aria-haspopup="listbox"
          aria-expanded={isGroupOpen}
          aria-controls="header-group-listbox"
          onClick={() => setIsGroupOpen((open) => !open)}
          className="flex h-9 w-[78px] items-center justify-center gap-1 rounded-full border px-3 text-sm font-bold outline-none transition-[background-color,color,box-shadow,border-color] active:scale-[0.98]"
          style={{
            backgroundColor: "var(--primary)",
            borderColor: "var(--primary)",
            color: "var(--on-primary)",
            boxShadow: isGroupOpen ? "0 8px 22px rgba(15, 23, 42, 0.14)" : "none"
          }}
        >
          <span>{userGroup}</span>
          <ChevronDown
            aria-hidden="true"
            size={14}
            className={`transition-transform ${isGroupOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          id="header-group-listbox"
          role="listbox"
          aria-label="分组列表"
          hidden={!isGroupOpen}
          className="absolute right-0 z-40 mt-2 w-[232px] rounded-2xl border p-2 shadow-[0_16px_40px_rgba(15,23,42,0.14)]"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--outline-variant)"
          }}
        >
          <div className="grid grid-cols-4 gap-1.5">
            {GROUP_OPTIONS.map((group) => {
              const selected = group === userGroup;
              return (
                <button
                  key={group}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectGroup(group)}
                  className="relative flex h-10 items-center justify-center rounded-xl border text-xs font-bold transition-colors"
                  style={{
                    backgroundColor: selected
                      ? "var(--primary-container)"
                      : "var(--surface-primary)",
                    borderColor: selected ? "var(--primary)" : "var(--outline-variant)",
                    color: selected ? "var(--primary)" : "var(--on-surface)"
                  }}
                >
                  {selected && (
                    <Check aria-hidden="true" size={12} className="absolute left-1" />
                  )}
                  {group}
                </button>
              );
            })}
          </div>
        </div>
        </div>
      )}
    </header>
  );
};

export default Header;
