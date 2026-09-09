/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "tinta sobre papel": negro/azul para lo normal, rojo para lo atrasado
        paper: {
          DEFAULT: '#EEF1F3',
          alt: '#F6F8F9',
          line: '#C6CBD1',
          divider: '#D3D7DB',
          track: '#DDE1E4'
        },
        ink: {
          DEFAULT: '#111827',
          soft: '#4C5361',
          faint: '#6B7280',
          faintest: '#9AA1AA',
          onDark: '#EEF1F3',
          onDarkSoft: '#B9C2CE',
          onDarkFaint: '#8E9AAB'
        },
        azul: {
          DEFAULT: '#0F5F8A',
          dark: '#0b4463',
          mid: '#4A87AC',
          tint: '#E1EAF0',
          tintBorder: '#B7CEDC'
        },
        rojo: {
          DEFAULT: '#B4472A',
          dark: '#8A4230',
          tint: '#F7EAE5',
          tintBorder: '#E0B6AA'
        }
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        serif: ['"Crimson Pro"', 'Georgia', 'serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(17,24,39,.06), 0 2px 10px rgba(17,24,39,.06)',
        sheet: '0 -8px 30px rgba(17,24,39,.18)'
      },
      borderRadius: {
        card: '14px'
      }
    }
  },
  plugins: []
}
