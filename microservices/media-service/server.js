const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const ServerConfig = require('../shared/config/serverConfig');

const mediaRoutes = require('./routes/media');
const { errorHandler } = require('./middleware/errorHandler');
const { cloudinaryConnect } = require('./config/cloudinary');

// Create server instance
const server = new ServerConfig('media-service', 3006);
const app = server.getApp();

// Connect to Cloudinary
cloudinaryConnect();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50 // Lower limit for file uploads
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
  credentials: true
}));

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  createParentPath: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/media', mediaRoutes);

// Health check endpoint
server.addHealthCheck();

// Error handling middleware
server.addErrorHandler(errorHandler);

// 404 handler
server.add404Handler();

// Start server
server.start();
