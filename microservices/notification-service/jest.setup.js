// Jest setup file for notification-service tests

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
process.env.FRONTEND_URL = 'http://localhost:3008';
process.env.MAIL_HOST = 'test-mail-host';
process.env.MAIL_USER = 'test@example.com';
process.env.MAIL_PASS = 'test-password';

jest.setTimeout(30000);
