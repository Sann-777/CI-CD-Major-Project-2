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

# Function to install dependencies for a service
install_service_deps() {
    local service_path=$1
    local service_name=$2
    
    if [ -d "$service_path" ]; then
        echo "📦 Installing dependencies for $service_name..."
        cd "$service_path"
        
        # Clean install to avoid cache issues
        if [ -f "package-lock.json" ]; then
            rm -rf node_modules package-lock.json
        fi
        
        npm install --production=false --silent
        echo "✅ $service_name dependencies installed"
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
echo "📦 Installing root dependencies..."
cd "$PROJECT_ROOT"
npm install --production=false --silent
echo "✅ Root dependencies installed"

# Install dependencies for all microservices
echo "📦 Installing microservice dependencies..."

# List of all microservices
services=(
    "microservices/api-gateway:API Gateway"
    "microservices/auth-service:Auth Service"
    "microservices/course-service:Course Service"
    "microservices/payment-service:Payment Service"
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
    npm install -g jest@latest
fi

# Check if concurrently is available
if command_exists concurrently; then
    echo "✅ Concurrently found globally"
elif [ -f "$PROJECT_ROOT/node_modules/.bin/concurrently" ]; then
    echo "✅ Concurrently found locally"
else
    echo "📦 Installing Concurrently globally for CI..."
    npm install -g concurrently@latest
fi

# Set npm cache and registry for faster installs in CI
echo "⚙️  Configuring npm for CI environment..."
npm config set cache /tmp/.npm-cache
npm config set registry https://registry.npmjs.org/

# Create a summary of installed packages
echo "📊 Creating dependency summary..."
echo "Root packages:" > "$PROJECT_ROOT/dependency-summary.txt"
npm list --depth=0 --production=false >> "$PROJECT_ROOT/dependency-summary.txt" 2>/dev/null || true

echo ""
echo "🎉 Pipeline setup completed successfully!"
echo "================================================"
echo "✅ All dependencies installed"
echo "✅ All microservices configured"
echo "✅ CI environment optimized"
echo ""
echo "You can now run:"
echo "  npm run test:services:ready    # Run all tests"
echo "  npm run lint:services:ready    # Run all linting"
echo "================================================"

# Return to original directory
cd "$PROJECT_ROOT"
