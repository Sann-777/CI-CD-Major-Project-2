#!/bin/bash

# Setup shared module for local development
echo "🔧 Setting up shared module for local development..."

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SHARED_DIR="$SCRIPT_DIR/microservices/shared"

# Navigate to shared directory and pack the module
cd "$SHARED_DIR"
echo "📦 Packing shared module..."
npm pack

# Install the packed module in each microservice
services=("api-gateway" "auth-service" "course-service" "payment-service" "profile-service" "rating-service" "media-service" "notification-service")

for service in "${services[@]}"; do
    echo "📥 Installing shared module in $service..."
    cd "$SCRIPT_DIR/microservices/$service"
    
    # Remove existing shared module if present
    npm uninstall shared 2>/dev/null || true
    
    # Install the packed shared module
    npm install "$SHARED_DIR/studynotion-shared-1.0.0.tgz"
done

echo "✅ Shared module setup complete!"
cd "$SCRIPT_DIR"
