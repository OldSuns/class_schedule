import React from "react";
import { Menu, ChevronLeft, ChevronRight } from "lucide-react";
import { MIN_WEEK, MAX_WEEK } from "./constants";

/**
 * 页面头部组件 - 包含标题和菜单按钮
 */
const Header = ({
  todayInfo,
  currentWeek,
  currentClassProgress,
  onOpenMenu,
  onWeekChange,
  onPreviousWeek,
  onNextWeek
}) => {
  const handleWeekInputChange = (e) => {
    onWeekChange(e.target.value);
  };

  return (
    <div className="text-center mb-3 sm:mb-6 md:mb-8">
      {/* 移动端顶部间距 */}
      <div className="sm:hidden mb-4"></div>

      {/* 标题和菜单按钮 */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
        {/* 菜单按钮 */}
        <button
          onClick={onOpenMenu}
          className="p-2 sm:p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          title="打开设置菜单"
        >
          <Menu size={20} className="sm:w-6 sm:h-6" />
        </button>

        {/* 标题 */}
        {currentClassProgress ? (
          <div className="flex-1 px-2 text-left">
            <div className="text-[11px] sm:text-sm md:text-base font-semibold text-indigo-900 truncate">
              {currentClassProgress.periodLabel} · {currentClassProgress.courseLabel}
            </div>
            <div className="mt-1 h-2.5 sm:h-3 bg-indigo-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-[width] duration-500"
                style={{ width: `${currentClassProgress.percent}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] sm:text-xs md:text-sm text-indigo-700">
              已过 {currentClassProgress.elapsedMinutes} 分钟 · {currentClassProgress.percent}% · 还剩{" "}
              {currentClassProgress.remainingMinutes} 分钟
            </div>
          </div>
        ) : (
          <h1 className="flex-1 text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold text-indigo-900 px-2 leading-tight">
            五临 2023级6班7班课表（2026-1）
          </h1>
        )}

        {/* 占位元素保持标题居中 */}
        <div className="w-10 sm:w-14"></div>
      </div>

      {/* 周数选择器 */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 px-2">
        {/* 上一周按钮 */}
        <button
          onClick={onPreviousWeek}
          disabled={currentWeek === MIN_WEEK}
          className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
            currentWeek === MIN_WEEK
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
          title="上一周"
        >
          <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
        </button>

        {/* 周数输入框 */}
        <input
          type="number"
          min={MIN_WEEK}
          max={MAX_WEEK}
          value={currentWeek}
          onChange={handleWeekInputChange}
          className="w-16 sm:w-20 px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-indigo-300 rounded-lg text-base sm:text-lg font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />

        {/* 下一周按钮 */}
        <button
          onClick={onNextWeek}
          disabled={currentWeek === MAX_WEEK}
          className={`p-2 sm:p-2.5 rounded-lg transition-colors ${
            currentWeek === MAX_WEEK
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
          }`}
          title="下一周"
        >
          <ChevronRight size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* 当前状态显示 */}
      {todayInfo && (
        <div className="flex justify-center items-center text-xs sm:text-sm md:text-base">
          <span className="text-green-600 font-medium">
            今天是第{todayInfo.week}周 星期{["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}
          </span>
        </div>
      )}
    </div>
  );
};

export default Header;
