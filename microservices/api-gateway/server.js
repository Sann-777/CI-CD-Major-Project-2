const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000 // limit each IP to 1000 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  profile: process.env.PROFILE_SERVICE_URL || 'http://localhost:3004',
  course: process.env.COURSE_SERVICE_URL || 'http://localhost:3003',
  rating: process.env.RATING_SERVICE_URL || 'http://localhost:3005',
  notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
  media: process.env.MEDIA_SERVICE_URL || 'http://localhost:3006'
};

// Proxy configuration
const createProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  timeout: 30000,
  logLevel: 'debug',
  onError: (err, req, res) => {
    console.error(`Proxy error for ${target}:`, err.message);
    if (!res.headersSent) {
      res.status(503).json({
        success: false,
        message: 'Service temporarily unavailable',
        error: 'PROXY_ERROR'
      });
    }
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to ${target}`);
    // Forward original headers
    if (req.headers.authorization) {
      proxyReq.setHeader('Authorization', req.headers.authorization);
    }
    // Handle body for POST requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH')) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Response from ${req.url}: ${proxyRes.statusCode}`);
  }
});

// Route proxying
app.use('/api/v1/auth', createProxy(services.auth));
app.use('/api/v1/profile', createProxy(services.profile));
app.use('/api/v1/course', createProxy(services.course));
app.use('/api/v1/category', createProxy(services.course));
app.use('/api/v1/rating', createProxy(services.rating));
app.use('/api/v1/notification', createProxy(services.notification));
app.use('/api/v1/reach', createProxy(services.notification));
app.use('/api/v1/media', createProxy(services.media));

// Health check endpoint
app.get('/health', async (req, res) => {
  const healthChecks = {};
  
  // Check health of all services
  for (const [serviceName, serviceUrl] of Object.entries(services)) {
    try {
      const axios = require('axios');
      const response = await axios.get(`${serviceUrl}/health`, { 
        timeout: 5000 
      });
      healthChecks[serviceName] = response.status === 200 ? 'healthy' : 'unhealthy';
    } catch (error) {
      healthChecks[serviceName] = 'unreachable';
    }
  }

  const allHealthy = Object.values(healthChecks).every(status => status === 'healthy');

  res.status(allHealthy ? 200 : 503).json({
    service: 'api-gateway',
    status: allHealthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    services: healthChecks
  });
});

// Service discovery endpoint
app.get('/api/services', (req, res) => {
  res.json({
    success: true,
    services: Object.keys(services).map(name => ({
      name,
      url: services[name],
      endpoints: getServiceEndpoints(name)
    }))
  });
});

// Get service endpoints
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
    profile: [
      'GET /api/v1/profile/getUserDetails',
      'POST /api/v1/profile/updateProfile',
      'GET /api/v1/profile/getEnrolledCourses'
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal gateway error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    availableRoutes: [
      '/api/v1/auth/*',
      '/api/v1/profile/*',
      '/api/v1/course/*',
      '/api/v1/category/*',
      '/api/v1/rating/*',
      '/api/v1/notification/*',
      '/api/v1/media/*'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available services:', Object.keys(services).join(', '));
});
