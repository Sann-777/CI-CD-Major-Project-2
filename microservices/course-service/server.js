const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const courseRoutes = require('./routes/course');
const categoryRoutes = require('./routes/category');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3008',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studynotion-courses', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Course Service: Connected to MongoDB'))
  .catch(err => console.error('Course Service: MongoDB connection error:', err));

// Routes
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/category', categoryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    service: 'course-service',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.listen(PORT, () => {
  console.log(`Course Service running on port ${PORT}`);
});
