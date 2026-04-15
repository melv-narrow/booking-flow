import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["DM Sans", "system-ui", "sans-serif"],
        mono: ["DM Mono", "'Courier New'", "monospace"],
      },
      colors: {
        background: "var(--color-surface-muted)",
        foreground: "var(--color-text-primary)",
        primary: {
          DEFAULT: "#01696f",
          hover: "#01565b",
          light: "#e6f3f4",
        },
        error: "#dc2626",
        warning: "#d97706",
        success: "#16a34a",
        surface: {
          DEFAULT: "#ffffff",
          muted: "#f8fafc",
        },
        border: "#e2e8f0",
        text: {
          primary: "#0f172a",
          secondary: "#475569",
          muted: "#94a3b8",
        },
      },
      spacing: {
        // 4px base scale already in Tailwind's default — extend with named aliases
        base: "4px",
      },
      borderRadius: {
        card: "8px",
        chip: "4px",
        btn: "6px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
        "card-md": "0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.06)",
        focus: "0 0 0 3px rgba(1, 105, 111, 0.3)",
      },
      transitionDuration: {
        fast: "100ms",
        base: "180ms",
        slow: "300ms",
      },
    },
  },
  plugins: [],
};

export default config;
