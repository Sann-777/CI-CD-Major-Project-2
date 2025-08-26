#!/bin/bash

# StudyNotion Microservices Deployment Script

echo "🚀 Deploying StudyNotion Microservices..."

# Check if environment is specified
if [ -z "$1" ]; then
    echo "❌ Please specify environment: ./deploy.sh [staging|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment. Use 'staging' or 'production'"
    exit 1
fi

echo "📦 Building and deploying to $ENVIRONMENT environment..."

# Build all services
echo "🔨 Building Docker images..."
docker-compose build

# Tag images for deployment
services=("auth-service" "course-service" "payment-service" "api-gateway")

for service in "${services[@]}"; do
    echo "🏷️  Tagging $service for $ENVIRONMENT..."
    docker tag "studynotion-$service:latest" "studynotion-$service:$ENVIRONMENT"
done

# Deploy based on environment
if [ "$ENVIRONMENT" = "staging" ]; then
    echo "🚀 Deploying to staging..."
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up -d
elif [ "$ENVIRONMENT" = "production" ]; then
    echo "🚀 Deploying to production..."
    docker-compose -f docker-compose.yml -f docker-compose.production.yml up -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Health check
echo "🔍 Performing health checks..."
services_urls=(
    "http://localhost:3000/health"
    "http://localhost:3001/health"
    "http://localhost:3003/health"
    "http://localhost:3004/health"
)

all_healthy=true

for url in "${services_urls[@]}"; do
    if curl -f -s "$url" > /dev/null; then
        echo "✅ $(echo $url | cut -d'/' -f3) is healthy"
    else
        echo "❌ $(echo $url | cut -d'/' -f3) is not responding"
        all_healthy=false
    fi
done

if [ "$all_healthy" = true ]; then
    echo "🎉 Deployment successful! All services are healthy."
    echo "🌐 API Gateway: http://localhost:3000"
    echo "📊 Service Status: http://localhost:3000/health"
else
    echo "⚠️  Some services are not healthy. Check logs with:"
    echo "   docker-compose logs -f [service-name]"
fi
