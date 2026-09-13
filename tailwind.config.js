/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // North Eastern Healthcare Palette
          primary: '#1E5E3A',       // Forest & Assam Tea Garden Green
          primaryHover: '#143B30',  // Deep Forest Green
          forest: '#1B4D3E',        // Grounded Forest Green
          light: '#EBF5EE',         // Tea Garden Mist
          yellow: '#C68215',        // Muga Golden Silk / Morning Sunlight
          softYellow: '#FFF6E5',    // Muga Warm Sunlight
          navy: '#162832',          // Himalayan Mountain Slate Text
          softGreen: '#EBF5EE',     // Soft Tea Shoot Green
          accentGreen: '#1E5E3A',   // Accent Forest Green
          softRed: '#FDF2F2',       // Soft Gamosa Red Alert
          accentRed: '#BA1A1A',     // Traditional Gamosa Crimson Red
          surface: '#F7F8F5',       // Warm Natural Mist Surface
          card: '#FFFFFF',
          border: '#D8E2D9',

          // Cultural & Natural Landscape Named Tokens
          tea: '#1E5E3A',
          teaLight: '#EBF5EE',
          teaBorder: '#C3E2CD',
          muga: '#C68215',
          mugaLight: '#FFF6E5',
          mugaBorder: '#F7D59A',
          gamosa: '#BA1A1A',
          gamosaLight: '#FDF2F2',
          gamosaBorder: '#F5C2C2',
          mountain: '#162832',
          sky: '#3D6B82',
          skyLight: '#E8F1F5',
          mist: '#DCEBF2',
          bamboo: '#FAF7F2',
          cane: '#EFE9DC',
          earth: '#8C6D53',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Plus Jakarta Sans', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'organic': '2rem 3.5rem 2rem 2.5rem',
        'leaf': '2.5rem 0.75rem 2.5rem 0.75rem',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(30, 94, 58, 0.08)',
        'elevated': '0 10px 25px -3px rgba(22, 40, 50, 0.10)',
        'tea': '0 8px 24px -4px rgba(30, 94, 58, 0.22)',
        'tea-deep': '0 12px 32px -4px rgba(22, 78, 48, 0.28)',
        'muga': '0 8px 24px -4px rgba(217, 138, 30, 0.22)',
        'mist-glow': '0 0 35px 5px rgba(220, 235, 242, 0.75)',
      }
    },
  },
  plugins: [],
}
