# StudyNotion EdTech Platform - Complete DevOps Guide

StudyNotion is a fully functional ed-tech platform built with microservices architecture using the MERN stack (MongoDB, ExpressJS, ReactJS, NodeJS) with comprehensive CI/CD pipeline using Jenkins and GitOps deployment with ArgoCD.

## 🏗️ Architecture Overview

The platform consists of:

### Frontend (Modern React with TypeScript)
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Redux Toolkit + TanStack React Query
- **Styling**: Tailwind CSS + Framer Motion
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **Port**: 3008 (Development), 80/443 (Production)

### Backend (Microservices Architecture)
- **API Gateway**: Express.js proxy server (Port 3000)
- **Auth Service**: JWT authentication & authorization (Port 3001)
- **Profile Service**: User profile management (Port 3002)
- **Course Service**: Course management & content (Port 3003)
- **Payment Service**: Razorpay integration (Port 3004)
- **Rating Service**: Reviews & ratings (Port 3005)
- **Notification Service**: Email & push notifications (Port 3006)
- **Media Service**: Cloudinary integration (Port 3007)

### Infrastructure & DevOps
- **Database**: MongoDB with separate databases per service
- **Media Storage**: Cloudinary
- **Payment Gateway**: Razorpay
- **Email Service**: Nodemailer
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **CI/CD**: Jenkins Pipeline
- **GitOps**: ArgoCD for deployment automation
- **Monitoring**: Prometheus + Grafana (optional)
- **Service Mesh**: Istio (optional)

## 🚀 Quick Start Guide

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18+ 
- **npm**: v8+
- **MongoDB**: v6+ (local or Atlas)
- **Git**: Latest version
- **Docker**: v20+ (optional)
- **Docker Compose**: v2+ (optional)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd studynotion-edtech-project-main

# Install dependencies for all services
npm run install:all
```

### 2. Environment Configuration

Create environment files for each service:

#### Frontend Environment (.env)
```bash
# Navigate to frontend
cd frontend-microservices
cp .env.example .env

# Edit .env with your values
VITE_API_GATEWAY_URL=http://localhost:4000
VITE_NODE_ENV=development
VITE_ENABLE_DEVTOOLS=true
```

#### Backend Services Environment
```bash
# API Gateway
cd microservices/api-gateway
cp .env.example .env

# Auth Service
cd ../auth-service
cp .env.example .env

# Course Service
cd ../course-service
cp .env.example .env

# Continue for all services...
```

#### Required Environment Variables

**Common for all backend services:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/studynotion
DB_NAME=studynotion

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password

# Cloudinary (for media service)
CLOUD_NAME=your-cloudinary-name
API_KEY=your-cloudinary-key
API_SECRET=your-cloudinary-secret

# Razorpay (for payment service)
RAZORPAY_KEY=your-razorpay-key
RAZORPAY_SECRET=your-razorpay-secret

# Service Discovery
SERVICE_REGISTRY_URL=http://localhost:4000/api/services
```

### 3. Database Setup

#### Option A: Local MongoDB
```bash
# Start MongoDB service
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS

# Create database and user
mongosh
use studynotion
db.createUser({
  user: "studynotion",
  pwd: "password",
  roles: ["readWrite"]
})
```

#### Option B: MongoDB Atlas
1. Create account at [MongoDB Atlas](https://cloud.mongodb.com)
2. Create cluster and get connection string
3. Update `MONGODB_URI` in environment files

### 4. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend-microservices
npm install

# Install backend dependencies
cd ../microservices
npm run install:all
```

## 🏃‍♂️ Running the Application

### Development Mode (Recommended)

#### Option 1: Run All Services with Docker Compose
```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f
```

#### Option 2: Run Services Individually
```bash
# Terminal 1: Start API Gateway
cd microservices/api-gateway
npm run dev

# Terminal 2: Start Auth Service
cd microservices/auth-service
npm run dev

# Terminal 3: Start Course Service
cd microservices/course-service
npm run dev

# Terminal 4: Start Frontend
cd frontend-microservices
npm run dev

# Continue for other services...
```

#### Option 3: Use Process Manager (PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start all services
npm run start:all

# Monitor services
pm2 monit

# Stop all services
npm run stop:all
```

### Production Mode

```bash
# Build frontend
cd frontend-microservices
npm run build

# Build and start backend services
cd ../microservices
npm run build:all
npm run start:prod
```

## 📋 Service URLs & Health Checks

Once running, access these URLs:

### Frontend
- **Main App**: http://localhost:3000
- **Dev Tools**: React Query Devtools available in development

### Backend Services
- **API Gateway**: http://localhost:4000
- **Auth Service**: http://localhost:4001
- **Course Service**: http://localhost:4002
- **Payment Service**: http://localhost:4003
- **Profile Service**: http://localhost:4004
- **Rating Service**: http://localhost:4005
- **Notification Service**: http://localhost:4006
- **Media Service**: http://localhost:4007

### Health Check Endpoints
```bash
# Check all services health
curl http://localhost:4000/health

# Individual service health
curl http://localhost:4001/health  # Auth
curl http://localhost:4002/health  # Course
# ... etc
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend-microservices

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Backend Testing
```bash
cd microservices

# Test all services
npm run test:all

# Test specific service
cd auth-service
npm test
```

### E2E Testing
```bash
# Install Playwright
npm install -g @playwright/test

# Run E2E tests
npm run test:e2e
```

## 🚀 CI/CD Pipeline with Jenkins & ArgoCD

### Overview
This project implements a complete DevOps pipeline using:
- **Jenkins**: Continuous Integration (CI) - Build, Test, Package
- **ArgoCD**: Continuous Deployment (CD) - GitOps-based deployment
- **Docker**: Containerization
- **Kubernetes**: Orchestration
- **Helm**: Package management (optional)

### Pipeline Architecture
```
Developer → Git Push → Jenkins → Docker Build → Registry → ArgoCD → Kubernetes
```

## 📋 Prerequisites for CI/CD

### Infrastructure Requirements
- **Jenkins Server**: v2.400+ with required plugins
- **Kubernetes Cluster**: v1.25+ (EKS, GKE, AKS, or on-premise)
- **ArgoCD**: v2.8+ installed on Kubernetes
- **Docker Registry**: Docker Hub, ECR, GCR, or Harbor
- **Git Repository**: GitHub, GitLab, or Bitbucket

### Required Tools
```bash
# On Jenkins server
- Docker v20+
- kubectl v1.25+
- Node.js v18+
- npm v8+
- Git v2.30+

# On local machine (for setup)
- kubectl configured for your cluster
- helm v3+ (optional)
- argocd CLI v2.8+
```

## 🔧 Jenkins Setup & Configuration

### 1. Jenkins Installation

#### Option A: Docker Installation
```bash
# Create Jenkins directory
mkdir -p /opt/jenkins/data
chown 1000:1000 /opt/jenkins/data

# Run Jenkins container
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v /opt/jenkins/data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v $(which docker):/usr/bin/docker \
  jenkins/jenkins:lts
```

#### Option B: Kubernetes Installation
```bash
# Add Jenkins Helm repository
helm repo add jenkins https://charts.jenkins.io
helm repo update

# Install Jenkins
helm install jenkins jenkins/jenkins \
  --namespace jenkins \
  --create-namespace \
  --set controller.serviceType=LoadBalancer \
  --set persistence.enabled=true \
  --set persistence.size=20Gi
```

### 2. Required Jenkins Plugins

Install these plugins via Jenkins UI (Manage Jenkins → Manage Plugins):

```
# Essential Plugins
- Pipeline
- Git
- Docker Pipeline
- Kubernetes
- Blue Ocean
- Credentials Binding
- Workspace Cleanup
- Timestamper
- Build Timeout

# Optional but Recommended
- SonarQube Scanner
- OWASP Dependency Check
- Slack Notification
- Email Extension
```

### 3. Jenkins Global Configuration

#### Configure Docker
```bash
# In Jenkins: Manage Jenkins → Global Tool Configuration
# Add Docker installation:
Name: docker
Install automatically: ✓
Version: latest
```

#### Configure Kubernetes
```bash
# In Jenkins: Manage Jenkins → Configure System
# Add Kubernetes Cloud:
Name: kubernetes
Kubernetes URL: https://your-k8s-api-server
Kubernetes Namespace: jenkins
Credentials: Add kubeconfig or service account token
```

#### Add Credentials
```bash
# In Jenkins: Manage Jenkins → Manage Credentials
# Add these credentials:

1. Docker Registry Credentials
   - ID: docker-registry-creds
   - Type: Username with password
   - Username: your-registry-username
   - Password: your-registry-password

2. Git Repository Credentials
   - ID: git-repo-creds
   - Type: SSH Username with private key or Username with password

3. Kubernetes Service Account
   - ID: k8s-service-account
   - Type: Secret text
   - Secret: your-k8s-service-account-token

4. SonarQube Token (optional)
   - ID: sonarqube-token
   - Type: Secret text
```

### 4. Create Jenkins Pipeline

#### Create Jenkinsfile
Create `Jenkinsfile` in project root:

```groovy
pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        DOCKER_REPO = 'studynotion'
        K8S_NAMESPACE = 'studynotion'
        ARGOCD_APP_NAME = 'studynotion-app'
        SONAR_PROJECT_KEY = 'studynotion'
    }
    
    tools {
        nodejs '18'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend-microservice') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        script {
                            def services = ['api-gateway', 'auth-service', 'course-service', 'payment-service']
                            services.each { service ->
                                dir("microservices/${service}") {
                                    sh 'npm ci'
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Code Quality & Security') {
            parallel {
                stage('Lint Frontend') {
                    steps {
                        dir('frontend-microservice') {
                            sh 'npm run lint'
                        }
                    }
                }
                stage('Lint Backend') {
                    steps {
                        script {
                            def services = ['api-gateway', 'auth-service', 'course-service', 'payment-service']
                            services.each { service ->
                                dir("microservices/${service}") {
                                    sh 'npm run lint || true'
                                }
                            }
                        }
                    }
                }
                stage('Security Scan') {
                    steps {
                        script {
                            // Frontend security scan
                            dir('frontend-microservice') {
                                sh 'npm audit --audit-level moderate || true'
                            }
                            
                            // Backend security scan
                            def services = ['api-gateway', 'auth-service', 'course-service', 'payment-service']
                            services.each { service ->
                                dir("microservices/${service}") {
                                    sh 'npm audit --audit-level moderate || true'
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Test') {
            parallel {
                stage('Frontend Tests') {
                    steps {
                        dir('frontend-microservice') {
                            sh 'npm test -- --coverage --watchAll=false'
                        }
                    }
                    post {
                        always {
                            publishHTML([
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'frontend-microservice/coverage/lcov-report',
                                reportFiles: 'index.html',
                                reportName: 'Frontend Coverage Report'
                            ])
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        script {
                            def services = ['api-gateway', 'auth-service', 'course-service', 'payment-service']
                            services.each { service ->
                                dir("microservices/${service}") {
                                    sh 'npm test || true'
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('SonarQube Analysis') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                        -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=**/node_modules/**,**/coverage/**,**/*.test.js \
                        -Dsonar.javascript.lcov.reportPaths=frontend-microservice/coverage/lcov.info
                    """
                }
            }
        }
        
        stage('Build Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontend-microservice') {
                            script {
                                sh 'npm run build'
                                def frontendImage = docker.build(
                                    "${DOCKER_REGISTRY}/${DOCKER_REPO}/frontend:${BUILD_TAG}",
                                    "-f Dockerfile ."
                                )
                                docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-creds') {
                                    frontendImage.push()
                                    frontendImage.push('latest')
                                }
                            }
                        }
                    }
                }
                stage('Build Backend Services') {
                    steps {
                        script {
                            def services = ['api-gateway', 'auth-service', 'course-service', 'payment-service']
                            services.each { service ->
                                dir("microservices/${service}") {
                                    def serviceImage = docker.build(
                                        "${DOCKER_REGISTRY}/${DOCKER_REPO}/${service}:${BUILD_TAG}",
                                        "-f Dockerfile ."
                                    )
                                    docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-creds') {
                                        serviceImage.push()
                                        serviceImage.push('latest')
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        
        stage('Update Deployment Manifests') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    // Update Kubernetes manifests with new image tags
                    def services = ['frontend', 'api-gateway', 'auth-service', 'course-service', 'payment-service']
                    services.each { service ->
                        sh """
                            sed -i 's|${DOCKER_REGISTRY}/${DOCKER_REPO}/${service}:.*|${DOCKER_REGISTRY}/${DOCKER_REPO}/${service}:${BUILD_TAG}|g' \
                            k8s/deployments/${service}-deployment.yaml
                        """
                    }
                    
                    // Commit and push updated manifests to GitOps repository
                    withCredentials([usernamePassword(credentialsId: 'git-repo-creds', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                        sh """
                            git config user.name "Jenkins CI"
                            git config user.email "jenkins@studynotion.com"
                            git add k8s/deployments/
                            git commit -m "Update image tags to ${BUILD_TAG}" || true
                            git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/your-org/studynotion-gitops.git HEAD:main
                        """
                    }
                }
            }
        }
        
        stage('Trigger ArgoCD Sync') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    withCredentials([string(credentialsId: 'argocd-token', variable: 'ARGOCD_TOKEN')]) {
                        sh """
                            argocd app sync ${ARGOCD_APP_NAME} \
                            --server argocd-server.argocd.svc.cluster.local \
                            --auth-token ${ARGOCD_TOKEN} \
                            --prune
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            slackSend(
                channel: '#deployments',
                color: 'good',
                message: "✅ StudyNotion deployment successful! Build: ${BUILD_TAG}"
            )
        }
        failure {
            slackSend(
                channel: '#deployments',
                color: 'danger',
                message: "❌ StudyNotion deployment failed! Build: ${BUILD_TAG}"
            )
        }
    }
}
```

### 5. Create Jenkins Pipeline Job

1. **Create New Job**:
   - Go to Jenkins Dashboard → New Item
   - Enter name: `studynotion-pipeline`
   - Select: Pipeline
   - Click OK

2. **Configure Pipeline**:
   - **General**: Check "GitHub project" and add repository URL
   - **Build Triggers**: Check "GitHub hook trigger for GITScm polling"
   - **Pipeline**: 
     - Definition: Pipeline script from SCM
     - SCM: Git
     - Repository URL: Your repository URL
     - Credentials: Select git credentials
     - Branch: `*/main` and `*/develop`
     - Script Path: `Jenkinsfile`

3. **Save Configuration**

## 🎯 ArgoCD Setup & Configuration

### 1. Install ArgoCD

#### Install ArgoCD on Kubernetes
```bash
# Create namespace
kubectl create namespace argocd

# Install ArgoCD
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Wait for pods to be ready
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

#### Access ArgoCD UI
```bash
# Port forward to access UI
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get initial admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Access UI at: https://localhost:8080
# Username: admin
# Password: (from above command)
```

#### Install ArgoCD CLI
```bash
# macOS
brew install argocd

# Linux
curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd

# Login via CLI
argocd login localhost:8080
```

### 2. Create GitOps Repository

Create a separate repository for Kubernetes manifests:

```bash
# Create new repository: studynotion-gitops
mkdir studynotion-gitops
cd studynotion-gitops

# Initialize repository structure
mkdir -p {environments/{dev,staging,prod},k8s/{base,overlays}}
```

#### Repository Structure
```
studynotion-gitops/
├── environments/
│   ├── dev/
│   │   ├── kustomization.yaml
│   │   └── values.yaml
│   ├── staging/
│   │   ├── kustomization.yaml
│   │   └── values.yaml
│   └── prod/
│       ├── kustomization.yaml
│       └── values.yaml
├── k8s/
│   ├── base/
│   │   ├── namespace.yaml
│   │   ├── mongodb/
│   │   ├── api-gateway/
│   │   ├── auth-service/
│   │   ├── course-service/
│   │   ├── payment-service/
│   │   └── frontend/
│   └── overlays/
│       ├── dev/
│       ├── staging/
│       └── prod/
└── README.md
```

### 3. Create Kubernetes Manifests

#### Base Namespace
```yaml
# k8s/base/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: studynotion
  labels:
    name: studynotion
```

#### API Gateway Deployment
```yaml
# k8s/base/api-gateway/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: studynotion
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: your-registry.com/studynotion/api-gateway:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-gateway-service
  namespace: studynotion
spec:
  selector:
    app: api-gateway
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Kustomization Files
```yaml
# k8s/base/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- namespace.yaml
- mongodb/
- api-gateway/
- auth-service/
- course-service/
- payment-service/
- frontend/

commonLabels:
  app.kubernetes.io/name: studynotion
  app.kubernetes.io/version: v1.0.0
```

```yaml
# environments/prod/kustomization.yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

resources:
- ../../k8s/base

patchesStrategicMerge:
- replica-patch.yaml

images:
- name: your-registry.com/studynotion/api-gateway
  newTag: latest
- name: your-registry.com/studynotion/auth-service
  newTag: latest
- name: your-registry.com/studynotion/course-service
  newTag: latest
- name: your-registry.com/studynotion/payment-service
  newTag: latest
- name: your-registry.com/studynotion/frontend
  newTag: latest
```

### 4. Create ArgoCD Application

#### Application Manifest
```yaml
# argocd-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: studynotion-app
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/your-org/studynotion-gitops.git
    targetRevision: HEAD
    path: environments/prod
  destination:
    server: https://kubernetes.default.svc
    namespace: studynotion
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
    syncOptions:
    - CreateNamespace=true
  revisionHistoryLimit: 10
```

#### Apply Application
```bash
kubectl apply -f argocd-application.yaml
```

### 5. Configure ArgoCD Projects & RBAC

#### Create Project
```yaml
# argocd-project.yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: studynotion
  namespace: argocd
spec:
  description: StudyNotion EdTech Platform
  sourceRepos:
  - 'https://github.com/your-org/studynotion-gitops.git'
  destinations:
  - namespace: studynotion
    server: https://kubernetes.default.svc
  clusterResourceWhitelist:
  - group: ''
    kind: Namespace
  namespaceResourceWhitelist:
  - group: ''
    kind: '*'
  - group: apps
    kind: '*'
  - group: extensions
    kind: '*'
```

## 🚀 Complete Deployment Process

### Step-by-Step Deployment

#### 1. Initial Setup
```bash
# Clone repositories
git clone https://github.com/your-org/studynotion-edtech-project.git
git clone https://github.com/your-org/studynotion-gitops.git

# Setup Jenkins pipeline
# (Follow Jenkins setup steps above)

# Setup ArgoCD
# (Follow ArgoCD setup steps above)
```

#### 2. First Deployment
```bash
# Push code changes
git add .
git commit -m "Initial deployment setup"
git push origin main

# Jenkins will automatically:
# 1. Run tests
# 2. Build Docker images
# 3. Push to registry
# 4. Update GitOps repository
# 5. Trigger ArgoCD sync

# Monitor deployment
kubectl get pods -n studynotion -w
argocd app get studynotion-app
```

#### 3. Verify Deployment
```bash
# Check all services are running
kubectl get all -n studynotion

# Check application logs
kubectl logs -f deployment/api-gateway -n studynotion
kubectl logs -f deployment/auth-service -n studynotion

# Access application
kubectl port-forward svc/frontend-service 3008:80 -n studynotion
# Open http://localhost:3008
```

### Environment-Specific Deployments

#### Development Environment
```bash
# Create dev branch and push
git checkout -b develop
git push origin develop

# ArgoCD will deploy to dev namespace automatically
```

#### Staging Environment
```bash
# Create staging application in ArgoCD
argocd app create studynotion-staging \
  --repo https://github.com/your-org/studynotion-gitops.git \
  --path environments/staging \
  --dest-server https://kubernetes.default.svc \
  --dest-namespace studynotion-staging
```

#### Production Environment
```bash
# Production deployment via main branch
git checkout main
git merge develop
git push origin main

# Monitor production deployment
argocd app sync studynotion-app
argocd app wait studynotion-app
```

## 📊 Monitoring & Observability

### Application Monitoring

#### Prometheus & Grafana Setup
```bash
# Add Prometheus Helm repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

# Install Prometheus
helm install prometheus prometheus-community/kube-prometheus-stack \
  --namespace monitoring \
  --create-namespace \
  --set grafana.adminPassword=admin123

# Access Grafana
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
# URL: http://localhost:3000 (admin/admin123)
```

#### Application Metrics
```javascript
// Add to each microservice - metrics.js
const promClient = require('prom-client');

// Create metrics
const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

module.exports = { httpRequestDuration, httpRequestTotal };
```

#### Health Check Endpoints
```javascript
// healthcheck.js for each service
const http = require('http');

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

req.on('error', () => process.exit(1));
req.on('timeout', () => process.exit(1));
req.end();
```

### Logging Strategy

#### Centralized Logging with ELK Stack
```bash
# Install Elasticsearch
helm repo add elastic https://helm.elastic.co
helm install elasticsearch elastic/elasticsearch \
  --namespace logging \
  --create-namespace

# Install Kibana
helm install kibana elastic/kibana \
  --namespace logging

# Install Filebeat for log collection
helm install filebeat elastic/filebeat \
  --namespace logging
```

#### Application Logging
```javascript
// logger.js - Winston configuration
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
```

## 🛠️ Troubleshooting Guide

### Common CI/CD Issues

#### Jenkins Pipeline Failures

**Issue**: Docker build fails
```bash
# Solution: Check Docker daemon and permissions
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins

# Verify Docker access
docker ps
```

**Issue**: Kubernetes deployment fails
```bash
# Check cluster connectivity
kubectl cluster-info
kubectl get nodes

# Verify service account permissions
kubectl auth can-i create deployments --namespace=studynotion
```

**Issue**: ArgoCD sync fails
```bash
# Check ArgoCD application status
argocd app get studynotion-app

# Force refresh and sync
argocd app refresh studynotion-app
argocd app sync studynotion-app --force
```

#### Application Runtime Issues

**Issue**: Service discovery failures
```bash
# Check service endpoints
kubectl get endpoints -n studynotion

# Verify DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup auth-service.studynotion.svc.cluster.local
```

**Issue**: Database connection issues
```bash
# Check MongoDB pods
kubectl get pods -l app=mongodb-auth -n studynotion

# Check connection from service
kubectl exec -it deployment/auth-service -n studynotion -- nc -zv mongodb-auth-service 27017
```

**Issue**: Memory/CPU issues
```bash
# Check resource usage
kubectl top pods -n studynotion
kubectl describe pod <pod-name> -n studynotion

# Scale deployment if needed
kubectl scale deployment auth-service --replicas=3 -n studynotion
```

### Debugging Commands

#### Kubernetes Debugging
```bash
# Get all resources
kubectl get all -n studynotion

# Describe problematic resources
kubectl describe deployment auth-service -n studynotion
kubectl describe pod <pod-name> -n studynotion

# Check logs
kubectl logs -f deployment/auth-service -n studynotion
kubectl logs --previous deployment/auth-service -n studynotion

# Execute into container
kubectl exec -it deployment/auth-service -n studynotion -- /bin/sh

# Port forward for local debugging
kubectl port-forward deployment/auth-service 3001:3001 -n studynotion
```

#### ArgoCD Debugging
```bash
# Check application health
argocd app get studynotion-app

# View application logs
argocd app logs studynotion-app

# Check sync status
argocd app diff studynotion-app

# Manual sync with options
argocd app sync studynotion-app --dry-run
argocd app sync studynotion-app --prune --force
```

#### Jenkins Debugging
```bash
# Check Jenkins logs
docker logs jenkins

# Verify Jenkins plugins
curl -u admin:password http://localhost:8080/pluginManager/api/json?depth=1

# Test pipeline syntax
# Use Jenkins Blue Ocean or Pipeline Syntax helper
```

### Performance Optimization

#### Database Optimization
```javascript
// MongoDB indexing for better performance
db.users.createIndex({ "email": 1 })
db.courses.createIndex({ "category": 1, "createdAt": -1 })
db.enrollments.createIndex({ "userId": 1, "courseId": 1 })
```

#### Caching Strategy
```javascript
// Redis caching implementation
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await client.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

#### Container Optimization
```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
USER node
CMD ["npm", "start"]
```

## 🔧 Development Guidelines

### Code Structure

```
studynotion-edtech-project-main/
├── frontend-microservice/           # React frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   ├── pages/                  # Route components
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── services/              # API services
│   │   ├── stores/                # Zustand stores
│   │   ├── types/                 # TypeScript types
│   │   └── utils/                 # Utility functions
│   ├── public/                    # Static assets
│   └── package.json
├── microservices/                 # Backend services
│   ├── api-gateway/              # API Gateway
│   ├── auth-service/             # Authentication
│   ├── course-service/           # Course management
│   ├── payment-service/          # Payment processing
│   ├── k8s/                      # Kubernetes configs
│   └── docker-compose.yml
├── .github/workflows/            # CI/CD pipelines
└── README.md
```

### Adding New Features

#### Frontend
1. Create types in `src/types/`
2. Add API service in `src/services/`
3. Create custom hook in `src/hooks/`
4. Build components in `src/components/`
5. Add pages in `src/pages/`
6. Update routing in `App.tsx`

#### Backend
1. Create new service directory
2. Add to docker-compose.yml
3. Update API Gateway routes
4. Add health check endpoint
5. Update service discovery

### Best Practices

#### Frontend
- Use TypeScript for type safety
- Follow React Query patterns for server state
- Use Zustand for client state
- Implement proper error boundaries
- Add loading states and error handling

#### Backend
- Follow microservices patterns
- Implement proper error handling
- Add comprehensive logging
- Use environment variables
- Implement health checks

## 🛠️ Troubleshooting

### Common Issues

#### Port Conflicts
```bash
# Check what's using a port
lsof -i :4000

# Kill process
kill -9 <PID>
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Docker Issues
```bash
# Clean Docker system
docker system prune -a

# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### Debugging

#### Frontend Debugging
- Use React Developer Tools
- Check browser console for errors
- Use React Query Devtools
- Check network tab for API calls

#### Backend Debugging
- Check service logs: `docker-compose logs <service-name>`
- Use Postman for API testing
- Check MongoDB logs
- Monitor service health endpoints

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/signup          # User registration
POST /api/auth/login           # User login
POST /api/auth/logout          # User logout
POST /api/auth/send-otp        # Send OTP
POST /api/auth/verify-otp      # Verify OTP
POST /api/auth/reset-password  # Reset password
```

### Course Endpoints
```
GET    /api/courses            # Get all courses
GET    /api/courses/:id        # Get course by ID
POST   /api/courses            # Create course (instructor)
PUT    /api/courses/:id        # Update course (instructor)
DELETE /api/courses/:id        # Delete course (instructor)
POST   /api/courses/:id/enroll # Enroll in course
```

### Payment Endpoints
```
POST /api/payments/capture     # Capture payment
POST /api/payments/verify      # Verify payment
GET  /api/payments/history     # Payment history
```

For complete API documentation, visit: `http://localhost:4000/api-docs`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## 🔄 Updates & Maintenance

- Regular dependency updates
- Security patches
- Performance optimizations
- Feature enhancements

---

**Happy Coding! 🚀**
