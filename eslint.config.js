import js from '@eslint/js';
import globals from 'globals';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwind from 'eslint-plugin-tailwindcss';
import configPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist/', 'build/', 'node_modules/', '**/vite.config.*', 'eslint.config.js'],
  },
  // Base JS + TS + React
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.es2022,
        __API_BASE__: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooks,
      tailwindcss: tailwind,
    },
    settings: {
      react: {
        version: 'detect',
      },
      tailwindcss: {
        callees: ['classnames', 'clsx', 'ctl'],
        config: 'tailwind.config.js',
      },
    },
    rules: {
      // Base recommended
      ...js.configs.recommended.rules,
      'no-undef': 'off',
      // TypeScript recommended (select few, keep concise)
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      // React
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-key': 'error',
      'react/no-unknown-property': ['error', { ignore: ['class', 'for'] }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // Tailwind
      'tailwindcss/classnames-order': 'off',
      'tailwindcss/no-custom-classname': 'off',
      // Style & quality
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      eqeqeq: ['error', 'smart'],
    },
  },
  // Test files (Vitest)
  {
    files: ['**/*.test.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
        // Vitest globals
        vi: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        afterAll: 'readonly',
        afterEach: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
  configPrettier,
];
