import planetConfig from 'eslint-config-planet';
import globals from 'globals';

export default [
  ...planetConfig,
  {
    languageOptions: {
      globals: {
        chrome: 'readonly',
      },
    },
  },
  {
    files: ['**/*.test.js'],
    languageOptions: {
      globals: globals.jest,
    },
  },
];
