import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { MIN_WEEK, MAX_WEEK } from "./constants";

/**
 * 设置菜单组件 - 包含开学日期设置和快速周数选择
 */
const SettingsMenu = ({
  isOpen,
  onClose,
  semesterStartDate,
  onStartDateChange,
  todayInfo,
  currentWeek,
  onSelectWeek
}) => {
  const [showWeekSelector, setShowWeekSelector] = useState(false);
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
            className="fixed left-0 top-0 bottom-0 w-72 sm:w-80 bg-white/20 backdrop-blur-md shadow-2xl z-50 overflow-y-auto"
          >
            {/* 菜单头部 */}
            <div className="sticky top-0 bg-indigo-600/15 backdrop-blur-sm text-white p-4 flex justify-between items-center">
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

              {/* 快速周数选择 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowWeekSelector(!showWeekSelector)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-indigo-600 text-white text-base font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <span>快速选择周数</span>
                  {showWeekSelector ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {/* 周数选择器网格 */}
                <AnimatePresence>
                  {showWeekSelector && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 sm:p-4 border-2 border-indigo-300">
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                          {Array.from({ length: MAX_WEEK - MIN_WEEK + 1 }, (_, i) => i + MIN_WEEK).map((week) => (
                            <button
                              key={week}
                              onClick={() => {
                                onSelectWeek(week);
                                setShowWeekSelector(false);
                              }}
                              className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-md sm:rounded-lg font-bold text-xs sm:text-sm transition-all ${
                                week === currentWeek
                                  ? "bg-indigo-600 text-white shadow-lg scale-105"
                                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:scale-105"
                              }`}
                            >
                              <span className="hidden sm:inline">{week}</span>
                              <span className="inline sm:hidden">{week}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsMenu;
