import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Hop-themed brand colors
        'hop-green': 'var(--hop-green)',
        'hop-gold': 'var(--hop-gold)', 
        'hop-brown': 'var(--hop-brown)',
        
        // Theme-aware colors using CSS variables
        'theme': {
          'primary-bg': 'var(--primary-bg)',
          'secondary-bg': 'var(--secondary-bg)',
          'accent-bg': 'var(--accent-bg)',
          'card-bg': 'var(--card-bg)',
          'modal-bg': 'var(--modal-bg)',
          'overlay-bg': 'var(--overlay-bg)',
          'primary-text': 'var(--primary-text)',
          'secondary-text': 'var(--secondary-text)',
          'accent-text': 'var(--accent-text)',
          'inverse-text': 'var(--inverse-text)',
          'border': 'var(--border-color)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'theme-gradient': 'var(--bg-gradient)',
        'card-gradient': 'var(--card-gradient)',
      },
      boxShadow: {
        'theme': 'var(--shadow)',
        'theme-lg': 'var(--shadow-lg)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-in': 'slideIn 0.4s ease-out',
        'bounce-subtle': 'bounce 2s infinite',
      },
      backdropBlur: {
        'theme': '12px',
      }
    },
  },
  plugins: [],
}
export default config