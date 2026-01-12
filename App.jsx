import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import * as storage from "./storage";
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

const App = () => {
  // 响应式窗口宽度状态
  const [isMobile, setIsMobile] = useState(false);

  // 监听窗口大小变化
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 配置移动端状态栏
  useEffect(() => {
    const setupStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // 设置状态栏样式为深色内容（适合浅色背景）
          await StatusBar.setStyle({ style: Style.Light });
          // 设置状态栏背景颜色为应用主色调
          await StatusBar.setBackgroundColor({ color: '#4F46E5' });
          // 显示状态栏
          await StatusBar.show();
        } catch (error) {
          console.error('状态栏配置失败:', error);
        }
      }
    };

    setupStatusBar();
  }, []);

  // 课表数据
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
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [semesterStartDate, setSemesterStartDate] = useState(() => {
    // 从本地缓存读取开学日期（同步方式，仅用于 Web）
    return storage.getItemSync("semesterStartDate") || "";
  });
  const [todayInfo, setTodayInfo] = useState(null);

  // 计算今天是第几周的星期几
  const calculateTodayInfo = React.useCallback((startDate) => {
    if (!startDate) return null;

    const start = new Date(startDate);
    const today = new Date();

    // 设置时间为0点，只比较日期
    start.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffTime = today - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return null; // 还没开学

    const week = Math.floor(diffDays / 7) + 1;
    const dayOfWeek = today.getDay(); // 0=周日, 1=周一, ..., 6=周六

    if (week > 16) return null; // 超过学期范围
    if (dayOfWeek === 0 || dayOfWeek === 6) return null; // 周末无课

    const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const dayName = dayNames[dayOfWeek - 1];

    return { week, day: dayName, dayOfWeek };
  }, []);

  // 初始化时计算今天的信息
  React.useEffect(() => {
    const loadSavedDate = async () => {
      const savedDate = await storage.getItem("semesterStartDate");
      if (savedDate) {
        setSemesterStartDate(savedDate);
        const info = calculateTodayInfo(savedDate);
        setTodayInfo(info);
        if (info) {
          setCurrentWeek(info.week);
        }
      }
    };

    loadSavedDate();
  }, [calculateTodayInfo]);

  // 处理周数变化
  const handleWeekChange = (e) => {
    const week = parseInt(e.target.value);
    if (week >= 1 && week <= 16) {
      setCurrentWeek(week);
    }
  };

  // 快速选择周数
  const handleQuickSelectWeek = (week) => {
    setCurrentWeek(week);
    setShowWeekSelector(false);
  };

  // 上一周/下一周
  const handlePreviousWeek = () => {
    if (currentWeek > 1) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  const handleNextWeek = () => {
    if (currentWeek < 16) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  // 处理开学日期变化
  const handleStartDateChange = async (e) => {
    const date = e.target.value;
    setSemesterStartDate(date);

    // 保存到本地缓存
    if (date) {
      await storage.setItem("semesterStartDate", date);
      const info = calculateTodayInfo(date);
      setTodayInfo(info);

      if (info) {
        setCurrentWeek(info.week);
      }
    } else {
      await storage.removeItem("semesterStartDate");
      setTodayInfo(null);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-2 sm:px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-7xl mx-auto">
        {/* 顶部标题和周数选择 */}
        <div className="text-center mb-3 sm:mb-6 md:mb-8">
          <h1 className="text-base sm:text-xl md:text-3xl lg:text-4xl font-bold text-indigo-900 mb-1 sm:mb-2 px-2 leading-tight">
            第五临床医学院 临床医学 2023级 6班课表
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-2 sm:mb-3 md:mb-4">湖州市中心医院教学点</p>

          {/* 开学日期输入 */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
            <label className="font-medium text-sm sm:text-base md:text-lg text-indigo-800">开学日期:</label>
            <div className="relative">
              <input
                type="date"
                value={semesterStartDate}
                onChange={handleStartDateChange}
                lang="zh-CN"
                placeholder="选择开学日期"
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border-2 border-indigo-300 rounded-md sm:rounded-lg text-sm sm:text-base md:text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                style={{
                  colorScheme: 'light',
                  minWidth: '150px'
                }}
              />
            </div>
            {todayInfo && (
              <span className="text-xs sm:text-sm md:text-base text-green-600 font-medium">
                今天是第{todayInfo.week}周 星期{["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}
              </span>
            )}
            {!todayInfo && semesterStartDate && (
              <span className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
                今天不在上课时间
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
            <label className="font-medium text-sm sm:text-base md:text-lg text-indigo-800">当前周数:</label>
            <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
              {/* 上一周按钮 */}
              <button
                onClick={handlePreviousWeek}
                disabled={currentWeek === 1}
                className={`p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg transition-colors ${
                  currentWeek === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
                title="上一周"
              >
                <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
              </button>

              {/* 周数输入框 */}
              <input
                type="number"
                min="1"
                max="16"
                value={currentWeek}
                onChange={handleWeekChange}
                className="w-14 sm:w-16 md:w-20 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 border-2 border-indigo-300 rounded-md sm:rounded-lg text-sm sm:text-base md:text-lg font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />

              {/* 下一周按钮 */}
              <button
                onClick={handleNextWeek}
                disabled={currentWeek === 16}
                className={`p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg transition-colors ${
                  currentWeek === 16
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                }`}
                title="下一周"
              >
                <ChevronRight size={16} className="sm:w-5 sm:h-5" />
              </button>

              {/* 快速选择按钮 */}
              <button
                onClick={() => setShowWeekSelector(!showWeekSelector)}
                className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-indigo-600 text-white text-xs sm:text-sm md:text-base font-medium rounded-md sm:rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
              >
                快速选择
              </button>
            </div>
          </div>

          {/* 周数快速选择器 */}
          <AnimatePresence>
            {showWeekSelector && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 sm:mt-4 overflow-hidden"
              >
                <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 max-w-2xl mx-auto border-2 border-indigo-200">
                  <div className="flex justify-between items-center mb-2 sm:mb-3">
                    <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900">选择周数</h3>
                    <button
                      onClick={() => setShowWeekSelector(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
                    {Array.from({ length: 16 }, (_, i) => i + 1).map((week) => (
                      <button
                        key={week}
                        onClick={() => handleQuickSelectWeek(week)}
                        className={`py-1.5 sm:py-2 md:py-3 px-2 sm:px-3 md:px-4 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm md:text-base transition-all ${
                          week === currentWeek
                            ? "bg-indigo-600 text-white shadow-lg scale-105"
                            : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105"
                        }`}
                      >
                        <span className="hidden sm:inline">第{week}周</span>
                        <span className="inline sm:hidden">{week}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 课表 */}
        <div className="bg-white rounded-lg sm:rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead className="bg-indigo-600">
                <tr>
                  <th className="px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-left text-xs sm:text-sm font-medium text-white uppercase tracking-tight sm:tracking-wider w-10 sm:w-12 md:w-16 sticky left-0 bg-indigo-600 z-10">
                    节次
                  </th>
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => (
                    <th key={day} className="px-1 sm:px-2 md:px-3 py-1.5 sm:py-2 md:py-3 text-center text-xs sm:text-sm font-medium text-white uppercase tracking-tight sm:tracking-wider w-[17.5%] sm:w-auto">
                      <span className="hidden sm:inline">
                        {day === "Monday" && "星期一"}
                        {day === "Tuesday" && "星期二"}
                        {day === "Wednesday" && "星期三"}
                        {day === "Thursday" && "星期四"}
                        {day === "Friday" && "星期五"}
                      </span>
                      <span className="inline sm:hidden">
                        {day === "Monday" && "周一"}
                        {day === "Tuesday" && "周二"}
                        {day === "Wednesday" && "周三"}
                        {day === "Thursday" && "周四"}
                        {day === "Friday" && "周五"}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white">
                {Array.from({ length: 11 }, (_, i) => i + 1).map(period => (
                  <tr key={period}>
                    <td className="px-1 sm:px-2 md:px-3 py-2 sm:py-3 md:py-4 text-xs sm:text-sm md:text-base font-medium text-gray-900 bg-indigo-50 border border-gray-200 sticky left-0 z-10">
                      {getPeriodLabel(period)}
                    </td>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(day => {
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
                            handleCellClick(day, cell.periodStart, cell.periodEnd, cell.filteredCourses)
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

        {/* 课程详情模态框 */}
        <AnimatePresence>
          {isModalOpen && selectedCell && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
              onClick={() => setIsModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
                onClick={e => e.stopPropagation()}
              >
                <div className="bg-indigo-600 p-3 sm:p-4 flex justify-between items-center">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                    <Clock className="flex-shrink-0" size={20} color="white" />
                    <h2 className="text-base sm:text-xl font-bold text-white truncate">
                      {selectedCell.day === "Monday" && "星期一"}
                      {selectedCell.day === "Tuesday" && "星期二"}
                      {selectedCell.day === "Wednesday" && "星期三"}
                      {selectedCell.day === "Thursday" && "星期四"}
                      {selectedCell.day === "Friday" && "星期五"} · {getPeriodRangeLabel(selectedCell.periodStart, selectedCell.periodEnd)}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="text-white hover:text-indigo-200 transition-colors flex-shrink-0 ml-2"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[70vh]">
                  {selectedCell.courses.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <Calendar className="mx-auto mb-3 sm:mb-4 text-gray-400" size={40} />
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">本节无课程安排</h3>
                      <p className="text-sm sm:text-base text-gray-500">该时间段没有安排课程</p>
                    </div>
                  ) : (
                    selectedCell.courses.map((course, index) => (
                      <div
                        key={index}
                        className={`mb-3 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
                          course.isCurrentWeek
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-gray-50"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className={`text-base sm:text-lg font-bold ${
                              course.isCurrentWeek ? "text-blue-700" : "text-gray-700"
                            }`}>
                              {course.name}
                            </h3>
                            {course.group && (
                              <p className="text-sm sm:text-base text-indigo-600 font-medium mt-1">{course.group}</p>
                            )}
                          </div>
                          {course.isCurrentWeek && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded flex-shrink-0">
                              本周课程
                            </span>
                          )}
                        </div>

                        <div className="mt-2 sm:mt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">上课周次</p>
                          <p className="text-sm sm:text-base font-medium mt-1 break-words">
                            {course.weeks.join("、")}周
                          </p>
                        </div>

                        <div className="mt-2 sm:mt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">学时/备注</p>
                          <p className="text-sm sm:text-base font-medium mt-1 break-words">{course.note}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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
