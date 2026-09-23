import { DISPLAY_MODES } from "../../../config/constants";

const DisplayModeSection = ({ displayMode, onDisplayModeChange }) => (
  <div
    className="space-y-2 rounded-[18px] border p-4"
    style={{
      backgroundColor: "var(--surface-primary)",
      borderColor: "var(--outline-variant)"
    }}
  >
    <label className="block text-sm font-semibold"
           style={{ color: "var(--foreground-primary)" }}>
      显示模式
    </label>
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => onDisplayModeChange?.(DISPLAY_MODES.CURRENT_ONLY)}
        className="py-2 rounded-xl text-sm font-semibold transition-colors"
        style={
          displayMode === DISPLAY_MODES.CURRENT_ONLY
            ? { backgroundColor: "var(--primary)", color: "var(--on-primary)" }
            : { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)" }
        }
      >
        仅本周
      </button>
      <button
        onClick={() => onDisplayModeChange?.(DISPLAY_MODES.ALL)}
        className="py-2 rounded-xl text-sm font-semibold transition-colors"
        style={
          displayMode === DISPLAY_MODES.ALL
            ? { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)" }
            : { backgroundColor: "var(--surface-elevated)", color: "var(--foreground-primary)" }
        }
      >
        显示全部
      </button>
    </div>
    <p className="text-xs leading-relaxed"
       style={{ color: "var(--foreground-secondary)" }}>
      显示全部时，非本周课程将以灰色显示。
    </p>
  </div>
);

export default DisplayModeSection;
