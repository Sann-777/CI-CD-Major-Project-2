const ServerConfig = require('../shared/config/serverConfig');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('auth-service', 3001);
const app = server.getApp();

// Connect to database
server.connectToDatabase('auth');

// Routes
app.use('/api/v1/auth', authRoutes);

// Health check
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
