import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig([
  {
    files: ['tests/**'],
    extends: [tseslint.configs.recommended, playwright.configs['flat/recommended']],
    rules: {
      // The accessibility suite is report-only by design (see
      // support/a11y.ts) - these helpers attach/annotate results instead of
      // calling expect(), so they stand in for assertions here.
      'playwright/expect-expect': [
        'warn',
        {
          assertFunctionNames: [
            'runAccessibilityScan',
            'checkReflow',
            'evaluateAltTextWithAI',
          ],
        },
      ],
    },
  },
]);
