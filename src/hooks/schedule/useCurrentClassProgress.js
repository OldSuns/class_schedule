import { useMemo } from "react";
import { shouldIncludeCourseForAudience } from "../../utils/schedule/electiveUtils.js";
import {
  getCurrentPeriod,
  getPeriodLabel,
  getPeriodRangeMinutes
} from "../../utils/schedule/timeUtils.js";

// 计算当前正在上的课与进度（用于头部进度条），无课时返回 null
export const useCurrentClassProgress = ({
  now,
  todayInfo,
  scheduleData,
  userGroup,
  selectedElectives
}) =>
  useMemo(() => {
    if (!todayInfo) return null;
    const period = getCurrentPeriod(now);
    if (!period) return null;

    const dayData = scheduleData.find((day) => day.day === todayInfo.day);
    const periodData = dayData?.periods.find((item) => item.period === period);
    const courses = (periodData?.courses ?? []).filter(
      (course) =>
        Array.isArray(course.weeks) &&
        course.weeks.includes(todayInfo.week) &&
        shouldIncludeCourseForAudience(course, userGroup, selectedElectives)
    );

    if (courses.length === 0) return null;

    const range = getPeriodRangeMinutes(period);
    if (!range) return null;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const duration = Math.max(1, range.endMin - range.startMin);
    const elapsed = Math.min(Math.max(nowMinutes - range.startMin, 0), duration);
    const remaining = Math.max(range.endMin - nowMinutes, 0);
    const percent = Math.min(
      100,
      Math.max(0, Math.round((elapsed / duration) * 100))
    );

    const labels = courses.map((course) =>
      course.group ? `${course.name}(${course.group})` : course.name
    );
    let courseLabel = labels[0];
    if (labels.length === 2) {
      courseLabel = `${labels[0]} / ${labels[1]}`;
    } else if (labels.length > 2) {
      courseLabel = `${labels[0]} 等`;
    }

    return {
      period,
      periodLabel: getPeriodLabel(period),
      courseLabel,
      elapsedMinutes: elapsed,
      remainingMinutes: remaining,
      percent
    };
  }, [now, todayInfo, userGroup, selectedElectives, scheduleData]);
