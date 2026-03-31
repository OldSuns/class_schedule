import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  formatMonthDay,
  getPeriodLabel,
  getPeriodTime,
  getScheduleDate
} from "./timeUtils";
import { DAYS, DAY_NAMES, MAX_PERIOD } from "./constants";
import { getCourseLocation } from "./courseUtils";

const HOVER_CAPABLE_MEDIA_QUERY = "(hover: hover) and (pointer: fine)";

const getCanHover = () => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(HOVER_CAPABLE_MEDIA_QUERY).matches;
};

// M3 tonal course colors — low-saturation, harmonious with primary #6750A4
// Each index maps to a stable color for a given course slot
const COURSE_TONAL_COLORS = [
  { bg: "#EAD8FF", text: "#21005D", border: "#C9B1F0" }, // primary-adjacent purple
  { bg: "#C8E6FF", text: "#00315F", border: "#9DC8F0" }, // blue
  { bg: "#D3EDDF", text: "#002113", border: "#9ACDB5" }, // green
  { bg: "#FFE4CC", text: "#3A1A00", border: "#F0C59A" }, // orange
  { bg: "#FFD8E4", text: "#31111D", border: "#EBA8BF" }, // tertiary pink
  { bg: "#FFF0C2", text: "#261A00", border: "#E8CC7A" }, // yellow
  { bg: "#DCF0F5", text: "#001F24", border: "#9FD0DA" }, // teal
  { bg: "#EDE3FF", text: "#2C0052", border: "#C5ADEB" }, // lavender
];

// Stable color index derived from course name string
const getCourseColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return COURSE_TONAL_COLORS[hash % COURSE_TONAL_COLORS.length];
};

/**
 * CourseTable — M3 style
 *
 * Design decisions:
 * - Table header: primary (#6750A4) filled row, white text
 * - Period column: surface-mid (#F3EDF7) tonal, not bright white — creates subtle depth
 * - Empty cells: surface (#FFFBFE), hover shows a ghost + icon
 * - Course cells: tonal color card derived from course name hash (stable per course)
 * - Today highlight: primary-container (#EADDFF) header chip, primary border on cells
 * - Separator rows (午休/晚休): secondary-container strip
 */
const CourseTable = ({
  mergedCellsByDay,
  semesterStartDate,
  todayInfo,
  currentWeek,
  onCellClick,
  isScheduleLoaded = true
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
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ border: "1px solid #CAC4D0", backgroundColor: "#F3EDF7" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-xs sm:text-sm">
          <thead>
            <tr style={{ backgroundColor: "#6750A4" }}>
              {/* Period column header */}
              <th
                className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs font-semibold uppercase tracking-wide sticky left-0 z-10 whitespace-nowrap w-[1%] max-w-[6.5rem]"
                style={{ backgroundColor: "#6750A4", color: "#FFFFFF" }}
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
                    className="px-1 sm:px-2 py-2 sm:py-3 text-center font-semibold w-[17.5%] sm:w-auto"
                    style={{ backgroundColor: "#6750A4", color: "#FFFFFF" }}
                  >
                    <div className="flex flex-col items-center leading-tight gap-0.5">
                      {/* Today: tonal chip in primary-container */}
                      <span
                        className="text-xs sm:text-sm px-1.5 py-0.5 rounded-full font-semibold"
                        style={
                          isToday
                            ? { backgroundColor: "#EADDFF", color: "#21005D" }
                            : { color: "#FFFFFF" }
                        }
                      >
                        <span className="hidden sm:inline">{DAY_NAMES[day].zh}</span>
                        <span className="inline sm:hidden">{DAY_NAMES[day].short}</span>
                      </span>
                      {headerDateLabels[day] ? (
                        <span
                          className="text-[10px] sm:text-xs font-normal normal-case tracking-normal"
                          style={{ color: isToday ? "#EADDFF" : "rgba(255,255,255,0.75)" }}
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
                    {/* Period label cell */}
                    <td
                      className="px-1 sm:px-2 py-2 sm:py-3 text-center sticky left-0 z-10 w-[1%] max-w-[6.5rem]"
                      style={{
                        backgroundColor: "#F3EDF7",
                        borderRight: "1px solid #CAC4D0",
                        borderBottom: "1px solid #E6E0E9"
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-bold leading-tight ${
                            isEveningPeriod ? "text-[10px] sm:text-xs" : "text-xs sm:text-sm"
                          }`}
                          style={{ color: "#1C1B1F" }}
                        >
                          {periodLabel}
                        </span>
                        <span
                          className="text-[9px] sm:text-[10px] mt-0.5 leading-tight"
                          style={{ color: "#49454F" }}
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

                      const cellBorder = {
                        borderBottom: "1px solid #E6E0E9",
                        borderRight: "1px solid #E6E0E9"
                      };

                      // Empty cell
                      if (!cell || cell.empty) {
                        return (
                          <td
                            key={`${day}-${period}`}
                            onClick={() =>
                              isScheduleLoaded && onCellClick(day, period, period)
                            }
                            className={`group py-2 sm:py-3 align-middle transition-colors ${
                              isScheduleLoaded ? "cursor-pointer" : "cursor-not-allowed"
                            }`}
                            style={{
                              backgroundColor: isToday
                                ? "#F7F2FF"
                                : "#FFFBFE",
                              ...cellBorder
                            }}
                            title={isScheduleLoaded ? "点击添加课程" : "课表加载中"}
                          >
                            {isScheduleLoaded && canHover && (
                              <div
                                className="flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: "#6750A4" }}
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
                        ? getCourseColor(primaryCourseName)
                        : { bg: "#F3EDF7", text: "#49454F", border: "#CAC4D0" };

                      return (
                        <td
                          key={`${day}-${period}`}
                          onClick={() =>
                            isScheduleLoaded &&
                            onCellClick(day, cell.periodStart, cell.periodEnd)
                          }
                          className={`p-1 align-top transition-colors duration-200 ${   //“p-1”中的数字负责课程离边框距离
                            isScheduleLoaded ? "cursor-pointer" : "cursor-not-allowed"
                          }`}
                          rowSpan={cell.rowSpan}
                          style={{
                            backgroundColor: isToday ? "#F7F2FF" : "#FFFBFE",
                            borderBottom: "1px solid #E6E0E9",
                            borderRight: "1px solid #E6E0E9",
                            height: "1px",
                          }}
                        >
                          <div
                            className="w-full flex flex-col justify-center items-center gap-0.5 rounded-2xl py-1.5 sm:py-2 px-1"
                            style={{
                              height: "100%",
                              backgroundColor: tonalColor.bg,
                              border: isTodayAndHasClass
                                ? `2px solid #6750A4`
                                : `1px solid ${tonalColor.border}`,
                              minHeight: "2.5rem"
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
                                    {course.location && (
                                      <div
                                        className="text-[9px] sm:text-[10px] mt-0.5 break-words"
                                        style={{ color: tonalColor.text, opacity: 0.65 }}
                                      >
                                        📍 {getCourseLocation(course.location, currentWeek)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {cell.otherCoursesCount > 0 && (
                                  <div
                                    className="mt-0.5 flex items-center justify-center text-[9px] sm:text-[10px] font-medium"
                                    style={{ color: "#6750A4" }}
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

                  {/* 午休 / 晚休 separator */}
                  {period === 5 || period === 10 ? (
                    <tr aria-hidden="true">
                      <td
                        colSpan={DAYS.length + 1}
                        className="p-0"
                        style={{ backgroundColor: "#E8DEF8" }}
                      >
                        <div
                          className="h-5 flex items-center justify-center text-[10px] sm:text-xs tracking-wide select-none"
                          style={{ color: "#49454F" }}
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
