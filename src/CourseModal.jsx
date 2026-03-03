import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar, MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { getPeriodRangeLabel } from "./timeUtils";
import { DAY_NAMES, DISPLAY_MODES, MAX_WEEK, MIN_WEEK } from "./constants";
import { getCourseLocation, getCourseNote } from "./courseUtils";
import WeekMultiSelect from "./WeekMultiSelect";
import { buildCourseIdentity, collectCoursesForRange } from "./scheduleUtils";
import { shouldNotifyForGroup } from "./groupUtils";

const LEGACY_GROUP_VALUE = "__legacy_group__";

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

const getKnownGroup = (value) => {
  if (value === "A组" || value === "B组") return value;
  return "";
};

const getLegacyGroup = (value) => {
  if (typeof value !== "string") return "";
  const normalized = value.trim();
  if (!normalized) return "";
  if (normalized === "A组" || normalized === "B组") return "";
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
      weeks: [],
      location: "",
      note: ""
    };

    const baseName = baseCourse.name ?? "";
    const baseKnownGroup = getKnownGroup(baseCourse.group ?? "");
    const baseLegacyGroup = getLegacyGroup(baseCourse.group ?? "");
    const baseGroup = baseLegacyGroup ? LEGACY_GROUP_VALUE : baseKnownGroup;
    const baseWeeks = Array.isArray(baseCourse.weeks) ? baseCourse.weeks : [];
    const baseLocation = resolveTextValue(baseCourse.location);
    const baseNote = resolveTextValue(baseCourse.note);

    setName(baseName);
    setGroup(baseGroup);
    setLegacyGroup(baseLegacyGroup);
    setWeeks(baseWeeks);
    setLocation(baseLocation);
    setNote(baseNote);
    setSelectedPeriods(normalizedPeriods);
    setErrors([]);

    setInitialSnapshot({
      name: baseName,
      group: baseGroup,
      legacyGroup: baseLegacyGroup,
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
      weeks: normalizeNumbers(weeks),
      location,
      note,
      periods: normalizedSelectedPeriods
    }),
    [name, group, legacyGroup, weeks, location, note, normalizedSelectedPeriods]
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
        : group === "A组" || group === "B组"
        ? group
        : null;

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
      weeks: normalizedWeeks,
      location: locationValue,
      note: noteValue
    };

    onSave?.(course, normalizedSelectedPeriods);
  };

  const hasPeriodSelection = normalizedPeriods.length > 1;

  return (
    <div className="mt-4 border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50/40">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-indigo-900">{title}</div>
        <button
          type="button"
          onClick={requestCancel}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          取消
        </button>
      </div>

      {errors.length > 0 && (
        <div className="mt-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-md p-2 space-y-1">
          {errors.map((err, index) => (
            <div key={`${err}-${index}`}>{err}</div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold text-gray-600">课程名称</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-400"
          placeholder="如：内科学A"
        />

        <label className="block text-xs font-semibold text-gray-600">组别（可选）</label>
        <select
          value={group || ""}
          onChange={(e) => setGroup(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-400 bg-white"
        >
          <option value="">无</option>
          <option value="A组">A组</option>
          <option value="B组">B组</option>
          {legacyGroup && (
            <option value={LEGACY_GROUP_VALUE}>保留原值（{legacyGroup}）</option>
          )}
        </select>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-2">上课周次</div>
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
            className="w-full px-3 py-2 rounded-md border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-400"
            placeholder="如：教学楼A101"
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">备注</div>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-400"
            placeholder="如：需要带白大褂"
          />
        </div>

        {hasPeriodSelection && (
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2">作用节次</div>
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
            className="px-3 py-1.5 rounded-md text-xs font-semibold text-gray-600 hover:text-gray-800"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-md text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
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
    const groupFilteredCourses = list.filter((course) =>
      shouldNotifyForGroup(course.group, userGroup)
    );
    const visibleCourses =
      displayMode === DISPLAY_MODES.CURRENT_ONLY
        ? groupFilteredCourses.filter(
            (course) =>
              Array.isArray(course.weeks) && course.weeks.includes(currentWeek)
          )
        : groupFilteredCourses;

    return visibleCourses.map((course) => ({
      ...course,
      isCurrentWeek: Array.isArray(course.weeks)
        ? course.weeks.includes(currentWeek)
        : false
    }));
  }, [scheduleData, selectedCell, currentWeek, displayMode, userGroup]);

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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={handleRequestClose}
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
                  {DAY_NAMES[selectedCell.day].zh} · {getPeriodRangeLabel(selectedCell.periodStart, selectedCell.periodEnd)}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-white text-xs">
                  <span>编辑</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditMode && !requestDiscardIfNeeded()) return;
                      setIsEditMode((prev) => !prev);
                    }}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      isEditMode ? "bg-white/90" : "bg-white/30"
                    }`}
                    aria-pressed={isEditMode}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-indigo-600 transition-transform ${
                        isEditMode ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={handleRequestClose}
                  className="text-white hover:text-indigo-200 transition-colors flex-shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[70vh]">
              {courses.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="mx-auto mb-3 sm:mb-4 text-gray-400" size={40} />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">本节无课程安排</h3>
                  <p className="text-sm sm:text-base text-gray-500">该时间段没有安排课程</p>
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

                      {course.location && (
                        <div className="mt-2 sm:mt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider flex items-center gap-1">
                            <MapPin size={12} />
                            上课地点
                          </p>
                          <p className="text-sm sm:text-base font-medium mt-1 break-words">{getCourseLocation(course.location, currentWeek)}</p>
                        </div>
                      )}

                      {hasNote && (
                        <div className="mt-2 sm:mt-3">
                          <p className="text-xs text-gray-500 uppercase tracking-wider">备注</p>
                          <p className="text-sm sm:text-base font-medium mt-1 break-words">{noteText}</p>
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
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                          >
                            <Pencil size={14} />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(courseId)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-600 hover:bg-rose-200"
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      )}

                      {isDeleting && isEditMode && hasRange && (
                        <div className="mt-3 border border-rose-200 rounded-md p-2 bg-rose-50 text-xs text-rose-700">
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
                            <div className="mt-2 text-rose-600">{deleteError}</div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              onClick={confirmDelete}
                              className="px-3 py-1 rounded-md bg-rose-500 text-white"
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
                              className="px-3 py-1 rounded-md border border-rose-200 text-rose-600"
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

            <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-between items-center">
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
                  className="inline-flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-100 text-indigo-700 text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  <Plus size={16} />
                  新增课程
                </button>
              ) : (
                <span className="text-xs text-gray-500">开启编辑模式以修改课程</span>
              )}
              <button
                onClick={handleRequestClose}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
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
