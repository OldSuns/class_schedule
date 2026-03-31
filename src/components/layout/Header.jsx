import React from "react";
import { Menu } from "lucide-react";
import { MIN_WEEK, MAX_WEEK } from "../../config/constants";

/**
 * Header — M3 style
 *
 * Layout: icon-button (menu) | flex-1 content | spacer
 * Week switcher: prev pill-btn | number input | next pill-btn
 * Colors: primary (#6750A4) for interactive, surface-mid for containers
 */
const Header = ({
  todayInfo,
  displayWeekInfo,
  currentWeek,
  currentClassProgress,
  onOpenMenu,
  onWeekChange,
  onPreviousWeek,
  onNextWeek
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
    ? { bg: "bg-secondary-container", text: "text-[#1D192B]" }
    : { bg: "bg-primary-container", text: "text-[#21005D]" };

  return (
    <div className="mb-1 sm:mb-2">
      {/* Mobile top spacing (status bar already handled by safe-top) */}
      <div className="sm:hidden mb-1" />

      {/* Title row */}
      <div className="flex items-center gap-2 sm:gap-3 mb-1 px-1">
        {/* Menu FAB — M3 filled tonal icon button */}
        <button
          onClick={onOpenMenu}
          className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center
                     rounded-xl2 bg-secondary-container text-[#1D192B]
                     active:bg-[#D0BCFF] transition-colors duration-200"
          style={{ backgroundColor: "#E8DEF8" }}
          title="打开设置菜单"
        >
          <Menu size={20} />
        </button>

        {/* Centre: progress or title */}
        <div className="flex-1 min-w-0">
          {currentClassProgress ? (
            <div className="flex flex-col gap-0.5">
              <div className="text-[11px] sm:text-sm font-semibold text-[#1C1B1F] truncate leading-tight">
                {currentClassProgress.periodLabel}
                <span className="mx-1 text-[#49454F]">·</span>
                {currentClassProgress.courseLabel}
              </div>
              {/* M3 linear progress — tonal primary */}
              <div className="h-1.5 rounded-pill bg-[#E8DEF8] overflow-hidden">
                <div
                  className="h-full rounded-pill bg-[#6750A4] transition-[width] duration-500"
                  style={{ width: `${currentClassProgress.percent}%` }}
                />
              </div>
              <div className="text-[10px] sm:text-xs text-[#49454F] leading-tight">
                已过 {currentClassProgress.elapsedMinutes} 分钟 · 剩余{" "}
                {currentClassProgress.remainingMinutes} 分钟（{currentClassProgress.percent}%）
              </div>
            </div>
          ) : (
            <h1 className="text-sm sm:text-lg md:text-2xl font-bold text-[#1C1B1F] leading-tight truncate">
              WL课表（2026-1）
            </h1>
          )}
        </div>

        {/* Spacer + week input inline */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          <input
            type="number"
            min={MIN_WEEK}
            max={MAX_WEEK}
            value={currentWeek}
            onChange={handleWeekInputChange}
            className="w-20 px-2 py-1 rounded-xl
                       bg-[#ECE6F0] border-0
                       text-base font-bold text-center text-[#1C1B1F]
                       focus:ring-2 focus:ring-[#6750A4] focus:outline-none
                       transition-shadow duration-200"
          />
          {statusText && (
            <span
              className="inline-flex items-center px-2 py-0 rounded-pill text-[10px] font-medium leading-4"
              style={
                displayWeekInfo?.isWeekendPreview
                  ? { backgroundColor: "#E8DEF8", color: "#1D192B" }
                  : { backgroundColor: "#EADDFF", color: "#21005D" }
              }
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
