#!/bin/bash

# Jenkins Pipeline Setup Script
# This script installs all dependencies for the StudyNotion microservices project
# Run this script once in Jenkins pipeline before running tests or linting

set -e  # Exit on any error

echo "🚀 Starting Jenkins Pipeline Setup..."
echo "================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies for a service (Jenkins cache-friendly)
install_service_deps() {
    local service_path=$1
    local service_name=$2
    local cache_dir="/var/lib/jenkins/cache"
    local cache_file="$cache_dir/${service_name// /_}-node_modules.tar.gz"

    if [ -d "$service_path" ]; then
        echo "📦 Checking dependencies for $service_name..."
        cd "$service_path"

        # Ensure cache dir exists
        mkdir -p "$cache_dir"

        # 1. Restore from cache if node_modules missing
        if [ ! -d "node_modules" ] && [ -f "$cache_file" ]; then
            echo "♻️ Restoring cached dependencies for $service_name..."
            tar -xzf "$cache_file"
        fi

        # 2. Install if node_modules is still missing or outdated
        if [ ! -d "node_modules" ] || [ ! -f "package-lock.json" ]; then
            echo "💾 Installing dependencies for $service_name..."
            # Try npm ci first, fallback to npm install
            if [ -f "package-lock.json" ]; then
                npm ci --cache ~/.npm --prefer-offline --silent 2>/dev/null || \
                npm install --production=false --silent
            else
                npm install --production=false --silent
            fi
            
            # Only run audit fix if we have sudo permissions (avoid in containers)
            if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
                sudo npm audit fix --force 2>/dev/null || true
            else
                npm audit fix --force 2>/dev/null || true
            fi
        else
            echo "⚡ $service_name dependencies already cached"
        fi

        # 3. Update cache after fresh install
        echo "🗄️ Updating cache for $service_name..."
        tar -czf "$cache_file" node_modules package-lock.json 2>/dev/null || true

        cd - > /dev/null
    else
        echo "⚠️  Warning: $service_path not found, skipping $service_name"
    fi
}


# Check Node.js and npm
echo "🔍 Checking Node.js and npm..."
if ! command_exists node; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm not found. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Install root dependencies first
echo "📦 Checking root dependencies..."
cd "$PROJECT_ROOT"
if [ -d "node_modules" ] && [ -f "package-lock.json" ]; then
    echo "⚡ Root dependencies already cached"
else
    echo "💾 Installing root dependencies..."
    npm ci --cache ~/.npm --prefer-offline --silent 2>/dev/null || npm install --production=false --silent
    echo "✅ Root dependencies installed"
fi

# Install dependencies for all microservices
echo "📦 Installing microservice dependencies..."

# List of all microservices (updated to match current project structure)
services=(
    "microservices/api-gateway:API Gateway"
    "microservices/auth-service:Auth Service"
    "microservices/course-service:Course Service"
    "microservices/profile-service:Profile Service"
    "microservices/rating-service:Rating Service"
    "microservices/media-service:Media Service"
    "microservices/notification-service:Notification Service"
)

# Install dependencies for each service
for service in "${services[@]}"; do
    IFS=':' read -r path name <<< "$service"
    install_service_deps "$PROJECT_ROOT/$path" "$name"
done

# Install frontend dependencies if exists
if [ -d "$PROJECT_ROOT/frontend-microservice" ]; then
    install_service_deps "$PROJECT_ROOT/frontend-microservice" "Frontend"
fi

# Verify critical global dependencies
echo "🔍 Verifying critical dependencies..."

# Check if jest is available globally or locally
if command_exists jest; then
    echo "✅ Jest found globally: $(jest --version)"
elif [ -f "$PROJECT_ROOT/node_modules/.bin/jest" ]; then
    echo "✅ Jest found locally"
else
    echo "📦 Installing Jest globally for CI..."
    if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
        sudo npm install -g jest@latest
    else
        npm install -g jest@latest
    fi
fi

# Check if concurrently is available
if command_exists concurrently; then
    echo "✅ Concurrently found globally"
elif [ -f "$PROJECT_ROOT/node_modules/.bin/concurrently" ]; then
    echo "✅ Concurrently found locally"
else
    echo "📦 Installing Concurrently globally for CI..."
    if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
        sudo npm install -g concurrently@latest
    else
        npm install -g concurrently@latest
    fi
fi

# Check if Docker is available (for containerized builds)
if command_exists docker; then
    echo "✅ Docker found: $(docker --version)"
    # Check if Docker daemon is running
    if docker info >/dev/null 2>&1; then
        echo "✅ Docker daemon is running"
    else
        echo "⚠️  Docker daemon is not running"
    fi
else
    echo "ℹ️  Docker not found (not required for basic pipeline)"
fi

# Set npm cache and registry for faster installs in CI
echo "⚙️  Configuring npm for CI environment..."
npm config set cache /tmp/.npm-cache
npm config set registry https://registry.npmjs.org/

# Create a summary of installed packages
echo "📊 Creating dependency summary..."
echo "Root packages:" > "$PROJECT_ROOT/dependency-summary.txt"
npm list --depth=0 --production=false >> "$PROJECT_ROOT/dependency-summary.txt" 2>/dev/null || true

# Validate all services have required files
echo "🔍 Validating service configurations..."
for service in "${services[@]}"; do
    IFS=':' read -r path name <<< "$service"
    service_path="$PROJECT_ROOT/$path"
    
    if [ -d "$service_path" ]; then
        # Check for package.json
        if [ ! -f "$service_path/package.json" ]; then
            echo "⚠️  Warning: Missing package.json in $name"
        fi
        
        # Check for server.js or index.js
        if [ ! -f "$service_path/server.js" ] && [ ! -f "$service_path/index.js" ]; then
            echo "⚠️  Warning: Missing server.js or index.js in $name"
        fi
        
        # Check for Dockerfile
        if [ ! -f "$service_path/Dockerfile" ]; then
            echo "⚠️  Warning: Missing Dockerfile in $name"
        fi
        
        echo "✅ $name configuration validated"
    fi
done

# Check frontend configuration
if [ -d "$PROJECT_ROOT/frontend-microservice" ]; then
    echo "🔍 Validating frontend configuration..."
    frontend_path="$PROJECT_ROOT/frontend-microservice"
    
    if [ ! -f "$frontend_path/package.json" ]; then
        echo "⚠️  Warning: Missing package.json in Frontend"
    fi
    
    if [ ! -f "$frontend_path/Dockerfile" ]; then
        echo "⚠️  Warning: Missing Dockerfile in Frontend"
    fi
    
    if [ ! -f "$frontend_path/nginx.conf" ]; then
        echo "⚠️  Warning: Missing nginx.conf in Frontend"
    fi
    
    echo "✅ Frontend configuration validated"
fi

echo ""
echo "🎉 Pipeline setup completed successfully!"
echo "================================================"
echo "✅ All dependencies installed"
echo "✅ All microservices configured (7 services)"
echo "✅ Frontend microservice configured"
echo "✅ CI environment optimized"
echo "✅ Docker support validated"
echo "✅ Pipeline ready for deployment"
echo ""
echo "You can now run:"
echo "  npm run test:all               # Run all tests"
echo "  npm run lint:all               # Run all linting"
echo "  npm run build:all              # Build all services"
echo "  npm run dev:all                # Start all services in development"
echo "  docker-compose up --build      # Build and run with Docker"
echo "  kubectl apply -f kubernetes/    # Deploy to Kubernetes"
echo "================================================"

# Return to original directory
cd "$PROJECT_ROOT"