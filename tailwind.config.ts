import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#0b1520",
          900: "#122032",
          800: "#1a2d45",
          700: "#243c58",
          600: "#355070",
          500: "#4a6a8a",
          400: "#7a97b0",
          300: "#a8bfd0",
          200: "#d0dee8",
          100: "#e8f0f5",
          50: "#f4f8fb",
        },
        signal: {
          DEFAULT: "#0d8a72",
          light: "#14b896",
          dark: "#086555",
          soft: "#d8f5ee",
        },
        ember: {
          DEFAULT: "#d4682a",
          soft: "#fceee4",
        },
        chalk: "#f7f4ef",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 18px 50px -24px rgba(11, 21, 32, 0.35)",
        lift: "0 10px 30px -16px rgba(11, 21, 32, 0.28)",
      },
      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          from: { opacity: "1" },
          to: { opacity: "0.55" },
        },
        barGrow: {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.55s ease-out both",
        "fade-up-delay": "fadeUp 0.65s ease-out 0.12s both",
        "fade-up-delay-2": "fadeUp 0.7s ease-out 0.22s both",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite alternate",
        "bar-grow": "barGrow 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
