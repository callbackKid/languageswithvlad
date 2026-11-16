import javascript from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
// globals has no named export for the browser set, so the whole object is imported
import globals from 'globals';
import typescript from 'typescript-eslint';

// The rules below are the checkable part of CODE_STYLE.md; the pre-commit hook runs them.
export default [
  javascript.configs.recommended,
  ...typescript.configs.recommended,
  react.configs.flat.recommended,
  // React 17+ needs no `import React` for JSX
  react.configs.flat['jsx-runtime'],
  {
    plugins: { 'react-hooks': reactHooks },
    rules: reactHooks.configs.recommended.rules,
    settings: { react: { version: 'detect' } },
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    plugins: { 'simple-import-sort': simpleImportSort },
    rules: {
      // imports: one sorted block per file, fixed automatically
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      // types are imported as types, so they never reach the bundle
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      // no `value!`: handle the missing case, or prove it can't happen with a check
      '@typescript-eslint/no-non-null-assertion': 'error',
      // === everywhere; `== null` stays allowed for "null or undefined"
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      // no debug output left behind; the server may log real problems
      'no-console': ['error', { allow: ['error', 'warn'] }],
      // whole-word names; t is the translation function, a/b are the two sides of a pair
      'id-length': ['error', { min: 2, exceptions: ['t', 'a', 'b'], properties: 'never' }],
      // a <button> inside a form submits it unless it says type="button"
      'react/button-has-type': 'error',
      'react/self-closing-comp': 'error',
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'no-else-return': 'error',
      'object-shorthand': 'error',
      'prefer-const': 'error',
    },
  },
  // last, so Prettier's formatting wins over any stylistic rule above
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'build/*', 'node_modules/*', '.vercel/*', '**/*.d.ts'],
  },
];
