import React from "react";

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
            className={`py-1 rounded text-xs font-semibold transition-colors border ${
              isSelected
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
            } ${
              isDisabled
                ? "opacity-40 cursor-not-allowed hover:bg-white"
                : "cursor-pointer"
            }`}
          >
            {week}
          </button>
        );
      })}
    </div>
  );
};

export default WeekMultiSelect;