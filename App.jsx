import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Plus } from "lucide-react";

const App = () => {
  // 课表数据（根据校正后的课表结构化）
  const scheduleData = useMemo(() => [
    // 星期一
    {
      day: "Monday",
      periods: [
        { period: 1, courses: [
            { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×14（共28学时）" }
          ]},
        { period: 2, courses: [
            { name: "内科学A(I)", weeks: [1,2,3,4,5,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×14（共28学时）" }
          ]},
        { period: 3, courses: [
            { name: "神经病学B", weeks: [4,5,7,8,9,11,12,13,14,15], group: null, note: "2学时×10（共20学时）" }
          ] },
        { period: 4, courses: [
            { name: "神经病学B", weeks: [4,5,7,8,9,11,12,13,14,15], group: null, note: "2学时×10（共20学时）" }
          ]},
        { period: 5, courses: []},
        { period: 6, courses: [
            { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时×1" },
            { name: "内科学见习", weeks: [16], group: "6班B组", note: "2学时×1" },
            { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
            { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
            { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
            { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
          ]},
        { period: 7, courses: [
            { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时×1" },
            { name: "内科学见习", weeks: [16], group: "6班B组", note: "2学时×1" },
            { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
            { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
            { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
            { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
          ]},
        { period: 8, courses: [
            { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
            { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
            { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
            { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
          ]},
        { period: 9, courses: [
            { name: "内科学见习", weeks: [5,8,11,13], group: "6班A组", note: "4学时×4" },
            { name: "内科学见习", weeks: [7,9,12,14], group: "6班B组", note: "4学时×4" },
            { name: "儿科学见习", weeks: [7,9,12,14,16], group: "6班A组", note: "4学时×5" },
            { name: "儿科学见习", weeks: [8,11,13,15], group: "6班B组", note: "4学时×4" }
          ]},
        { period: 10, courses: [] },
        { period: 11, courses: [] }
      ]
    },
    // 星期二
    {
      day: "Tuesday",
      periods: [
        { period: 1, courses: [
            { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: "2学时×8（共16学时）" }
          ]},
        { period: 2, courses: [
            { name: "内科学A(I)", weeks: [1,2,4,6,8,12,14,16], group: null, note: "2学时×8（共16学时）" }
          ]},
        { period: 3, courses: [
            { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×15（共30学时）" }
          ]},
        { period: 4, courses: [
            { name: "外科学A(I)", weeks: [1,2,3,4,5,6,7,8,9,11,12,13,14,15,16], group: null, note: "2学时×15（共30学时）" }
          ]},
        { period: 5, courses: [] },
        { period: 6, courses: [
            { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: "2学时×4" },
            { name: "神经病学见习", weeks: [9], group: "6班A组", note: "3学时×1" },
            { name: "神经病学见习", weeks: [11], group: "6班B组", note: "3学时×1" },
            { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
          ]},
        { period: 7, courses: [
            { name: "口腔科见习", weeks: [5,7,12,13], group: "6班A、B组", note: "2学时×4" },
            { name: "神经病学见习", weeks: [9], group: "6班A组", note: "3学时×1" },
            { name: "神经病学见习", weeks: [11], group: "6班B组", note: "3学时×1" },
            { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
          ]},
        { period: 8, courses: [
            { name: "神经病学见习", weeks: [9], group: "6班A组", note: "3学时×1" },
            { name: "神经病学见习", weeks: [11], group: "6班B组", note: "3学时×1" },
            { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
          ]},
        { period: 9, courses: [
            { name: "外科学见习", weeks: [8,14], group: "6班A组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,15], group: "6班B组", note: "4学时×2" }
          ]},
        { period: 10, courses: [] },
        { period: 11, courses: [] }
      ]
    },
    // 星期三
    {
      day: "Wednesday",
      periods: [
        { period: 1, courses: [
            { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: "3学时×12（共36学时）" },
            { name: "儿科学A", weeks: [16], group: null, note: "2学时×1（共2学时）" }
          ]},
        { period: 2, courses: [
            { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: "3学时×12（共36学时）" },
            { name: "儿科学A", weeks: [16], group: null, note: "2学时×1（共2学时）" }
          ]},
        { period: 3, courses: [
            { name: "儿科学A", weeks: [1,2,5,7,8,9,10,11,12,13,14,15], group: null, note: "3学时×12（共36学时）" }
          ]},
        { period: 4, courses: [] },
        { period: 5, courses: [] },
        { period: 6, courses: [
            { name: "形势与政策A", weeks: [4,14,15], group: null, note: "讲座（14-15周第6节，网课）" }
          ]},
        { period: 7, courses: [] },
        { period: 8, courses: [] },
        { period: 9, courses: [] },
        { period: 10, courses: [
            { name: "形势与政策A", weeks: [14,15], group: null, note: "陈超怡（讲座）" }
          ]},
        { period: 11, courses: [
            { name: "形势与政策A", weeks: [14,15], group: null, note: "陈超怡（讲座）" }
          ]}
      ]
    },
    // 星期四
    {
      day: "Thursday",
      periods: [
        { period: 1, courses: [
            { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
            { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,13], group: "6班A组", note: "3学时×2" },
            { name: "外科学见习", weeks: [8,12], group: "6班B组", note: "3学时×2" },
            { name: "神经病学见习", weeks: [8], group: "6班A组", note: "3学时×1" },
            { name: "神经病学见习", weeks: [9], group: "6班B组", note: "3学时×1" }
          ]},
        { period: 2, courses: [
            { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
            { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,13], group: "6班A组", note: "3学时×2" },
            { name: "外科学见习", weeks: [8,12], group: "6班B组", note: "3学时×2" },
            { name: "神经病学见习", weeks: [8], group: "6班A组", note: "3学时×1" },
            { name: "神经病学见习", weeks: [9], group: "6班B组", note: "3学时×1" }
          ]},
        { period: 3, courses: [
            { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
            { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" },
            { name: "外科学见习", weeks: [9,13], group: "6班A组", note: "3学时×2" },
            { name: "外科学见习", weeks: [8,12], group: "6班B组", note: "3学时×2" },
            { name: "神经病学见习", weeks: [8], group: "6班A组", note: "3学时×1" },
            { name: "神经病学见习", weeks: [9], group: "6班B组", note: "3学时×1" }
          ]},
        { period: 4, courses: [
            { name: "儿科学见习", weeks: [15], group: "6班A组", note: "4学时×1" },
            { name: "儿科学见习", weeks: [14,16], group: "6班B组", note: "4学时×2" }
          ]},
        { period: 5, courses: [] },
        { period: 6, courses: [
            { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: "2学时×8（共16学时）" }
          ]},
        { period: 7, courses: [
            { name: "内科学A(I)", weeks: [1,3,5,7,9,11,13,15], group: null, note: "2学时×8（共16学时）" },
            { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: "2学时×8（共16学时）" }
          ]},
        { period: 8, courses: [
            { name: "外科学A(I)", weeks: [2,4,6,8,10,12,14,16], group: null, note: "2学时×8（共16学时）" }
          ]},
        { period: 9, courses: [] },
        { period: 10, courses: [] },
        { period: 11, courses: [] }
      ]
    },
    // 星期五
    {
      day: "Friday",
      periods: [
        { period: 1, courses: [
            { name: "神经病学B", weeks: [1,2,3], group: null, note: "2学时×3" },
            { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: "2学时×6（共12学时）" }
          ]},
        { period: 2, courses: [
            { name: "神经病学B", weeks: [1,2,3], group: null, note: "2学时×3" },
            { name: "外科学A(I)", weeks: [5,6,7,11,13,15], group: null, note: "2学时×6（共12学时）" }
          ]},
        { period: 3, courses: [
            { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: "2学时×10（共10学时）" }
          ] },
        { period: 4, courses: [
            { name: "口腔科学A", weeks: [2,4,6,8,12], group: null, note: "2学时×10（共10学时）" }
          ]},
        { period: 5, courses: []},
        { period: 6, courses: [
            { name: "儿科学见习", weeks: [12], group: "6班A组", note: "2学时" },
            { name: "儿科学见习", weeks: [13], group: "6班B组", note: "2学时" },
            { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时" },
            { name: "内科学见习", weeks: [14], group: "6班B组", note: "2学时" }
          ]},
        { period: 7, courses: [
            { name: "儿科学见习", weeks: [12], group: "6班A组", note: "2学时" },
            { name: "儿科学见习", weeks: [13], group: "6班B组", note: "2学时" },
            { name: "内科学见习", weeks: [15], group: "6班A组", note: "2学时" },
            { name: "内科学见习", weeks: [14], group: "6班B组", note: "2学时" }
          ]},
        { period: 8, courses: [] },
        { period: 9, courses: [] },
        { period: 10, courses: [] },
        { period: 11, courses: [] }
      ]
    }
  ], []);

  // 状态管理
  const [currentWeek, setCurrentWeek] = useState(1);
  const [selectedCell, setSelectedCell] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 处理周数变化
  const handleWeekChange = (e) => {
    const week = parseInt(e.target.value);
    if (week >= 1 && week <= 16) {
      setCurrentWeek(week);
    }
  };

  // 处理单元格点击
  const handleCellClick = (day, periodStart, periodEnd, courses) => {
    setSelectedCell({ day, periodStart, periodEnd, courses });
    setIsModalOpen(true);
  };

  // 获取节次名称
  const getPeriodLabel = (period) => {
    if (period === 10 || period === 11) {
      return `晚${period - 9}节`;
    }
    return `${period}节`;
  };

  const getPeriodRangeLabel = (periodStart, periodEnd) => {
    if (periodStart === periodEnd) return getPeriodLabel(periodStart);
    return `${getPeriodLabel(periodStart)}～${getPeriodLabel(periodEnd)}`;
  };

  // 合并同一天内连续的同一课程：以“显示的课程（name+group）一致”为准，并用 rowSpan 覆盖多行显示
  const mergedCellsByDay = useMemo(() => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const periods = Array.from({ length: 11 }, (_, i) => i + 1);
    const result = {};

    const getCourseKey = (course) =>
      `${course.name}::${course.group ?? ""}::${course.note ?? ""}::${course.weeks.join(",")}`;

    const getDisplayKey = (courses) => {
      const keys = [];
      const seen = new Set();
      for (const course of courses) {
        const key = `${course.name}::${course.group ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        keys.push(key);
      }
      keys.sort();
      return keys.join("||");
    };

    const getDisplayCourses = (courses) => {
      const result = [];
      const seen = new Set();
      for (const course of courses) {
        const key = `${course.name}::${course.group ?? ""}`;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(course);
      }
      // 同一时间 A/B 组都上课时同时显示（最多显示 2 条，剩余用“其他课程”提示）
      return result.slice(0, 2);
    };

    for (const day of days) {
      const dayData = scheduleData.find(d => d.day === day);
      const raw = {};

      for (const period of periods) {
        const periodData = dayData?.periods.find(p => p.period === period);
        const courses = periodData?.courses ?? [];

        if (courses.length === 0) {
          raw[period] = { empty: true };
          continue;
        }

        const filteredCourses = courses.map(course => ({
          ...course,
          isCurrentWeek: course.weeks.includes(currentWeek),
        }));

        const currentWeekCourses = filteredCourses.filter(c => c.isCurrentWeek);
        const displayCourses =
          currentWeekCourses.length > 0 ? getDisplayCourses(currentWeekCourses) : (filteredCourses[0] ? [filteredCourses[0]] : []);
        const displayKey = currentWeekCourses.length > 0 ? getDisplayKey(currentWeekCourses) : "";
        const otherCoursesCount = Math.max(0, filteredCourses.length - displayCourses.length);

        raw[period] = {
          empty: false,
          filteredCourses,
          displayCourses,
          displayKey,
          hasCurrentWeekCourse: currentWeekCourses.length > 0,
          otherCoursesCount,
        };
      }

      const merged = {};
      let period = 1;
      while (period <= 11) {
        const cell = raw[period];
        if (!cell || cell.empty) {
          merged[period] = { empty: true };
          period += 1;
          continue;
        }

        // 不是本周课程：不做跨节次合并（保持每节独立显示）
        if (!cell.hasCurrentWeekCourse) {
          merged[period] = {
            ...cell,
            periodStart: period,
            periodEnd: period,
            rowSpan: 1,
          };
          period += 1;
          continue;
        }

        let end = period;
        const combinedCoursesMap = new Map();
        const addCourses = (list) => {
          for (const course of list) {
            const key = getCourseKey(course);
            const existing = combinedCoursesMap.get(key);
            if (!existing) {
              combinedCoursesMap.set(key, course);
              continue;
            }
            if (!existing.isCurrentWeek && course.isCurrentWeek) {
              combinedCoursesMap.set(key, { ...existing, isCurrentWeek: true });
            }
          }
        };

        addCourses(cell.filteredCourses);
        let hasCurrentWeekCourse = cell.hasCurrentWeekCourse;

        while (end + 1 <= 11) {
          const next = raw[end + 1];
          if (!next || next.empty) break;
          if (!next.hasCurrentWeekCourse) break;
          if (next.displayKey !== cell.displayKey) break;
          addCourses(next.filteredCourses);
          hasCurrentWeekCourse = hasCurrentWeekCourse || next.hasCurrentWeekCourse;
          end += 1;
        }

        const mergedCourses = Array.from(combinedCoursesMap.values());
        const mergedCurrentWeekCourses = mergedCourses.filter(c => c.isCurrentWeek);
        const displayCourses = getDisplayCourses(mergedCurrentWeekCourses);
        const otherCoursesCount = Math.max(0, mergedCourses.length - displayCourses.length);

        merged[period] = {
          ...cell,
          filteredCourses: mergedCourses,
          displayCourses,
          hasCurrentWeekCourse,
          otherCoursesCount,
          periodStart: period,
          periodEnd: end,
          rowSpan: end - period + 1,
        };

        for (let p = period + 1; p <= end; p += 1) {
          merged[p] = { skip: true };
        }

        period = end + 1;
      }

      result[day] = merged;
    }

    return result;
  }, [scheduleData, currentWeek]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题和周数选择 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-2">
            第五临床医学院 临床医学 2023级 6班课表
          </h1>
          <p className="text-gray-600 mb-4">湖州市中心医院教学点</p>
          <div className="flex justify-center items-center space-x-4">
            <label className="font-medium text-lg text-indigo-800">当前周数:</label>
            <input
              type="number"
              min="1"
              max="16"
              value={currentWeek}
              onChange={handleWeekChange}
              className="w-20 px-3 py-2 border-2 border-indigo-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="text-gray-500 text-sm">（1-16周）</div>
          </div>
        </div>

        {/* 课表 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
          <table className="min-w-full border-collapse">
            <thead className="bg-indigo-600">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-24">
                  节次
                </th>
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                  <th key={day} className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                    {day === "Monday" && "星期一"}
                    {day === "Tuesday" && "星期二"}
                    {day === "Wednesday" && "星期三"}
                    {day === "Thursday" && "星期四"}
                    {day === "Friday" && "星期五"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white">
              {Array.from({ length: 11 }, (_, i) => i + 1).map(period => (
                <tr key={period} className="h-20">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 bg-indigo-50 border border-gray-200">
                    {getPeriodLabel(period)}
                  </td>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
                    const cell = mergedCellsByDay?.[day]?.[period];
                    if (cell?.skip) return null;

                    if (!cell || cell.empty) {
                      return <td key={`${day}-${period}`} className="p-1 h-full border border-gray-200" />;
                    }

                    return (
                      <td
                        key={`${day}-${period}`}
                        onClick={() =>
                          handleCellClick(day, cell.periodStart, cell.periodEnd, cell.filteredCourses)
                        }
                        className={`p-0 h-full align-top border border-gray-200 cursor-pointer transition-colors duration-200 ${
                          cell.hasCurrentWeekCourse
                            ? "bg-blue-50 hover:bg-blue-100"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        rowSpan={cell.rowSpan}
                      >
                        <div
                          style={{ height: `${cell.rowSpan * 80}px` }}
                          className="p-2 w-full h-full flex flex-col justify-center items-center"
                        >
                          {cell.displayCourses.length > 0 ? (
                            <>
                              {cell.displayCourses.map((course, idx) => (
                                <div
                                  key={`${course.name}-${course.group ?? ""}-${idx}`}
                                  className={`text-center font-medium text-sm ${
                                    course.isCurrentWeek ? "text-blue-700" : "text-gray-600"
                                  }`}
                                >
                                  {course.name}
                                  {course.group && ` (${course.group})`}
                                </div>
                              ))}
                              {cell.otherCoursesCount > 0 && (
                                <div className="mt-1 flex items-center text-xs text-indigo-600 font-medium">
                                  <Plus size={12} className="mr-1" />
                                  {cell.otherCoursesCount} 门其他课程
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

        {/* 课程详情模态框 */}
        <AnimatePresence>
          {isModalOpen && selectedCell && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-indigo-600 p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="mr-2" size={24} color="white" />
                    <h2 className="text-xl font-bold text-white">
                      {selectedCell.day === "Monday" && "星期一"}
                      {selectedCell.day === "Tuesday" && "星期二"}
                      {selectedCell.day === "Wednesday" && "星期三"}
                      {selectedCell.day === "Thursday" && "星期四"}
                      {selectedCell.day === "Friday" && "星期五"} · {getPeriodRangeLabel(selectedCell.periodStart, selectedCell.periodEnd)}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-indigo-200 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                  {selectedCell.courses.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">本节无课程安排</h3>
                      <p className="text-gray-500">该时间段没有安排课程</p>
                    </div>
                  ) : (
                    selectedCell.courses.map((course, index) => (
                      <div 
                        key={index} 
                        className={`mb-6 p-4 rounded-xl border-2 ${
                          course.isCurrentWeek 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`text-lg font-bold ${
                              course.isCurrentWeek ? "text-blue-700" : "text-gray-700"
                            }`}>
                              {course.name}
                            </h3>
                            {course.group && (
                              <p className="text-indigo-600 font-medium mt-1">{course.group}</p>
                            )}
                          </div>
                          {course.isCurrentWeek && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                              本周课程
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">上课周次</p>
                          <p className="font-medium mt-1">
                            {course.weeks.join("、")}周
                          </p>
                        </div>
                        
                        <div className="mt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">学时/备注</p>
                          <p className="font-medium mt-1 break-words">{course.note}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    关闭
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
