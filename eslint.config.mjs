import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores(['.next/*', 'out/*', 'build/*', 'dist/*', 'next-env.d.ts', 'public/*']),
  {
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      /*
       * The React-Compiler-era rules below aggressively flag idiomatic
       * patterns in this codebase:
       *  - imperative WebGL/three.js mutation inside effects + useFrame
       *  - one-shot random/now geometry computed in memoized initializers
       *  - matchMedia/resize detection that must run post-mount
       *  - "latest value" refs read during render
       * Keep them visible (warn) but non-blocking.
       */
      'react-hooks/immutability': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
    },
  },
]);

export default eslintConfig;