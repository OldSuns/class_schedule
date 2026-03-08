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

/**
 * 课程表格组件
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
    const updateCanHover = () => {
      setCanHover(mediaQuery.matches);
    };

    updateCanHover();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateCanHover);
      return () => mediaQuery.removeEventListener("change", updateCanHover);
    }

    mediaQuery.addListener(updateCanHover);
    return () => mediaQuery.removeListener(updateCanHover);
  }, []);

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-xs sm:text-sm">
          <thead className="bg-indigo-600">
            <tr>
              <th className="px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-center text-xs sm:text-sm font-medium text-white uppercase tracking-tight sm:tracking-wider w-[1%] max-w-[6.5rem] sticky left-0 bg-indigo-600 z-10 whitespace-nowrap">
                节次
              </th>
              {DAYS.map(day => (
                <th key={day} className="px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-center text-xs sm:text-sm font-medium text-white uppercase tracking-tight sm:tracking-wider w-[17.5%] sm:w-auto">
                  <div className="flex flex-col items-center leading-tight">
                    <span className="hidden sm:inline">{DAY_NAMES[day].zh}</span>
                    <span className="inline sm:hidden">{DAY_NAMES[day].short}</span>
                    {headerDateLabels[day] ? (
                      <span className="mt-0.5 text-[10px] sm:text-xs font-normal text-indigo-100 normal-case tracking-normal">
                        {headerDateLabels[day]}
                      </span>
                    ) : null}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {Array.from({ length: MAX_PERIOD }, (_, i) => i + 1).map(period => {
              const periodLabel = getPeriodLabel(period);
              const isEveningPeriod = periodLabel.startsWith("晚");
              const periodTime = getPeriodTime(period);

              return (
                <tr key={period}>
                <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium text-gray-900 bg-indigo-50 border border-gray-200 sticky left-0 z-10 w-[1%] max-w-[6.5rem]">
                  <div className="flex flex-col items-center w-full max-w-[6.5rem]">
                    <div className={`font-bold ${isEveningPeriod ? "text-[11px] sm:text-xs md:text-sm" : ""}`}>
                      {periodLabel}
                    </div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 leading-tight truncate w-full text-center">
                      {periodTime}
                    </div>
                  </div>
                </td>
                {DAYS.map(day => {
                  const cell = mergedCellsByDay?.[day]?.[period];
                  if (cell?.skip) return null;

                  if (!cell || cell.empty) {
                    return (
                      <td
                        key={`${day}-${period}`}
                        onClick={() =>
                          isScheduleLoaded && onCellClick(day, period, period)
                        }
                        className={`group py-2 sm:py-3 md:py-4 border border-gray-200 transition-colors ${
                          isScheduleLoaded
                            ? `cursor-pointer bg-white ${
                                canHover ? "hover:bg-indigo-50" : ""
                              }`
                            : "cursor-not-allowed bg-gray-50"
                        }`}
                        title={isScheduleLoaded ? "点击添加课程" : "课表加载中"}
                      >
                        {isScheduleLoaded ? (
                          canHover ? (
                            <div className="flex items-center justify-center text-xs text-indigo-400 opacity-0 transition-opacity group-hover:opacity-100">
                              <Plus size={12} className="mr-0.5" />
                              <span className="hidden sm:inline">新增课程</span>
                              <span className="inline sm:hidden">新增</span>
                            </div>
                          ) : null
                        ) : (
                          <div className="flex items-center justify-center text-xs text-gray-400 opacity-100">
                            <Plus size={12} className="mr-0.5" />
                            <span className="hidden sm:inline">加载中</span>
                            <span className="inline sm:hidden">...</span>
                          </div>
                        )}
                      </td>
                    );
                  }

                  // 检查是否是今天的课程且本周有课
                  const isToday = todayInfo && todayInfo.day === day && todayInfo.week === currentWeek;
                  const isTodayAndHasClass = isToday && cell.hasCurrentWeekCourse;

                  return (
                    <td
                      key={`${day}-${period}`}
                      onClick={() =>
                        isScheduleLoaded &&
                        onCellClick(day, cell.periodStart, cell.periodEnd)
                      }
                      className={`py-2 sm:py-3 md:py-4 px-1 sm:px-1.5 md:px-2 align-middle border transition-colors duration-200 ${
                        isScheduleLoaded ? "cursor-pointer" : "cursor-not-allowed"
                      } ${
                        isTodayAndHasClass
                          ? "bg-green-100 hover:bg-green-200 border-green-400 border-2"
                          : cell.hasCurrentWeekCourse
                          ? "bg-blue-50 hover:bg-blue-100 border-gray-200"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                      }`}
                      rowSpan={cell.rowSpan}
                    >
                      <div className="w-full flex flex-col justify-center items-center gap-1">
                        {cell.displayCourses.length > 0 ? (
                          <>
                            {cell.displayCourses.map((course, idx) => (
                              <div
                                key={`${course.name}-${course.group ?? ""}-${idx}`}
                                className={`text-center font-medium text-[11px] sm:text-xs md:text-sm leading-snug ${
                                  course.isCurrentWeek ? "text-blue-700" : "text-gray-600"
                                }`}
                              >
                                <div className="break-words">{course.name}</div>
                                {course.group && <div className="text-[10px] sm:text-xs md:text-sm mt-0.5">({course.group})</div>}
                                {course.location && (
                                  <div className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 mt-0.5 break-words">
                                    📍 {getCourseLocation(course.location, currentWeek)}
                                  </div>
                                )}
                              </div>
                            ))}
                            {cell.otherCoursesCount > 0 && (
                              <div className="mt-0.5 flex items-center justify-center text-[10px] sm:text-xs md:text-sm text-indigo-600 font-medium">
                                <Plus size={10} className="mr-0.5" />
                                <span className="hidden sm:inline">{cell.otherCoursesCount} 门其他</span>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;
