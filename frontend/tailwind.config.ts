import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        blue: {
          dark: "#395A9A",
          light: "#0070BB",
        },
        black: {
          DEFAULT: "#000000",
          dark: "#1A1A1A",
          light: "#080808",
        },
        white: {
          DEFAULT: "#FFFFFF",
          darker: "#D9D9D9",
          dark: "#F6F6F6",
        },
        red: {
          dark: "#AB2E58",
          light: "#E31838",
        },
      },
      screens: {
        mid: "940px",
      },
    },
  },
  plugins: [require("tailwindcss-animated")],
  darkMode: "class",
} satisfies Config;
