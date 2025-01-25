module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking'
  ],
  parserOptions: {
    project: ['./tsconfig.json', './src/tsconfig.json'],
    tsconfigRootDir: __dirname,
  },
  rules: {
    // Prevent floating promises
    '@typescript-eslint/no-floating-promises': 'error',
    
    // Prevent misused promises
    '@typescript-eslint/await-thenable': 'error',
    '@typescript-eslint/no-misused-promises': [
      'error',
      {
        'checksVoidReturn': {
          'attributes': false
        }
      }
    ],

    // Additional promise-related rules
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/no-unnecessary-condition': 'error',
  }
};
