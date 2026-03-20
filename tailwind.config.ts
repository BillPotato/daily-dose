import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        plant: {
          mint: "#c1dcdc",
          cream: "#fdfbf7",
          ink: "#1e1e1e",
          soft: "#d9d9d9",
          muted: "#b6b5b5",
          paper: "#ffffff",
          primary: "#7fa8a8",
          primaryHover: "#6f9494",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        serif: ["var(--font-playfair)", "serif"],
      },
      boxShadow: {
        organic: "0 8px 30px rgb(4 43 21 / 0.06)",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
