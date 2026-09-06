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
          primary: '#2F6FED',      // Primary Blue
          light: '#EAF2FF',        // Light Blue
          yellow: '#FFC857',       // Warm Yellow
          softYellow: '#FFF8E1',   // Soft Yellow
          navy: '#172B4D',         // Dark Navy Text
          softGreen: '#E8F5E9',    // Soft Success Green
          accentGreen: '#2E7D32',  // Accent Green
          softRed: '#FDECEC',      // Soft Emergency Red
          accentRed: '#D32F2F',    // Accent Red
          surface: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(47, 111, 237, 0.08)',
        'elevated': '0 10px 25px -3px rgba(23, 43, 77, 0.08)',
      }
    },
  },
  plugins: [],
}
