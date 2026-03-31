import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { MAX_WEEK, MIN_WEEK } from "../../../config/constants";

const QuickWeekSection = ({
  showWeekSelector,
  onToggle,
  currentWeek,
  onSelectWeek
}) => (
  <div className="space-y-2">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors"
      style={{ backgroundColor: "#E8DEF8", color: "#1D192B" }}
    >
      <span>快速选择周数</span>
      {showWeekSelector ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
    </button>

    <AnimatePresence>
      {showWeekSelector && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div
            className="rounded-2xl p-3"
            style={{ backgroundColor: "#F3EDF7", border: "1px solid #CAC4D0" }}
          >
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
              {Array.from(
                { length: MAX_WEEK - MIN_WEEK + 1 },
                (_, i) => i + MIN_WEEK
              ).map((week) => (
                <button
                  key={week}
                  onClick={() => onSelectWeek(week)}
                  className="py-1.5 px-2 rounded-lg font-bold text-xs transition-colors"
                  style={
                    week === currentWeek
                      ? { backgroundColor: "#6750A4", color: "#FFFFFF" }
                      : { backgroundColor: "#ECE6F0", color: "#49454F" }
                  }
                >
                  {week}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default QuickWeekSection;
