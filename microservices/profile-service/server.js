const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const profileRoutes = require('./routes/profile');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3002;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studynotion-profiles', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Profile Service: Connected to MongoDB'))
.catch(err => console.error('Profile Service: MongoDB connection error:', err));

// Routes
app.use('/api/v1/profile', profileRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'profile-service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`Profile Service running on port ${PORT}`);
});
