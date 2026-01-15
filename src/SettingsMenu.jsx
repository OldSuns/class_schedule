import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { MIN_WEEK, MAX_WEEK } from "./constants";

/**
 * 设置菜单组件 - 包含开学日期和周数选择
 */
const SettingsMenu = ({
  isOpen,
  onClose,
  semesterStartDate,
  onStartDateChange,
  todayInfo,
  currentWeek,
  onWeekChange,
  onPreviousWeek,
  onNextWeek,
  onToggleWeekSelector
}) => {
  const handleWeekInputChange = (e) => {
    onWeekChange(e.target.value);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* 菜单面板 */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 sm:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
          >
            {/* 菜单头部 */}
            <div className="sticky top-0 bg-indigo-600 text-white p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">设置</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-indigo-700 rounded-lg transition-colors"
                title="关闭"
              >
                <X size={24} />
              </button>
            </div>

            {/* 菜单内容 */}
            <div className="p-6 space-y-8">
              {/* 开学日期设置 */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-indigo-900">
                  开学日期
                </label>
                <input
                  type="date"
                  value={semesterStartDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  lang="zh-CN"
                  placeholder="选择开学日期"
                  className="w-full px-4 py-3 border-2 border-indigo-300 rounded-lg text-base font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
                  style={{
                    colorScheme: 'light'
                  }}
                />
                {todayInfo && (
                  <div className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-lg">
                    今天是第{todayInfo.week}周 星期{["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}
                  </div>
                )}
                {!todayInfo && semesterStartDate && (
                  <div className="text-sm text-gray-500 font-medium bg-gray-50 p-3 rounded-lg">
                    今天不在上课时间
                  </div>
                )}
              </div>

              {/* 周数选择 */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-indigo-900">
                  当前周数
                </label>
                <div className="flex items-center gap-3">
                  {/* 上一周按钮 */}
                  <button
                    onClick={onPreviousWeek}
                    disabled={currentWeek === MIN_WEEK}
                    className={`p-3 rounded-lg transition-colors ${
                      currentWeek === MIN_WEEK
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                    title="上一周"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {/* 周数输入框 */}
                  <input
                    type="number"
                    min={MIN_WEEK}
                    max={MAX_WEEK}
                    value={currentWeek}
                    onChange={handleWeekInputChange}
                    className="flex-1 px-4 py-3 border-2 border-indigo-300 rounded-lg text-lg font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />

                  {/* 下一周按钮 */}
                  <button
                    onClick={onNextWeek}
                    disabled={currentWeek === MAX_WEEK}
                    className={`p-3 rounded-lg transition-colors ${
                      currentWeek === MAX_WEEK
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    }`}
                    title="下一周"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* 快速选择按钮 */}
                <button
                  onClick={() => {
                    onToggleWeekSelector();
                    onClose();
                  }}
                  className="w-full px-4 py-3 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  快速选择周数
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
