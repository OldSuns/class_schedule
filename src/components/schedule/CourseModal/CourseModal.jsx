import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, Plus } from "lucide-react";
import { getPeriodRangeLabel } from "../../../utils/schedule/timeUtils";
import {
  DAY_NAMES,
  DISPLAY_MODES,
  MAX_WEEK,
  MIN_WEEK
} from "../../../config/constants";
import { getCourseLocation, getCourseNote } from "../../../utils/schedule/courseUtils";
import { shouldIncludeCourseForAudience } from "../../../utils/schedule/electiveUtils";
import { collectLogicalCoursesForRange } from "../../../utils/schedule/scheduleUtils";
import CourseEditor from "./CourseEditor.jsx";
import CourseCard from "./CourseCard.jsx";
import DeleteCoursePanel from "./DeleteCoursePanel.jsx";

const normalizeNumbers = (list) =>
  Array.from(new Set(Array.isArray(list) ? list : [])).sort((a, b) => a - b);

const buildRanges = (numbers) => {
  const values = normalizeNumbers(numbers);
  if (values.length === 0) return [];
  const ranges = [];
  let start = values[0];
  let end = values[0];
  for (let index = 1; index < values.length; index += 1) {
    const current = values[index];
    if (current === end + 1) {
      end = current;
      continue;
    }
    ranges.push([start, end]);
    start = current;
    end = current;
  }
  ranges.push([start, end]);
  return ranges;
};

const formatWeekList = (weeks) =>
  buildRanges(weeks)
    .map(([start, end]) => (start === end ? `${start}` : `${start}-${end}`))
    .join("、");

const formatWeekSentence = (weeks) => {
  const label = formatWeekList(weeks);
  return label ? `第${label}周` : "";
};

const formatPeriodSetLabel = (periods) =>
  buildRanges(periods)
    .map(([start, end]) => getPeriodRangeLabel(start, end))
    .join("、");

const getUniqueNonEmptyTexts = (values) =>
  Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
    )
  );

const buildWeekPeriodSummary = (logicalCourse) => {
  const groups = new Map();
  for (const week of logicalCourse.allWeeks) {
    const periods = normalizeNumbers(logicalCourse.weekPeriodMap?.[week] ?? []);
    const key = periods.join(",");
    if (!groups.has(key)) {
      groups.set(key, { periods, weeks: [] });
    }
    groups.get(key).weeks.push(week);
  }

  const items = Array.from(groups.values()).map((item) => ({
    ...item,
    weeks: normalizeNumbers(item.weeks)
  }));
  if (items.length <= 1) {
    return items.map((item) => ({
      label: "",
      periodsLabel: formatPeriodSetLabel(item.periods)
    }));
  }
  const mainItem =
    items.length > 1
      ? items.reduce(
          (best, item) => (!best || item.weeks.length > best.weeks.length ? item : best),
          null
        )
      : null;

  return items
    .sort((a, b) => a.weeks.length - b.weeks.length || a.weeks[0] - b.weeks[0])
    .map((item) => ({
      label:
        mainItem && item === mainItem && item.weeks.length !== logicalCourse.allWeeks.length
          ? "其余周"
          : formatWeekSentence(item.weeks),
      periodsLabel: formatPeriodSetLabel(item.periods)
    }));
};

const buildLogicalCourseDisplay = (logicalCourse, currentWeek) => {
  const currentWeekFragments = logicalCourse.fragments.filter((fragment) =>
    Array.isArray(fragment.course?.weeks)
      ? fragment.course.weeks.includes(currentWeek)
      : false
  );
  const activeFragments =
    currentWeekFragments.length > 0 ? currentWeekFragments : logicalCourse.fragments;
  const locationTexts = getUniqueNonEmptyTexts(
    activeFragments.map((fragment) =>
      getCourseLocation(fragment.course?.location, currentWeek)
    )
  );
  const noteTexts = getUniqueNonEmptyTexts(
    activeFragments.map((fragment) => getCourseNote(fragment.course?.note, currentWeek))
  );
  const currentWeekPeriods = normalizeNumbers(
    logicalCourse.weekPeriodMap?.[currentWeek] ??
      activeFragments[0]?.periods ??
      logicalCourse.availablePeriods
  );

  return {
    ...logicalCourse,
    isCurrentWeek: logicalCourse.allWeeks.includes(currentWeek),
    currentWeekPeriods,
    currentWeekPeriodsLabel: formatPeriodSetLabel(currentWeekPeriods),
    periodSummary: buildWeekPeriodSummary(logicalCourse),
    hasPeriodVariation:
      Object.keys(logicalCourse.weekPeriodMap ?? {}).length > 0 &&
      new Set(
        Object.values(logicalCourse.weekPeriodMap ?? {}).map((periods) =>
          normalizeNumbers(periods).join(",")
        )
      ).size > 1,
    locationText: locationTexts.join(" / "),
    noteText: noteTexts.join(" / "),
    allWeeksLabel: formatWeekList(logicalCourse.allWeeks)
  };
};

const CourseModal = ({
  isOpen,
  selectedCell,
  currentWeek,
  displayMode = DISPLAY_MODES.ALL,
  userGroup,
  selectedElectives = [],
  scheduleData,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onClose
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLogicalId, setEditingLogicalId] = useState(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [deletingLogicalId, setDeletingLogicalId] = useState(null);
  const [deletePeriods, setDeletePeriods] = useState([]);
  const [deleteWeeks, setDeleteWeeks] = useState([]);
  const [deleteError, setDeleteError] = useState("");
  const [hasUnsavedEditorChanges, setHasUnsavedEditorChanges] = useState(false);

  const selectedRangePeriods = useMemo(() => {
    if (!selectedCell) return [];
    const start = Math.min(selectedCell.periodStart, selectedCell.periodEnd);
    const end = Math.max(selectedCell.periodStart, selectedCell.periodEnd);
    const list = [];
    for (let period = start; period <= end; period += 1) {
      list.push(period);
    }
    return list;
  }, [selectedCell]);

  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
      setEditingLogicalId(null);
      setAddingCourse(false);
      setDeletingLogicalId(null);
      setDeletePeriods([]);
      setDeleteWeeks([]);
      setDeleteError("");
      setHasUnsavedEditorChanges(false);
    }
  }, [isOpen, selectedCell]);

  useEffect(() => {
    if (!isEditMode) {
      setEditingLogicalId(null);
      setAddingCourse(false);
      setDeletingLogicalId(null);
      setDeletePeriods([]);
      setDeleteWeeks([]);
      setDeleteError("");
      setHasUnsavedEditorChanges(false);
    }
  }, [isEditMode]);

  const logicalCourses = useMemo(() => {
    if (!selectedCell || !scheduleData) return [];
    return collectLogicalCoursesForRange(
      scheduleData,
      selectedCell.day,
      selectedCell.periodStart,
      selectedCell.periodEnd
    )
      .filter((course) =>
        shouldIncludeCourseForAudience(
          {
            ...course.baseCourse,
            group: course.baseCourse.group,
            electives: course.baseCourse.electives
          },
          userGroup,
          selectedElectives
        )
      )
      .filter((course) =>
        displayMode === DISPLAY_MODES.CURRENT_ONLY
          ? course.allWeeks.includes(currentWeek)
          : true
      )
      .map((course) => buildLogicalCourseDisplay(course, currentWeek));
  }, [
    scheduleData,
    selectedCell,
    currentWeek,
    displayMode,
    userGroup,
    selectedElectives
  ]);

  const addingInitialValues = useMemo(
    () => ({
      name: "",
      group: "",
      electives: [],
      weeks: [],
      location: "",
      note: "",
      periods: selectedRangePeriods
    }),
    [selectedRangePeriods]
  );

  const editingCourse = useMemo(
    () => logicalCourses.find((course) => course.logicalId === editingLogicalId) || null,
    [logicalCourses, editingLogicalId]
  );

  const deletingCourse = useMemo(
    () => logicalCourses.find((course) => course.logicalId === deletingLogicalId) || null,
    [logicalCourses, deletingLogicalId]
  );

  if (!selectedCell) return null;

  const requestDiscardIfNeeded = () => {
    if (!hasUnsavedEditorChanges) return true;
    return window.confirm("有未保存修改，确认放弃？");
  };

  const handleRequestClose = () => {
    if (!requestDiscardIfNeeded()) return;
    onClose?.();
  };

  const handleAdd = (course, payload) => {
    onAddCourse?.(selectedCell.day, payload.periods, {
      ...course,
      weeks: payload.weeks
    });
    setAddingCourse(false);
    setHasUnsavedEditorChanges(false);
  };

  const handleUpdate = (logicalCourse, course, payload) => {
    const weeksPeriodsIntersection = (logicalCourse.availablePeriods || []).filter((period) =>
      payload.weeks.every((week) => {
        const weekPeriods = logicalCourse.weekPeriodMap?.[week] || [];
        return weekPeriods.includes(period);
      })
    );

    const effectiveScopePeriods =
      weeksPeriodsIntersection.length > 0 ? weeksPeriodsIntersection : payload.periods;

    onUpdateCourse?.({
      day: selectedCell.day,
      logicalId: logicalCourse.logicalId,
      scopePeriods: effectiveScopePeriods,
      selectedWeeks: payload.weeks,
      selectedPeriods: payload.periods,
      course: {
        ...course,
        weeks: payload.weeks
      },
      preserveLocation: !payload.changedFields.location,
      preserveNote: !payload.changedFields.note
    });
    setEditingLogicalId(null);
    setHasUnsavedEditorChanges(false);
  };

  const handleDelete = (logicalCourse, weeks, periods) => {
    onDeleteCourse?.({
      day: selectedCell.day,
      logicalId: logicalCourse.logicalId,
      scopePeriods: logicalCourse.availablePeriods,
      selectedWeeks: weeks,
      selectedPeriods: periods
    });
    setDeletingLogicalId(null);
    setDeletePeriods([]);
    setDeleteWeeks([]);
    setDeleteError("");
  };

  const openDelete = (logicalCourse) => {
    if (!requestDiscardIfNeeded()) return;
    setHasUnsavedEditorChanges(false);
    setEditingLogicalId(null);
    setAddingCourse(false);
    setDeletingLogicalId(logicalCourse.logicalId);
    setDeletePeriods(logicalCourse.currentWeekPeriods);
    setDeleteWeeks([]);
    setDeleteError("");
  };

  const confirmDelete = () => {
    if (!deletingCourse) return;
    const normalizedWeeks = normalizeNumbers(deleteWeeks).filter((item) =>
      deletingCourse.allWeeks.includes(item)
    );
    const normalizedPeriods = normalizeNumbers(deletePeriods).filter((item) =>
      deletingCourse.availablePeriods.includes(item)
    );
    if (normalizedWeeks.length === 0) {
      setDeleteError("请选择要删除的周次");
      return;
    }
    if (normalizedPeriods.length === 0) {
      setDeleteError("请选择要删除的节次");
      return;
    }
    handleDelete(deletingCourse, normalizedWeeks, normalizedPeriods);
  };

  const handleStartEdit = (course) => {
    if (!requestDiscardIfNeeded()) return;
    setHasUnsavedEditorChanges(false);
    setEditingLogicalId(course.logicalId);
    setAddingCourse(false);
    setDeletingLogicalId(null);
    setDeletePeriods([]);
    setDeleteWeeks([]);
    setDeleteError("");
  };

  const handleCancelDelete = () => {
    setDeletingLogicalId(null);
    setDeletePeriods([]);
    setDeleteWeeks([]);
    setDeleteError("");
  };

  const handleStartAdd = () => {
    if (!requestDiscardIfNeeded()) return;
    setHasUnsavedEditorChanges(false);
    setAddingCourse(true);
    setEditingLogicalId(null);
    setDeletingLogicalId(null);
    setDeletePeriods([]);
    setDeleteWeeks([]);
    setDeleteError("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={handleRequestClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
            className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col rounded-t-[28px] sm:rounded-[28px]"
            style={{
              backgroundColor: "#FFFBFE",
              boxShadow: "0 4px 32px rgba(103,80,164,0.18)"
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex-shrink-0 p-4 sm:p-5 flex justify-between items-center"
              style={{ backgroundColor: "#6750A4", borderRadius: "28px 28px 0 0" }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="flex-shrink-0" size={20} color="white" />
                <h2 className="text-base sm:text-xl font-bold text-white truncate">
                  {DAY_NAMES[selectedCell.day].zh} ·{" "}
                  {getPeriodRangeLabel(selectedCell.periodStart, selectedCell.periodEnd)}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-white text-xs">
                  <span>编辑</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditMode && !requestDiscardIfNeeded()) return;
                      setIsEditMode((prev) => !prev);
                    }}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{
                      backgroundColor: isEditMode
                        ? "rgba(255,255,255,0.90)"
                        : "rgba(255,255,255,0.30)"
                    }}
                    aria-pressed={isEditMode}
                  >
                    <span
                      className="inline-block h-3 w-3 transform rounded-full transition-transform"
                      style={{
                        backgroundColor: "#6750A4",
                        transform: isEditMode ? "translateX(20px)" : "translateX(4px)"
                      }}
                    />
                  </button>
                </div>
                <button
                  onClick={handleRequestClose}
                  className="transition-opacity hover:opacity-75 flex-shrink-0"
                  style={{ color: "#FFFFFF" }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 sm:p-5 overflow-y-auto" style={{ backgroundColor: "#FFFBFE" }}>
              {logicalCourses.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="mx-auto mb-3" size={36} style={{ color: "#CAC4D0" }} />
                  <h3 className="text-base font-semibold mb-1" style={{ color: "#1C1B1F" }}>
                    本节无课程安排
                  </h3>
                  <p className="text-sm" style={{ color: "#49454F" }}>
                    该时间段没有安排课程
                  </p>
                </div>
              ) : (
                logicalCourses.map((course) => {
                  const isEditing = editingCourse?.logicalId === course.logicalId && isEditMode;
                  const isDeleting = deletingCourse?.logicalId === course.logicalId && isEditMode;

                  if (isEditing) {
                    return (
                      <CourseEditor
                        key={course.logicalId}
                        title="编辑课程"
                        initialValues={{
                          name: course.baseCourse.name,
                          group: course.baseCourse.group ?? "",
                          electives: course.baseCourse.electives,
                          weeks: course.allWeeks,
                          location: course.locationText,
                          note: course.noteText,
                          periods: course.currentWeekPeriods
                        }}
                        onSave={(nextCourse, payload) =>
                          handleUpdate(course, nextCourse, payload)
                        }
                        onCancel={() => {
                          setEditingLogicalId(null);
                          setHasUnsavedEditorChanges(false);
                        }}
                        onDirtyChange={setHasUnsavedEditorChanges}
                        availablePeriods={course.availablePeriods}
                        weekPeriodMap={course.weekPeriodMap}
                        hasPeriodVariation={course.hasPeriodVariation}
                        minWeek={MIN_WEEK}
                        maxWeek={MAX_WEEK}
                        allowedWeeks={course.allWeeks}
                        weekLabel="选择要修改的周次"
                        weekErrorMessage="请选择要修改的周次"
                        currentWeek={currentWeek}
                      />
                    );
                  }

                  return (
                    <CourseCard
                      key={course.logicalId}
                      course={course}
                      isEditMode={isEditMode}
                      onEdit={() => handleStartEdit(course)}
                      onDelete={() => openDelete(course)}
                    >
                      {isDeleting && (
                        <DeleteCoursePanel
                          course={course}
                          deleteWeeks={deleteWeeks}
                          onDeleteWeeksChange={setDeleteWeeks}
                          deletePeriods={deletePeriods}
                          onDeletePeriodsChange={setDeletePeriods}
                          deleteError={deleteError}
                          onConfirm={confirmDelete}
                          onCancel={handleCancelDelete}
                        />
                      )}
                    </CourseCard>
                  );
                })
              )}

              {addingCourse && isEditMode && (
                <CourseEditor
                  title="新增课程"
                  initialValues={addingInitialValues}
                  onSave={handleAdd}
                  onCancel={() => {
                    setAddingCourse(false);
                    setHasUnsavedEditorChanges(false);
                  }}
                  onDirtyChange={setHasUnsavedEditorChanges}
                  availablePeriods={selectedRangePeriods}
                  minWeek={MIN_WEEK}
                  maxWeek={MAX_WEEK}
                  allowedWeeks={Array.from(
                    { length: MAX_WEEK - MIN_WEEK + 1 },
                    (_, index) => MIN_WEEK + index
                  )}
                  weekLabel="上课周次"
                  weekErrorMessage="请选择上课周次"
                  currentWeek={currentWeek}
                />
              )}
            </div>

            <div
              className="flex-shrink-0 px-4 py-3 flex justify-between items-center"
              style={{ backgroundColor: "#F3EDF7", borderTop: "1px solid #CAC4D0" }}
            >
              {isEditMode ? (
                <button
                  onClick={handleStartAdd}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors"
                  style={{
                    backgroundColor: "#E8DEF8",
                    color: "#1D192B",
                    borderRadius: "9999px"
                  }}
                >
                  <Plus size={16} />
                  新增课程
                </button>
              ) : (
                <span className="text-xs" style={{ color: "#79747E" }}>
                  开启编辑模式以修改课程
                </span>
              )}
              <button
                onClick={handleRequestClose}
                className="px-5 py-2 text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: "#6750A4",
                  color: "#FFFFFF",
                  borderRadius: "9999px"
                }}
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseModal;
