const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

// Setup MongoDB Memory Server before all tests
beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)
  } catch (error) {
    // Gracefully handle setup errors
    console.warn('Test setup warning:', error.message)
  }
})

// Cleanup after all tests
afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase()
      await mongoose.connection.close()
    }
    if (mongod) {
      await mongod.stop()
    }
  } catch (error) {
    // Gracefully handle cleanup errors
    console.warn('Test cleanup warning:', error.message)
  }
})

// Clean up between tests
afterEach(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections
      for (const key in collections) {
        const collection = collections[key]
        await collection.deleteMany({})
      }
    }
  } catch (error) {
    // Gracefully handle cleanup errors
    console.warn('Test cleanup warning:', error.message)
  }
})

// Mock bcryptjs for password hashing
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'mock_user_id', role: 'Student' }),
  sign: jest.fn().mockReturnValue('mock_jwt_token')
}))

// Mock nodemailer for email sending
jest.mock('nodemailer', () => ({
  createTransporter: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock_message_id',
      response: '250 Message queued'
    })
  })
}))

// Mock OTP generator
jest.mock('otp-generator', () => ({
  generate: jest.fn().mockReturnValue('123456')
}))

// Mock crypto-random-string
jest.mock('crypto-random-string', () => ({
  default: jest.fn().mockReturnValue('mock_random_string')
}))

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.MAIL_HOST = 'smtp.gmail.com'
process.env.MAIL_USER = 'test@example.com'
process.env.MAIL_PASS = 'test_password'
process.env.PORT = '0' // Use random available port for tests
