import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
  {
    files: ['tests/**'],
    extends: [tseslint.configs.recommended, playwright.configs['flat/recommended']],
    rules: {
      // You can customize or override specific rules here
    },
  },
]);
