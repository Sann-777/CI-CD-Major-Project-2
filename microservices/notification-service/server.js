const ServerConfig = require('../shared/config/serverConfig');
const contactRoutes = require('./routes/contact');
const { errorHandler } = require('./middleware/errorHandler');

// Create server instance
const server = new ServerConfig('notification-service', 3007);
const app = server.getApp();

// Connect to database
server.connectToDatabase('notifications');

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
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
