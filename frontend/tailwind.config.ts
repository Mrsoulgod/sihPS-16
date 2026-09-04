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
        background: "var(--background)",
        foreground: "var(--foreground)",
        gov: {
          primary: "#15803d",       // Institutional Green
          primaryDark: "#166534",   // Deep Green
          primaryLight: "#dcfce7",  // Light Green Tint
          secondary: "#0f172a",     // Slate Dark
          accent: "#ca8a04",        // Gold/Ochre Alert
          muted: "#64748b",         // Slate Muted
          surface: "#ffffff",
          border: "#e2e8f0",
        },
      },
    },
  },
  plugins: [],
};
export default config;
