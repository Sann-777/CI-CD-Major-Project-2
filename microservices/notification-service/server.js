<<<<<<< HEAD
const ServerConfig = require('@studynotion/shared/config/serverConfig');
=======
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
require('dotenv').config();

>>>>>>> delta
const contactRoutes = require('./routes/contact');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('notification-service', 3007);
const app = server.getApp();

<<<<<<< HEAD
// Connect to database
server.connectToDatabase('notifications');
=======
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
>>>>>>> delta

// Routes
app.use('/api/v1/notification', contactRoutes);
app.use('/api/v1/reach', contactRoutes);

// Health check
<<<<<<< HEAD
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
=======
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'notification-service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studynotion-notification';
    await mongoose.connect(mongoURI);
    console.log('Notification Service: Connected to MongoDB');
  } catch (error) {
    console.error('Notification Service: MongoDB connection error:', error);
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
    console.log(`Notification Service running on port ${PORT}`);
  });
});
>>>>>>> delta
