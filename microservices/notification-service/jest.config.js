module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: false,
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 10000,
};
