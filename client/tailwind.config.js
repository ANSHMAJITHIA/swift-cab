/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          dark: '#121212',
          card: '#1e1e1e',
          gray: '#2c2c2c',
          lightGray: '#f3f4f6',
          blue: '#276EF1',
          green: '#05944F',
          yellow: '#FFC043',
        },
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slight': 'bounceSlight 1s infinite',
      },
      keyframes: {
        bounceSlight: {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
