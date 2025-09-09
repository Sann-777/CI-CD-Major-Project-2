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

// Mock external dependencies
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload: jest.fn().mockResolvedValue({
        secure_url: 'https://mock-cloudinary.com/test.jpg',
        public_id: 'mock_public_id'
      })
    }
  }
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
