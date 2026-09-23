import React from "react";
import { MIN_WEEK, MAX_WEEK } from "../../config/constants";

/**
 * Header — M3 mobile schedule header
 *
 * Layout: title | week input + status chip
 * Design tokens from Pencil:
 * - Title: fontFamily $font-sans, fontSize 15px, fontWeight 700
 * - Week input: cornerRadius 12px, fill $surface-elevated, padding [5,8]
 * - Status chip: cornerRadius 9999px, fill $primary-container, padding [2,8]
 */
const Header = ({
  todayInfo,
  displayWeekInfo,
  currentWeek,
  currentClassProgress,
  onWeekChange
}) => {
  const handleWeekInputChange = (e) => {
    onWeekChange(e.target.value);
  };

  const statusText = todayInfo
    ? `今天是第${todayInfo.week}周 星期${["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}`
    : displayWeekInfo?.isWeekendPreview
    ? `今天是周末，默认显示第${displayWeekInfo.week}周课表`
    : "";

  // Weekend preview → secondary tonal chip; weekday → primary tonal chip
  const statusStyle = displayWeekInfo?.isWeekendPreview
    ? { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)" }
    : { backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)" };

  return (
    <div className="mb-2 sm:mb-3">
      {/* Mobile top spacing (status bar already handled by safe-top) */}
      <div className="sm:hidden mb-1" />

      {/* Title row */}
      <div className="flex items-center gap-3 sm:gap-4 mb-1 px-1">
        {/* Centre: progress or title */}
        <div className="flex-1 min-w-0">
          {currentClassProgress ? (
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] sm:text-sm font-semibold truncate leading-tight"
                   style={{ color: "var(--foreground-primary)" }}>
                {currentClassProgress.periodLabel}
                <span className="mx-1" style={{ color: "var(--foreground-secondary)" }}>·</span>
                {currentClassProgress.courseLabel}
              </div>
              {/* Linear progress bar */}
              <div className="h-2 rounded-pill overflow-hidden"
                   style={{ backgroundColor: "var(--surface-mid)" }}>
                <div
                  className="h-full rounded-pill transition-[width] duration-500"
                  style={{
                    width: `${currentClassProgress.percent}%`,
                    backgroundColor: "var(--primary)",
                    opacity: 0.8
                  }}
                />
              </div>
              <div className="text-[10px] sm:text-xs leading-tight"
                   style={{ color: "var(--foreground-secondary)" }}>
                已过 {currentClassProgress.elapsedMinutes} 分钟 · 剩余{" "}
                {currentClassProgress.remainingMinutes} 分钟（{currentClassProgress.percent}%）
              </div>
            </div>
          ) : (
            <h1 className="text-[15px] font-semibold leading-tight truncate"
                style={{ color: "var(--foreground-primary)" }}>
              WL课表（2026-2）
            </h1>
          )}
        </div>

        {/* Week input + status chip */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <input
            type="number"
            min={MIN_WEEK}
            max={MAX_WEEK}
            value={currentWeek}
            onChange={handleWeekInputChange}
            className="w-16 px-2 py-1 rounded-xl border border-outline-variant
                       text-base font-bold text-center
                       focus:ring-2 focus:outline-none
                       transition-[border-color,box-shadow] duration-200"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--foreground-primary)",
              borderColor: "var(--outline-variant)",
              boxShadow: "none"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--primary)";
              e.target.style.boxShadow = "0 0 0 2px var(--primary)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--outline-variant)";
              e.target.style.boxShadow = "none";
            }}
          />
          {statusText && (
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-pill text-[10px] font-medium leading-tight"
              style={statusStyle}
            >
              {statusText}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
