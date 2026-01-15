/**
 * 时间相关工具函数
 */

// 获取节次时间
export const getPeriodTime = (period) => {
  const timeMap = {
    1: "8:15-8:55",
    2: "9:00-9:40",
    3: "9:55-10:35",
    4: "10:40-11:20",
    5: "11:25-12:05",
    6: "13:45-14:25",
    7: "14:30-15:10",
    8: "15:20-16:00",
    9: "16:05-16:45",
    10: "16:45-17:55",
    11: "18:00-18:40",
    12: "18:45-19:25",
    13: "19:30-20:10"
  };
  return timeMap[period] || "";
};

// 获取节次名称
export const getPeriodLabel = (period) => {
  if (period >= 11 && period <= 13) {
    return `晚${period - 10}节`;
  }
  return `${period}节`;
};

// 获取节次范围标签
export const getPeriodRangeLabel = (periodStart, periodEnd) => {
  if (periodStart === periodEnd) return getPeriodLabel(periodStart);
  return `${getPeriodLabel(periodStart)}～${getPeriodLabel(periodEnd)}`;
};

// 计算今天是第几周的星期几
export const calculateTodayInfo = (startDate) => {
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
};
