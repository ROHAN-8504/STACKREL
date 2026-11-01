import coreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  { ignores: ['.next/**', 'out/**', 'node_modules/**', 'next-env.d.ts', 'worker/**'] },
  ...coreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // SPEC.md Security: external links must not leak the referrer.
      'react/jsx-no-target-blank': ['error', { allowReferrer: false }],
    },
  },
];

export default config;
