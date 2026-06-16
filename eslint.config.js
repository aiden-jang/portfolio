import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // The two classic, high-signal hooks rules. We intentionally do NOT
      // spread `reactHooks.configs.recommended` because v7 folds in the React
      // Compiler ruleset (react-hooks/refs, immutability), which false-positives
      // all over react-three-fiber: mutating the camera / scene graph inside
      // useFrame and seeding props from init values is the correct r3f pattern,
      // not a render-purity bug.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // Node-context config files (Vite, ESLint, Tailwind).
  {
    files: ['*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
  // Disable stylistic rules that would fight Prettier. Keep last.
  prettier,
);
