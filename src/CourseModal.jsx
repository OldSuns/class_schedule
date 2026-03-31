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
import { collectLogicalCoursesForRange } from "./scheduleUtils";

const LEGACY_GROUP_VALUE = "__legacy_group__";
const EDITOR_GROUP_OPTIONS = ["6班A组", "6班B组", "7班C组", "7班D组"];
const LEGACY_GROUP_ALIAS_MAP = {
  A组: "6班A组",
  B组: "6班B组"
};

const normalizeNumbers = (list) =>
  Array.from(new Set(Array.isArray(list) ? list : [])).sort((a, b) => a - b);

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
      ? items.reduce((best, item) =>
          !best || item.weeks.length > best.weeks.length ? item : best
        , null)
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
    activeFragments.map((fragment) =>
      getCourseNote(fragment.course?.note, currentWeek)
    )
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
    hasPeriodVariation: Object.keys(logicalCourse.weekPeriodMap ?? {}).length > 0 &&
      new Set(
        Object.values(logicalCourse.weekPeriodMap ?? {}).map((periods) =>
          normalizeNumbers(periods).join(",")
        )
      ).size > 1,
    locationText: locationTexts.join(" / "),
    noteText: noteTexts.join(" / ")
  };
};

const CourseEditor = ({
  title,
  initialValues,
  onSave,
  onCancel,
  onDirtyChange,
  availablePeriods,
  minWeek,
  maxWeek,
  allowedWeeks,
  weekLabel,
  weekErrorMessage,
  currentWeek,
  weekPeriodMap = {},
  hasPeriodVariation = false
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
  const [initialLocationText, setInitialLocationText] = useState("");
  const [initialNoteText, setInitialNoteText] = useState("");
  const [userHasModifiedWeeks, setUserHasModifiedWeeks] = useState(false);
  const hasInitializedRef = React.useRef(false);

  const normalizedPeriods = useMemo(
    () => normalizeNumbers(availablePeriods),
    [availablePeriods]
  );
  const normalizedAllowedWeeks = useMemo(
    () => normalizeNumbers(allowedWeeks),
    [allowedWeeks]
  );

  // Initialize state from initialValues only once on mount (not on every re-render)
  useEffect(() => {
    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const base = initialValues ?? {};
    const baseKnownGroup = getKnownGroup(base.group ?? "");
    const baseLegacyGroup = getLegacyGroup(base.group ?? "");
    const baseGroup = baseLegacyGroup ? LEGACY_GROUP_VALUE : baseKnownGroup;
    const baseElectives = normalizeElectives(base.electives);
    const baseWeeks = normalizeNumbers(base.weeks);
    const basePeriods = normalizeNumbers(
      base.periods?.length ? base.periods : normalizedPeriods
    );
    const baseLocation = typeof base.location === "string" ? base.location : "";
    const baseNote = typeof base.note === "string" ? base.note : "";

    setName(base.name ?? "");
    setGroup(baseGroup);
    setLegacyGroup(baseLegacyGroup);
    setElectives(baseElectives);
    setWeeks(baseWeeks);
    setLocation(baseLocation);
    setNote(baseNote);
    setSelectedPeriods(basePeriods);
    setErrors([]);
    setInitialLocationText(baseLocation);
    setInitialNoteText(baseNote);
    setInitialSnapshot({
      name: base.name ?? "",
      group: baseGroup,
      legacyGroup: baseLegacyGroup,
      electives: baseElectives,
      weeks: baseWeeks,
      location: baseLocation,
      note: baseNote,
      periods: basePeriods
    });
  }, [initialValues, normalizedPeriods]);

  const normalizedSelectedPeriods = useMemo(
    () =>
      normalizeNumbers(selectedPeriods).filter((item) =>
        normalizedPeriods.includes(item)
      ),
    [selectedPeriods, normalizedPeriods]
  );

  const normalizedSelectedWeeks = useMemo(
    () =>
      normalizeNumbers(weeks).filter((item) =>
        normalizedAllowedWeeks.length > 0 ? normalizedAllowedWeeks.includes(item) : true
      ),
    [weeks, normalizedAllowedWeeks]
  );

  // 当选择了不同节次数的周时，计算可选的节次交集
  // 只有在用户主动修改周次后才应用共同节次限制，初始化时使用所有节次
  const effectiveAvailablePeriods = useMemo(() => {
    if (!hasPeriodVariation || !userHasModifiedWeeks || normalizedSelectedWeeks.length === 0) {
      return normalizedPeriods;
    }
    // 找出所有选中周都存在的节次
    const commonPeriods = normalizedSelectedWeeks.reduce((acc, week) => {
      const weekPeriods = normalizeNumbers(weekPeriodMap[week] || []);
      if (acc === null) return weekPeriods;
      return acc.filter((p) => weekPeriods.includes(p));
    }, null);
    const result = commonPeriods || normalizedPeriods;
    // 如果共同节次为空但有选中周，说明这些周节次完全不同
    // 此时返回所有涉及节次，让用户自己选择
    return result.length > 0 ? result : normalizedPeriods;
  }, [hasPeriodVariation, userHasModifiedWeeks, normalizedSelectedWeeks, weekPeriodMap, normalizedPeriods]);

  // 当周次变化且有节次差异时，自动调整选中的节次
  useEffect(() => {
    if (!hasPeriodVariation || weeks.length === 0) return;

    // 计算当前选中周的共同节次
    const currentCommonPeriods = normalizeNumbers(weeks).reduce((acc, week) => {
      const weekPeriods = normalizeNumbers(weekPeriodMap[week] || []);
      if (acc === null) return weekPeriods;
      return acc.filter((p) => weekPeriods.includes(p));
    }, null);

    if (!currentCommonPeriods || currentCommonPeriods.length === 0) return;

    // 检查当前选中节次是否都在共同节次中
    const validPeriods = normalizedSelectedPeriods.filter((p) =>
      currentCommonPeriods.includes(p)
    );

    // 如果有节次变化（移除或新增），更新选中节次
    if (validPeriods.length !== normalizedSelectedPeriods.length) {
      setSelectedPeriods(validPeriods);
    }

    // 如果当前选中节次少于共同节次（比如从2节课的周切换到3节课的周），
    // 自动扩展选中节次到共同节次的超集
    const needsExpansion = currentCommonPeriods.some(
      (p) => !normalizedSelectedPeriods.includes(p)
    );
    if (needsExpansion) {
      // 合并当前选中节次和共同节次，但不超过共同节次范围
      const merged = normalizeNumbers([...normalizedSelectedPeriods, ...currentCommonPeriods]);
      setSelectedPeriods(merged);
    }
  }, [weeks, hasPeriodVariation, weekPeriodMap]);

  const currentSnapshot = useMemo(
    () => ({
      name,
      group,
      legacyGroup,
      electives: normalizeElectives(electives),
      weeks: normalizedSelectedWeeks,
      location,
      note,
      periods: normalizedSelectedPeriods
    }),
    [
      name,
      group,
      legacyGroup,
      electives,
      normalizedSelectedWeeks,
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
    if (normalizedSelectedWeeks.length === 0) {
      nextErrors.push(weekErrorMessage);
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

    onSave?.(
      {
        name: trimmedName,
        group: normalizedGroup,
        electives: normalizeElectives(electives),
        weeks: normalizedSelectedWeeks,
        location: location.trim(),
        note: note.trim()
      },
      {
        weeks: normalizedSelectedWeeks,
        periods: normalizedSelectedPeriods,
        changedFields: {
          location: location.trim() !== initialLocationText.trim(),
          note: note.trim() !== initialNoteText.trim()
        }
      }
    );
  };

  const hasPeriodSelection = effectiveAvailablePeriods.length > 1;

  return (
    <div
      className="mt-4 rounded-2xl p-4"
      style={{ border: "1px solid #CAC4D0", backgroundColor: "#F3EDF7" }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold" style={{ color: "#1C1B1F" }}>
          {title}
        </div>
        <button
          type="button"
          onClick={requestCancel}
          className="text-xs font-medium transition-colors"
          style={{ color: "#49454F" }}
        >
          取消
        </button>
      </div>

      {errors.length > 0 && (
        <div
          className="mt-2 text-xs rounded-xl p-3 space-y-1"
          style={{
            backgroundColor: "#F9DEDC",
            color: "#410E0B",
            border: "1px solid #EFB8C8"
          }}
        >
          {errors.map((err, index) => (
            <div key={`${err}-${index}`}>{err}</div>
          ))}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <label className="block text-xs font-semibold" style={{ color: "#49454F" }}>
          课程名称
        </label>
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
          style={{
            backgroundColor: "#ECE6F0",
            border: "1px solid #CAC4D0",
            color: "#1C1B1F",
            "--tw-ring-color": "#6750A4"
          }}
          placeholder="如：儿科学A"
        />

        <label className="block text-xs font-semibold" style={{ color: "#49454F" }}>
          组别（可选）
        </label>
        <select
          value={group || ""}
          onChange={(event) => setGroup(event.target.value)}
          className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
          style={{
            backgroundColor: "#ECE6F0",
            border: "1px solid #CAC4D0",
            color: "#1C1B1F"
          }}
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
          <div className="text-xs font-semibold mb-2" style={{ color: "#49454F" }}>
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
                  style={
                    isSelected
                      ? { backgroundColor: "#6750A4", color: "#FFFFFF" }
                      : { backgroundColor: "#ECE6F0", color: "#1D192B" }
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: "#49454F" }}>
            {weekLabel}
          </div>
          {normalizedAllowedWeeks.length > 1 && currentWeek != null && (
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setWeeks([currentWeek])}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: "#E8DEF8",
                  color: "#21005D",
                  border: "1px solid #CAC4D0"
                }}
              >
                仅第{currentWeek}周
              </button>
              <button
                type="button"
                onClick={() => setWeeks(normalizedAllowedWeeks)}
                className="px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                style={{
                  backgroundColor: "#E8DEF8",
                  color: "#21005D",
                  border: "1px solid #CAC4D0"
                }}
              >
                全部周
              </button>
            </div>
          )}
          <WeekMultiSelect
            weeks={weeks}
            onChange={(newWeeks) => {
              if (!userHasModifiedWeeks) {
                setUserHasModifiedWeeks(true);
              }
              setWeeks(newWeeks);
            }}
            minWeek={minWeek}
            maxWeek={maxWeek}
            allowedWeeks={normalizedAllowedWeeks}
          />
        </div>

        <div>
          <div className="text-xs font-semibold text-gray-600 mb-1">上课地点</div>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
            style={{
              backgroundColor: "#ECE6F0",
              border: "1px solid #CAC4D0",
              color: "#1C1B1F"
            }}
            placeholder="如：教学楼A101"
          />
        </div>

        <div>
          <div className="text-xs font-semibold mb-1" style={{ color: "#49454F" }}>
            备注
          </div>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="w-full px-3 py-2 rounded-xl text-sm focus:ring-2 focus:outline-none"
            style={{
              backgroundColor: "#ECE6F0",
              border: "1px solid #CAC4D0",
              color: "#1C1B1F"
            }}
            placeholder="如：需要带白大褂"
          />
        </div>

        {hasPeriodSelection && (
          <div>
            <div className="text-xs font-semibold mb-2" style={{ color: "#49454F" }}>
              作用节次
              {hasPeriodVariation && normalizedSelectedWeeks.length > 0 && (
                <span className="ml-1 text-purple-600">
                  （已过滤到选中周的共同节次）
                </span>
              )}
            </div>
            <WeekMultiSelect
              weeks={selectedPeriods}
              onChange={setSelectedPeriods}
              minWeek={effectiveAvailablePeriods[0]}
              maxWeek={effectiveAvailablePeriods[effectiveAvailablePeriods.length - 1]}
              allowedWeeks={effectiveAvailablePeriods}
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={requestCancel}
            className="px-4 py-1.5 rounded-pill text-xs font-semibold transition-colors"
            style={{ color: "#6750A4", backgroundColor: "transparent" }}
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-1.5 rounded-pill text-xs font-semibold transition-colors"
            style={{ backgroundColor: "#6750A4", color: "#FFFFFF" }}
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
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
    () =>
      logicalCourses.find((course) => course.logicalId === editingLogicalId) || null,
    [logicalCourses, editingLogicalId]
  );

  const deletingCourse = useMemo(
    () =>
      logicalCourses.find((course) => course.logicalId === deletingLogicalId) || null,
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
    // 计算用户选择的周次在该课程中实际存在的节次
    const selectedWeeksSet = new Set(payload.weeks);
    const weeksPeriodsIntersection = (logicalCourse.availablePeriods || []).filter(
      (period) => {
        // 检查该节次在每个选中周是否都有课程
        return payload.weeks.every((week) => {
          const weekPeriods = logicalCourse.weekPeriodMap?.[week] || [];
          return weekPeriods.includes(period);
        });
      }
    );

    // scopePeriods 只包含用户选中周实际存在的节次
    const effectiveScopePeriods =
      weeksPeriodsIntersection.length > 0
        ? weeksPeriodsIntersection
        : payload.periods;

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
                  {getPeriodRangeLabel(
                    selectedCell.periodStart,
                    selectedCell.periodEnd
                  )}
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

            <div
              className="flex-1 p-3 sm:p-5 overflow-y-auto"
              style={{ backgroundColor: "#FFFBFE" }}
            >
              {logicalCourses.length === 0 ? (
                <div className="text-center py-10">
                  <Calendar
                    className="mx-auto mb-3"
                    size={36}
                    style={{ color: "#CAC4D0" }}
                  />
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: "#1C1B1F" }}
                  >
                    本节无课程安排
                  </h3>
                  <p className="text-sm" style={{ color: "#49454F" }}>
                    该时间段没有安排课程
                  </p>
                </div>
              ) : (
                logicalCourses.map((course) => {
                  const isEditing =
                    editingCourse?.logicalId === course.logicalId && isEditMode;
                  const isDeleting =
                    deletingCourse?.logicalId === course.logicalId && isEditMode;

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
                    <div
                      key={course.logicalId}
                      className="mb-3 p-3 sm:p-4"
                      style={{
                        borderRadius: "16px",
                        backgroundColor: course.isCurrentWeek ? "#EADDFF" : "#F3EDF7",
                        border: course.isCurrentWeek
                          ? "1.5px solid #6750A4"
                          : "1px solid #CAC4D0"
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3
                            className="text-base sm:text-lg font-bold"
                            style={{
                              color: course.isCurrentWeek ? "#21005D" : "#1C1B1F"
                            }}
                          >
                            {course.baseCourse.name}
                          </h3>
                          {course.baseCourse.group && (
                            <p
                              className="text-sm font-medium mt-0.5"
                              style={{ color: "#6750A4" }}
                            >
                              {course.baseCourse.group}
                            </p>
                          )}
                          {normalizeElectives(course.baseCourse.electives).length > 0 && (
                            <p
                              className="text-xs font-medium mt-1"
                              style={{ color: "#7D5260" }}
                            >
                              {normalizeElectives(course.baseCourse.electives)
                                .map(getElectiveLabel)
                                .join(" / ")}
                            </p>
                          )}
                        </div>
                        {course.isCurrentWeek && (
                          <span
                            className="text-xs font-semibold px-2.5 py-0.5 flex-shrink-0"
                            style={{
                              backgroundColor: "#6750A4",
                              color: "#FFFFFF",
                              borderRadius: "9999px"
                            }}
                          >
                            本周课程
                          </span>
                        )}
                      </div>

                      <div className="mt-2 sm:mt-3">
                        <p
                          className="text-xs uppercase tracking-wider"
                          style={{ color: "#49454F" }}
                        >
                          上课周次
                        </p>
                        <p
                          className="text-sm font-medium mt-1 break-words"
                          style={{ color: "#1C1B1F" }}
                        >
                          {formatWeekList(course.allWeeks)}周
                        </p>
                      </div>

                      <div className="mt-2">
                        <p
                          className="text-xs uppercase tracking-wider"
                          style={{ color: "#49454F" }}
                        >
                          节次安排
                        </p>
                        <div className="mt-1 space-y-1">
                          {course.periodSummary.map((item) => (
                            <p
                              key={`${course.logicalId}-${item.label}-${item.periodsLabel}`}
                              className="text-sm font-medium break-words"
                              style={{ color: "#1C1B1F" }}
                            >
                              {item.label ? `${item.label}：` : ""}
                              {item.periodsLabel}
                            </p>
                          ))}
                        </div>
                        {course.isCurrentWeek &&
                          course.hasPeriodVariation &&
                          course.currentWeekPeriodsLabel && (
                          <p className="text-xs mt-2" style={{ color: "#6750A4" }}>
                            当前周节次：{course.currentWeekPeriodsLabel}
                          </p>
                        )}
                      </div>

                      {course.locationText && (
                        <div className="mt-2">
                          <p
                            className="text-xs uppercase tracking-wider flex items-center gap-1"
                            style={{ color: "#49454F" }}
                          >
                            <MapPin size={12} />
                            上课地点
                          </p>
                          <p
                            className="text-sm font-medium mt-1 break-words"
                            style={{ color: "#1C1B1F" }}
                          >
                            {course.locationText}
                          </p>
                        </div>
                      )}

                      {course.noteText && (
                        <div className="mt-2">
                          <p
                            className="text-xs uppercase tracking-wider"
                            style={{ color: "#49454F" }}
                          >
                            备注
                          </p>
                          <p
                            className="text-sm font-medium mt-1 break-words"
                            style={{ color: "#1C1B1F" }}
                          >
                            {course.noteText}
                          </p>
                        </div>
                      )}

                      {isEditMode && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (!requestDiscardIfNeeded()) return;
                              setHasUnsavedEditorChanges(false);
                              setEditingLogicalId(course.logicalId);
                              setAddingCourse(false);
                              setDeletingLogicalId(null);
                              setDeletePeriods([]);
                              setDeleteWeeks([]);
                              setDeleteError("");
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                              backgroundColor: "#E8DEF8",
                              color: "#1D192B",
                              borderRadius: "9999px"
                            }}
                          >
                            <Pencil size={14} />
                            编辑
                          </button>
                          <button
                            type="button"
                            onClick={() => openDelete(course)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
                            style={{
                              backgroundColor: "#F9DEDC",
                              color: "#410E0B",
                              borderRadius: "9999px"
                            }}
                          >
                            <Trash2 size={14} />
                            删除
                          </button>
                        </div>
                      )}

                      {isDeleting && (
                        <div
                          className="mt-3 p-3 text-xs"
                          style={{
                            backgroundColor: "#F9DEDC",
                            borderRadius: "12px",
                            border: "1px solid #EFB8C8",
                            color: "#410E0B"
                          }}
                        >
                          <div className="font-semibold">选择要删除的周次</div>
                          <div className="mt-2">
                            <WeekMultiSelect
                              weeks={deleteWeeks}
                              onChange={setDeleteWeeks}
                              minWeek={MIN_WEEK}
                              maxWeek={MAX_WEEK}
                              allowedWeeks={course.allWeeks}
                            />
                          </div>
                          <div className="font-semibold mt-3">选择要删除的节次</div>
                          <div className="mt-2">
                            <WeekMultiSelect
                              weeks={deletePeriods}
                              onChange={setDeletePeriods}
                              minWeek={course.availablePeriods[0]}
                              maxWeek={course.availablePeriods[course.availablePeriods.length - 1]}
                              allowedWeeks={course.availablePeriods}
                            />
                          </div>
                          {deleteError && (
                            <div className="mt-2" style={{ color: "#B3261E" }}>
                              {deleteError}
                            </div>
                          )}
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={confirmDelete}
                              className="px-4 py-1.5 text-xs font-semibold"
                              style={{
                                backgroundColor: "#B3261E",
                                color: "#FFFFFF",
                                borderRadius: "9999px"
                              }}
                            >
                              确认删除
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingLogicalId(null);
                                setDeletePeriods([]);
                                setDeleteWeeks([]);
                                setDeleteError("");
                              }}
                              className="px-4 py-1.5 text-xs font-semibold"
                              style={{
                                border: "1px solid #EFB8C8",
                                color: "#410E0B",
                                borderRadius: "9999px",
                                backgroundColor: "transparent"
                              }}
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
                  onClick={() => {
                    if (!requestDiscardIfNeeded()) return;
                    setHasUnsavedEditorChanges(false);
                    setAddingCourse(true);
                    setEditingLogicalId(null);
                    setDeletingLogicalId(null);
                    setDeletePeriods([]);
                    setDeleteWeeks([]);
                    setDeleteError("");
                  }}
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
