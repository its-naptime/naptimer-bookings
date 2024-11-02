import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: { 
        Title: ['Title', 'sans-serif'],
        Body: ['Body', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      keyframes: {
        pulse: {
          '0%': { transform: 'scale(1)', opacity: '0.2' },
          '50%': { transform: 'scale(1.1)', opacity: '0.3' },
          '100%': { transform: 'scale(1)', opacity: '0.2' },
        },
        blob: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(75px, -75px) scale(1.1)' },
          '50%': { transform: 'translate(100px, 0) scale(1.2)' },
          '75%': { transform: 'translate(75px, 75px) scale(1.1)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        blob2: {
          '0%': { transform: 'translate(0, 0) scale(1.2)' },
          '25%': { transform: 'translate(-75px, 75px) scale(1.1)' },
          '50%': { transform: 'translate(-100px, 0) scale(1)' },
          '75%': { transform: 'translate(-75px, -75px) scale(1.1)' },
          '100%': { transform: 'translate(0, 0) scale(1.2)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scrollDot: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInFromLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInFromRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        rotateIn: {
          '0%': { transform: 'rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'rotate(0)', opacity: '1' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-5px, 5px)' },
          '40%': { transform: 'translate(-5px, -5px)' },
          '60%': { transform: 'translate(5px, 5px)' },
          '80%': { transform: 'translate(5px, -5px)' },
        },
        typewriter: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },      
        lineSlide: {
          'from': { width: '0%', opacity: '0' },
          'to': { width: '80%', opacity: '1' },
        },
      },
      animation: {
        pulseglow: 'pulse 4s ease-in-out infinite',
        blob: 'blob 8s infinite ease-in-out',
        blob2: 'blob2 8s infinite ease-in-out',
        fadeIn2: 'fadeIn 1s ease-out 0.5s forwards',
        fadeIn3: 'fadeIn 1s ease-out 0.8s forwards',
        slideDown: 'slideDown 1s ease-out',
        slideUp: 'slideUp 1s ease-out',
        scrollDot: 'scrollDot 1.5s infinite',
        scaleIn: 'scaleIn 0.7s ease-out forwards',
        slideLeft: 'slideInFromLeft 0.7s ease-out forwards',
        slideRight: 'slideInFromRight 0.7s ease-out forwards',
        rotateIn: 'rotateIn 0.7s ease-out forwards',
        glitch: 'glitch 0.5s infinite',
        typewriter: 'typewriter 2s steps(20) forwards',
        iconFade1: 'fadeIn 0.5s ease-out 0.3s forwards',
        iconFade2: 'fadeIn 0.5s ease-out 0.6s forwards',
        iconFade3: 'fadeIn 0.5s ease-out 0.9s forwards',
        fadeIn: 'fadeIn 3s ease-out forwards',  // Slowed down title fade
        lineSlide: 'lineSlide 1s ease-out 0.5s forwards', // Starts after title fade
        bookingFade: 'fadeIn 1s ease-out 1.5s forwards', // Starts after line animation
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar')
  ],
}

export default config