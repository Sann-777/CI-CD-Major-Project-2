// Jest setup file for all tests
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Global test variables
global.console = {
  ...console,
  // Suppress console.log in tests unless needed
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// MongoDB Memory Server instance
let mongoServer;

// Setup before all tests
beforeAll(async () => {
  // Start MongoDB Memory Server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  // Stop MongoDB Memory Server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clean up after each test
afterEach(async () => {
  // Clear all collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  // Clear all mocks
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  // Generate test user data
  generateTestUser: () => ({
    firstName: 'Test',
    lastName: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123!',
    accountType: 'Student',
  }),
  
  // Generate test course data
  generateTestCourse: () => ({
    courseName: 'Test Course',
    courseDescription: 'A test course description',
    whatYouWillLearn: 'Test learning outcomes',
    price: 99.99,
    tag: ['test', 'course'],
    category: 'Programming',
    status: 'Draft',
  }),
  
  // Generate JWT token for testing
  generateTestToken: (payload = { id: 'test-user-id' }) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  },
  
  // Mock Express request object
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),
  
  // Mock Express response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Mock Express next function
  mockNext: () => jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MAIL_HOST = 'test-mail-host';
process.env.MAIL_USER = 'test@example.com';
process.env.MAIL_PASS = 'test-password';
process.env.FRONTEND_URL = 'http://localhost:3000';

// Increase timeout for async operations
jest.setTimeout(30000);
