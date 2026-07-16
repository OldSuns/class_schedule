import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAYS, DAY_NAMES } from "../../config/constants";
import {
  filterScheduleEvents,
  getCurrentEvents,
  getEventProgress
} from "../../utils/schedule/eventUtils";
import { getScheduleDate, parseTimeToMinutes } from "../../utils/schedule/timeUtils";

const getTime = (date) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const isSameLocalDate = (left, right) =>
  left instanceof Date &&
  right instanceof Date &&
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const CourseTable = ({
  events = [],
  semesterStartDate,
  currentWeek,
  selectedDay = "Monday",
  userGroup = "1组",
  now = new Date(),
  onSelectDay,
  onPreviousWeek,
  onNextWeek,
  onEventClick,
  isScheduleLoaded = true
}) => {
  const selectedDate = getScheduleDate(semesterStartDate, currentWeek, selectedDay);
  const dayEvents = filterScheduleEvents(events, {
    week: currentWeek,
    day: selectedDay,
    group: userGroup
  });
  const currentEvents =
    selectedDate && isSameLocalDate(selectedDate, now)
      ? getCurrentEvents(events, {
          week: currentWeek,
          day: selectedDay,
          group: userGroup,
          atTime: getTime(now)
        })
      : [];
  const currentIds = new Set(currentEvents.map((event) => event.id));

  return (
    <div className="space-y-3">
      <div
        className="flex h-12 items-center justify-between rounded-xl border px-3"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--outline-variant)"
        }}
      >
        <button type="button" aria-label="上一周" onClick={onPreviousWeek}>
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-bold text-on-surface">第 {currentWeek} 周</span>
        <button type="button" aria-label="下一周" onClick={onNextWeek}>
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-5 gap-1.5">
        {DAYS.map((day) => {
          const date = getScheduleDate(semesterStartDate, currentWeek, day);
          const selected = day === selectedDay;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay?.(day)}
              className="rounded-xl border px-1 py-2 text-[11px] font-semibold transition-colors"
              style={{
                backgroundColor: selected ? "var(--primary)" : "var(--surface-primary)",
                borderColor: selected ? "var(--primary)" : "var(--outline-variant)",
                color: selected ? "var(--on-primary)" : "var(--foreground-secondary)"
              }}
            >
              {DAY_NAMES[day].short} {date?.getDate() ?? ""}
            </button>
          );
        })}
      </div>

      <h2 className="px-1 text-lg font-bold text-on-surface">
        {DAY_NAMES[selectedDay]?.short} · {selectedDate ? `${selectedDate.getMonth() + 1} 月 ${selectedDate.getDate()} 日` : ""}
      </h2>

      <section className="space-y-2" aria-label="当前课程">
        {currentEvents.length > 0 ? (
          currentEvents.map((event) => {
            const progress = getEventProgress(event, getTime(now));
            const duration =
              parseTimeToMinutes(event.endTime) - parseTimeToMinutes(event.startTime);
            const elapsed = Math.round((progress / 100) * duration);
            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onEventClick?.(event)}
                className="w-full rounded-2xl border bg-surface-primary px-4 py-4 text-left"
                style={{ borderColor: "var(--primary)" }}
              >
                <span className="text-[11px] font-bold text-primary">当前课程</span>
                <strong className="mt-1 block text-center text-lg text-on-surface">
                  {event.name}
                </strong>
                <span className="mt-1 block text-center text-xs text-on-surface-variant">
                  {event.startTime}–{event.endTime} · {event.location || "地点未提供"}
                </span>
                <span className="mt-2 block text-[10px] text-on-surface-variant">
                  已进行 {elapsed} 分钟 · 剩余 {Math.max(0, duration - elapsed)} 分钟
                </span>
                <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-mid">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </span>
              </button>
            );
          })
        ) : (
          <div
            className="rounded-2xl border px-4 py-4 text-center"
            style={{
              backgroundColor: "var(--surface-primary)",
              borderColor: "var(--outline-variant)"
            }}
          >
            <span className="text-[11px] font-bold text-primary">当前课程</span>
            <p className="mt-1 text-sm font-semibold text-on-surface-variant">当前无课程</p>
          </div>
        )}
      </section>

      <section aria-label="当天全部课程">
        <div className="mb-2 flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-on-surface">当天全部课程</h3>
          <span className="text-[10px] text-on-surface-variant">
            {dayEvents.length} 项
            {dayEvents.length > 0
              ? ` · ${dayEvents[0].startTime}—${dayEvents.at(-1).endTime}`
              : ""}
          </span>
        </div>
        <div
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: "var(--surface-primary)",
            borderColor: "var(--outline-variant)"
          }}
        >
          <div className="grid grid-cols-[90px_minmax(0,1fr)_98px] bg-primary-container text-center text-[11px] font-bold text-primary-on-container">
            <span className="px-2 py-2.5">时间</span>
            <span className="px-2 py-2.5">课程</span>
            <span className="px-2 py-2.5">地点</span>
          </div>
          {!isScheduleLoaded ? (
            <p className="px-4 py-8 text-center text-sm text-on-surface-variant">课表加载中</p>
          ) : dayEvents.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-on-surface-variant">当天无课程</p>
          ) : (
            dayEvents.map((event) => {
              const active = currentIds.has(event.id);
              return (
                <button
                  key={event.id}
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => onEventClick?.(event)}
                  className="grid w-full grid-cols-[90px_minmax(0,1fr)_98px] items-center border-t text-center"
                  style={{
                    backgroundColor: active ? "var(--primary-container)" : "var(--surface-primary)",
                    borderColor: "var(--outline-variant)",
                    boxShadow: active ? "inset 4px 0 0 var(--primary)" : "none"
                  }}
                >
                  <span className="px-2 py-4 font-mono text-[11px] font-semibold text-on-surface-variant">
                    {event.startTime}–{event.endTime}
                  </span>
                  <strong
                    className="px-2 py-4 text-sm leading-snug"
                    style={{ color: active ? "var(--primary)" : "var(--foreground-primary)" }}
                  >
                    {event.name}
                  </strong>
                  <span className="break-words px-2 py-4 text-[11px] leading-snug text-on-surface-variant">
                    {event.location || "—"}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseTable;
