{
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  extends: [
    'standard',
  ],
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
  },
}
