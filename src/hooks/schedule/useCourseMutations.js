import {
  applyLogicalCourseDeletion,
  applyLogicalCourseUpdate,
  cloneSchedule
} from "../../utils/schedule/scheduleUtils.js";

const normalizeNumbers = (values) =>
  Array.from(new Set(Array.isArray(values) ? values : [])).sort((a, b) => a - b);

// 课程增删改：统一做参数归一化与校验，写入前克隆课表
export const useCourseMutations = (setScheduleData) => {
  const updateSchedule = (mutate) => {
    setScheduleData((prev) => {
      const next = cloneSchedule(prev);
      mutate(next);
      return next;
    });
  };

  const handleAddCourse = (day, periods, course) => {
    const targets = normalizeNumbers(periods);
    if (targets.length === 0) return;
    updateSchedule((next) => {
      const dayEntry = next.find((entry) => entry.day === day);
      if (!dayEntry) return;
      for (const period of targets) {
        const periodEntry = dayEntry.periods.find(
          (entry) => entry.period === period
        );
        if (!periodEntry) continue;
        periodEntry.courses = [...periodEntry.courses, course];
      }
    });
  };

  const normalizeLogicalPayload = ({
    day,
    logicalId,
    scopePeriods,
    selectedWeeks,
    selectedPeriods
  }) => {
    const normalized = {
      day,
      logicalId,
      scopePeriods: normalizeNumbers(scopePeriods),
      selectedWeeks: normalizeNumbers(selectedWeeks),
      selectedPeriods: normalizeNumbers(selectedPeriods)
    };
    const isValid =
      Boolean(day) &&
      Boolean(logicalId) &&
      normalized.scopePeriods.length > 0 &&
      normalized.selectedWeeks.length > 0 &&
      normalized.selectedPeriods.length > 0;
    return isValid ? normalized : null;
  };

  const handleUpdateCourse = ({ course, preserveLocation, preserveNote, ...scope }) => {
    const normalized = normalizeLogicalPayload(scope);
    if (!normalized || !course) return;
    updateSchedule((next) => {
      applyLogicalCourseUpdate(next, {
        ...normalized,
        course,
        preserveLocation,
        preserveNote
      });
    });
  };

  const handleDeleteCourse = (scope) => {
    const normalized = normalizeLogicalPayload(scope);
    if (!normalized) return;
    updateSchedule((next) => {
      applyLogicalCourseDeletion(next, normalized);
    });
  };

  return { handleAddCourse, handleUpdateCourse, handleDeleteCourse };
};
