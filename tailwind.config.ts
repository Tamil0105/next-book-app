import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3498db',
        secondary: '#f1c40f',
        success: '#2ecc71',
        warning: '#e67e73',
        error: '#e74c3c',
        dark: '#2c3e50',
        light: '#ecf0f1',
      },
      spacing: {
        128: '32rem',
        144: '36rem',
      },
      typography: {
        xl: {
          fontSize: '1.25rem',
          lineHeight: '1.6',
        },
        '2xl': {
          fontSize: '1.5rem',
          lineHeight: '1.6',
        },
        '3xl': {
          fontSize: '1.75rem',
          lineHeight: '1.6',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
