// eslint.config.js
import stylisticTs from '@stylistic/eslint-plugin-ts';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    plugins: {
      '@stylistic/ts': stylisticTs
    },
    rules: {
      '@stylistic/ts/indent': ['error', 2]
    }
  }
];
