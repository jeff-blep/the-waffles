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
        // Waffles brand palette
        waffle: {
          orange:  "#F5A623",
          "orange-light": "#FAC75A",
          "orange-dark":  "#D4881A",
          blue:    "#2B9FE8",
          "blue-light":   "#6DBFF0",
          "blue-dark":    "#1A7AC0",
          cream:   "#FFF8EE",
          "cream-dark":   "#F5EDD8",
        },
        // Semantic aliases used throughout the app
        chef:    "#F5A623",   // chef/seller actions
        diner:   "#2B9FE8",   // diner/buyer actions
        draw:    "#9B59B6",   // draw/raffle events
        win:     "#27AE60",   // winner states
        danger:  "#E74C3C",   // warnings, errors
        neutral: "#8E9BA8",   // muted / secondary text
      },
      fontFamily: {
        sans:    ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "monospace"],
      },
      borderRadius: {
        waffle: "12px",
        seat:   "8px",
      },
      boxShadow: {
        card:  "0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        raised:"0 4px 12px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
      },
      animation: {
        "fade-in":    "fadeIn 0.2s ease-out",
        "slide-up":   "slideUp 0.3s ease-out",
        "spin-slow":  "spin 3s linear infinite",
        "bounce-sm":  "bounceSm 0.6s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        bounceSm: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%":      { transform: "translateY(-4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
