const js = require('@eslint/js');
const globals = require('globals');
const tseslint = require('typescript-eslint');
const { defineConfig } = require('eslint/config');
const eslintConfigPrettier = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  { ignores: ['dist/**', 'node_modules/**'] },
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: { globals: globals.node },
  },
  ...tseslint.configs.recommended,
  {
    files: ['eslint.config.js', '*.config.js'],
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  eslintConfigPrettier,
]);
