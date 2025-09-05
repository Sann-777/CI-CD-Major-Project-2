const ServerConfig = require('../shared/config/serverConfig');
const profileRoutes = require('./routes/profile');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('profile-service', 3004);
const app = server.getApp();

// Connect to database
server.connectToDatabase('profiles');

// Routes
app.use('/api/v1/profile', profileRoutes);

// Health check
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
