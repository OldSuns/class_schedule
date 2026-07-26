import { MapPin, Pencil, Trash2 } from "lucide-react";
import {
  getElectiveLabel,
  normalizeElectives
} from "../../../utils/schedule/electiveUtils";

const CourseCard = ({ course, isEditMode, onEdit, onDelete, children }) => (
  <div
    className="mb-4 p-4"
    style={{
      borderRadius: "16px",
      backgroundColor: course.isCurrentWeek ? "var(--primary-container)" : "var(--surface-elevated)"
    }}
  >
    <div className="flex justify-between items-start gap-2">
      <div className="flex-1 min-w-0">
        <h3
          className="text-lg font-bold"
          style={{ color: course.isCurrentWeek ? "var(--on-primary-container)" : "var(--foreground-primary)" }}
        >
          {course.baseCourse.name}
        </h3>
        {course.baseCourse.group && (
          <p className="text-sm font-medium mt-0.5" style={{ color: "var(--primary)" }}>
            {course.baseCourse.group}
          </p>
        )}
        {normalizeElectives(course.baseCourse.electives).length > 0 && (
          <p className="text-xs font-medium mt-1" style={{ color: "var(--tertiary)" }}>
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
            backgroundColor: "var(--primary)",
            color: "var(--on-primary)",
            borderRadius: "9999px"
          }}
        >
          本周课程
        </span>
      )}
    </div>

    <div className="mt-3">
      <p className="text-xs font-normal" style={{ color: "var(--foreground-secondary)" }}>
        上课周次
      </p>
      <p className="text-sm font-medium mt-1 break-words leading-relaxed" style={{ color: "var(--foreground-primary)" }}>
        {course.allWeeksLabel}周
      </p>
    </div>

    <div className="mt-3">
      <p className="text-xs font-normal" style={{ color: "var(--foreground-secondary)" }}>
        节次安排
      </p>
      <div className="mt-1 space-y-1">
        {course.periodSummary.map((item) => (
          <p
            key={`${course.logicalId}-${item.label}-${item.periodsLabel}`}
            className="text-sm font-medium break-words leading-relaxed"
            style={{ color: "var(--foreground-primary)" }}
          >
            {item.label ? `${item.label}：` : ""}
            {item.periodsLabel}
          </p>
        ))}
      </div>
      {course.isCurrentWeek && course.hasPeriodVariation && course.currentWeekPeriodsLabel && (
        <p className="text-xs mt-2" style={{ color: "var(--primary)" }}>
          当前周节次：{course.currentWeekPeriodsLabel}
        </p>
      )}
    </div>

    {(course.locationPeriods?.length > 0 || course.locationText) && (
      <div className="mt-3">
        <p
          className="text-xs font-normal flex items-center gap-1"
          style={{ color: "var(--foreground-secondary)" }}
        >
          <MapPin size={12} />
          上课地点
        </p>
        {course.locationPeriods?.length > 1 ? (
          <div className="mt-1 space-y-1">
            {course.locationPeriods.map((lp) => (
              <p
                key={`${course.logicalId}-${lp.location}-${lp.periodsLabel}`}
                className="text-sm font-medium break-words leading-relaxed"
                style={{ color: "var(--foreground-primary)" }}
              >
                <span style={{ color: "var(--primary)" }}>{lp.periodsLabel}</span>
                <span className="ml-2">{lp.location}</span>
              </p>
            ))}
          </div>
        ) : (
          <p
            className="text-sm font-medium mt-1 break-words leading-relaxed"
            style={{ color: "var(--foreground-primary)" }}
          >
            {course.locationText}
          </p>
        )}
      </div>
    )}

    {course.noteText && (
      <div className="mt-3">
        <p className="text-xs font-normal" style={{ color: "var(--foreground-secondary)" }}>
          备注
        </p>
        <p className="text-sm font-medium mt-1 break-words leading-relaxed" style={{ color: "var(--foreground-primary)" }}>
          {course.noteText}
        </p>
      </div>
    )}

    {isEditMode && (
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            backgroundColor: "var(--secondary-container)",
            color: "var(--on-secondary-container)",
            borderRadius: "9999px"
          }}
        >
          <Pencil size={14} />
          编辑
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-colors"
          style={{
            backgroundColor: "var(--error-container)",
            color: "var(--on-error-container)",
            borderRadius: "9999px"
          }}
        >
          <Trash2 size={14} />
          删除
        </button>
      </div>
    )}

    {children}
  </div>
);

export default CourseCard;
