# Migration Guide: Monolith to Microservices

## 🔄 Migration Strategy

### Phase 1: Preparation
1. **Backup existing data**
2. **Set up microservices infrastructure**
3. **Configure environment variables**
4. **Test microservices independently**

### Phase 2: Data Migration
1. **Export data from monolithic database**
2. **Transform data for microservices**
3. **Import data to respective service databases**

### Phase 3: Frontend Integration
1. **Update API endpoints in frontend**
2. **Test all user flows**
3. **Update authentication flow**

### Phase 4: Go Live
1. **Deploy microservices**
2. **Switch traffic to API Gateway**
3. **Monitor and validate**

## 📊 Data Migration Scripts

### Export from Monolith
```javascript
// scripts/export-data.js
const mongoose = require('mongoose');

// Connect to monolithic database
mongoose.connect('mongodb://localhost:27017/studynotion-monolith');

// Export users for auth service
const exportUsers = async () => {
  const users = await User.find({}).select('firstName lastName email password accountType active approved image token resetPasswordExpires');
  return users;
};

// Export courses for course service
const exportCourses = async () => {
  const courses = await Course.find({}).populate('courseContent category');
  return courses;
};

// Export payments for payment service
const exportPayments = async () => {
  // Extract payment data from existing structure
  return payments;
};
```

### Import to Microservices
```javascript
// scripts/import-data.js
const importToAuthService = async (users) => {
  // Connect to auth service database
  mongoose.connect('mongodb://localhost:27017/studynotion-auth');
  
  for (const user of users) {
    await AuthUser.create(user);
  }
};
```

## 🔧 Frontend Updates

### API Endpoint Changes
```javascript
// Before (Monolith)
const API_BASE = 'http://localhost:4000/api/v1';

// After (Microservices via API Gateway)
const API_BASE = 'http://localhost:3000/api/v1';

// Endpoints remain the same, but now routed through API Gateway
```

### Authentication Updates
```javascript
// services/authAPI.js
const API_BASE = process.env.REACT_APP_API_GATEWAY_URL || 'http://localhost:3000';

export const authAPI = {
  login: (data) => axios.post(`${API_BASE}/api/v1/auth/login`, data),
  signup: (data) => axios.post(`${API_BASE}/api/v1/auth/signup`, data),
  // ... other auth endpoints
};
```

## 🚀 Deployment Checklist

### Pre-Migration
- [ ] Backup monolithic database
- [ ] Set up microservices environment
- [ ] Configure all environment variables
- [ ] Test each microservice independently
- [ ] Verify API Gateway routing
- [ ] Test frontend with microservices

### Migration Day
- [ ] Stop monolithic application
- [ ] Run data migration scripts
- [ ] Start microservices
- [ ] Update DNS/load balancer
- [ ] Verify all services are healthy
- [ ] Test critical user flows
- [ ] Monitor logs and metrics

### Post-Migration
- [ ] Monitor application performance
- [ ] Check error rates
- [ ] Validate data integrity
- [ ] Collect user feedback
- [ ] Optimize based on metrics

## 🔍 Testing Strategy

### Unit Tests
Each microservice includes unit tests:
```bash
cd microservices/auth-service
npm test
```

### Integration Tests
Test service-to-service communication:
```javascript
// tests/integration/auth-course.test.js
describe('Auth-Course Integration', () => {
  it('should create course with valid instructor token', async () => {
    // Test auth service token validation
    // Test course creation
  });
});
```

### End-to-End Tests
Test complete user workflows:
```javascript
// tests/e2e/user-journey.test.js
describe('Student Course Purchase Journey', () => {
  it('should allow student to purchase and access course', async () => {
    // Login -> Browse -> Purchase -> Access
  });
});
```

## 📈 Monitoring & Observability

### Metrics to Track
- **Response Times**: API Gateway and individual services
- **Error Rates**: 4xx and 5xx responses
- **Throughput**: Requests per second
- **Database Performance**: Query times, connections
- **Resource Usage**: CPU, memory, disk

### Logging Strategy
```javascript
// Structured logging across all services
const logger = require('winston');

logger.info('User login attempt', {
  service: 'auth-service',
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString()
});
```

## 🔐 Security Considerations

### Service-to-Service Communication
- Use internal network for service communication
- Implement service authentication
- Validate requests between services

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all external communication
- Implement proper input validation

### Access Control
- JWT tokens for user authentication
- Role-based access control (RBAC)
- API rate limiting

## 🐛 Rollback Plan

### Quick Rollback
1. **Stop microservices**
2. **Start monolithic application**
3. **Restore database from backup**
4. **Update DNS/load balancer**

### Gradual Rollback
1. **Route specific endpoints back to monolith**
2. **Migrate data back incrementally**
3. **Monitor and validate**

## 📞 Support & Troubleshooting

### Common Issues

#### Service Discovery Problems
```bash
# Check if services are registered correctly
curl http://localhost:3000/api/services

# Verify service health
curl http://localhost:3001/health
```

#### Database Connection Issues
```bash
# Check MongoDB containers
docker-compose ps

# Verify connection strings
docker-compose exec auth-service env | grep MONGODB_URI
```

#### Authentication Failures
```bash
# Check JWT secret consistency across services
# Verify token validation logic
# Check CORS configuration
```

### Performance Issues
```bash
# Monitor resource usage
docker stats

# Check service logs
docker-compose logs -f auth-service

# Verify database performance
# Check for N+1 queries
# Monitor connection pools
```
