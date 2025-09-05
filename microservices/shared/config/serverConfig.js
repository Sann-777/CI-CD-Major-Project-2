const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

/**
 * Shared server configuration for all microservices
 * Eliminates code duplication and ensures consistency
 */
class ServerConfig {
  constructor(serviceName, defaultPort) {
    this.serviceName = serviceName;
    this.port = process.env.PORT || defaultPort;
    this.app = express();
    this.setupMiddleware();
  }

  setupMiddleware() {
    // Security middleware
    this.app.use(helmet());

    // Rate limiting configuration
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: this.getRateLimitMax(),
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      }
    });
    this.app.use(limiter);

    // CORS configuration
    this.setupCORS();

    // Body parsing middleware
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  setupCORS() {
    const allowedOrigins = [
      'http://localhost:3008',
      'https://studynotion.example.com',
      'http://studynotion.example.com',
      process.env.FRONTEND_URL
    ].filter(Boolean);

    this.app.use(cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Check allowed origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Allow localhost with any port for development
        if (/^https?:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, true);
        }
        
        // Allow LAN IP addresses
        if (this.isLanIpOrigin(origin)) {
          return callback(null, true);
        }
        
        // Allow development mode
        if (process.env.NODE_ENV === 'development') {
          return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      optionsSuccessStatus: 200
    }));
  }

  isLanIpOrigin(origin) {
    return /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(origin) ||
           /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(origin) ||
           /^https?:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+(:\d+)?$/.test(origin);
  }

  getRateLimitMax() {
    const limits = {
      'api-gateway': 1000,
      'auth-service': 100,
      'course-service': 200,
      'payment-service': 50,
      'profile-service': 150,
      'rating-service': 100,
      'media-service': 200,
      'notification-service': 50
    };
    return limits[this.serviceName] || 100;
  }

  async connectToDatabase(dbName) {
    const mongoUri = process.env.MONGODB_URI || `mongodb://localhost:27017/studynotion-${dbName}`;
    
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log(`${this.serviceName}: Connected to MongoDB (${dbName})`);
    } catch (error) {
      console.error(`${this.serviceName}: MongoDB connection error:`, error);
      process.exit(1);
    }
  }

  addHealthCheck() {
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        service: this.serviceName,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }

  addErrorHandler(errorHandler) {
    this.app.use(errorHandler);
  }

  add404Handler() {
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        service: this.serviceName,
        path: req.originalUrl
      });
    });
  }

  start(callback) {
    this.app.listen(this.port, () => {
      console.log(`${this.serviceName} running on port ${this.port}`);
      if (callback) callback();
    });
  }

  getApp() {
    return this.app;
  }

  getPort() {
    return this.port;
  }
}

module.exports = ServerConfig;
