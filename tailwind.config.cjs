/** @type {import('tailwindcss').Config} */

const { BugAntIcon } = require('@heroicons/react/24/solid');

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primaryNavbar: 'var(--background-primary-navbar)',
        bgBodyPrimary: 'var(--background-body-primary)',
        bgBodySecondary: 'var(--background-body-secondary)',
        // input
        inputBg: 'var(--input-background)',
        inputMain: 'var(--input-main)',
        inputOnHover: 'var(--input-on-hover)',
        inputText: 'var(--input-text)',
        inputOnFocus: 'var(--input-on-focus)',
        // button
        buttonPrimary: 'var(--button-primary)',
        buttonOnHover: 'var(--button-on-hover)',
        buttonOnClick: 'var(--button-on-click)',
        buttonBorder: 'var(--button-border)',
        buttonFocus: 'var(--button-focus)',
        // border
        borderOnHover: 'var(--border-on-hover)',
        border: 'var(--border)',
        // text
        textOnHover: 'var(--text-on-hover)',
        textWhite: 'var(--text-white)',
        textGray: 'var(--text-gray)',
        textLabel: 'var(--text-label)',
        textValue: 'var(--text-value)',
        textHighlight: 'var(--text-highlight)',
        // image
        imageBackground: 'var(--image-background)',

        success: 'var(--success)',
        error: 'var(--error)',
      },
    },
  },
  plugins: [],
};
