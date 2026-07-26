import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlarmClock,
  CalendarClock,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X
} from "lucide-react";
import * as storage from "../../../storage";
import { STORAGE_KEYS } from "../../config/constants";
import {
  DEFAULT_EXAM_SEGMENT,
  EMPTY_EXAM_FORM,
  EXAM_METHOD_OPTIONS,
  EXAM_SEGMENTS,
  buildExamFromForm,
  buildExamSummary,
  deleteExam,
  examToFormValues,
  filterExamsBySegment,
  getExamActionRevealOffset,
  getExamCountdownLabel,
  isExamActionControlTarget,
  isExamCompleted,
  parseStoredExams,
  shouldOpenExamActions,
  stringifyExams,
  upsertExam
} from "../../utils/exam/examUtils";

const SEGMENT_OPTIONS = [
  { value: EXAM_SEGMENTS.ALL, label: "全部" },
  { value: EXAM_SEGMENTS.PENDING, label: "待考试" },
  { value: EXAM_SEGMENTS.COMPLETED, label: "已结束" }
];

const CARD_ACTION_WIDTH = 112;
const TOUCH_TRACK_THRESHOLD = 8;
const CONTEXT_MENU_WIDTH = 128;
const CONTEXT_MENU_HEIGHT = 88;

const formatExamDateTime = (startsAt) => {
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return "";
  const weekday = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    date.getDay()
  ];
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${date.getMonth() + 1}月${date.getDate()}日 ${weekday} ${date.getHours()}:${minutes}`;
};

const ExamMetric = ({ label, value, emphasized = false }) => (
  <div
    className="flex h-[62px] min-w-0 flex-1 flex-col justify-center rounded-[18px] px-3"
    style={{
      backgroundColor: emphasized ? "var(--primary-container)" : "var(--surface-primary)",
      color: emphasized ? "var(--on-primary-container)" : "var(--foreground-primary)"
    }}
  >
    <span className="text-[11px] font-medium leading-tight text-on-surface-variant">
      {label}
    </span>
    <span className="mt-0.5 text-xl font-extrabold leading-tight">{value}</span>
  </div>
);

const ExamCard = ({ exam, now, isNext, onEdit, onDelete }) => {
  const completed = isExamCompleted(exam, now);
  const touchRef = useRef(null);
  const preventNextClick = useRef(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const metaItems = [
    exam.location,
    exam.seatNumber ? `座位号 ${exam.seatNumber}` : "",
    exam.method,
    exam.durationMinutes ? `${exam.durationMinutes}分钟` : ""
  ].filter(Boolean);
  const cardOffset = dragOffset ?? (isActionOpen ? -CARD_ACTION_WIDTH : 0);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const closeContextMenu = () => setContextMenu(null);
    window.addEventListener("click", closeContextMenu);
    window.addEventListener("resize", closeContextMenu);
    window.addEventListener("scroll", closeContextMenu, true);
    return () => {
      window.removeEventListener("click", closeContextMenu);
      window.removeEventListener("resize", closeContextMenu);
      window.removeEventListener("scroll", closeContextMenu, true);
    };
  }, [contextMenu]);

  const runAction = (action) => {
    setIsActionOpen(false);
    setDragOffset(null);
    setContextMenu(null);
    action?.(exam);
  };

  const handleTouchStart = (event) => {
    if (isExamActionControlTarget(event.target)) {
      // 如果点击的是操作按钮，只阻止传播，不阻止默认行为（需要让 click 事件正常触发）
      event.stopPropagation();
      touchRef.current = null;
      return;
    }

    const touch = event.touches[0];
    if (!touch) return;
    setContextMenu(null);
    touchRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startOffset: isActionOpen ? -CARD_ACTION_WIDTH : 0,
      isTracking: false
    };
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    const snapshot = touchRef.current;
    if (!touch || !snapshot) return;

    const deltaX = touch.clientX - snapshot.startX;
    const deltaY = touch.clientY - snapshot.startY;
    const horizontalDistance = Math.abs(deltaX);
    const verticalDistance = Math.abs(deltaY);

    if (!snapshot.isTracking) {
      if (
        horizontalDistance < TOUCH_TRACK_THRESHOLD &&
        verticalDistance < TOUCH_TRACK_THRESHOLD
      ) {
        return;
      }
      if (verticalDistance >= horizontalDistance) {
        touchRef.current = null;
        return;
      }
      snapshot.isTracking = true;
    }

    event.preventDefault();
    setDragOffset(
      getExamActionRevealOffset(snapshot.startOffset + deltaX, CARD_ACTION_WIDTH)
    );
  };

  const finishTouch = (event) => {
    const touch = event.changedTouches?.[0];
    let targetElement = event.target;

    // 如果有触摸点，尝试通过触摸坐标找到实际的元素
    if (touch && touch.clientX != null && touch.clientY != null) {
      const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);
      if (elementAtPoint) {
        targetElement = elementAtPoint;
      }
    }

    // 如果点击的是操作按钮，直接处理
    if (isActionOpen && isExamActionControlTarget(targetElement)) {
      const button = targetElement.closest('button');
      const ariaLabel = button?.getAttribute('aria-label') || '';

      if (ariaLabel.includes('编辑')) {
        runAction(onEdit);
        return;
      }
      if (ariaLabel.includes('删除')) {
        runAction(onDelete);
        return;
      }
    }

    const snapshot = touchRef.current;
    if (!snapshot) return;
    const deltaX = touch ? touch.clientX - snapshot.startX : 0;
    const deltaY = touch ? touch.clientY - snapshot.startY : 0;
    const currentOffset =
      dragOffset ?? (isActionOpen ? -CARD_ACTION_WIDTH : snapshot.startOffset);

    const newOpenState = shouldOpenExamActions({ deltaX, deltaY, currentOffset });

    // 如果正在打开操作按钮，阻止可能的误触点击
    if (newOpenState && !isActionOpen) {
      preventNextClick.current = true;
      setTimeout(() => {
        preventNextClick.current = false;
      }, 300);
    }

    setIsActionOpen(newOpenState);
    setDragOffset(null);
    touchRef.current = null;
  };

  const handleContextMenu = (event) => {
    event.preventDefault();

    const maxLeft = Math.max(8, window.innerWidth - CONTEXT_MENU_WIDTH - 8);
    const maxTop = Math.max(8, window.innerHeight - CONTEXT_MENU_HEIGHT - 8);
    setIsActionOpen(false);
    setDragOffset(null);
    setContextMenu({
      x: Math.min(Math.max(event.clientX, 8), maxLeft),
      y: Math.min(Math.max(event.clientY, 8), maxTop)
    });
  };

  return (
    <div
      data-exam-card={exam.id}
      className="relative overflow-hidden rounded-[20px]"
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={finishTouch}
      onTouchCancel={() => {
        setDragOffset(null);
        touchRef.current = null;
      }}
      style={{ touchAction: "pan-y" }}
    >
      <div
        className="absolute inset-y-0 right-0 flex w-[112px] overflow-hidden rounded-[20px] border border-outline-variant bg-surface-high"
        data-exam-action-control
        style={{ pointerEvents: isActionOpen ? 'auto' : 'none' }}
      >
        <button
          type="button"
          onClick={(e) => {
            if (preventNextClick.current) {
              return;
            }
            e.stopPropagation();
            runAction(onEdit);
          }}
          tabIndex={isActionOpen ? 0 : -1}
          className="flex w-14 flex-col items-center justify-center gap-1 text-xs font-bold text-primary"
          aria-label={`编辑${exam.name}`}
        >
          <Pencil size={16} />
          编辑
        </button>
        <button
          type="button"
          onClick={(e) => {
            if (preventNextClick.current) {
              return;
            }
            e.stopPropagation();
            runAction(onDelete);
          }}
          tabIndex={isActionOpen ? 0 : -1}
          className="flex w-14 flex-col items-center justify-center gap-1 bg-error-container text-xs font-bold text-error"
          aria-label={`删除${exam.name}`}
        >
          <Trash2 size={16} />
          删除
        </button>
      </div>

      <article
        data-exam-card-surface={exam.id}
        className="relative rounded-[20px] border px-4 py-3 transition-transform duration-200 ease-m3-standard"
        style={{
          backgroundColor: "var(--surface-primary)",
          borderColor: "var(--outline-variant)",
          transform: `translateX(${cardOffset}px)`,
          transitionDuration: dragOffset == null ? "200ms" : "0ms"
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="min-w-0 flex-1 truncate text-[15px] font-bold text-on-surface">
                {exam.name}
              </h3>
              {isNext && !completed ? (
                <span className="rounded-pill bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-on-primary">
                  下一场
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs font-semibold text-primary">
              {formatExamDateTime(exam.startsAt)}
            </p>
          </div>
        </div>

        {metaItems.length > 0 ? (
          <div className="mt-2 flex items-center gap-2 text-xs font-medium text-on-surface-variant">
            <MapPin size={14} />
            <span className="min-w-0 flex-1 truncate">
              {metaItems.join(" · ")}
            </span>
          </div>
        ) : null}
      </article>

      {contextMenu ? (
        <div
          role="menu"
          className="fixed z-50 w-32 overflow-hidden rounded-2xl border border-outline-variant bg-surface-primary py-1 shadow-elevated"
          data-exam-action-control
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onEdit)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-on-surface transition-colors hover:bg-surface-mid"
          >
            <Pencil size={15} />
            编辑
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => runAction(onDelete)}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold text-error transition-colors hover:bg-error-container"
          >
            <Trash2 size={15} />
            删除
          </button>
        </div>
      ) : null}
    </div>
  );
};
const EmptyState = ({ title = "暂无考试安排", onAdd, showAction = false }) => (
  <div
    className="rounded-[20px] border px-4 py-8 text-center"
    style={{
      backgroundColor: "var(--surface-primary)",
      borderColor: "var(--outline-variant)"
    }}
  >
    <CalendarClock className="mx-auto text-outline" size={32} />
    <p className="mt-3 text-sm font-semibold text-on-surface">{title}</p>
    {showAction ? (
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-pill border border-outline-variant bg-primary-container px-4 py-2 text-sm font-bold text-primary-on-container"
      >
        <Plus size={16} />
        添加考试
      </button>
    ) : null}
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="block text-xs font-semibold text-on-surface-variant">
    {children}
  </label>
);

const inputClassName =
  "mt-1 w-full rounded-2xl border border-outline-variant bg-surface-low px-3.5 py-2.5 text-sm font-medium text-on-surface outline-none transition-shadow focus:ring-2 focus:ring-primary/30";

const ExamEditorSheet = ({ editor, onSave, onClose }) => {
  const isOpen = Boolean(editor);
  const [form, setForm] = useState(EMPTY_EXAM_FORM);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!editor) return;
    setForm(editor.exam ? examToFormValues(editor.exam) : EMPTY_EXAM_FORM);
    setErrors([]);
  }, [editor]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = buildExamFromForm(form, {
      id: editor.exam?.id
    });
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    onSave?.(result.exam);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 px-0 sm:items-center sm:px-4"
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full overflow-hidden rounded-t-[28px] bg-surface-primary shadow-elevated sm:max-w-md sm:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 bg-surface-elevated px-4 py-3">
          <h2 className="text-base font-extrabold text-on-surface">
            {editor.exam ? "编辑考试" : "添加考试"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-pill text-on-surface-variant transition-colors hover:bg-surface-mid"
            aria-label="关闭"
            title="关闭"
          >
            <X size={19} />
          </button>
        </div>

        <div className="max-h-[calc(90vh-132px)] space-y-3 overflow-y-auto px-4 py-4">
          {errors.length > 0 ? (
            <div className="space-y-1 rounded-2xl bg-error-container px-3 py-2 text-xs font-semibold text-error-on-container">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}

          <div>
            <FieldLabel>考试名称</FieldLabel>
            <input
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className={inputClassName}
              placeholder="输入考试名称"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>日期</FieldLabel>
              <input
                type="date"
                value={form.date}
                onChange={(event) => updateField("date", event.target.value)}
                className={inputClassName}
              />
            </div>
            <div>
              <FieldLabel>开始时间</FieldLabel>
              <input
                type="time"
                value={form.time}
                onChange={(event) => updateField("time", event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <FieldLabel>地点</FieldLabel>
            <input
              type="text"
              value={form.location}
              onChange={(event) => updateField("location", event.target.value)}
              className={inputClassName}
              placeholder="输入地点"
            />
          </div>

          <div>
            <FieldLabel>座位号</FieldLabel>
            <input
              type="text"
              value={form.seatNumber}
              onChange={(event) => updateField("seatNumber", event.target.value)}
              className={inputClassName}
              placeholder="输入座位号"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>形式</FieldLabel>
              <select
                value={form.method}
                onChange={(event) => updateField("method", event.target.value)}
                className={inputClassName}
              >
                {EXAM_METHOD_OPTIONS.map((method) => (
                  <option key={method || "blank"} value={method}>
                    {method || "空白"}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>时长</FieldLabel>
              <input
                type="number"
                min="1"
                inputMode="numeric"
                value={form.durationMinutes}
                onChange={(event) =>
                  updateField("durationMinutes", event.target.value)
                }
                className={inputClassName}
                placeholder="分钟"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 bg-surface-elevated px-4 py-3 pb-[max(12px,var(--safe-bottom))]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-pill px-4 py-2 text-sm font-bold text-primary"
          >
            取消
          </button>
          <button
            type="submit"
            className="rounded-pill bg-primary px-5 py-2 text-sm font-bold text-on-primary"
          >
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

const ExamPage = ({ currentWeek, now }) => {
  const [segment, setSegment] = useState(DEFAULT_EXAM_SEGMENT);
  const [exams, setExams] = useState([]);
  const [editor, setEditor] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const summary = useMemo(() => buildExamSummary(exams, now), [exams, now]);
  const visibleExams = useMemo(
    () => filterExamsBySegment(exams, segment, now),
    [exams, segment, now]
  );
  const nextExam = summary.nextExam;
  const hasExams = exams.length > 0;

  useEffect(() => {
    let cancelled = false;

    const loadExams = async () => {
      try {
        const raw = await storage.getItem(STORAGE_KEYS.USER_EXAMS);
        const next = parseStoredExams(raw);
        if (cancelled) return;
        setExams(next);
        setStorageError("");
      } catch (error) {
        console.error("读取考试数据失败:", error);
        if (!cancelled) {
          setStorageError("考试数据读取失败，请检查本地存储");
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    };

    loadExams();

    return () => {
      cancelled = true;
    };
  }, []);

  const persistExams = (next) => {
    setExams(next);
    setStorageError("");
    void storage.setItem(STORAGE_KEYS.USER_EXAMS, stringifyExams(next));
  };

  const handleOpenAdd = () => {
    setEditor({ exam: null });
  };

  const handleOpenEdit = (exam) => {
    setEditor({ exam });
  };

  const handleSaveExam = (exam) => {
    persistExams(upsertExam(exams, exam));
    setEditor(null);
  };

  const handleDeleteExam = (exam) => {
    if (!window.confirm(`确认删除“${exam.name}”？`)) return;
    persistExams(deleteExam(exams, exam.id));
  };

  return (
    <section className="min-h-screen bg-surface-low pb-24">
      <header className="px-4 pb-1 pt-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-extrabold leading-tight text-on-surface">
              考试
            </h1>
            <p className="mt-0.5 text-xs font-medium text-on-surface-variant">
              第{currentWeek}周 · {summary.pendingCount}场待完成
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[20px] border px-3 text-sm font-bold"
            style={{
              backgroundColor: "var(--surface-primary)",
              borderColor: "var(--outline-variant)",
              color: "var(--primary)"
            }}
          >
            <Plus size={18} />
            添加
          </button>
        </div>
      </header>

      <main className="space-y-3">
        {storageError ? (
          <div className="px-4">
            <div className="rounded-2xl bg-error-container px-3 py-2 text-xs font-semibold text-error-on-container">
              {storageError}
            </div>
          </div>
        ) : null}

        <div className="px-4">
          {nextExam ? (
            <section
              className="rounded-[26px] p-[18px] text-primary-on-primary"
              style={{
                backgroundColor: "var(--primary)",
                boxShadow: "0 8px 18px rgba(103, 80, 164, 0.15)"
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[13px] font-bold">下一场考试</span>
                <span className="rounded-pill bg-white/15 px-2.5 py-1 text-xs font-bold">
                  {getExamCountdownLabel(nextExam, now)}
                </span>
              </div>
              <h2 className="mt-3 truncate text-[22px] font-extrabold">
                {nextExam.name}
              </h2>
              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/85">
                <AlarmClock size={15} />
                <span className="min-w-0 flex-1 truncate">
                  {formatExamDateTime(nextExam.startsAt)} · {nextExam.location}
                </span>
              </div>
            </section>
          ) : (
            <EmptyState
              title={
                isLoaded
                  ? hasExams
                    ? "暂无待考试"
                    : "暂无考试安排"
                  : "正在读取考试"
              }
              onAdd={handleOpenAdd}
              showAction={isLoaded && !hasExams}
            />
          )}
        </div>

        <div className="flex gap-2 px-4">
          <ExamMetric label="待考试" value={summary.pendingCount} />
          <ExamMetric label="两周内" value={summary.withinTwoWeeksCount} emphasized />
          <ExamMetric label="已完成" value={summary.completedCount} />
        </div>

        <div className="flex gap-1.5 px-4">
          {SEGMENT_OPTIONS.map((item) => {
            const isActive = segment === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setSegment(item.value)}
                className="h-[38px] flex-1 rounded-2xl border text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: isActive
                    ? "var(--primary-container)"
                    : "var(--surface-primary)",
                  borderColor: "var(--outline-variant)",
                  color: isActive
                    ? "var(--on-primary-container)"
                    : "var(--foreground-primary)"
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <section className="space-y-2.5 px-3 pt-1">
          <div className="flex items-center justify-between px-1 py-1">
            <h2 className="text-sm font-bold text-on-surface">考试时间线</h2>
            <span className="text-xs font-medium text-on-surface-variant">
              {visibleExams.length}场
            </span>
          </div>
          {visibleExams.length > 0 ? (
            visibleExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam}
                now={now}
                isNext={summary.nextExam?.id === exam.id}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteExam}
              />
            ))
          ) : (
            <EmptyState
              title={
                isLoaded
                  ? hasExams
                    ? "当前筛选暂无考试"
                    : "暂无考试安排"
                  : "正在读取考试"
              }
              onAdd={handleOpenAdd}
              showAction={isLoaded && !hasExams}
            />
          )}
        </section>
      </main>

      <ExamEditorSheet
        editor={editor}
        onSave={handleSaveExam}
        onClose={() => setEditor(null)}
      />
    </section>
  );
};

export default ExamPage;
