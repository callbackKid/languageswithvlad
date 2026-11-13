import javascript from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
// browser не импортируется из globals через именованный импорт
import globals from 'globals';
import typescript from 'typescript-eslint';

// Public packages in place of @packages/eslint-config, which only exists inside another project.
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
  // last, so Prettier's formatting wins over any stylistic rule above
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', 'build/*', 'node_modules/*', '.vercel/*', '**/*.d.ts'],
  },
];
