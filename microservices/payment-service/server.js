const ServerConfig = require('@studynotion/shared/config/serverConfig');
const paymentRoutes = require('./routes/payment');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('payment-service', 3002);
const app = server.getApp();

// Connect to database
server.connectToDatabase('payments');

// Routes
app.use('/api/v1/payment', paymentRoutes);

// Health check
server.addHealthCheck();

// Error handling
server.addErrorHandler(errorHandler);
server.add404Handler();

// Start server
server.start();
