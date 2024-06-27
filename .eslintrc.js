/* eslint-disable no-undef */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:tailwindcss/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'tailwindcss',
    '@typescript-eslint',
    'prettier',
    'unused-imports',
    'simple-import-sort',
    'check-file',
    'no-relative-import-paths',
  ],
  rules: {
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      { allowSameFolder: false, prefix: '@', rootDir: 'src' },
    ],
    complexity: ['warn', 30],
    'react/react-in-jsx-scope': 'off', // Not needed for React 17+
    'react/prop-types': 'off', // Using TypeScript for type checking
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Gives flexibility with type inference
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // Warn on unused vars, ignore with prefix '_'
    'tailwindcss/classnames-order': 'warn', // Encourage ordered TailwindCSS class names, but don't error
    'tailwindcss/no-custom-classname': 'off', // Allows custom classNames for special cases
    'prettier/prettier': [
      'error',
      {
        // Your preferred Prettier configuration
        singleQuote: true,
        bracketSpacing: true,
        jsxBracketSameLine: false,
        semi: true,
        useTabs: false,
        tabWidth: 2,
        printWidth: 80,
      },
    ],
    'no-unused-vars': 'off',
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'error',
      {
        vars: 'all',
        varsIgnorePattern: '^_',
        args: 'after-used',
        argsIgnorePattern: '^_',
      },
    ],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['@tanstack/react-query'],
            message:
              'Use utils/api.ts instead of importing directly from react-query',
          },
        ],
      },
    ],
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // External Packages
          [
            '^react',
            '^lodash',
            '^vite',
            '^@vitejs',
            '^@heroicons',
            '^@headlessui',
            '^@tanstack',
            '^tailwind',
            '^@floating-ui',
            '',
          ],
          // Internal packages.
          ['^(@)(/.*|$)'],
          // Parent imports. Put `..` last.
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports. Put same-folder imports and `.` last.
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports.
          ['^.+\\.s?css$'],
        ],
      },
    ],
    'check-file/folder-naming-convention': [
      'error',
      { 'src/**/': 'CAMEL_CASE' },
    ],
    'check-file/filename-naming-convention': [
      'error',
      {
        'src/(components|sections)/**/!(index).tsx': 'PASCAL_CASE',
        'src/(components|sections)/**/*.ts': 'CAMEL_CASE',
        'src/utils/**/*.{ts,tsx}': 'CAMEL_CASE',
      },
      { ignoreMiddleExtensions: true },
    ],
  },
  settings: {
    react: {
      version: 'detect', // Automatically detect the React version
    },
  },
};
