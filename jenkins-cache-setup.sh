#!/bin/bash

# Jenkins Cache-Optimized Setup Script
# This script is designed specifically for Jenkins pipeline caching
# It checks for cached dependencies before installing

set -e

echo "🚀 Jenkins Cache-Optimized Setup Starting..."
echo "================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create cache key from package.json
get_cache_key() {
    local package_file=$1
    if [ -f "$package_file" ]; then
        md5sum "$package_file" | cut -d' ' -f1
    else
        echo "no-package"
    fi
}

# Function to check if dependencies are cached and valid
is_cache_valid() {
    local service_path=$1
    local cache_key_file="$service_path/.cache-key"
    local current_key=$(get_cache_key "$service_path/package.json")
    
    # Check if node_modules exists and cache key matches
    if [ -d "$service_path/node_modules" ] && [ -f "$cache_key_file" ]; then
        local stored_key=$(cat "$cache_key_file" 2>/dev/null || echo "")
        if [ "$stored_key" = "$current_key" ]; then
            return 0  # Cache is valid
        fi
    fi
    return 1  # Cache is invalid or missing
}

# Function to install dependencies with caching
install_with_cache() {
    local service_path=$1
    local service_name=$2
    
    if [ ! -d "$service_path" ]; then
        echo "⚠️  Warning: $service_path not found, skipping $service_name"
        return
    fi
    
    cd "$service_path"
    
    if is_cache_valid "$service_path"; then
        echo "⚡ $service_name dependencies cached and valid"
    else
        echo "💾 Installing $service_name dependencies..."
        
        # Remove old cache if exists
        rm -rf node_modules package-lock.json .cache-key 2>/dev/null || true
        
        # Install dependencies
        npm ci --cache ~/.npm --prefer-offline --silent 2>/dev/null || \
        npm install --production=false --silent
        
        # Store cache key
        get_cache_key "package.json" > .cache-key
        
        echo "✅ $service_name dependencies installed and cached"
    fi
    
    cd - > /dev/null
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

# Get project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "📁 Project root: $PROJECT_ROOT"

# Setup npm cache directory
export NPM_CONFIG_CACHE="$HOME/.npm"
mkdir -p "$NPM_CONFIG_CACHE"

# Configure npm for CI
npm config set cache "$NPM_CONFIG_CACHE"
npm config set prefer-offline true
npm config set audit false
npm config set fund false

echo "📦 Processing dependencies with smart caching..."

# Install root dependencies
install_with_cache "$PROJECT_ROOT" "Root Project"

# Install frontend dependencies
if [ -d "$PROJECT_ROOT/frontend-microservice" ]; then
    install_with_cache "$PROJECT_ROOT/frontend-microservice" "Frontend"
fi

# Install microservice dependencies
services=(
    "api-gateway"
    "auth-service" 
    "course-service"
    "payment-service"
    "profile-service"
    "rating-service"
    "media-service"
    "notification-service"
)

for service in "${services[@]}"; do
    service_path="$PROJECT_ROOT/microservices/$service"
    install_with_cache "$service_path" "$service"
done

# Verify and install global tools if needed
echo "🔧 Verifying global tools..."

# Check Jest
if ! command_exists jest && ! [ -f "$PROJECT_ROOT/node_modules/.bin/jest" ]; then
    echo "📦 Installing Jest globally..."
    npm install -g jest@latest --cache "$NPM_CONFIG_CACHE"
else
    echo "✅ Jest available"
fi

# Check Concurrently  
if ! command_exists concurrently && ! [ -f "$PROJECT_ROOT/node_modules/.bin/concurrently" ]; then
    echo "📦 Installing Concurrently globally..."
    npm install -g concurrently@latest --cache "$NPM_CONFIG_CACHE"
else
    echo "✅ Concurrently available"
fi

# Create cache summary
echo "📊 Creating cache summary..."
{
    echo "Cache Summary - $(date)"
    echo "=================================="
    echo "Root cache key: $(get_cache_key "$PROJECT_ROOT/package.json")"
    
    if [ -d "$PROJECT_ROOT/frontend-microservice" ]; then
        echo "Frontend cache key: $(get_cache_key "$PROJECT_ROOT/frontend-microservice/package.json")"
    fi
    
    for service in "${services[@]}"; do
        service_path="$PROJECT_ROOT/microservices/$service"
        if [ -d "$service_path" ]; then
            echo "$service cache key: $(get_cache_key "$service_path/package.json")"
        fi
    done
} > "$PROJECT_ROOT/cache-summary.txt"

echo ""
echo "🎉 Jenkins Cache-Optimized Setup Complete!"
echo "================================================"
echo "✅ All dependencies processed with smart caching"
echo "✅ Cache keys generated for dependency tracking"
echo "✅ Global tools verified and available"
echo "✅ Pipeline ready for fast subsequent runs"
echo ""
echo "📊 Cache benefits:"
echo "  • First run: Full dependency installation"
echo "  • Subsequent runs: Only changed dependencies reinstalled"
echo "  • Estimated time savings: 60-80% on repeat builds"
echo ""
echo "🚀 Ready to run:"
echo "  npm run test:services:ready"
echo "  npm run lint:services:ready"
echo "================================================"

cd "$PROJECT_ROOT"
