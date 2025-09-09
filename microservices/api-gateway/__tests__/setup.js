// Mock external dependencies for API Gateway testing
jest.mock('http-proxy-middleware', () => {
  return {
    createProxyMiddleware: jest.fn().mockImplementation(() => {
      return (req, res, next) => {
        // Mock proxy middleware behavior
        res.status(200).json({ proxied: true, target: req.url })
      }
    })
  }
})

// Mock axios for service health checks
jest.mock('axios', () => ({
  get: jest.fn().mockResolvedValue({
    status: 200,
    data: { status: 'healthy', service: 'mock-service' }
  }),
  post: jest.fn().mockResolvedValue({
    status: 200,
    data: { success: true }
  })
}))

// Mock JWT verification
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'mock_user_id', role: 'Student' }),
  sign: jest.fn().mockReturnValue('mock_jwt_token')
}))

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.PORT = '0' // Use random available port for tests

// Service URLs for testing
process.env.AUTH_SERVICE_URL = 'http://localhost:3001'
process.env.COURSE_SERVICE_URL = 'http://localhost:3003'
process.env.PAYMENT_SERVICE_URL = 'http://localhost:3002'
process.env.PROFILE_SERVICE_URL = 'http://localhost:3004'
process.env.RATING_SERVICE_URL = 'http://localhost:3005'
process.env.MEDIA_SERVICE_URL = 'http://localhost:3006'
process.env.NOTIFICATION_SERVICE_URL = 'http://localhost:3007'

// Global test setup
beforeAll(() => {
  // Suppress console logs during testing unless needed
  if (process.env.JEST_VERBOSE !== 'true') {
    console.log = jest.fn()
    console.info = jest.fn()
  }
})

afterAll(() => {
  // Cleanup after tests
  jest.clearAllMocks()
})
