/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "hair-bg": {
          DEFAULT: "#3F2D25",
          dark: "#2a1f1a",
          light: "#5A4A3A",
        },
        "hair-gold": {
          DEFAULT: "#D2994A",
          hover: "#C79745",
          copper: "#C9764D",
        },
        "hair-cream": "#e8e0d5",
        // Semantic colors
        success: "#34D399",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
    },
  },
  plugins: [],
};
