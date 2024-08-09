/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const colors = require('tailwindcss/colors');
const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './node_modules/@tremor/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors: {
      tremor: {
        brand: {
          faint: colors.blue[50],
          muted: colors.blue[200],
          subtle: colors.blue[400],
          DEFAULT: colors.blue[500],
          emphasis: colors.blue[700],
          inverted: colors.white,
        },
        background: {
          muted: colors.gray[50],
          subtle: colors.gray[100],
          DEFAULT: colors.white,
          emphasis: colors.gray[700],
        },
        border: {
          DEFAULT: colors.gray[200],
        },
        ring: {
          DEFAULT: colors.gray[200],
        },
        content: {
          subtle: colors.gray[400],
          DEFAULT: colors.gray[500],
          emphasis: colors.gray[700],
          strong: colors.gray[900],
          inverted: colors.white,
        },
      },
      boxShadow: {
        // light
        'tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        // dark
        'dark-tremor-input': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'dark-tremor-card':
          '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'dark-tremor-dropdown':
          '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      borderRadius: {
        'tremor-small': '0.375rem',
        'tremor-default': '0.5rem',
        'tremor-full': '9999px',
      },
      fontSize: {
        'tremor-label': ['0.75rem', { lineHeight: '1rem' }],
        'tremor-default': ['0.875rem', { lineHeight: '1.25rem' }],
        'tremor-title': ['1.125rem', { lineHeight: '1.75rem' }],
        'tremor-metric': ['1.875rem', { lineHeight: '2.25rem' }],
      },

      ...colors,
      transparent: 'transparent',
      current: 'currentColor',
      error: '#dc2626',
      'error-selected': '#fbe9e9',
      'error-light': colors.red[200],
      success: '#16a34a',
      'success-light': '#dcfce7',
      brand: {
        DEFAULT: addOpacity('var(--brand)'),
        dark: addAlphaValue('var(--brand-dark)'),
        light: addAlphaValue('var(--brand-light)'),
        lighter: addAlphaValue('var(--brand-lighter)'),
      },
      primary: {
        DEFAULT: addOpacity('var(--primary)'),
        dark: addAlphaValue('var(--primary-dark)'),
        light: addAlphaValue('var(--primary-light)'),
      },
      contract: addOpacity('var(--contract)'),
      highlight: addOpacity('var(--highlight)'),
      checkbox: {
        DEFAULT: 'var(--border-default)',
        checked: addAlphaValue('var(--primary-light)'),
      },
      header: {
        light: addAlphaValue('var(--header-light)'),
        DEFAULT: addAlphaValue('var(--header)'),
        dark: addAlphaValue('var(--header-dark)'),
      },
      default: {
        light: addAlphaValue('var(--default-light)'),
        DEFAULT: addAlphaValue('var(--default)'),
        dark: addAlphaValue('var(--default-dark)'),
      },
      layer0: addAlphaValue('var(--layer0)'),
      layer1: addAlphaValue('var(--layer1)'),
      layer2: addAlphaValue('var(--layer2)'),
    },
    textColor: theme => {
      return {
        ...theme('colors'),
        header: {
          light: addAlphaValue('var(--text-header-light)'),
          DEFAULT: addAlphaValue('var(--text-header)'),
          dark: addAlphaValue('var(--text-header-dark)'),
        },
        default: {
          light: addAlphaValue('var(--text-default-light)'),
          DEFAULT: addAlphaValue('var(--text-default)'),
          dark: addAlphaValue('var(--text-default-dark)'),
        },
        disabled: {
          DEFAULT: addAlphaValue('var(--text-disabled)'),
        },
      };
    },
    borderColor: theme => ({
      ...theme('colors'),
      header: {
        DEFAULT: addAlphaValue('var(--border-header)'),
      },
      default: {
        DEFAULT: addAlphaValue('var(--border-default)'),
      },
    }),
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', ...defaultTheme.fontFamily.sans],
        mono: ['IBM Plex Mono', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(100%)', opacity: 0 },
        },
      },
      animation: {
        'spin-slow': 'spinSlow 2s linear infinite',
      },
    },
  },
  safelist: [
    {
      pattern:
        /^(bg-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(text-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(border-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
      variants: ['hover', 'ui-selected'],
    },
    {
      pattern:
        /^(ring-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(stroke-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
    {
      pattern:
        /^(fill-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(?:50|100|200|300|400|500|600|700|800|900|950))$/,
    },
  ],
  plugins: [require('@tailwindcss/typography')],
};

function addAlphaValue(variable) {
  return variable;
}

function addOpacity(variable) {
  return `rgb(${variable} / <alpha-value>)`;
}
