import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MIN_WEEK, MAX_WEEK } from "./constants";

/**
 * 页面头部组件 - 包含标题、开学日期选择和周数选择
 */
const Header = ({
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
    <div className="text-center mb-3 sm:mb-6 md:mb-8">
      <h1 className="hidden sm:block text-base sm:text-xl md:text-3xl lg:text-4xl font-bold text-indigo-900 mb-1 sm:mb-2 px-2 leading-tight">
        第五临床医学院 临床医学 2023级 6班课表
      </h1>
      {/* 移动端顶部间距 */}
      <div className="sm:hidden mb-4"></div>

      {/* 开学日期输入 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <label className="font-medium text-sm sm:text-base md:text-lg text-indigo-800">开学日期:</label>
        <div className="relative">
          <input
            type="date"
            value={semesterStartDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            lang="zh-CN"
            placeholder="选择开学日期"
            className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 border-2 border-indigo-300 rounded-md sm:rounded-lg text-sm sm:text-base md:text-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
            style={{
              colorScheme: 'light',
              minWidth: '150px'
            }}
          />
        </div>
        {todayInfo && (
          <span className="text-xs sm:text-sm md:text-base text-green-600 font-medium">
            今天是第{todayInfo.week}周 星期{["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}
          </span>
        )}
        {!todayInfo && semesterStartDate && (
          <span className="text-xs sm:text-sm md:text-base text-gray-500 font-medium">
            今天不在上课时间
          </span>
        )}
      </div>

      {/* 周数选择 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-4">
        <label className="font-medium text-sm sm:text-base md:text-lg text-indigo-800">当前周数:</label>
        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
          {/* 上一周按钮 */}
          <button
            onClick={onPreviousWeek}
            disabled={currentWeek === MIN_WEEK}
            className={`p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg transition-colors ${
              currentWeek === MIN_WEEK
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
            title="上一周"
          >
            <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
          </button>

          {/* 周数输入框 */}
          <input
            type="number"
            min={MIN_WEEK}
            max={MAX_WEEK}
            value={currentWeek}
            onChange={handleWeekInputChange}
            className="w-14 sm:w-16 md:w-20 px-1.5 sm:px-2 md:px-3 py-1 sm:py-1.5 md:py-2 border-2 border-indigo-300 rounded-md sm:rounded-lg text-sm sm:text-base md:text-lg font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />

          {/* 下一周按钮 */}
          <button
            onClick={onNextWeek}
            disabled={currentWeek === MAX_WEEK}
            className={`p-1 sm:p-1.5 md:p-2 rounded-md sm:rounded-lg transition-colors ${
              currentWeek === MAX_WEEK
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
            }`}
            title="下一周"
          >
            <ChevronRight size={16} className="sm:w-5 sm:h-5" />
          </button>

          {/* 快速选择按钮 */}
          <button
            onClick={onToggleWeekSelector}
            className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-indigo-600 text-white text-xs sm:text-sm md:text-base font-medium rounded-md sm:rounded-lg hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            快速选择
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
