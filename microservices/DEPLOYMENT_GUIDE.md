# StudyNotion Microservices Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### 1. Setup Environment
```bash
cd microservices
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Configure Environment Variables
Update the following files with your credentials:
- `.env` (global configuration)
- `auth-service/.env`
- `course-service/.env`
- `payment-service/.env`
- `api-gateway/.env`

### 3. Start Services
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check health
curl http://localhost:3000/health
```

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐
│   Frontend      │────│   API Gateway    │
│   (React)       │    │   Port: 3000     │
│   Port: 3008    │    └──────────────────┘
└─────────────────┘             │
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼──────┐    ┌───────────▼──────┐    ┌──────────▼─────┐
│ Auth Service │    │  Course Service  │    │ Payment Service │
│ Port: 3001   │    │  Port: 3003      │    │ Port: 3004     │
└──────────────┘    └──────────────────┘    └────────────────┘
        │                       │                       │
┌───────▼──────┐    ┌───────────▼──────┐    ┌──────────▼─────┐
│   MongoDB    │    │    MongoDB       │    │    MongoDB     │
│   Auth DB    │    │   Courses DB     │    │  Payment DB   │
└──────────────┘    └──────────────────┘    └────────────────┘
```

## 📋 Service Endpoints

### API Gateway (Port 3000)
- **Health Check**: `GET /health`
- **Service Discovery**: `GET /api/services`

### Auth Service (Port 3001)
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/sendotp` - Send OTP
- `POST /api/v1/auth/changepassword` - Change password
- `POST /api/v1/auth/reset-password-token` - Reset password token
- `POST /api/v1/auth/reset-password` - Reset password

### Course Service (Port 3003)
- `POST /api/v1/course/createCourse` - Create course (Instructor)
- `GET /api/v1/course/getAllCourses` - Get all courses
- `POST /api/v1/course/getCourseDetails` - Get course details
- `GET /api/v1/course/getInstructorCourses` - Get instructor courses
- `POST /api/v1/course/addSection` - Add section (Instructor)
- `POST /api/v1/course/addSubSection` - Add subsection (Instructor)
- `GET /api/v1/category/showAllCategories` - Get categories
- `POST /api/v1/category/createCategory` - Create category (Admin)

### Payment Service (Port 3004)
- `POST /api/v1/payment/capture` - Initiate payment (Student)
- `POST /api/v1/payment/verify` - Verify payment (Student)
- `GET /api/v1/payment/History` - Payment history (Student)

## 🔧 Configuration

### Environment Variables

#### Global (.env)
```env
JWT_SECRET=your_jwt_secret
MAIL_HOST=smtp.gmail.com
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
PAYMENT_KEY=your_payment_key
PAYMENT_SECRET=your_payment_secret
```

#### Service-Specific
Each service has its own `.env.example` file. Copy and configure:
```bash
cp auth-service/.env.example auth-service/.env
cp course-service/.env.example course-service/.env
cp payment-service/.env.example payment-service/.env
cp api-gateway/.env.example api-gateway/.env
```

## 🐳 Docker Commands

```bash
# Build all services
docker-compose build

# Start services in background
docker-compose up -d

# View logs for specific service
docker-compose logs -f auth-service

# Stop all services
docker-compose down

# Remove volumes (careful - deletes data!)
docker-compose down -v

# Restart specific service
docker-compose restart auth-service
```

## 🔍 Monitoring & Health Checks

### Service Health
```bash
# API Gateway health
curl http://localhost:3000/health

# Individual service health
curl http://localhost:3001/health  # Auth
curl http://localhost:3003/health  # Course
curl http://localhost:3004/health  # Payment
```

### Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Last 100 lines
docker-compose logs --tail=100 course-service
```

## 🚀 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml studynotion

# Check services
docker service ls
```

### Using Kubernetes
```bash
# Apply namespace
kubectl apply -f k8s/namespace.yaml

# Deploy MongoDB
kubectl apply -f k8s/mongodb-deployment.yaml

# Deploy services (create deployment files for each service)
kubectl apply -f k8s/
```

## 🔐 Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secrets**: Use strong, unique secrets
3. **Database**: Enable authentication in production
4. **HTTPS**: Use SSL/TLS in production
5. **Rate Limiting**: Configure appropriate limits
6. **CORS**: Restrict origins in production

## 🐛 Troubleshooting

### Common Issues

#### Service Not Starting
```bash
# Check logs
docker-compose logs service-name

# Check if port is in use
lsof -i :3001

# Restart service
docker-compose restart service-name
```

#### Database Connection Issues
```bash
# Check MongoDB container
docker-compose logs mongodb-auth

# Verify connection string
docker-compose exec auth-service env | grep MONGODB_URI
```

#### API Gateway Not Routing
```bash
# Check service URLs in API Gateway
docker-compose logs api-gateway

# Verify service discovery
curl http://localhost:3000/api/services
```

## 📊 Performance Monitoring

### Metrics to Monitor
- Response times
- Error rates
- Database connections
- Memory usage
- CPU usage

### Tools
- Prometheus + Grafana
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Docker stats: `docker stats`

## 🔄 CI/CD Pipeline

The project includes GitHub Actions workflow:
- **Test**: Runs tests for all services
- **Build**: Creates Docker images
- **Security**: Vulnerability scanning
- **Deploy**: Automated deployment to staging/production

### Triggering Deployment
```bash
# Push to main branch triggers production deployment
git push origin main

# Push to develop branch triggers staging deployment
git push origin develop
```

## 📞 Support

For issues and questions:
1. Check logs: `docker-compose logs -f`
2. Verify health endpoints
3. Check environment variables
4. Review this guide
5. Create GitHub issue with logs and error details
