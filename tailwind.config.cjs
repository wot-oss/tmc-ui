/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'loader-slide-fade': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-300px)',
          },
          '33%': {
            opacity: '1',
            transform: 'translateX(0px)',
          },
          '66%': {
            opacity: '1',
            transform: 'translateX(0px)',
          },
          '100%': {
            opacity: '0',
            transform: 'translateX(300px)',
          },
        },
      },
      animation: {
        'loader-slide-fade': 'loader-slide-fade 3s infinite ease-in-out',
      },
      colors: {
        surface: {
          canvas: 'var(--color-surface-canvas)',
          panel: 'var(--color-surface-panel)',
          'panel-hover': 'var(--color-surface-panel-hover)',
          'panel-active': 'var(--color-surface-panel-active)',
          modal: 'var(--color-surface-modal)',
          input: 'var(--color-surface-input)',
          'input-hover': 'var(--color-surface-input-hover)',
        },
        media: {
          DEFAULT: 'var(--color-media)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          inverse: 'var(--color-text-inverse)',
          'inverse-strong': 'var(--color-text-inverse-strong)',
          'muted-light': 'var(--color-text-muted-light)',
          marker: 'var(--color-text-marker)',
        },
        border: {
          default: 'var(--color-border-default)',
          subtle: 'var(--color-border-subtle)',
          interactive: 'var(--color-border-interactive)',
          'interactive-hover': 'var(--color-border-interactive-hover)',
          'interactive-pressed': 'var(--color-border-interactive-pressed)',
          focus: 'var(--color-border-focus)',
          accent: 'var(--color-border-accent)',
        },
        interactive: {
          primary: 'var(--color-interactive-primary)',
          hover: 'var(--color-interactive-hover)',
          pressed: 'var(--color-interactive-pressed)',
          support: 'var(--color-interactive-support)',
          'support-hover': 'var(--color-interactive-support-hover)',
          accent: 'var(--color-interactive-accent)',
        },
        focus: {
          ring: 'var(--color-focus-ring)',
          soft: 'var(--color-focus-soft)',
        },
        status: {
          success: 'var(--color-status-success)',
          'success-subtle': 'var(--color-status-success-subtle)',
          'success-outline': 'var(--color-status-success-outline)',
          error: 'var(--color-status-error)',
          'error-subtle': 'var(--color-status-error-subtle)',
          'error-hover': 'var(--color-status-error-hover)',
          'error-outline': 'var(--color-status-error-outline)',
          'error-strong': 'var(--color-status-error-strong)',
          'error-soft': 'var(--color-status-error-soft)',
        },
        overlay: {
          backdrop: 'var(--color-overlay-backdrop)',
          'success-tint': 'var(--color-overlay-success-tint)',
          'scroll-thumb': 'var(--color-overlay-scroll-thumb)',
        },
        icon: {
          brand: 'var(--color-icon-brand)',
        },
      },
    },
  },
  plugins: [],
};
