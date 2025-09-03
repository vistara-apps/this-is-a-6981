/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: 'hsl(225 15% 15%)',
        accent: 'hsl(180 70% 50%)',
        primary: 'hsl(220 70% 50%)',
        surface: 'hsl(220 15% 20%)',
        'text-primary': 'hsl(225 10% 90%)',
        'text-secondary': 'hsl(225 5% 70%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'xl': '24px',
      },
      spacing: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'xxl': '20px',
      },
      boxShadow: {
        'card': 'hsla(220, 15%, 10%, 0.3) 0px 8px 24px',
        'modal': 'hsla(220, 15%, 10%, 0.4) 0px 5px 15px',
      },
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        'slide-up': 'slideUp 400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}