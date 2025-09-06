const { MongoMemoryServer } = require('mongodb-memory-server')
const mongoose = require('mongoose')

let mongod

beforeAll(async () => {
  try {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri)
  } catch (error) {
    console.warn('Test setup warning:', error.message)
  }
})

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
    console.warn('Test cleanup warning:', error.message)
  }
})

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
    console.warn('Test cleanup warning:', error.message)
  }
})

// Mock Nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'mock_message_id',
      response: '250 Message queued'
    })
  })
}))

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'mock_user_id', role: 'Student' }),
  sign: jest.fn().mockReturnValue('mock_jwt_token')
}))

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.MAIL_HOST = 'smtp.gmail.com'
process.env.MAIL_USER = 'test@example.com'
process.env.MAIL_PASS = 'test_password'
process.env.PORT = '0'
