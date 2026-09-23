import { motion, AnimatePresence } from "framer-motion";

const RemoteUpdateConfirmDialog = ({ isOpen, onCancel, onConfirm }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm rounded-3xl p-5 shadow-elev2 bg-surface"
        >
          <div className="text-base font-semibold text-on-surface">
            检测到远端课表更新
          </div>
          <div className="mt-2 text-sm text-on-surface-variant">
            是否应用远端课表更新？当前课表将被替换。
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors bg-secondary-container text-secondary-on-container"
            >
              暂不更新
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              style={{ backgroundColor: "#6750A4", color: "#FFFFFF" }}
            >
              应用更新
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default RemoteUpdateConfirmDialog;
