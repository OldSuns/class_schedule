import { AnimatePresence, motion } from "framer-motion";
import { Download, Sparkles, X } from "lucide-react";

const AppUpdateDialog = ({
  isOpen,
  version,
  notes,
  onLater,
  onUpdate
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        role="presentation"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onLater?.();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") onLater?.();
        }}
      >
        <motion.section
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-update-title"
          className="w-full max-w-[390px] overflow-hidden rounded-[28px] border border-outline-variant bg-surface-primary shadow-2xl"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="flex items-start justify-between gap-4 bg-primary-container px-5 py-5">
            <div className="flex min-w-0 items-start gap-3">
              <span className="rounded-2xl bg-primary p-2.5 text-primary-on-primary">
                <Sparkles size={20} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-on-surface-variant">发现新版本</p>
                <h2 id="app-update-title" className="mt-1 text-xl font-extrabold text-primary-on-container">
                  v{version || "最新版本"}
                </h2>
              </div>
            </div>
            <button
              type="button"
              aria-label="稍后更新"
              onClick={onLater}
              className="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-high"
            >
              <X size={20} />
            </button>
          </header>

          <div className="px-5 py-5">
            <p className="text-xs font-semibold text-on-surface-variant">本次更新</p>
            <div className="mt-2 max-h-52 overflow-y-auto whitespace-pre-wrap rounded-2xl bg-surface-elevated px-4 py-3 text-sm leading-6 text-on-surface">
              {notes || "新版本已发布，建议更新后继续使用。"}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onLater}
                className="rounded-full bg-secondary-container px-4 py-3 text-sm font-bold text-on-secondary-container"
              >
                稍后
              </button>
              <button
                type="button"
                onClick={onUpdate}
                autoFocus
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-bold text-primary-on-primary"
              >
                <Download size={17} aria-hidden="true" />
                立即更新
              </button>
            </div>
          </div>
        </motion.section>
      </motion.div>
    )}
  </AnimatePresence>
);

export default AppUpdateDialog;
