/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./App.jsx", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Material You (M3) color tokens — seed #6750A4
      colors: {
        // Primary tonal palette
        primary: {
          DEFAULT: "#6750A4",
          dark: "#4F378B",
          light: "#7965AF",
          container: "#EADDFF",
          "on-container": "#21005D",
          "on-primary": "#FFFFFF",
        },
        // Secondary
        secondary: {
          DEFAULT: "#625B71",
          container: "#E8DEF8",
          "on-container": "#1D192B",
          "on-secondary": "#FFFFFF",
        },
        // Tertiary
        tertiary: {
          DEFAULT: "#7D5260",
          container: "#FFD8E4",
          "on-container": "#31111D",
        },
        // Surface hierarchy (tonal)
        surface: {
          DEFAULT: "#FFFBFE",     // App background — warm near-white
          dim: "#DED8E1",
          bright: "#FFFBFE",
          low: "#F7F2FA",         // Surface Container Low
          mid: "#F3EDF7",         // Surface Container (cards)
          high: "#ECE6F0",        // Surface Container High
          highest: "#E6E0E9",     // Surface Container Highest
        },
        // Utility
        outline: {
          DEFAULT: "#79747E",
          variant: "#CAC4D0",
        },
        // Semantic
        error: {
          DEFAULT: "#B3261E",
          container: "#F9DEDC",
          "on-container": "#410E0B",
        },
        // On-surface text/icon
        "on-surface": {
          DEFAULT: "#1C1B1F",
          variant: "#49454F",
        },
        // Inverse
        "inverse-surface": "#313033",
        "inverse-on-surface": "#F4EFF4",
        "inverse-primary": "#D0BCFF",
        // State layers (used via opacity utilities)
        "state-primary": "#6750A4",
      },
      borderRadius: {
        // M3 shape scale
        "pill": "9999px",
        "xl2": "20px",
        "xl3": "28px",
        "xl4": "32px",
      },
      boxShadow: {
        // M3 elevation tones (warm tinted shadows)
        "elev1": "0 1px 2px 0 rgba(103,80,164,0.10), 0 1px 3px 1px rgba(103,80,164,0.08)",
        "elev2": "0 1px 2px 0 rgba(103,80,164,0.12), 0 2px 6px 2px rgba(103,80,164,0.10)",
        "elev3": "0 4px 8px 3px rgba(103,80,164,0.10), 0 1px 3px 0 rgba(103,80,164,0.12)",
      },
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont",
          "\"PingFang SC\"", "\"Hiragino Sans GB\"",
          "\"Microsoft YaHei\"", "sans-serif"
        ],
      },
      transitionTimingFunction: {
        // M3 standard easing
        "m3-standard": "cubic-bezier(0.2, 0, 0, 1)",
        "m3-decel": "cubic-bezier(0, 0, 0, 1)",
        "m3-accel": "cubic-bezier(0.3, 0, 1, 1)",
      },
      transitionDuration: {
        "200": "200ms",
        "300": "300ms",
        "400": "400ms",
      },
    },
  },
  plugins: [],
};
