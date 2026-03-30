import React from "react";

// M3 week/period chip selector
// Selected: primary filled; unselected: secondary-container tonal; disabled: dimmed
const WeekMultiSelect = ({
  weeks = [],
  onChange,
  minWeek = 1,
  maxWeek = 16,
  allowedWeeks
}) => {
  const selected = new Set(weeks);
  const allowedSet = Array.isArray(allowedWeeks)
    ? new Set(allowedWeeks)
    : null;

  const allWeeks = [];
  for (let week = minWeek; week <= maxWeek; week += 1) {
    allWeeks.push(week);
  }

  const toggleWeek = (week) => {
    if (allowedSet && !allowedSet.has(week)) return;
    const next = new Set(selected);
    if (next.has(week)) {
      next.delete(week);
    } else {
      next.add(week);
    }
    const sorted = Array.from(next).sort((a, b) => a - b);
    onChange?.(sorted);
  };

  return (
    <div className="grid grid-cols-8 gap-1">
      {allWeeks.map((week) => {
        const isSelected = selected.has(week);
        const isDisabled = allowedSet ? !allowedSet.has(week) : false;
        return (
          <button
            key={week}
            type="button"
            onClick={() => toggleWeek(week)}
            disabled={isDisabled}
            aria-pressed={isSelected}
            className={`py-1 rounded-lg text-xs font-semibold transition-colors duration-200 ${
              isSelected
                ? "bg-primary text-primary-on-primary shadow-sm"
                : "bg-secondary-container text-secondary-on-container hover:bg-primary-container"
            } ${
              isDisabled
                ? "opacity-30 cursor-not-allowed"
                : "cursor-pointer active:scale-95"
            }`}
            style={
              isSelected
                ? { backgroundColor: "#6750A4", color: "#FFFFFF" }
                : isDisabled
                ? { backgroundColor: "#E8DEF8", color: "#1D192B", opacity: 0.3 }
                : { backgroundColor: "#E8DEF8", color: "#1D192B" }
            }
          >
            {week}
          </button>
        );
      })}
    </div>
  );
};

export default WeekMultiSelect;
