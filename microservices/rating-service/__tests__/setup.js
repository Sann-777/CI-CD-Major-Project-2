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

// Mock JWT
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn().mockReturnValue({ id: 'mock_user_id', role: 'Student' }),
  sign: jest.fn().mockReturnValue('mock_jwt_token')
}))

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test_jwt_secret'
process.env.PORT = '0'
