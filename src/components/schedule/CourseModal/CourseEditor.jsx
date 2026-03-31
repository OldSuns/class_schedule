import React, { useEffect, useMemo, useRef, useState } from "react";
import { ELECTIVE_OPTIONS } from "../../../config/constants";
import { normalizeElectives } from "../../../utils/schedule/electiveUtils";
import WeekMultiSelect from "../../shared/WeekMultiSelect.jsx";

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
  const hasInitializedRef = useRef(false);

  const normalizedPeriods = useMemo(
    () => normalizeNumbers(availablePeriods),
    [availablePeriods]
  );
  const normalizedAllowedWeeks = useMemo(
    () => normalizeNumbers(allowedWeeks),
    [allowedWeeks]
  );

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

  const effectiveAvailablePeriods = useMemo(() => {
    if (!hasPeriodVariation || !userHasModifiedWeeks || normalizedSelectedWeeks.length === 0) {
      return normalizedPeriods;
    }
    const commonPeriods = normalizedSelectedWeeks.reduce((acc, week) => {
      const weekPeriods = normalizeNumbers(weekPeriodMap[week] || []);
      if (acc === null) return weekPeriods;
      return acc.filter((period) => weekPeriods.includes(period));
    }, null);
    const result = commonPeriods || normalizedPeriods;
    return result.length > 0 ? result : normalizedPeriods;
  }, [
    hasPeriodVariation,
    userHasModifiedWeeks,
    normalizedSelectedWeeks,
    weekPeriodMap,
    normalizedPeriods
  ]);

  useEffect(() => {
    if (!hasPeriodVariation || weeks.length === 0) return;

    const currentCommonPeriods = normalizeNumbers(weeks).reduce((acc, week) => {
      const weekPeriods = normalizeNumbers(weekPeriodMap[week] || []);
      if (acc === null) return weekPeriods;
      return acc.filter((period) => weekPeriods.includes(period));
    }, null);

    if (!currentCommonPeriods || currentCommonPeriods.length === 0) return;

    const validPeriods = normalizedSelectedPeriods.filter((period) =>
      currentCommonPeriods.includes(period)
    );

    if (validPeriods.length !== normalizedSelectedPeriods.length) {
      setSelectedPeriods(validPeriods);
    }

    const needsExpansion = currentCommonPeriods.some(
      (period) => !normalizedSelectedPeriods.includes(period)
    );
    if (needsExpansion) {
      const merged = normalizeNumbers([
        ...normalizedSelectedPeriods,
        ...currentCommonPeriods
      ]);
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
                <span className="ml-1 text-purple-600">（已过滤到选中周的共同节次）</span>
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

export default CourseEditor;
