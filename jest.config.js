module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js',
    '**/__tests__/**/*.js',
    '**/*.test.js',
    '**/*.spec.js',
  ],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'microservices/**/controllers/**/*.js',
    'microservices/**/middleware/**/*.js',
    'microservices/**/models/**/*.js',
    'microservices/**/routes/**/*.js',
    'microservices/**/utils/**/*.js',
    'microservices/**/services/**/*.js',
    '!**/node_modules/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // Module paths
  roots: ['<rootDir>/microservices'],
  
  // Transform files
  transform: {},
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Error handling
  errorOnDeprecated: true,
  
  // Projects for different services
  projects: [
    {
      displayName: 'auth-service',
      testMatch: ['<rootDir>/microservices/auth-service/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'course-service',
      testMatch: ['<rootDir>/microservices/course-service/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'profile-service',
      testMatch: ['<rootDir>/microservices/profile-service/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'notification-service',
      testMatch: ['<rootDir>/microservices/notification-service/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'rating-service',
      testMatch: ['<rootDir>/microservices/rating-service/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'api-gateway',
      testMatch: ['<rootDir>/microservices/api-gateway/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
};
