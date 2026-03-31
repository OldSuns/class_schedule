import { MAX_WEEK, MIN_WEEK } from "../../../config/constants";
import WeekMultiSelect from "../../shared/WeekMultiSelect.jsx";

const DeleteCoursePanel = ({
  course,
  deleteWeeks,
  onDeleteWeeksChange,
  deletePeriods,
  onDeletePeriodsChange,
  deleteError,
  onConfirm,
  onCancel
}) => (
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
        onChange={onDeleteWeeksChange}
        minWeek={MIN_WEEK}
        maxWeek={MAX_WEEK}
        allowedWeeks={course.allWeeks}
      />
    </div>
    <div className="font-semibold mt-3">选择要删除的节次</div>
    <div className="mt-2">
      <WeekMultiSelect
        weeks={deletePeriods}
        onChange={onDeletePeriodsChange}
        minWeek={course.availablePeriods[0] ?? 1}
        maxWeek={course.availablePeriods[course.availablePeriods.length - 1] ?? 1}
        allowedWeeks={course.availablePeriods}
      />
    </div>
    {deleteError && <div className="mt-2" style={{ color: "#B3261E" }}>{deleteError}</div>}
    <div className="flex gap-2 mt-3">
      <button
        type="button"
        onClick={onConfirm}
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
        onClick={onCancel}
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
);

export default DeleteCoursePanel;
