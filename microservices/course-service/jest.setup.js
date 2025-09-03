// Jest setup file for course-service tests
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

// Global test variables
global.console = {
  ...console,
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
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Clean up after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  jest.clearAllMocks();
});

// Global test utilities
global.testUtils = {
  generateTestCourse: () => ({
    courseName: 'Test Course',
    courseDescription: 'A test course description',
    whatYouWillLearn: 'Test learning outcomes',
    price: 99.99,
    tag: ['test', 'course'],
    category: 'Programming',
    status: 'Draft',
  }),
  
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ...overrides,
  }),
  
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },
  
  mockNext: () => jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.MEDIA_SERVICE_URL = 'http://localhost:3007';
process.env.USER_SERVICE_URL = 'http://localhost:3002';
process.env.FRONTEND_URL = 'http://localhost:3008';

jest.setTimeout(30000);
