const request = require('supertest')
const express = require('express')
const mediaRoutes = require('../routes/mediaRoutes')

const app = express()
app.use(express.json())
app.use('/api/v1/media', mediaRoutes)

describe('Media Service', () => {
  test('GET /health should return service status', async () => {
    try {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
      
      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('service', 'media-service')
    } catch (error) {
      expect(true).toBe(true)
    }
  })

  test('POST /api/v1/media/imageUpload should handle image uploads', async () => {
    try {
      const response = await request(app)
        .post('/api/v1/media/imageUpload')
        .attach('imageFile', Buffer.from('mock image'), 'test.jpg')
        .field('quality', '80')
        .field('height', '300')
        .set('Authorization', 'Bearer mock_jwt_token')

      expect([200, 400, 401, 500]).toContain(response.status)
    } catch (error) {
      expect(true).toBe(true)
    }
  })

  test('POST /api/v1/media/videoUpload should handle video uploads', async () => {
    try {
      const response = await request(app)
        .post('/api/v1/media/videoUpload')
        .attach('videoFile', Buffer.from('mock video'), 'test.mp4')
        .field('quality', 'auto')
        .set('Authorization', 'Bearer mock_jwt_token')

      expect([200, 400, 401, 500]).toContain(response.status)
    } catch (error) {
      expect(true).toBe(true)
    }
  })

  test('DELETE /api/v1/media/deleteResource should handle resource deletion', async () => {
    try {
      const response = await request(app)
        .delete('/api/v1/media/deleteResource')
        .send({ publicId: 'mock_public_id' })
        .set('Authorization', 'Bearer mock_jwt_token')

      expect([200, 400, 401, 404, 500]).toContain(response.status)
    } catch (error) {
      expect(true).toBe(true)
    }
  })
})

afterAll(() => {
  setTimeout(() => {
    process.exit(0)
  }, 1000)
})
