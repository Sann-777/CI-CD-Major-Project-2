const ServerConfig = require('@studynotion/shared/config/serverConfig');
const contactRoutes = require('./routes/contact');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('notification-service', 3007);
const app = server.getApp();

// Connect to database
server.connectToDatabase('notifications');

// Routes
app.use('/api/v1/notification', contactRoutes);
app.use('/api/v1/reach', contactRoutes);

// Health check
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
