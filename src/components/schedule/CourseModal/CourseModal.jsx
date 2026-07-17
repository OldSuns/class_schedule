import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, MapPin, Pencil, Trash2, X } from "lucide-react";
import { DAY_NAMES, MAX_WEEK, MIN_WEEK } from "../../../config/constants";
import { parseTimeToMinutes } from "../../../utils/schedule/timeUtils";

const GROUP_OPTIONS = Array.from({ length: 7 }, (_, index) => `${index + 1}组`);

const CourseModal = ({
  isOpen,
  event,
  currentWeek,
  onUpdateEvent,
  onDeleteEvent,
  onClose
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [form, setForm] = useState(event ?? null);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(event ?? null);
    setIsEditMode(false);
    setIsConfirmingDelete(false);
    setError("");
  }, [event, isOpen]);

  if (!isOpen || !event || !form) return null;

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleWeek = (week) => {
    const selected = new Set(form.weeks);
    if (selected.has(week)) selected.delete(week);
    else selected.add(week);
    updateField("weeks", Array.from(selected).sort((left, right) => left - right));
  };

  const save = () => {
    if (!form.name.trim()) {
      setError("请输入课程名称");
      return;
    }
    if (
      parseTimeToMinutes(form.startTime) == null ||
      parseTimeToMinutes(form.endTime) == null ||
      parseTimeToMinutes(form.endTime) <= parseTimeToMinutes(form.startTime)
    ) {
      setError("结束时间必须晚于开始时间");
      return;
    }
    if (form.weeks.length === 0) {
      setError("请至少选择一个周次");
      return;
    }
    setError("");
    onUpdateEvent?.({
      ...form,
      name: form.name.trim(),
      location: form.location.trim(),
      teacher: form.teacher.trim(),
      note: form.note.trim()
    });
    setIsEditMode(false);
  };

  const confirmDelete = () => {
    onDeleteEvent?.(event.id);
    setIsConfirmingDelete(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        key="course-modal-backdrop"
        className="fixed inset-0 z-40 flex items-end bg-black/25"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onMouseDown={(mouseEvent) => {
          if (mouseEvent.target === mouseEvent.currentTarget) onClose?.();
        }}
      >
        <motion.div
          className="mx-auto flex max-h-[88vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-surface-primary"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.2 }}
        >
          <header className="flex items-center justify-between rounded-t-[28px] bg-surface-elevated p-4">
            <div className="flex min-w-0 items-center gap-2">
              <Clock size={20} className="shrink-0" />
              <h2 className="truncate text-base font-bold text-on-surface">
                {DAY_NAMES[event.day].zh} · {event.startTime}–{event.endTime}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-on-surface-variant">编辑</span>
              <button
                type="button"
                aria-label="切换编辑模式"
                aria-pressed={isEditMode}
                onClick={() => {
                  setIsEditMode((value) => !value);
                  setIsConfirmingDelete(false);
                  setError("");
                }}
                className="relative h-5 w-9 rounded-full"
                style={{ backgroundColor: isEditMode ? "var(--primary)" : "var(--surface-high)" }}
              >
                <span
                  className="absolute top-1 h-3 w-3 rounded-full bg-white transition-transform"
                  style={{ transform: `translateX(${isEditMode ? 20 : 4}px)` }}
                />
              </button>
              <button type="button" aria-label="关闭课程详情" onClick={onClose}>
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="overflow-y-auto p-4">
            {isEditMode ? (
              <div className="space-y-4 rounded-2xl bg-primary-container p-4">
                <label className="block text-xs text-on-surface-variant">
                  课程名称
                  <input
                    value={form.name}
                    onChange={(inputEvent) => updateField("name", inputEvent.target.value)}
                    className="mt-1 w-full rounded-xl bg-surface-primary px-3 py-2 text-sm text-on-surface outline-none"
                  />
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-xs text-on-surface-variant">
                    开始时间
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(inputEvent) => updateField("startTime", inputEvent.target.value)}
                      className="mt-1 w-full rounded-xl bg-surface-primary px-3 py-2 text-sm text-on-surface outline-none"
                    />
                  </label>
                  <label className="text-xs text-on-surface-variant">
                    结束时间
                    <input
                      type="time"
                      value={form.endTime}
                      onChange={(inputEvent) => updateField("endTime", inputEvent.target.value)}
                      className="mt-1 w-full rounded-xl bg-surface-primary px-3 py-2 text-sm text-on-surface outline-none"
                    />
                  </label>
                </div>
                <label className="block text-xs text-on-surface-variant">
                  地点
                  <input
                    value={form.location}
                    onChange={(inputEvent) => updateField("location", inputEvent.target.value)}
                    className="mt-1 w-full rounded-xl bg-surface-primary px-3 py-2 text-sm text-on-surface outline-none"
                  />
                </label>
                <label className="block text-xs text-on-surface-variant">
                  授课教师
                  <input
                    value={form.teacher}
                    onChange={(inputEvent) => updateField("teacher", inputEvent.target.value)}
                    className="mt-1 w-full rounded-xl bg-surface-primary px-3 py-2 text-sm text-on-surface outline-none"
                  />
                </label>
                <label className="block text-xs text-on-surface-variant">
                  备注
                  <textarea
                    rows={3}
                    value={form.note}
                    onChange={(inputEvent) => updateField("note", inputEvent.target.value)}
                    className="mt-1 w-full resize-y rounded-xl bg-surface-primary px-3 py-2 text-sm leading-6 text-on-surface outline-none"
                  />
                </label>
                <label className="block text-xs text-on-surface-variant">
                  适用对象
                  <select
                    value={form.group ?? ""}
                    onChange={(inputEvent) => updateField("group", inputEvent.target.value || null)}
                    className="mt-1 w-full rounded-xl bg-surface-primary px-3 py-2 text-sm text-on-surface outline-none"
                  >
                    <option value="">共同课程</option>
                    {GROUP_OPTIONS.map((group) => (
                      <option key={group} value={group}>{group}</option>
                    ))}
                  </select>
                </label>
                <div>
                  <span className="text-xs text-on-surface-variant">上课周次</span>
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {Array.from(
                      { length: MAX_WEEK - MIN_WEEK + 1 },
                      (_, index) => MIN_WEEK + index
                    ).map((week) => (
                      <button
                        key={week}
                        type="button"
                        aria-pressed={form.weeks.includes(week)}
                        onClick={() => toggleWeek(week)}
                        className="rounded-xl py-2 text-xs font-semibold"
                        style={
                          form.weeks.includes(week)
                            ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
                            : { backgroundColor: "var(--surface-primary)", color: "var(--foreground-primary)" }
                        }
                      >
                        {week}
                      </button>
                    ))}
                  </div>
                </div>
                {error && <p className="text-xs text-error">{error}</p>}
                <div className="flex justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(true)}
                    className="inline-flex items-center gap-1 rounded-full bg-error-container px-4 py-2 text-sm font-semibold text-error-on-container"
                  >
                    <Trash2 size={15} /> 删除
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-on-primary"
                  >
                    <Pencil size={15} /> 保存
                  </button>
                </div>
                {isConfirmingDelete && (
                  <div className="rounded-xl bg-surface-primary p-3 text-sm">
                    <p className="font-semibold text-on-surface">确认删除这门课程？</p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button type="button" onClick={() => setIsConfirmingDelete(false)}>取消</button>
                      <button type="button" className="font-bold text-error" onClick={confirmDelete}>确认删除</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <article className="rounded-2xl bg-primary-container p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="min-w-0 flex-1 text-lg font-bold text-primary-on-container">
                    {event.name}
                  </h3>
                  {event.weeks.includes(currentWeek) && (
                    <span className="shrink-0 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-primary-on-primary">
                      本周课程
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-xs text-on-surface-variant">上课周次</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">{event.weeks.join("、")}周</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">上课时间</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">
                      {event.startTime} — {event.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="flex items-center gap-1 text-xs text-on-surface-variant">
                      <MapPin size={13} /> 上课地点
                    </p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">
                      {event.location || "未提供"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant">适用对象</p>
                    <p className="mt-1 text-sm font-semibold text-on-surface">
                      {event.group ?? "全体学生"}
                    </p>
                  </div>
                  {event.teacher && (
                    <div>
                      <p className="text-xs text-on-surface-variant">授课教师</p>
                      <p className="mt-1 text-sm font-semibold text-on-surface">{event.teacher}</p>
                    </div>
                  )}
                  {event.note && (
                    <div>
                      <p className="text-xs text-on-surface-variant">备注</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm font-semibold leading-6 text-on-surface">
                        {event.note}
                      </p>
                    </div>
                  )}
                </div>
              </article>
            )}
          </div>

          <footer className="flex items-center justify-between bg-surface-elevated px-4 py-3 pb-[max(12px,var(--safe-bottom))]">
            <span className="text-xs text-on-surface-variant">
              {isEditMode ? "修改后点击保存" : "开启编辑模式以修改课程"}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-on-primary"
            >
              关闭
            </button>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CourseModal;
