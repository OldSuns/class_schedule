import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MIN_WEEK, MAX_WEEK } from "./constants";

/**
 * 周数快速选择器组件
 */
const WeekSelector = ({ show, currentWeek, onSelectWeek, onClose }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-3 sm:mt-4 overflow-hidden"
        >
          <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 max-w-2xl mx-auto border-2 border-indigo-200">
            <div className="flex justify-between items-center mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-indigo-900">选择周数</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 sm:gap-2">
              {Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => i + MIN_WEEK).map((week) => (
                <button
                  key={week}
                  onClick={() => onSelectWeek(week)}
                  className={`py-1.5 sm:py-2 md:py-3 px-2 sm:px-3 md:px-4 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm md:text-base transition-all ${
                    week === currentWeek
                      ? "bg-indigo-600 text-white shadow-lg scale-105"
                      : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105"
                  }`}
                >
                  <span className="hidden sm:inline">第{week}周</span>
                  <span className="inline sm:hidden">{week}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WeekSelector;
