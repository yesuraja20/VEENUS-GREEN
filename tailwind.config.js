/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f1f8f4',
          100: '#ddeee4',
          200: '#bfdfcc',
          300: '#94c9ad',
          400: '#63ad8a',
          500: '#3f916b',
          600: '#2f7454',
          700: '#265d44',
          800: '#1b4332',
          900: '#0d281e',
          950: '#061610',
        },
        gold: {
          50: '#fbf9ed',
          100: '#f6f0d1',
          200: '#eedda5',
          300: '#e4c46f',
          400: '#d9a93e',
          500: '#d4af37',
          600: '#b88b20',
          700: '#92671b',
          800: '#79521c',
          900: '#67441c',
        },
        cream: {
          50: '#fdfcf9',
          100: '#faf7f2',
          200: '#f4ede1',
          300: '#eadccb',
          400: '#dbc4ab',
          500: '#caa889',
        },
        spice: {
          pepper: '#1f2421',
          clove: '#43281c',
          cinnamon: '#7f4f24',
          saffron: '#e07a5f',
          turmeric: '#e09f3e',
          cardamom: '#588157',
        }
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-outfit)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(13, 40, 30, 0.15)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.35)',
        'inner-gold': 'inset 0 1px 0 rgba(243, 223, 138, 0.3)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
};
