const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const ServerConfig = require('@studynotion/shared/config/serverConfig');

const mediaRoutes = require('./routes/media');
const { errorHandler } = require('./middleware/errorHandler');
const { cloudinaryConnect } = require('./config/cloudinary');

// Create server instance
const server = new ServerConfig('media-service', 3006);
const app = server.getApp();

// Connect to database
server.connectToDatabase('media');

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Connect to Cloudinary
cloudinaryConnect();

// File upload middleware
app.use(fileUpload({
  useTempFiles: true,
<<<<<<< HEAD
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  createParentPath: true
=======
  tempFileDir: '/tmp/'
>>>>>>> delta
}));

// Routes
app.use('/api/v1/media', mediaRoutes);

<<<<<<< HEAD
// Health check endpoint
server.addHealthCheck();

// Error handling middleware
server.addErrorHandler(errorHandler);

// 404 handler
server.add404Handler();

// Start server
server.start();
=======
// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'media-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studynotion-media';
    await mongoose.connect(mongoURI);
    console.log('Media Service: Connected to MongoDB');
  } catch (error) {
    console.error('Media Service: MongoDB connection error:', error);
    process.exit(1);
  }
};

// Error handling
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Media Service running on port ${PORT}`);
  });
});
>>>>>>> delta
