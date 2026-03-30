import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { getPeriodRangeLabel } from "./timeUtils";
import {
  DAY_NAMES,
  DISPLAY_MODES,
  ELECTIVE_OPTIONS,
  MAX_WEEK,
  MIN_WEEK
} from "./constants";
import { getCourseLocation, getCourseNote } from "./courseUtils";
import {
  getElectiveLabel,
  normalizeElectives,
  shouldIncludeCourseForAudience
} from "./electiveUtils";
import WeekMultiSelect from "./WeekMultiSelect";
import { buildCourseIdentity, collectCoursesForRange } from "./scheduleUtils";

const LEGACY_GROUP_VALUE = "__legacy_group__";
const EDITOR_GROUP_OPTIONS = ["6班A组", "6班B组", "7班C组", "7班D组"];
const LEGACY_GROUP_ALIAS_MAP = {
  "A组": "6班A组",
  "B组": "6班B组"
};

const resolveTextValue = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && typeof value.default === "string") {
    return value.default;
  }
  return "";
};

const normalizeNumbers = (list) => {
  const result = Array.isArray(list) ? list : [];
  return Array.from(new Set(result)).sort((a, b) => a - b);
};

const toggleValue = (list, value) => {
  const values = Array.isArray(list) ? list : [];
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
};

const getKnownGroup = (value) => {
  if (EDITOR_GROUP_OPTIONS.includes(value)) return value;
  if (typeof value === "string" && LEGACY_GROUP_ALIAS_MAP[value]) {
    return LEGACY_GROUP_ALIAS_MAP[value];
  }
  return "";
};

const getLegacyGroup = (value) => {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized) return "";
  if (EDITOR_GROUP_OPTIONS.includes(normalized)) return "";
  if (LEGACY_GROUP_ALIAS_MAP[normalized]) return "";
  return normalized;
};

const CourseEditor = ({
  title,
  initialCourse,
  onSave,
  onCancel,
  onDirtyChange,
  availablePeriods,
  minWeek,
  maxWeek
}) => {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [legacyGroup, setLegacyGroup] = useState("");
  const [electives, setElectives] = useState([]);
  const [weeks, setWeeks] = useState([]);
  const [location, setLocation] = useState("");
  const [note, setNote] = useState("");
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [errors, setErrors] = useState([]);
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  const normalizedPeriods = useMemo(
    () => normalizeNumbers(availablePeriods),
    [availablePeriods]
  );

  useEffect(() => {
    const baseCourse = initialCourse ?? {
      name: "",
      group: "",
      electives: [],
      weeks: [],
      location: "",
      note: ""
    };

    const baseName = baseCourse.name ?? "";
    const baseKnownGroup = getKnownGroup(baseCourse.group ?? "");
    const baseLegacyGroup = getLegacyGroup(baseCourse.group ?? "");
    const baseGroup = baseLegacyGroup ? LEGACY_GROUP_VALUE : baseKnownGroup;
    const baseElectives = normalizeElectives(baseCourse.electives);
    const baseWeeks = Array.isArray(baseCourse.weeks) ? baseCourse.weeks : [];
    const baseLocation = resolveTextValue(baseCourse.location);
    const baseNote = resolveTextValue(baseCourse.note);

    setName(baseName);
    setGroup(baseGroup);
    setLegacyGroup(baseLegacyGroup);
    setElectives(baseElectives);
    setWeeks(baseWeeks);
    setLocation(baseLocation);
    setNote(baseNote);
    setSelectedPeriods(normalizedPeriods);
    setErrors([]);

    setInitialSnapshot({
      name: baseName,
      group: baseGroup,
      legacyGroup: baseLegacyGroup,
      electives: baseElectives,
      weeks: normalizeNumbers(baseWeeks),
      location: baseLocation,
      note: baseNote,
      periods: normalizedPeriods
    });
  }, [initialCourse, normalizedPeriods]);

  const normalizedSelectedPeriods = useMemo(
    () =>
      normalizeNumbers(selectedPeriods).filter((item) =>
        normalizedPeriods.includes(item)
      ),
    [selectedPeriods, normalizedPeriods]
  );

  const currentSnapshot = useMemo(
    () => ({
      name,
      group,
      legacyGroup,
      electives: normalizeElectives(electives),
      weeks: normalizeNumbers(weeks),
      location,
      note,
      periods: normalizedSelectedPeriods
    }),
    [
      name,
      group,
      legacyGroup,
      electives,
      weeks,
      location,
      note,
      normalizedSelectedPeriods
    ]
  );

  const isDirty = useMemo(() => {
    if (!initialSnapshot) return false;
    return JSON.stringify(initialSnapshot) !== JSON.stringify(currentSnapshot);
  }, [initialSnapshot, currentSnapshot]);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    return () => {
      onDirtyChange?.(false);
    };
  }, [onDirtyChange]);

  const requestCancel = () => {
    if (isDirty && !window.confirm("有未保存修改，确认放弃？")) {
      return;
    }
    onCancel?.();
  };

  const handleSave = () => {
    const nextErrors = [];
    const trimmedName = name.trim();
    if (!trimmedName) {
      nextErrors.push("课程名称不能为空");
    }
    const normalizedWeeks = normalizeNumbers(weeks);
    if (normalizedWeeks.length === 0) {
      nextErrors.push("请选择上课周次");
    }

    if (normalizedSelectedPeriods.length === 0) {
      nextErrors.push("请选择作用节次");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      return;
    }

    const normalizedGroup =
      group === LEGACY_GROUP_VALUE
        ? legacyGroup || null
        : EDITOR_GROUP_OPTIONS.includes(group)
        ? group
        : null;
    const normalizedCourseElectives = normalizeElectives(electives);

    const normalizedLocationText = location.trim();
    const normalizedNoteText = note.trim();
    const initialLocation = initialCourse?.location;
    const initialNote = initialCourse?.note;

    const locationValue =
      initialLocation &&
      typeof initialLocation === "object" &&
      normalizedLocationText === resolveTextValue(initialLocation).trim()
        ? initialLocation
        : normalizedLocationText;

    const noteValue =
      initialNote &&
      typeof initialNote === "object" &&
      normalizedNoteText === resolveTextValue(initialNote).trim()
        ? initialNote
        : normalizedNoteText;

    const course = {
      name: trimmedName,
      group: normalizedGroup,
      electives: normalizedCourseElectives,
      weeks: normalizedWeeks,
      location: locationValue,
      note: noteValue
    };

    onSave?.(course, normalizedSelectedPeriods);
  };

  const hasPeriodSelection = normalizedPeriods.length > 1;

  return (
    <div className="mt-4 rounded-2xl p-4" style={{border:"1px solid #CAC4D0",backgroundColor:"#F3EDF7"}}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold" style={{color:"#1C1B1F"}}>{title}</div>
        <button
          type="button"
          onClick={requestCancel}
          className="text-xs font-medium transition-colors"
          style={{color:"#49454F"}}
        >
          取消
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 text-xs rounded-xl p-3 space-y-1" style={{backgroundColor:"#F9DEDC",color:"#410E0B",border:"1px solid #EFB8C8"}}>
          {errors.map((err, index) => (
            <div key={`${err}-${index}`}>{err}</div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold" style={{color:"#49454F"}}>课程名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
          style={{backgroundColor:"#ECE6F0",border:"1px solid #CAC4D0",color:"#1C1B1F","--tw-ring-color":"#6750A4"}}
          placeholder="如：内科学A"
        />

        <label className="block text-xs font-semibold" style={{color:"#49454F"}}>组别（可选）</label>
        <select
          value={group || ""}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
          style={{backgroundColor:"#ECE6F0",border:"1px solid #CAC4D0",color:"#1C1B1F"}}
        >
          <option value="">无</option>
          <option value="6班A组">6班A组</option>
          <option value="6班B组">6班B组</option>
          <option value="7班C组">7班C组</option>
          <option value="7班D组">7班D组</option>
          {legacyGroup && (
            <option value={LEGACY_GROUP_VALUE}>保留原值（{legacyGroup}）</option>
          )}
        </select>

        <div>
          <div className="text-xs font-semibold mb-2" style={{color:"#49454F"}}>
            选修归属（可选 / 可多选）
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ELECTIVE_OPTIONS.map((option) => {
              const isSelected = electives.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setElectives((prev) => toggleValue(prev, option.value))
                  }
                  className="py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={isSelected
                    ? {backgroundColor:"#6750A4",color:"#FFFFFF"}
                    : {backgroundColor:"#ECE6F0",color:"#1D192B"}}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold mb-2" style={{color:"#49454F"}}>上课周次</div>
          <WeekMultiSelect
            weeks={weeks}
            onChange={setWeeks}
            minWeek={minWeek}
            maxWeek={maxWeek}
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">上课地点</div>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
            style={{backgroundColor:"#ECE6F0",border:"1px solid #CAC4D0",color:"#1C1B1F"}}
            placeholder="如：教学楼A101"
          />
        </div>

        <div>
          <div className="text-xs font-semibold mb-1" style={{color:"#49454F"}}>备注</div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
            style={{backgroundColor:"#ECE6F0",border:"1px solid #CAC4D0",color:"#1C1B1F"}}
            placeholder="如：需要带白大褂"
          />
        </div>

        {hasPeriodSelection && (
          <div>
          <div className="text-xs font-semibold mb-2" style={{color:"#49454F"}}>作用节次</div>
            <WeekMultiSelect
              weeks={selectedPeriods}
              onChange={setSelectedPeriods}
              minWeek={normalizedPeriods[0]}
              maxWeek={normalizedPeriods[normalizedPeriods.length - 1]}
              allowedWeeks={normalizedPeriods}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={requestCancel}
            className="px-4 py-1.5 rounded-pill text-xs font-semibold transition-colors"
            style={{color:"#6750A4",backgroundColor:"transparent"}}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 rounded-pill text-xs font-semibold transition-colors"
            style={{backgroundColor:"#6750A4",color:"#FFFFFF"}}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * 课程详情模态框组件
 */
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
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [deletePeriods, setDeletePeriods] = useState([]);
  const [deleteError, setDeleteError] = useState("");
  const [hasUnsavedEditorChanges, setHasUnsavedEditorChanges] = useState(false);

  const availablePeriods = useMemo(() => {
    if (!selectedCell) return [];
    const start = Math.min(selectedCell.periodStart, selectedCell.periodEnd);
    const end = Math.max(selectedCell.periodStart, selectedCell.periodEnd);
    const list = [];
    for (let period = start; period <= end; period += 1) {
      list.push(period);
    }
    return list;
  }, [selectedCell]);

  const hasRange = availablePeriods.length > 1;

  useEffect(() => {
    if (!isOpen) {
      setIsEditMode(false);
      setEditingCourseId(null);
      setAddingCourse(false);
      setDeletingCourseId(null);
      setDeletePeriods([]);
      setDeleteError("");
      setHasUnsavedEditorChanges(false);
    }
  }, [isOpen, selectedCell]);

  useEffect(() => {
    if (!isEditMode) {
      setEditingCourseId(null);
      setAddingCourse(false);
      setDeletingCourseId(null);
      setDeletePeriods([]);
      setDeleteError("");
      setHasUnsavedEditorChanges(false);
    }
  }, [isEditMode]);

  const courses = useMemo(() => {
    if (!selectedCell || !scheduleData) return [];
    const list = collectCoursesForRange(
      scheduleData,
      selectedCell.day,
      selectedCell.periodStart,
      selectedCell.periodEnd
    );
    const audienceFilteredCourses = list.filter((course) =>
      shouldIncludeCourseForAudience(course, userGroup, selectedElectives)
    );
    const visibleCourses =
      displayMode === DISPLAY_MODES.CURRENT_ONLY
        ? audienceFilteredCourses.filter(
            (course) =>
              Array.isArray(course.weeks) && course.weeks.includes(currentWeek)
          )
        : audienceFilteredCourses;

    return visibleCourses.map((course) => ({
      ...course,
      isCurrentWeek: Array.isArray(course.weeks)
        ? course.weeks.includes(currentWeek)
        : false
    }));
  }, [
    scheduleData,
    selectedCell,
    currentWeek,
    displayMode,
    userGroup,
    selectedElectives
  ]);

  if (!selectedCell) return null;

  const requestDiscardIfNeeded = () => {
    if (!hasUnsavedEditorChanges) return true;
    return window.confirm("有未保存修改，确认放弃？");
  };

  const handleRequestClose = () => {
    if (!requestDiscardIfNeeded()) return;
    onClose?.();
  };

  const handleAdd = (course, selectedPeriods) => {
    onAddCourse?.(selectedCell.day, selectedPeriods, course);
    setAddingCourse(false);
    setHasUnsavedEditorChanges(false);
  };

  const handleUpdate = (courseId, course, selectedPeriods) => {
    onUpdateCourse?.(selectedCell.day, selectedPeriods, courseId, course);
    setEditingCourseId(null);
    setHasUnsavedEditorChanges(false);
  };

  const handleDelete = (courseId, selectedPeriods) => {
    onDeleteCourse?.(selectedCell.day, selectedPeriods, courseId);
    setDeletingCourseId(null);
    setDeletePeriods([]);
    setDeleteError("");
  };

  const openDelete = (courseId) => {
    if (!hasRange) {
      if (window.confirm("确认删除该课程？")) {
        handleDelete(courseId, availablePeriods);
      }
      return;
    }
    if (!requestDiscardIfNeeded()) return;
    setHasUnsavedEditorChanges(false);
    setEditingCourseId(null);
    setAddingCourse(false);
    setDeletingCourseId(courseId);
    setDeletePeriods(availablePeriods);
    setDeleteError("");
  };

  const confirmDelete = () => {
    if (!deletingCourseId) return;
    const normalized = normalizeNumbers(deletePeriods).filter((item) =>
      availablePeriods.includes(item)
    );
    if (normalized.length === 0) {
      setDeleteError("请选择要删除的节次");
      return;
    }
    handleDelete(deletingCourseId, normalized);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          style={{backgroundColor:"rgba(0,0,0,0.45)"}}
          onClick={handleRequestClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 48 }}
            transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col rounded-t-[28px] sm:rounded-[28px]"
            style={{backgroundColor:"#FFFBFE",boxShadow:"0 4px 32px rgba(103,80,164,0.18)"}}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-shrink-0 p-4 sm:p-5 flex justify-between items-center" style={{backgroundColor:"#6750A4",borderRadius:"28px 28px 0 0"}}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Clock className="flex-shrink-0" size={20} color="white" />
                <h2 className="text-base sm:text-xl font-bold text-white truncate">
                  {DAY_NAMES[selectedCell.day].zh} · {getPeriodRangeLabel(selectedCell.periodStart, selectedCell.periodEnd)}
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
                    style={{backgroundColor: isEditMode ? "rgba(255,255,255,0.90)" : "rgba(255,255,255,0.30)"}}
                    aria-pressed={isEditMode}
                  >
                    <span
                      className="inline-block h-3 w-3 transform rounded-full transition-transform"
                      style={{backgroundColor:"#6750A4", transform: isEditMode ? "translateX(20px)" : "translateX(4px)"}}
                    />
                  </button>
                </div>
                <button
                  onClick={handleRequestClose}
                  className="transition-opacity hover:opacity-75 flex-shrink-0"
                  style={{color:"#FFFFFF"}}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 p-3 sm:p-5 overflow-y-auto" style={{backgroundColor:"#FFFBFE"}}>
              {courses.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar className="mx-auto mb-3" size={36} style={{color:"#CAC4D0"}} />
                  <h3 className="text-base font-semibold mb-1" style={{color:"#1C1B1F"}}>本节无课程安排</h3>
                  <p className="text-sm" style={{color:"#49454F"}}>该时间段没有安排课程</p>
                </div>
              ) : (
                courses.map((course) => {
                  const courseId = buildCourseIdentity(course);
                  const noteText = getCourseNote(course.note, currentWeek);
                  const hasNote = noteText.trim().length > 0;
                  const isEditing = editingCourseId === courseId;
                  const isDeleting = deletingCourseId === courseId;

                  if (isEditing && isEditMode) {
                    return (
                      <CourseEditor
                        key={courseId}
                        title="编辑课程"
                        initialCourse={course}
                        onSave={(nextCourse, selectedPeriods) =>
                          handleUpdate(courseId, nextCourse, selectedPeriods)
                        }
                        onCancel={() => {
                          setEditingCourseId(null);
                          setHasUnsavedEditorChanges(false);
                        }}
                        onDirtyChange={setHasUnsavedEditorChanges}
                        availablePeriods={availablePeriods}
                        minWeek={MIN_WEEK}
                        maxWeek={MAX_WEEK}
                      />
                    );
                  }

                  return (
                    <div
                      key={courseId}
                      className="mb-3 p-3 sm:p-4"
                      style={{
                        borderRadius: "16px",
                        backgroundColor: course.isCurrentWeek ? "#EADDFF" : "#F3EDF7",
                        border: course.isCurrentWeek ? "1.5px solid #6750A4" : "1px solid #CAC4D0"
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-bold" style={{color: course.isCurrentWeek ? "#21005D" : "#1C1B1F"}}>
                            {course.name}
                          </h3>
                          {course.group && (
                            <p className="text-sm font-medium mt-0.5" style={{color:"#6750A4"}}>{course.group}</p>
                          )}
                          {normalizeElectives(course.electives).length > 0 && (
                            <p className="text-xs font-medium mt-1" style={{color:"#7D5260"}}>
                              {normalizeElectives(course.electives)
                                .map(getElectiveLabel)
                                .join(" / ")}
                            </p>
                          )}
                        </div>
                        {course.isCurrentWeek && (
                          <span className="text-xs font-semibold px-2.5 py-0.5 flex-shrink-0" style={{backgroundColor:"#6750A4",color:"#FFFFFF",borderRadius:"9999px"}}>
                            本周课程
                          </span>
                        )}
                      </div>

                      <div className="mt-2 sm:mt-3">
                        <p className="text-xs uppercase tracking-wider" style={{color:"#49454F"}}>上课周次</p>
                        <p className="text-sm font-medium mt-1 break-words" style={{color:"#1C1B1F"}}>
                          {course.weeks.join("、")}周
                        </p>
                      </div>

                      {course.location && (
                        <div className="mt-2">
                          <p className="text-xs uppercase tracking-wider flex items-center gap-1" style={{color:"#49454F"}}>
                            <MapPin size={12} />
                            上课地点
                          </p>
                          <p className="text-sm font-medium mt-1 break-words" style={{color:"#1C1B1F"}}>{getCourseLocation(course.location, currentWeek)}</p>
                        </div>
                      )}

                      {hasNote && (
                        <div className="mt-2">
                          <p className="text-xs uppercase tracking-wider" style={{color:"#49454F"}}>备注</p>
                          <p className="text-sm font-medium mt-1 break-words" style={{color:"#1C1B1F"}}>{noteText}</p>
                        </div>
                      )}

                      {isEditMode && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!requestDiscardIfNeeded()) return;
                              setHasUnsavedEditorChanges(false);
                              setEditingCourseId(courseId);
                              setAddingCourse(false);
                              setDeletingCourseId(null);
                              setDeletePeriods([]);
                              setDeleteError("");
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{backgroundColor:"#E8DEF8",color:"#1D192B",borderRadius:"9999px"}}
                          >
                            <Pencil size={14} />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(courseId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{backgroundColor:"#F9DEDC",color:"#410E0B",borderRadius:"9999px"}}
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      )}

                      {isDeleting && isEditMode && hasRange && (
                        <div className="mt-3 p-3 text-xs" style={{backgroundColor:"#F9DEDC",borderRadius:"12px",border:"1px solid #EFB8C8",color:"#410E0B"}}>
                          <div className="font-semibold">选择要删除的节次</div>
                          <div className="mt-2">
                            <WeekMultiSelect
                              weeks={deletePeriods}
                              onChange={setDeletePeriods}
                              minWeek={availablePeriods[0]}
                              maxWeek={availablePeriods[availablePeriods.length - 1]}
                              allowedWeeks={availablePeriods}
                            />
                          </div>
                          {deleteError && (
                            <div className="mt-2" style={{color:"#B3261E"}}>{deleteError}</div>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={confirmDelete}
                              className="px-4 py-1.5 text-xs font-semibold"
                              style={{backgroundColor:"#B3261E",color:"#FFFFFF",borderRadius:"9999px"}}
                            >
                              确认删除
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingCourseId(null);
                                setDeletePeriods([]);
                                setDeleteError("");
                              }}
                              className="px-4 py-1.5 text-xs font-semibold"
                              style={{border:"1px solid #EFB8C8",color:"#410E0B",borderRadius:"9999px",backgroundColor:"transparent"}}
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {addingCourse && isEditMode && (
                <CourseEditor
                  title="新增课程"
                  initialCourse={null}
                  onSave={handleAdd}
                  onCancel={() => {
                    setAddingCourse(false);
                    setHasUnsavedEditorChanges(false);
                  }}
                  onDirtyChange={setHasUnsavedEditorChanges}
                  availablePeriods={availablePeriods}
                  minWeek={MIN_WEEK}
                  maxWeek={MAX_WEEK}
                />
              )}
            </div>

            <div className="flex-shrink-0 px-4 py-3 flex justify-between items-center" style={{backgroundColor:"#F3EDF7",borderTop:"1px solid #CAC4D0"}}>
              {isEditMode ? (
                <button
                  onClick={() => {
                    if (!requestDiscardIfNeeded()) return;
                    setHasUnsavedEditorChanges(false);
                    setAddingCourse(true);
                    setEditingCourseId(null);
                    setDeletingCourseId(null);
                    setDeletePeriods([]);
                    setDeleteError("");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors"
                  style={{backgroundColor:"#E8DEF8",color:"#1D192B",borderRadius:"9999px"}}
                >
                  <Plus size={16} />
                  新增课程
                </button>
              ) : (
                <span className="text-xs" style={{color:"#79747E"}}>开启编辑模式以修改课程</span>
              )}
              <button
                onClick={handleRequestClose}
                className="px-5 py-2 text-sm font-semibold transition-colors"
                style={{backgroundColor:"#6750A4",color:"#FFFFFF",borderRadius:"9999px"}}
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
