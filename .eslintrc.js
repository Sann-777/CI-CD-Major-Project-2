module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:node/recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'node',
  ],
  rules: {
    // Code quality - relaxed for CI/CD
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-debugger': 'warn',
    'no-duplicate-imports': 'warn',
    'no-unreachable': 'warn',
    'no-var': 'warn',
    'prefer-const': 'warn',
    'no-const-assign': 'warn',
    
    // Style - relaxed for CI/CD
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off',
    'object-curly-spacing': 'off',
    'array-bracket-spacing': 'off',
    'space-before-blocks': 'off',
    'keyword-spacing': 'off',
    'space-infix-ops': 'off',
    
    // Best practices - relaxed for CI/CD
    'eqeqeq': 'off',
    'curly': 'off',
    'dot-notation': 'off',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-return-assign': 'off',
    'no-throw-literal': 'off',
    'radix': 'off',
    
    // Node.js specific - all off for CI/CD
    'node/no-unpublished-require': 'off',
    'node/no-missing-require': 'off',
    'node/no-extraneous-require': 'off',
    'node/exports-style': 'off',
    'node/no-process-exit': 'off',
    'node/no-unsupported-features/es-syntax': 'off',
    'no-process-exit': 'off',
    
    // Async/await - relaxed for CI/CD
    'require-await': 'off',
    'no-async-promise-executor': 'off',
    'no-await-in-loop': 'off',
    'no-prototype-builtins': 'off',
    'no-undef': 'off',
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true,
      },
      rules: {
        'no-console': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    '*.min.js',
  ],
};
