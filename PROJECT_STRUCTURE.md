# StudyNotion Project Structure

## 📁 Current Project Organization

```
studynotion-edtech-project-main/
├── 🚀 MICROSERVICES ARCHITECTURE
│   ├── frontend-microservice/          # Modern React + TypeScript frontend
│   │   ├── src/
│   │   │   ├── components/            # Reusable UI components
│   │   │   ├── pages/                 # Route components
│   │   │   ├── hooks/                 # Custom React hooks
│   │   │   ├── services/              # API services
│   │   │   ├── store/                 # Redux Toolkit store
│   │   │   └── types/                 # TypeScript definitions
│   │   ├── public/                    # Static assets
│   │   ├── package.json               # Frontend dependencies
│   │   └── vite.config.ts             # Vite configuration
│   │
│   └── microservices/                 # Backend microservices
│       ├── api-gateway/               # API Gateway (Port 3000)
│       ├── auth-service/              # Authentication (Port 3001)
│       ├── course-service/            # Course management (Port 3003)
│       ├── payment-service/           # Payment processing (Port 3004)
│       ├── k8s/                       # Kubernetes manifests
│       └── docker-compose.yml         # Docker orchestration
│
├── 📚 LEGACY MONOLITHIC APP
│   └── monolithic-legacy/             # Original monolithic application
│       ├── src/                       # React frontend (legacy)
│       ├── server/                    # Express.js backend (legacy)
│       ├── public/                    # Static assets (legacy)
│       ├── package.json               # Legacy dependencies
│       └── README.md                  # Legacy documentation
│
├── 🔧 DEVOPS & CI/CD
│   ├── .github/workflows/             # GitHub Actions
│   ├── Jenkinsfile                    # Jenkins CI/CD pipeline
│   ├── README.md                      # Complete DevOps guide
│   └── QUICK_START.md                 # Quick start instructions
│
└── 📋 PROJECT CONFIG
    ├── .gitignore                     # Git ignore rules
    ├── .editorconfig                  # Editor configuration
    ├── .prettierignore                # Prettier ignore rules
    ├── .nvmrc                         # Node version
    └── package.json                   # Root package.json for microservices
```

## 🎯 Architecture Overview

### **Microservices (Current/Active)**
- **Frontend**: Modern React 18 + TypeScript + Vite (Port 3008)
- **API Gateway**: Request routing and load balancing (Port 3000)
- **Auth Service**: JWT authentication & authorization (Port 3001)
- **Course Service**: Course management & content (Port 3003)
- **Payment Service**: Razorpay integration (Port 3004)

### **Legacy Monolithic (Reference Only)**
- **Frontend**: Original React app (Port 3000)
- **Backend**: Express.js server (Port 4000)
- **Database**: Single MongoDB instance

## 🚀 Quick Commands

### Microservices Development
```bash
# Install all dependencies
npm run install:all

# Start all services
npm run dev:all

# Build all services
npm run build:all

# Run tests
npm run test:all
```

### Legacy Application (Optional)
```bash
# Run legacy monolithic app
npm run legacy:dev
```

### Docker & Kubernetes
```bash
# Docker operations
npm run docker:build
npm run docker:up
npm run docker:down

# Kubernetes deployment
npm run k8s:deploy
npm run k8s:delete
```

## 📊 Service Ports

| Service | Port | URL |
|---------|------|-----|
| Frontend Microservice | 3008 | http://localhost:3008 |
| API Gateway | 3000 | http://localhost:3000 |
| Auth Service | 3001 | http://localhost:3001 |
| Course Service | 3003 | http://localhost:3003 |
| Payment Service | 3004 | http://localhost:3004 |
| Legacy Frontend | 3000 | http://localhost:3000 |
| Legacy Backend | 4000 | http://localhost:4000 |

## 🔄 Migration Status

✅ **Completed**:
- Microservices architecture implementation
- Modern React frontend with TypeScript
- CI/CD pipeline with Jenkins & ArgoCD
- Docker containerization
- Kubernetes deployment manifests
- Legacy code organization

🚧 **In Progress**:
- Complete service mesh implementation
- Advanced monitoring setup
- Performance optimization

## 📝 Development Guidelines

1. **New Features**: Develop in microservices architecture
2. **Legacy Code**: Kept for reference, avoid modifications
3. **Testing**: Each service has independent test suite
4. **Deployment**: Use CI/CD pipeline for production deployments
5. **Documentation**: Update relevant README files for changes

## 🆘 Need Help?

- **Microservices Setup**: See `README.md`
- **Quick Start**: See `QUICK_START.md`
- **Legacy App**: See `monolithic-legacy/README.md`
- **CI/CD**: Jenkins & ArgoCD sections in main README
