import React from "react";
import { Menu } from "lucide-react";

/**
 * 页面头部组件 - 包含标题和菜单按钮
 */
const Header = ({ todayInfo, currentWeek, onOpenMenu }) => {
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
        <h1 className="flex-1 text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold text-indigo-900 px-2 leading-tight">
          第五临床医学院 临床医学 2023级 6班课表
        </h1>

        {/* 占位元素保持标题居中 */}
        <div className="w-10 sm:w-14"></div>
      </div>

      {/* 当前状态显示 */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-2 text-xs sm:text-sm md:text-base">
        <span className="font-medium text-indigo-800">
          第 {currentWeek} 周
        </span>
        {todayInfo && (
          <span className="text-green-600 font-medium">
            · 今天是第{todayInfo.week}周 星期{["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}
          </span>
        )}
      </div>
    </div>
  );
};

export default Header;
