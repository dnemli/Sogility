import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f3f5ee",
        ink: "#10211d",
        panel: "#f7f8f2",
        line: "#d8ded1",
        pitch: {
          50: "#effbf4",
          100: "#d7f3e1",
          500: "#1d8f5a",
          700: "#176b44",
        },
      },
      boxShadow: {
        panel: "0 24px 80px rgba(16, 33, 29, 0.08)",
      },
      fontFamily: {
        sans: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
        display: ["Avenir Next", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
      backgroundImage: {
        grid:
          "linear-gradient(to right, rgba(16, 33, 29, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(16, 33, 29, 0.04) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
