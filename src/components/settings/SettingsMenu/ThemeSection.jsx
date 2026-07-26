import { THEMES } from "../../../config/constants";

const ThemeSection = ({ theme, onThemeChange }) => (
  <div
    className="space-y-2 rounded-[18px] border p-4"
    style={{
      backgroundColor: "var(--surface-primary)",
      borderColor: "var(--outline-variant)"
    }}
  >
    <div className="flex items-center justify-between">
      <label className="text-sm font-semibold"
             style={{ color: "var(--foreground-primary)" }}>
        主题
      </label>
      <div className="flex gap-2">
        <button
          onClick={() => onThemeChange?.(THEMES.M3)}
          className="rounded-xl text-xs font-normal transition-colors"
          style={
            theme === THEMES.M3
              ? { backgroundColor: "var(--primary)", color: "var(--on-primary)", padding: "8px 16px" }
              : { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)", padding: "8px 16px" }
          }
        >
          M3
        </button>
        <button
          onClick={() => onThemeChange?.(THEMES.MINIMAL)}
          className="rounded-xl text-xs font-normal transition-colors"
          style={
            theme === THEMES.MINIMAL
              ? { backgroundColor: "var(--primary)", color: "var(--on-primary)", padding: "8px 16px" }
              : { backgroundColor: "var(--secondary-container)", color: "var(--on-secondary-container)", padding: "8px 16px" }
          }
        >
          简约蓝
        </button>
      </div>
    </div>
    <p className="text-xs leading-relaxed"
       style={{ color: "var(--foreground-secondary)" }}>
      切换应用的主题样式。
    </p>
  </div>
);

export default ThemeSection;
