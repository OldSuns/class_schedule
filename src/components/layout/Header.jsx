const GROUP_OPTIONS = Array.from({ length: 7 }, (_, index) => `${index + 1}组`);

const Header = ({ todayInfo, userGroup = "1组", onGroupChange }) => {
  const statusText = todayInfo
    ? `今天是第${todayInfo.week}周 星期${["一", "二", "三", "四", "五"][todayInfo.dayOfWeek - 1]}`
    : "暑期社会实践课表";

  return (
    <header className="mb-3 flex items-start justify-between px-1 pt-1">
      <div className="min-w-0">
        <h1 className="truncate text-[15px] font-semibold leading-tight text-on-surface">
          WL课表（2026暑期）
        </h1>
        <p className="mt-1 text-[10px] font-medium leading-tight text-on-surface-variant">
          {statusText}
        </p>
      </div>
      <select
        aria-label="选择分组"
        value={userGroup}
        onChange={(event) => onGroupChange?.(event.target.value)}
        className="h-8 rounded-full border-0 px-3 text-center text-sm font-bold text-white outline-none"
        style={{ backgroundColor: "var(--primary)" }}
      >
        {GROUP_OPTIONS.map((group) => (
          <option key={group} value={group}>
            {group}
          </option>
        ))}
      </select>
    </header>
  );
};

export default Header;
