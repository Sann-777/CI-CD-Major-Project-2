#!/bin/bash

# StudyNotion Microservices Setup Script

echo "🚀 Setting up StudyNotion Microservices..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment files from examples
echo "📝 Creating environment files..."

services=("auth-service" "course-service" "payment-service" "api-gateway")

for service in "${services[@]}"; do
    if [ ! -f "$service/.env" ]; then
        cp "$service/.env.example" "$service/.env"
        echo "✅ Created $service/.env"
    else
        echo "⚠️  $service/.env already exists, skipping..."
    fi
done

# Create global .env file
if [ ! -f ".env" ]; then
    cp ".env.example" ".env"
    echo "✅ Created global .env file"
else
    echo "⚠️  Global .env already exists, skipping..."
fi

echo ""
echo "🔧 Please update the following environment variables in your .env files:"
echo "   - JWT_SECRET"
echo "   - MAIL_HOST, MAIL_USER, MAIL_PASS"
echo "   - RAZORPAY_KEY, RAZORPAY_SECRET"
echo "   - CLOUD_NAME, API_KEY, API_SECRET (Cloudinary)"
echo ""

# Install dependencies for all services
echo "📦 Installing dependencies for all services..."

for service in "${services[@]}"; do
    echo "Installing dependencies for $service..."
    cd "$service"
    npm install
    cd ..
done

echo ""
echo "🐳 Building Docker images..."
docker-compose build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 To start the services, run:"
echo "   docker-compose up -d"
echo ""
echo "📊 To view logs, run:"
echo "   docker-compose logs -f [service-name]"
echo ""
echo "🔍 To check service health:"
echo "   curl http://localhost:3000/health"
echo ""
echo "🛑 To stop all services:"
echo "   docker-compose down"
