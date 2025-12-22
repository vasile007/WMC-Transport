/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#dc2626", // red-600
          light: "#ef4444",   // red-500
          dark: "#b91c1c",    // red-700
        },
        accent: {
          yellow: "#facc15",  // yellow-400
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 20px rgba(2, 6, 23, 0.06)",
        md: "0 10px 24px rgba(2, 6, 23, 0.08)",
        glow: "0 0 0 3px rgba(220,38,38,0.15)",
      },
    },
  },
  plugins: [],
};

