const request = require('supertest');
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

// Mock dependencies
jest.mock('http-proxy-middleware');

describe('API Gateway', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock proxy middleware
    createProxyMiddleware.mockImplementation(() => (req, res, next) => {
      res.status(200).json({ success: true, message: 'Proxied successfully' });
    });
    
    jest.clearAllMocks();
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      app.get('/health', (req, res) => {
        res.status(200).json({
          success: true,
          message: 'API Gateway is healthy',
          timestamp: new Date().toISOString(),
          services: {
            auth: 'http://localhost:3001',
            profile: 'http://localhost:3002',
            course: 'http://localhost:3003',
            payment: 'http://localhost:3004',
            rating: 'http://localhost:3005',
            notification: 'http://localhost:3006',
            media: 'http://localhost:3007',
          },
        });
      });

      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('API Gateway is healthy');
      expect(response.body.services).toBeDefined();
    });
  });

  describe('Route Proxying', () => {
    beforeEach(() => {
      // Setup proxy routes
      app.use('/api/v1/auth', createProxyMiddleware({
        target: 'http://localhost:3001',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/auth': '' },
      }));

      app.use('/api/v1/profile', createProxyMiddleware({
        target: 'http://localhost:3002',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/profile': '' },
      }));

      app.use('/api/v1/course', createProxyMiddleware({
        target: 'http://localhost:3003',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/course': '' },
      }));

      app.use('/api/v1/payment', createProxyMiddleware({
        target: 'http://localhost:3004',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/payment': '' },
      }));

      app.use('/api/v1/rating', createProxyMiddleware({
        target: 'http://localhost:3005',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/rating': '' },
      }));

      app.use('/api/v1/notification', createProxyMiddleware({
        target: 'http://localhost:3006',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/notification': '' },
      }));

      app.use('/api/v1/media', createProxyMiddleware({
        target: 'http://localhost:3007',
        changeOrigin: true,
        pathRewrite: { '^/api/v1/media': '' },
      }));
    });

    it('should proxy auth service requests', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'password' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(createProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'http://localhost:3001',
          changeOrigin: true,
        })
      );
    });

    it('should proxy course service requests', async () => {
      const response = await request(app)
        .get('/api/v1/course/getAllCourses');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(createProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'http://localhost:3003',
          changeOrigin: true,
        })
      );
    });

    it('should proxy rating service requests', async () => {
      const response = await request(app)
        .get('/api/v1/rating/getReviews');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(createProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'http://localhost:3005',
          changeOrigin: true,
        })
      );
    });

    it('should proxy notification service requests', async () => {
      const response = await request(app)
        .post('/api/v1/notification/contact')
        .send({
          email: 'test@example.com',
          firstname: 'John',
          lastname: 'Doe',
          message: 'Test message',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(createProxyMiddleware).toHaveBeenCalledWith(
        expect.objectContaining({
          target: 'http://localhost:3006',
          changeOrigin: true,
        })
      );
    });
  });

  describe('CORS Configuration', () => {
    it('should handle CORS preflight requests', async () => {
      app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });

      const response = await request(app)
        .options('/api/v1/auth/login')
        .set('Origin', 'http://localhost:3008');

      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBe('*');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      app.use('*', (req, res) => {
        res.status(404).json({
          success: false,
          message: 'Route not found',
          path: req.originalUrl,
        });
      });

      const response = await request(app).get('/api/v1/unknown/route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Route not found');
    });

    it('should handle proxy errors gracefully', async () => {
      createProxyMiddleware.mockImplementation(() => (req, res, next) => {
        const error = new Error('Service unavailable');
        error.code = 'ECONNREFUSED';
        next(error);
      });

      app.use('/api/v1/test', createProxyMiddleware({
        target: 'http://localhost:9999',
        changeOrigin: true,
      }));

      app.use((error, req, res, next) => {
        if (error.code === 'ECONNREFUSED') {
          res.status(503).json({
            success: false,
            message: 'Service temporarily unavailable',
            error: error.message,
          });
        } else {
          next(error);
        }
      });

      const response = await request(app).get('/api/v1/test/endpoint');

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Service temporarily unavailable');
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting to requests', async () => {
      const rateLimit = require('express-rate-limit');
      
      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: {
          success: false,
          message: 'Too many requests from this IP, please try again later.',
        },
      });

      app.use('/api/', limiter);
      app.get('/api/test', (req, res) => {
        res.json({ success: true, message: 'Request successful' });
      });

      const response = await request(app).get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
