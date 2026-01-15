import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Calendar } from "lucide-react";
import { getPeriodRangeLabel } from "./timeUtils";
import { DAY_NAMES } from "./constants";

/**
 * 课程详情模态框组件
 */
const CourseModal = ({ isOpen, selectedCell, onClose }) => {
  if (!selectedCell) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-indigo-600 p-3 sm:p-4 flex justify-between items-center">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
                <Clock className="flex-shrink-0" size={20} color="white" />
                <h2 className="text-base sm:text-xl font-bold text-white truncate">
                  {DAY_NAMES[selectedCell.day].zh} · {getPeriodRangeLabel(selectedCell.periodStart, selectedCell.periodEnd)}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-indigo-200 transition-colors flex-shrink-0 ml-2"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-140px)] sm:max-h-[70vh]">
              {selectedCell.courses.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <Calendar className="mx-auto mb-3 sm:mb-4 text-gray-400" size={40} />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">本节无课程安排</h3>
                  <p className="text-sm sm:text-base text-gray-500">该时间段没有安排课程</p>
                </div>
              ) : (
                selectedCell.courses.map((course, index) => (
                  <div
                    key={index}
                    className={`mb-3 sm:mb-6 p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 ${
                      course.isCurrentWeek
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-base sm:text-lg font-bold ${
                          course.isCurrentWeek ? "text-blue-700" : "text-gray-700"
                        }`}>
                          {course.name}
                        </h3>
                        {course.group && (
                          <p className="text-sm sm:text-base text-indigo-600 font-medium mt-1">{course.group}</p>
                        )}
                      </div>
                      {course.isCurrentWeek && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded flex-shrink-0">
                          本周课程
                        </span>
                      )}
                    </div>

                    <div className="mt-2 sm:mt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">上课周次</p>
                      <p className="text-sm sm:text-base font-medium mt-1 break-words">
                        {course.weeks.join("、")}周
                      </p>
                    </div>

                    <div className="mt-2 sm:mt-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">学时/备注</p>
                      <p className="text-sm sm:text-base font-medium mt-1 break-words">{course.note}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CourseModal;
