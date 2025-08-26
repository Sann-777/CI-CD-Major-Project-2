# StudyNotion - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

### 1. Frontend Microservice Setup
```bash
cd frontend-microservice
npm install
npm run dev
```
✅ **Frontend running at**: http://localhost:3008

### 2. Backend Microservices Setup

#### Start API Gateway
```bash
cd microservices/api-gateway
npm install
npm run dev
```
✅ **API Gateway running at**: http://localhost:3000

#### Start Auth Service
```bash
cd microservices/auth-service
npm install
npm run dev
```
✅ **Auth Service running at**: http://localhost:3001

#### Start Course Service
```bash
cd microservices/course-service
npm install
npm run dev
```
✅ **Course Service running at**: http://localhost:3003

### Alternative: Run All Services at Once
```bash
# Install all dependencies
npm run install:all

# Start all microservices
npm run dev:all
```

### 3. Legacy Monolithic Application (Optional)
If you need to run the original monolithic version:
```bash
cd monolithic-legacy
npm install
npm run dev
```
✅ **Legacy Frontend**: http://localhost:3000
✅ **Legacy Backend**: http://localhost:4000

### 4. Environment Variables

Create `.env` files in each service directory:

#### Frontend (.env)
```env
VITE_API_GATEWAY_URL=http://localhost:4000
VITE_NODE_ENV=development
```

#### Backend Services (.env for each)
```env
MONGODB_URI=mongodb://localhost:27017/studynotion
JWT_SECRET=your-super-secret-jwt-key
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

### 4. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
```

#### Option B: MongoDB Atlas
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Get connection string
3. Update `MONGODB_URI` in `.env` files

### 5. Test the Application

1. **Frontend**: http://localhost:3000
2. **API Gateway**: http://localhost:4000/health
3. **Auth Service**: http://localhost:4001/health
4. **Course Service**: http://localhost:4002/health

## ✅ What's Working

### Frontend Features
- ✅ Modern React 18 + TypeScript + Vite
- ✅ TanStack React Query for server state
- ✅ Zustand for client state management
- ✅ Tailwind CSS + responsive design
- ✅ React Router v6 navigation
- ✅ Form validation with React Hook Form + Zod
- ✅ Toast notifications
- ✅ Authentication flow components
- ✅ Dashboard layouts (Student & Instructor)
- ✅ Course catalog and details pages
- ✅ Protected routes with role-based access

### Backend Architecture
- ✅ Microservices architecture
- ✅ API Gateway for routing
- ✅ Service discovery
- ✅ Health check endpoints
- ✅ JWT authentication
- ✅ MongoDB integration
- ✅ Error handling and logging

### Development Tools
- ✅ TypeScript configuration
- ✅ ESLint + Prettier
- ✅ Vite build optimization
- ✅ React Query Devtools
- ✅ Hot module replacement

## 🔧 Development Commands

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

### Backend
```bash
npm run dev          # Start service in development
npm start            # Start service in production
npm test             # Run tests
npm run lint         # Run ESLint
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Check if ports 3000, 4000-4007 are available
2. **MongoDB connection**: Ensure MongoDB is running
3. **Environment variables**: Check all `.env` files are configured
4. **Dependencies**: Run `npm install` in each service directory

### Health Checks
```bash
# Check all services
curl http://localhost:4000/health

# Check individual services
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # Course
```

## 📚 Next Steps

1. **Configure external services**:
   - Cloudinary for media storage
   - Razorpay for payments
   - Email service (Gmail/SendGrid)

2. **Add more services**:
   - Payment service (Port 4003)
   - Profile service (Port 4004)
   - Rating service (Port 4005)
   - Notification service (Port 4006)
   - Media service (Port 4007)

3. **Deploy to production**:
   - Use Docker Compose for containerization
   - Deploy to cloud platforms (AWS, GCP, Azure)
   - Set up CI/CD with GitHub Actions

## 🆘 Need Help?

- Check the main [README.md](./README.md) for detailed documentation
- Review service logs for error messages
- Ensure all prerequisites are installed
- Verify environment variables are set correctly

---

**Happy Coding! 🚀**
