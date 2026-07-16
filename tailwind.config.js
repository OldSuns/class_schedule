/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // 使用CSS变量支持主题切换
      colors: {
        // Primary tonal palette
        primary: {
          DEFAULT: "var(--primary)",
          container: "var(--primary-container)",
          "on-container": "var(--on-primary-container)",
          "on-primary": "var(--on-primary)",
        },
        // Secondary
        secondary: {
          DEFAULT: "var(--secondary)",
          container: "var(--secondary-container)",
          "on-container": "var(--on-secondary-container)",
        },
        // Surface hierarchy
        surface: {
          DEFAULT: "var(--surface)",
          primary: "var(--surface-primary)",
          elevated: "var(--surface-elevated)",
          low: "var(--surface-low)",
          mid: "var(--surface-mid)",
          high: "var(--surface-high)",
          highest: "var(--surface-highest)",
        },
        // Foreground
        foreground: {
          primary: "var(--foreground-primary)",
          secondary: "var(--foreground-secondary)",
        },
        // Utility
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        // Semantic
        error: {
          DEFAULT: "var(--error)",
          container: "var(--error-container)",
          "on-container": "var(--on-error-container)",
        },
        // On-surface text/icon
        "on-surface": {
          DEFAULT: "var(--on-surface)",
          variant: "var(--on-surface-variant)",
        },
      },
      borderRadius: {
        "pill": "9999px",
      },
      boxShadow: {
        "elev2": "0 1px 2px 0 rgba(103,80,164,0.05), 0 2px 4px 0 rgba(103,80,164,0.03)",
        "elevated": "0 2px 6px -2px rgba(0,0,0,0.04), 0 1px 3px -1px rgba(0,0,0,0.02)",
      },
      fontFamily: {
        sans: [
          "\"Noto Sans SC\"",
          "-apple-system", "BlinkMacSystemFont",
          "\"PingFang SC\"", "\"Hiragino Sans GB\"",
          "\"Microsoft YaHei\"", "sans-serif"
        ],
      },
      borderColor: {
        // Apple minimalist border tones — near-invisible
        "soft": "rgba(0,0,0,0.04)",
        "softer": "rgba(0,0,0,0.02)",
      },
      transitionTimingFunction: {
        "m3-standard": "cubic-bezier(0.2, 0, 0, 1)",
      },
    },
  },
};
