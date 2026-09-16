import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f131c",
        "on-background": "#dfe2ee",
        surface: "#0f131c",
        "surface-dim": "#0f131c",
        "surface-bright": "#353942",
        "surface-container-lowest": "#0a0e16",
        "surface-container-low": "#181c24",
        "surface-container": "#1c2028",
        "surface-container-high": "#262a33",
        "surface-container-highest": "#31353e",
        "on-surface": "#dfe2ee",
        "on-surface-variant": "#bbcabf",
        outline: "#86948a",
        "outline-variant": "#3c4a42",
        primary: "#4edea3",
        "on-primary": "#003824",
        "primary-container": "#10b981",
        "on-primary-container": "#00422b",
        "inverse-primary": "#006c49",
        "emerald-custom": "#10b981",
        secondary: "#bdc7d9",
        "on-secondary": "#27313f",
        "secondary-container": "#404a59",
        "on-secondary-container": "#afb9cb",
        tertiary: "#ffb3ad",
        "tertiary-container": "#ff7a73",
        error: "#ffb4ab",
        "error-container": "#93000a",
        "card-bg": "#1A1E26",
        "card-border": "#2B313E",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-geist)", "Geist", "sans-serif"],
        mono: ["var(--font-mono)", "Geist Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        "emerald-glow": "0 0 12px rgba(16, 185, 129, 0.3)",
        "emerald-glow-hover": "0 0 16px rgba(16, 185, 129, 0.5)",
        "pass-modal": "0 0 30px rgba(16, 185, 129, 0.08)",
      },
      animation: {
        borderGlow: "borderGlow 4s ease infinite",
        scanLine: "scanLine 2.5s infinite linear",
        pulseRing: "pulseRing 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
      },
      keyframes: {
        borderGlow: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        scanLine: {
          "0%": { top: "0%", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { top: "100%", opacity: "0" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.8)", opacity: "0.8" },
          "100%": { transform: "scale(2.6)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
