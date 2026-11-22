import fsd from '@feature-sliced/steiger-plugin';
import { defineConfig } from 'steiger';

// The FSD layer rules (CODE_STYLE.md, Imports), checked by `yarn verify` and the pre-commit hook.
export default defineConfig([
  ...fsd.configs.recommended,
  {
    rules: {
      // "news" is uncountable, not a plural: entities/news stays as it is
      'fsd/inconsistent-naming': 'off',
    },
  },
]);
