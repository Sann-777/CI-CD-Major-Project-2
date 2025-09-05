const ServerConfig = require('../shared/config/serverConfig');
const ratingRoutes = require('./routes/rating');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('rating-service', 3005);
const app = server.getApp();

// Connect to database
server.connectToDatabase('ratings');

// Routes
app.use('/api/v1/rating', ratingRoutes);

// Health check
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
