import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

// M3 Snackbar-style toast: pill shape, inverse surface background
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
          className="fixed left-1/2 bottom-14 z-50 -translate-x-1/2"
          role="status"
          aria-live="polite"
        >
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
          >
            {/* inverse-surface + inverse-on-surface = M3 Snackbar */}
            <div className="max-w-[80vw] rounded-pill bg-[#313033] text-[#F4EFF4] px-4 py-2 text-xs font-medium shadow-elev3 select-none">
              {message}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
