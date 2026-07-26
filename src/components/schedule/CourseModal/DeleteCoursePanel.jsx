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
    className="mt-3 p-3 text-xs bg-error-container text-error-on-container rounded-xl"
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
    {deleteError && <div className="mt-2 text-error">{deleteError}</div>}
    <div className="flex gap-2 mt-3">
      <button
        type="button"
        onClick={onConfirm}
        className="px-4 py-1.5 text-xs font-semibold bg-error text-on-primary rounded-pill"
      >
        确认删除
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-1.5 text-xs font-semibold bg-transparent text-error-on-container rounded-pill"
      >
        取消
      </button>
    </div>
  </div>
);

export default DeleteCoursePanel;
