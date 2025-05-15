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
        primary: "#4AE5FB",
        'teal-dark': "#1D7A85", // Approx. from rgba(29, 122, 133, 0.85)
        'teal-darker': "#10444A", // Approx. from rgba(16, 68, 74, 0.916608)
      },
      keyframes: {
        popOutCustom: {
          '0%': { 
            opacity: '0', 
            width: '10px',
            height: '10px',
          },
          '10%': { 
            opacity: '1',
            width: '60vmin',
            height: '60vmin',
          },
          '100%': { 
            opacity: '1', 
            width: '80vmin',
            height: '80vmin',
          },
        },
        fadeInDelayCustom: {
          '0%': { opacity: '0' },
          '20%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        popOutCustom: 'popOutCustom 7.5s cubic-bezier(0.25, 0.1, 0.25, 1.0) forwards',
        fadeInDelayCustom: 'fadeInDelayCustom 2.5s 1s ease-in-out forwards',
      },
    },
  },
  plugins: [],
};
export default config;
