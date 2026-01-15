import React from "react";
import { Plus } from "lucide-react";
import { getPeriodLabel, getPeriodTime } from "./timeUtils";
import { DAYS, DAY_NAMES, MAX_PERIOD } from "./constants";

/**
 * 课程表格组件
 */
const CourseTable = ({ mergedCellsByDay, todayInfo, currentWeek, onCellClick }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs sm:text-sm">
          <thead className="bg-indigo-600">
            <tr>
              <th className="px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-tight sm:tracking-wider w-10 sm:w-12 md:w-16 sticky left-0 bg-indigo-600 z-10">
                节次
              </th>
              {DAYS.map(day => (
                <th key={day} className="px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-center text-xs sm:text-sm font-medium text-white uppercase tracking-tight sm:tracking-wider w-[17.5%] sm:w-auto">
                  <span className="hidden sm:inline">{DAY_NAMES[day].zh}</span>
                  <span className="inline sm:hidden">{DAY_NAMES[day].short}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {Array.from({ length: MAX_PERIOD }, (_, i) => i + 1).map(period => (
              <tr key={period}>
                <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium text-gray-900 bg-indigo-50 border border-gray-200 sticky left-0 z-10">
                  <div className="flex flex-col items-center">
                    <div className="font-bold">{getPeriodLabel(period)}</div>
                    <div className="text-[10px] sm:text-xs text-gray-600 mt-0.5 whitespace-nowrap">
                      {getPeriodTime(period)}
                    </div>
                  </div>
                </td>
                {DAYS.map(day => {
                  const cell = mergedCellsByDay?.[day]?.[period];
                  if (cell?.skip) return null;

                  if (!cell || cell.empty) {
                    return <td key={`${day}-${period}`} className="py-2 sm:py-3 md:py-4 border border-gray-200" />;
                  }

                  // 检查是否是今天的课程且本周有课
                  const isToday = todayInfo && todayInfo.day === day && todayInfo.week === currentWeek;
                  const isTodayAndHasClass = isToday && cell.hasCurrentWeekCourse;

                  return (
                    <td
                      key={`${day}-${period}`}
                      onClick={() =>
                        onCellClick(day, cell.periodStart, cell.periodEnd, cell.filteredCourses)
                      }
                      className={`py-2 sm:py-3 md:py-4 px-1 sm:px-1.5 md:px-2 align-middle border cursor-pointer transition-colors duration-200 ${
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CourseTable;
