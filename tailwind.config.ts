import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#01696f',
          hover: '#01565b',
        },
        error: '#dc2626',
        warning: '#d97706',
        success: '#16a34a',
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f8fafc',
        },
      },
      spacing: {
        base: '4px',
      },
      borderRadius: {
        card: '8px',
        chip: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
