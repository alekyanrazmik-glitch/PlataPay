import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#08172F',
        bg2: '#0c1f40',
        bg3: '#13294e',
        card: '#0d1f44',
        line: '#16315f',
        line2: '#1d3a6b',
        text: '#eef3ff',
        muted: '#9fb2d4',
        muted2: '#aebfdc',
        muted3: '#8499c0',
        accent: '#2e7bff',
        accentHover: '#1f63e6',
        accent2: '#7BAEFF',
        green: '#22C55E',
        greenD: '#15A34A',
        avito: '#9bc736',
        star: '#FFC107',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'system-ui',
          'sans-serif',
        ],
      },
      backgroundImage: {
        'cta-grad': 'linear-gradient(180deg,#2e7bff,#1e5fd6)',
      },
    },
  },
  plugins: [],
};

export default config;
