const ServerConfig = require('../shared/config/serverConfig');
const courseRoutes = require('./routes/course');
const categoryRoutes = require('./routes/category');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('course-service', 3003);
const app = server.getApp();

// Connect to database
server.connectToDatabase('courses');

// Routes
app.use('/api/v1/course', courseRoutes);
app.use('/api/v1/category', categoryRoutes);

// Health check
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
