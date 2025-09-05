const request = require('supertest');
const ServerConfig = require('../config/serverConfig');

describe('ServerConfig', () => {
  let server;
  let app;

  beforeEach(() => {
    server = new ServerConfig('test-service', 3999);
    app = server.getApp();
  });

  afterEach(async () => {
    if (server && server.server) {
      await new Promise(resolve => server.server.close(resolve));
    }
  });

  describe('Constructor', () => {
    it('should create server with correct service name and port', () => {
      expect(server.serviceName).toBe('test-service');
      expect(server.getPort()).toBe(3999);
    });

    it('should use environment PORT if available', () => {
      process.env.PORT = '4000';
      const envServer = new ServerConfig('env-test', 3999);
      expect(envServer.getPort()).toBe('4000');
      delete process.env.PORT;
    });
  });

  describe('CORS Configuration', () => {
    it('should allow localhost origins', async () => {
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://localhost:3008')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.status).toBe(200);
    });

    it('should allow LAN IP origins', async () => {
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://192.168.1.100:3008')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.status).toBe(200);
    });

    it('should reject invalid origins in production', async () => {
      process.env.NODE_ENV = 'production';
      const response = await request(app)
        .options('/')
        .set('Origin', 'http://malicious-site.com')
        .set('Access-Control-Request-Method', 'GET');
      
      expect(response.status).toBe(500);
      delete process.env.NODE_ENV;
    });
  });

  describe('Rate Limiting', () => {
    it('should apply rate limiting based on service type', () => {
      const authServer = new ServerConfig('auth-service', 3001);
      const gatewayServer = new ServerConfig('api-gateway', 3000);
      
      expect(authServer.getRateLimitMax()).toBe(100);
      expect(gatewayServer.getRateLimitMax()).toBe(1000);
    });
  });

  describe('Health Check', () => {
    beforeEach(() => {
      server.addHealthCheck();
    });

    it('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        service: 'test-service',
        status: 'healthy',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        memory: expect.any(Object),
        version: expect.any(String)
      });
    });
  });

  describe('404 Handler', () => {
    beforeEach(() => {
      server.add404Handler();
    });

    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown-route');
      
      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        success: false,
        message: 'Route not found',
        service: 'test-service',
        path: '/unknown-route'
      });
    });
  });

  describe('LAN IP Detection', () => {
    it('should detect valid LAN IP addresses', () => {
      expect(server.isLanIpOrigin('http://192.168.1.100:3008')).toBe(true);
      expect(server.isLanIpOrigin('http://10.0.0.1:3008')).toBe(true);
      expect(server.isLanIpOrigin('http://172.16.0.1:3008')).toBe(true);
    });

    it('should reject invalid IP addresses', () => {
      expect(server.isLanIpOrigin('http://8.8.8.8:3008')).toBe(false);
      expect(server.isLanIpOrigin('http://malicious.com')).toBe(false);
    });
  });

  describe('Middleware Setup', () => {
    it('should handle JSON requests', async () => {
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test')
        .send({ test: 'data' })
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ test: 'data' });
    });

    it('should handle URL encoded requests', async () => {
      app.post('/test-form', (req, res) => {
        res.json({ received: req.body });
      });

      const response = await request(app)
        .post('/test-form')
        .send('name=test&value=123')
        .set('Content-Type', 'application/x-www-form-urlencoded');

      expect(response.status).toBe(200);
      expect(response.body.received).toEqual({ name: 'test', value: '123' });
    });
  });

  describe('Error Handling', () => {
    it('should handle errors with custom error handler', async () => {
      const errorHandler = (err, req, res, next) => {
        res.status(500).json({ error: 'Custom error handler' });
      };

      server.addErrorHandler(errorHandler);

      app.get('/error-test', (req, res, next) => {
        const error = new Error('Test error');
        next(error);
      });

      const response = await request(app).get('/error-test');
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Custom error handler');
    });
  });
});
