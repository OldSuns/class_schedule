import { MapPin, Pencil, Trash2 } from "lucide-react";
import {
  getElectiveLabel,
  normalizeElectives
} from "../../../utils/schedule/electiveUtils";

const CourseCard = ({ course, isEditMode, onEdit, onDelete, children }) => (
  <div
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
          style={{ color: course.isCurrentWeek ? "#21005D" : "#1C1B1F" }}
        >
          {course.baseCourse.name}
        </h3>
        {course.baseCourse.group && (
          <p className="text-sm font-medium mt-0.5" style={{ color: "#6750A4" }}>
            {course.baseCourse.group}
          </p>
        )}
        {normalizeElectives(course.baseCourse.electives).length > 0 && (
          <p className="text-xs font-medium mt-1" style={{ color: "#7D5260" }}>
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
      <p className="text-xs uppercase tracking-wider" style={{ color: "#49454F" }}>
        上课周次
      </p>
      <p className="text-sm font-medium mt-1 break-words" style={{ color: "#1C1B1F" }}>
        {course.allWeeksLabel}周
      </p>
    </div>

    <div className="mt-2">
      <p className="text-xs uppercase tracking-wider" style={{ color: "#49454F" }}>
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
      {course.isCurrentWeek && course.hasPeriodVariation && course.currentWeekPeriodsLabel && (
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
        <p className="text-sm font-medium mt-1 break-words" style={{ color: "#1C1B1F" }}>
          {course.locationText}
        </p>
      </div>
    )}

    {course.noteText && (
      <div className="mt-2">
        <p className="text-xs uppercase tracking-wider" style={{ color: "#49454F" }}>
          备注
        </p>
        <p className="text-sm font-medium mt-1 break-words" style={{ color: "#1C1B1F" }}>
          {course.noteText}
        </p>
      </div>
    )}

    {isEditMode && (
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onEdit}
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
          onClick={onDelete}
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

    {children}
  </div>
);

export default CourseCard;
