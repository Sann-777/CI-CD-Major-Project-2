// Jest setup file for api-gateway tests

// Global test variables
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.testUtils = {
  mockRequest: (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    method: 'GET',
    originalUrl: '/',
    ...overrides,
  }),
  
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.header = jest.fn().mockReturnValue(res);
    res.headers = {};
    return res;
  },
  
  mockNext: () => jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.FRONTEND_URL = 'http://localhost:3008';
process.env.AUTH_SERVICE_URL = 'http://localhost:3001';
process.env.PROFILE_SERVICE_URL = 'http://localhost:3002';
process.env.COURSE_SERVICE_URL = 'http://localhost:3003';
process.env.PAYMENT_SERVICE_URL = 'http://localhost:3004';
process.env.RATING_SERVICE_URL = 'http://localhost:3005';
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3006';
process.env.MEDIA_SERVICE_URL = 'http://localhost:3007';

jest.setTimeout(30000);
