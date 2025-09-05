#!/bin/bash

# StudyNotion Development Startup Script
# Automatically configures LAN IP for development access

set -e

echo "🚀 Starting StudyNotion Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Get the absolute path of the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"

# Get LAN IP address
get_lan_ip() {
    # Try different methods to get LAN IP
    if command -v ip >/dev/null 2>&1; then
        # Linux method
        ip route get 8.8.8.8 | awk '{print $7; exit}' 2>/dev/null
    elif command -v ifconfig >/dev/null 2>&1; then
        # macOS/BSD method
        ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
    else
        # Fallback method
        hostname -I | awk '{print $1}' 2>/dev/null || echo "localhost"
    fi
}

LAN_IP=$(get_lan_ip)
if [ -z "$LAN_IP" ] || [ "$LAN_IP" = "localhost" ]; then
    LAN_IP="localhost"
    echo -e "${YELLOW}[WARNING]${NC} Could not detect LAN IP, using localhost"
else
    echo -e "${BLUE}[INFO]${NC} Detected LAN IP: $LAN_IP"
fi

# Create logs directory
mkdir -p "$LOGS_DIR"

# Create/update environment file for frontend
echo -e "${BLUE}[INFO]${NC} Configuring frontend environment..."
cat > "$SCRIPT_DIR/frontend-microservice/.env.development" << EOF
# Auto-generated development configuration
VITE_API_BASE_URL=http://$LAN_IP:4000
VITE_FRONTEND_URL=http://$LAN_IP:3008
NODE_ENV=development
EOF

# Create/update environment file for API Gateway
echo -e "${BLUE}[INFO]${NC} Configuring API Gateway environment..."
cat > "$SCRIPT_DIR/microservices/api-gateway/.env.development" << EOF
# Auto-generated development configuration
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://$LAN_IP:3008
AUTH_SERVICE_URL=http://localhost:3001
COURSE_SERVICE_URL=http://localhost:3003
PAYMENT_SERVICE_URL=http://localhost:3002
PROFILE_SERVICE_URL=http://localhost:3004
RATING_SERVICE_URL=http://localhost:3005
MEDIA_SERVICE_URL=http://localhost:3006
NOTIFICATION_SERVICE_URL=http://localhost:3007
EOF

# Function to start service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo -e "${BLUE}[INFO]${NC} Starting $service_name on port $port..."
    
    # Change to service directory
    cd "$SCRIPT_DIR/$service_path"
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        echo -e "${BLUE}[INFO]${NC} Installing dependencies for $service_name..."
        npm install
    fi
    
    # Start the service
    if [ "$service_name" = "frontend" ]; then
        npm run dev > "$LOGS_DIR/$service_name.log" 2>&1 &
    else
        npm start > "$LOGS_DIR/$service_name.log" 2>&1 &
    fi
    echo $! > "$LOGS_DIR/$service_name.pid"
    
    # Return to script directory
    cd "$SCRIPT_DIR"
    
    # Wait a moment for service to start
    sleep 2
}

# Start all microservices
echo -e "${GREEN}[INFO]${NC} Starting all microservices..."

# Start backend services first
start_service "auth-service" "microservices/auth-service" "3001"
start_service "payment-service" "microservices/payment-service" "3002"
start_service "course-service" "microservices/course-service" "3003"
start_service "profile-service" "microservices/profile-service" "3004"
start_service "rating-service" "microservices/rating-service" "3005"
start_service "media-service" "microservices/media-service" "3006"
start_service "notification-service" "microservices/notification-service" "3007"

# Wait for backend services to start
echo -e "${BLUE}[INFO]${NC} Waiting for backend services to initialize..."
sleep 5

# Start API Gateway
start_service "api-gateway" "microservices/api-gateway" "4000"

# Wait for API Gateway to start
echo -e "${BLUE}[INFO]${NC} Waiting for API Gateway to initialize..."
sleep 3

# Start Frontend
start_service "frontend" "frontend-microservice" "3008"

# Wait a moment for all services to stabilize
sleep 5

# Health check function
check_service_health() {
    local service_name=$1
    local port=$2
    local max_attempts=10
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name${NC} is healthy"
            return 0
        fi
        echo -e "${YELLOW}⏳ Waiting for $service_name (attempt $attempt/$max_attempts)${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name${NC} failed to start properly"
    return 1
}

# Check health of all services
echo -e "${BLUE}[INFO]${NC} Checking service health..."
check_service_health "auth-service" "3001"
check_service_health "payment-service" "3002"
check_service_health "course-service" "3003"
check_service_health "profile-service" "3004"
check_service_health "rating-service" "3005"
check_service_health "media-service" "3006"
check_service_health "notification-service" "3007"
check_service_health "api-gateway" "4000"

# Display access information
echo ""
echo -e "${GREEN}✅ StudyNotion Development Environment Started!${NC}"
echo ""
echo "Access your application:"
echo -e "🌐 Frontend (localhost): ${BLUE}http://localhost:3008${NC}"
echo -e "🌐 Frontend (LAN):       ${BLUE}http://$LAN_IP:3008${NC}"
echo -e "🔌 API Gateway:          ${BLUE}http://$LAN_IP:4000${NC}"
echo -e "🏥 Health Check:         ${BLUE}http://$LAN_IP:4000/health${NC}"
echo -e "🔍 Service Discovery:    ${BLUE}http://$LAN_IP:4000/api/services${NC}"
echo ""
echo "Individual Services:"
echo -e "🔐 Auth Service:         ${BLUE}http://$LAN_IP:3001/health${NC}"
echo -e "💳 Payment Service:      ${BLUE}http://$LAN_IP:3002/health${NC}"
echo -e "📚 Course Service:       ${BLUE}http://$LAN_IP:3003/health${NC}"
echo -e "👤 Profile Service:      ${BLUE}http://$LAN_IP:3004/health${NC}"
echo -e "⭐ Rating Service:       ${BLUE}http://$LAN_IP:3005/health${NC}"
echo -e "📁 Media Service:        ${BLUE}http://$LAN_IP:3006/health${NC}"
echo -e "📧 Notification Service: ${BLUE}http://$LAN_IP:3007/health${NC}"
echo ""
echo "Logs are available in the 'logs' directory"
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Stopping all services..."
    
    # Kill all services
    services=("api-gateway" "auth-service" "payment-service" "course-service" "profile-service" "rating-service" "media-service" "notification-service" "frontend")
    
    for service in "${services[@]}"; do
        if [ -f "$LOGS_DIR/$service.pid" ]; then
            pid=$(cat "$LOGS_DIR/$service.pid")
            if kill -0 "$pid" 2>/dev/null; then
                kill "$pid" 2>/dev/null || true
                echo -e "${BLUE}[INFO]${NC} Stopped $service"
            fi
            rm "$LOGS_DIR/$service.pid"
        fi
    done
    
    echo -e "${GREEN}[SUCCESS]${NC} All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Keep script running and show logs
echo -e "${BLUE}[INFO]${NC} Monitoring services... (Ctrl+C to stop)"
while true; do
    sleep 10
    # Optional: Add periodic health checks here
done
