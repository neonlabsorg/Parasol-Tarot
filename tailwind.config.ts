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
        // Parasol Brand Colors
        // Color combinations:
        // 1. #81B29A (green/teal) with #E07A5F (coral) and #F4F1DE (cream)
        // 2. #81B29A (green/teal) with #3D405B (dark blue) and #F4F1DE (cream) and #F2CC8F (light yellow)
        'brand-primary': '#81B29A',      // Parasol primary - green/teal (base color for both combinations)
        'brand-secondary': '#F4F1DE',    // Parasol secondary - cream/beige (common to both combinations)
        'brand-accent': '#3D405B',       // Parasol accent - dark blue/navy (from combination 2)
        'brand-highlight': '#E07A5F',    // Parasol highlight - coral/salmon (from combination 1)
        'brand-light': '#F2CC8F',        // Parasol light - light yellow/cream (from combination 2)
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #81B29A 0%, #F4F1DE 50%, #3D405B 100%)',
      },
    },
  },
  plugins: [],
};

export default config;

