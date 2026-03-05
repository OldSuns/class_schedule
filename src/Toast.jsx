import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const Toast = ({ message, isOpen, duration = 4500, onClose }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  return (
    <AnimatePresence>
      {isOpen && message && (
        <div
          className="fixed left-1/2 bottom-12 z-50 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="max-w-[80vw] rounded-full bg-black/40 text-white px-3 py-1.5 text-xs shadow-lg backdrop-blur">
              {message}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
