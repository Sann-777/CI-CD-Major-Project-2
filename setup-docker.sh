#!/bin/bash

# StudyNotion Docker Setup Script
echo "Setting up StudyNotion EdTech Platform with Docker..."

# Create .env file from template if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp docker.env.example .env
    echo "⚠️  Please edit .env file with your actual credentials:"
    echo "   - MAIL_USER and MAIL_PASS for email functionality"
    echo "   - CLOUDINARY credentials for file uploads"
    echo "   - RAZORPAY credentials for payments"
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Remove any orphaned containers
echo "Cleaning up..."
docker system prune -f

# Build and start all services
echo "Building and starting all services..."
docker-compose up -d --build

# Wait for services to start
echo "Waiting for services to start..."
sleep 30

# Check service status
echo "Checking service status..."
docker-compose ps

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:3008"
echo "  API Gateway: http://localhost:3000"
echo "  MongoDB: localhost:27017"
echo ""
echo "To view logs: docker-compose logs [service-name]"
echo "To stop: docker-compose down"
