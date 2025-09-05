const ServerConfig = require('@studynotion/shared/config/serverConfig');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

// Create server instance
const server = new ServerConfig('api-gateway', 4000);
const app = server.getApp();

// Service URLs with correct port mappings
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  course: process.env.COURSE_SERVICE_URL || 'http://localhost:3003',
  payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3002',
  profile: process.env.PROFILE_SERVICE_URL || 'http://localhost:3004',
  rating: process.env.RATING_SERVICE_URL || 'http://localhost:3005',
  media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3006',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007'
};

// Proxy configuration
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  timeout: 30000,
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  onError: (err, req, res) => {
    console.error(`Proxy error for ${target}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: 'PROXY_ERROR',
        service: target
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Proxying ${req.method} ${req.url} to ${target}`);
    }
    
    // Forward authorization headers
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    
    // Handle body for POST/PUT/PATCH requests
    if (req.body && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Response from ${req.url}: ${proxyRes.statusCode}`);
    }
  }
});

// Route proxying with correct paths
app.use('/api/v1/auth', createProxy(services.auth));
app.use('/api/v1/course', createProxy(services.course));
app.use('/api/v1/category', createProxy(services.course));
app.use('/api/v1/payment', createProxy(services.payment));
app.use('/api/v1/profile', createProxy(services.profile));
app.use('/api/v1/rating', createProxy(services.rating));
app.use('/api/v1/notification', createProxy(services.notification));
app.use('/api/v1/reach', createProxy(services.notification));
app.use('/api/v1/media', createProxy(services.media));

// Custom health check for API Gateway
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    services: Object.keys(services)
  });
});

// Comprehensive service health check
app.get('/health/services', async (req, res) => {
  const healthChecks = {};
  
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      const response = await axios.get(`${serviceUrl}/health`, { 
        timeout: 5000 
      });
      healthChecks[serviceName] = {
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        url: serviceUrl,
        responseTime: response.headers['x-response-time'] || 'unknown'
      };
    } catch (error) {
      healthChecks[serviceName] = {
        status: 'unreachable',
        url: serviceUrl,
        error: error.message
      };
    }
  }

  const allHealthy = Object.values(healthChecks).every(check => check.status === 'healthy');

  res.status(200).json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: healthChecks,
    allServicesHealthy: allHealthy
  });
});

// Service discovery endpoint
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    gateway: {
      name: 'api-gateway',
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime()
    },
    services: Object.keys(services).map(name => ({
      name,
      url: services[name],
      endpoints: getServiceEndpoints(name)
    }))
  });
});

// Service endpoints documentation
function getServiceEndpoints(serviceName) {
  const endpoints = {
    auth: [
      'POST /api/v1/auth/login',
      'POST /api/v1/auth/signup',
      'POST /api/v1/auth/sendotp',
      'POST /api/v1/auth/changepassword',
      'POST /api/v1/auth/reset-password-token',
      'POST /api/v1/auth/reset-password'
    ],
    course: [
      'POST /api/v1/course/createCourse',
      'GET /api/v1/course/getAllCourses',
      'POST /api/v1/course/getCourseDetails',
      'GET /api/v1/course/getInstructorCourses',
      'POST /api/v1/course/addSection',
      'POST /api/v1/course/addSubSection',
      'GET /api/v1/category/showAllCategories',
      'POST /api/v1/category/createCategory'
    ],
    payment: [
      'POST /api/v1/payment/capturePayment',
      'POST /api/v1/payment/verifyPayment',
      'GET /api/v1/payment/paymentHistory'
    ],
    profile: [
      'GET /api/v1/profile/getUserDetails',
      'POST /api/v1/profile/updateProfile',
      'GET /api/v1/profile/getEnrolledCourses'
    ],
    rating: [
      'POST /api/v1/rating/createRating',
      'GET /api/v1/rating/getAverageRating',
      'GET /api/v1/rating/getReviews'
    ],
    notification: [
      'POST /api/v1/notification/contact',
      'POST /api/v1/reach/contact'
    ],
    media: [
      'POST /api/v1/media/upload',
      'POST /api/v1/media/upload-video'
    ]
  };
  
  return endpoints[serviceName] || [];
}

// Use shared error handler
const { errorHandler } = require('./middleware/errorHandler');
server.addErrorHandler(errorHandler);

// Custom 404 handler for API Gateway
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    service: 'api-gateway',
    path: req.originalUrl,
    availableRoutes: [
      '/api/v1/auth/*',
      '/api/v1/course/*',
      '/api/v1/category/*',
      '/api/v1/payment/*',
      '/api/v1/profile/*',
      '/api/v1/rating/*',
      '/api/v1/notification/*',
      '/api/v1/media/*',
      '/health',
      '/health/services',
      '/api/services'
    ]
  });
});

// Start server
server.start(() => {
  console.log('Available services:', Object.keys(services).join(', '));
  console.log('Service URLs:', services);
});
