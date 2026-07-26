import React, { useEffect, useMemo, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import {
  formatMonthDay,
  getPeriodLabel,
  getPeriodTime,
  getScheduleDate
} from "../../utils/schedule/timeUtils";
import { DAYS, DAY_NAMES, MAX_PERIOD, THEMES } from "../../config/constants";

const HOVER_CAPABLE_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

const getCanHover = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(HOVER_CAPABLE_MEDIA_QUERY).matches;
};

// 课程颜色通过CSS变量获取，支持主题切换
const getCourseColorVars = (name, isCurrentWeek = false) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const colorNames = ['purple', 'blue', 'green', 'orange', 'pink', 'yellow', 'teal', 'lavender'];
  const colorName = colorNames[hash % colorNames.length];
  const prefix = isCurrentWeek ? 'course-today' : 'course';

  return {
    bg: `var(--${prefix}-${colorName}-bg)`,
    text: `var(--${prefix}-${colorName}-text)`,
    border: `var(--${prefix}-${colorName}-border)`,
  };
};

/**
 * CourseTable — Warm-white minimalist style
 *
 * Design decisions:
 * - Table header: light surface (#F7F2FA), dark text (#1C1B1F)
 * - Period column: surface-low tonal, no border separators
 * - Empty cells: surface (#FFFBFE), hover shows ghost + icon
 * - Course cells: ultra-light tonal color card, no shadow — no colored borders
 * - Today highlight: subtle ring instead of heavy border
 * - Separator rows (午休/晚休): surface-low with barely-visible borders
 * - Whitespace replaces most borders and separators
 */
const CourseTable = ({
  mergedCellsByDay,
  semesterStartDate,
  todayInfo,
  currentWeek,
  onCellClick,
  isScheduleLoaded = true,
  theme
}) => {
  const [canHover, setCanHover] = useState(getCanHover);
  const headerDateLabels = useMemo(
    () =>
      Object.fromEntries(
        DAYS.map((day) => [
          day,
          formatMonthDay(getScheduleDate(semesterStartDate, currentWeek, day))
        ])
      ),
    [currentWeek, semesterStartDate]
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mediaQuery = window.matchMedia(HOVER_CAPABLE_MEDIA_QUERY);
    const updateCanHover = () => setCanHover(mediaQuery.matches);
    updateCanHover();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateCanHover);
      return () => mediaQuery.removeEventListener("change", updateCanHover);
    }
    mediaQuery.addListener(updateCanHover);
    return () => mediaQuery.removeListener(updateCanHover);
  }, []);

  return (
    <div
      className="overflow-hidden rounded-[20px] border"
      style={{
        backgroundColor: "var(--surface-elevated)",
        borderColor: "var(--outline-variant)"
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-xs sm:text-sm">
          <thead>
            <tr style={{ backgroundColor: "var(--surface-elevated)" }}>
              {/* Period column header */}
              <th
                className="sticky left-0 z-10 w-[42px] min-w-[42px] max-w-[42px] px-1 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }}
              >
                节次
              </th>
              {DAYS.map((day) => {
                const isToday =
                  todayInfo &&
                  todayInfo.day === day &&
                  todayInfo.week === currentWeek;
                return (
                  <th
                    key={day}
                    className="w-[17.5%] px-1 py-3 text-center font-semibold sm:px-2"
                    style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }}
                  >
                    <div className="flex flex-col items-center leading-tight gap-0.5">
                      {/* Today: tonal chip in primary-container */}
                      <span
                        className="text-xs sm:text-sm px-1.5 py-0.5 rounded-full font-semibold"
                        style={
                          isToday
                            ? { backgroundColor: "var(--primary-container)", color: "var(--on-primary-container)" }
                            : { color: "var(--foreground-primary)" }
                        }
                      >
                        <span className="hidden sm:inline">{DAY_NAMES[day].zh}</span>
                        <span className="inline sm:hidden">{DAY_NAMES[day].short}</span>
                      </span>
                      {headerDateLabels[day] ? (
                        <span
                          className="text-[10px] sm:text-xs font-normal normal-case tracking-normal"
                          style={{ color: isToday ? "var(--on-primary-container)" : "var(--foreground-secondary)" }}
                        >
                          {headerDateLabels[day]}
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: MAX_PERIOD }, (_, i) => i + 1).map((period) => {
              const periodLabel = getPeriodLabel(period);
              const isEveningPeriod = periodLabel.startsWith("晚");
              const periodTime = getPeriodTime(period);

              return (
                <React.Fragment key={period}>
                  <tr>
                    {/* Period label cell — no borders, whitespace only */}
                    <td
                      className="sticky left-0 z-10 w-[42px] min-w-[42px] max-w-[42px] px-1 py-3 text-center sm:py-4"
                      style={{
                        backgroundColor: "var(--surface-elevated)"
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-bold leading-tight ${
                            isEveningPeriod ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
                          }`}
                          style={{ color: "var(--foreground-primary)" }}
                        >
                          {periodLabel}
                        </span>
                        <span
                          className="text-[9px] sm:text-[10px] mt-0.5 leading-tight"
                          style={{ color: "var(--foreground-secondary)" }}
                        >
                          {periodTime}
                        </span>
                      </div>
                    </td>

                    {DAYS.map((day) => {
                      const cell = mergedCellsByDay?.[day]?.[period];
                      if (cell?.skip) return null;

                      const isToday =
                        todayInfo &&
                        todayInfo.day === day &&
                        todayInfo.week === currentWeek;

                      // Empty cell — no borders, whitespace only
                      if (!cell || cell.empty) {
                        return (
                          <td
                            key={`${day}-${period}`}
                            onClick={() =>
                              isScheduleLoaded && onCellClick(day, period, period)
                            }
                            className={`group py-2 sm:py-3 align-middle transition-colors w-[17.5%] ${
                              isScheduleLoaded ? "cursor-pointer" : "cursor-not-allowed"
                            }`}
                            style={{
                              backgroundColor: isToday
                                ? "var(--surface-elevated)"
                                : "var(--surface)"
                            }}
                            title={isScheduleLoaded ? "点击添加课程" : "课表加载中"}
                          >
                            {isScheduleLoaded && canHover && (
                              <div
                                className="flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-primary/30"
                              >
                                <Plus size={11} className="mr-0.5" />
                                <span className="hidden sm:inline">新增</span>
                              </div>
                            )}
                          </td>
                        );
                      }

                      const isTodayAndHasClass = isToday && cell.hasCurrentWeekCourse;

                      // Derive tonal color from first display course name
                      const primaryCourseName = cell.displayCourses[0]?.name ?? "";
                      const tonalColor = cell.hasCurrentWeekCourse
                        ? getCourseColorVars(primaryCourseName, isTodayAndHasClass)
                        : { bg: "var(--surface-elevated)", text: "var(--foreground-secondary)" };

                      return (
                        <td
                          key={`${day}-${period}`}
                          onClick={() =>
                            isScheduleLoaded &&
                            onCellClick(day, cell.periodStart, cell.periodEnd)
                          }
                          className={`p-1.5 align-top transition-colors duration-200 w-[17.5%] ${
                            isScheduleLoaded ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                          rowSpan={cell.rowSpan}
                          style={{
                            backgroundColor: isToday ? "var(--surface-elevated)" : "var(--surface)",
                            height: "1px",
                          }}
                        >
                          <div
                            className={`w-full flex flex-col justify-center items-center gap-0.5 rounded-2xl py-2 sm:py-3 px-2 sm:px-3 ${
                              isTodayAndHasClass ? "ring-1 ring-primary/15" : ""
                            }`}
                            style={{
                              height: "100%",
                              backgroundColor: tonalColor.bg,
                              minHeight: "2.5rem",
                              ...(theme === THEMES.MINIMAL && cell.hasCurrentWeekCourse
                                ? {
                                    border: isTodayAndHasClass
                                      ? `2px solid ${tonalColor.border}`
                                      : `1px solid ${tonalColor.border}`,
                                  }
                                : {}),
                            }}
                          >
                            {cell.displayCourses.length > 0 ? (
                              <>
                                {cell.displayCourses.map((course, idx) => (
                                  <div
                                    key={`${course.name}-${course.group ?? ""}-${idx}`}
                                    className="text-center leading-snug"
                                  >
                                    <div
                                      className="font-semibold text-[11px] sm:text-xs break-words"
                                      style={{ color: tonalColor.text }}
                                    >
                                      {course.name}
                                    </div>
                                    {course.group && (
                                      <div
                                        className="text-[9px] sm:text-[10px] mt-0.5"
                                        style={{ color: tonalColor.text, opacity: 0.75 }}
                                      >
                                        {course.group}
                                      </div>
                                    )}
                                    {(() => {
                                      const locs =
                                        cell.distinctLocationsByDisplay?.[idx] ?? [];
                                      if (locs.length === 0) return null;
                                      const extraCount = locs.length - 1;
                                      return (
                                        <div
                                          className="text-[9px] sm:text-[10px] mt-0.5 break-words"
                                          style={{ color: tonalColor.text, opacity: 0.7 }}
                                          title={
                                            extraCount > 0
                                              ? locs.join("\n")
                                              : undefined
                                          }
                                        >
                                          <MapPin size={9} className="inline" /> {locs[0]}
                                          {extraCount > 0 && (
                                            <span
                                              className="ml-1 inline-flex items-center align-baseline font-medium text-primary/60"
                                              aria-label={`另有 ${extraCount} 个地点：${locs
                                                .slice(1)
                                                .join("、")}`}
                                            >
                                              <Plus size={9} className="mr-0.5" />
                                              {extraCount}
                                            </span>
                                          )}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                ))}
                                {cell.otherCoursesCount > 0 && (
                                  <div
                                    className="mt-0.5 flex items-center justify-center text-[9px] sm:text-[10px] font-medium text-primary/50"
                                  >
                                    <Plus size={9} className="mr-0.5" />
                                    <span className="hidden sm:inline">
                                      {cell.otherCoursesCount} 门其他
                                    </span>
                                    <span className="inline sm:hidden">+{cell.otherCoursesCount}</span>
                                  </div>
                                )}
                              </>
                            ) : null}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* 午休 / 晚休 separator — barely-visible borders */}
                  {period === 5 || period === 10 ? (
                    <tr aria-hidden="true">
                      <td
                        colSpan={DAYS.length + 1}
                        className="p-0 border-b border-softer"
                        style={{ backgroundColor: "var(--surface-elevated)" }}
                      >
                        <div
                          className="h-6 sm:h-7 flex items-center justify-center text-[10px] sm:text-xs tracking-wide select-none text-on-surface-variant font-medium"
                        >
                          {period === 5 ? "午休" : "晚休"}
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;
