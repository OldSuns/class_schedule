import { DISPLAY_MODES } from "../../../config/constants";

const DisplayModeSection = ({ displayMode, onDisplayModeChange }) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold" style={{ color: "#1C1B1F" }}>
      显示模式
    </label>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onDisplayModeChange?.(DISPLAY_MODES.ALL)}
        className="py-2 rounded-xl text-sm font-semibold transition-colors"
        style={
          displayMode === DISPLAY_MODES.ALL
            ? { backgroundColor: "#6750A4", color: "#FFFFFF" }
            : { backgroundColor: "#E8DEF8", color: "#1D192B" }
        }
      >
        显示全部
      </button>
      <button
        onClick={() => onDisplayModeChange?.(DISPLAY_MODES.CURRENT_ONLY)}
        className="py-2 rounded-xl text-sm font-semibold transition-colors"
        style={
          displayMode === DISPLAY_MODES.CURRENT_ONLY
            ? { backgroundColor: "#6750A4", color: "#FFFFFF" }
            : { backgroundColor: "#E8DEF8", color: "#1D192B" }
        }
      >
        仅本周
      </button>
    </div>
    <p className="text-xs" style={{ color: "#49454F" }}>
      显示全部时，非本周课程将以灰色显示。
    </p>
  </div>
);

export default DisplayModeSection;
