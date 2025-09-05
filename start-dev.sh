#!/bin/bash

# StudyNotion Development Startup Script
# Automatically configures LAN IP for development access

set -e

echo "🚀 Starting StudyNotion Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
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
VITE_API_BASE_URL=http://$LAN_IP:3000
VITE_FRONTEND_URL=http://$LAN_IP:3008
NODE_ENV=development
EOF

# Create/update environment file for API Gateway
echo -e "${BLUE}[INFO]${NC} Configuring API Gateway environment..."
cat > "$SCRIPT_DIR/microservices/api-gateway/.env.development" << EOF
# Auto-generated development configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://$LAN_IP:3008
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
    npm run dev > "$LOGS_DIR/$service_name.log" 2>&1 &
    echo $! > "$LOGS_DIR/$service_name.pid"
    
    # Return to script directory
    cd "$SCRIPT_DIR"
}

# Start API Gateway
start_service "api-gateway" "microservices/api-gateway" "3000"

# Wait a moment for API Gateway to start
sleep 3

# Start Frontend
echo -e "${BLUE}[INFO]${NC} Starting frontend on port 3008..."
cd "$SCRIPT_DIR/frontend-microservice"

if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}[INFO]${NC} Installing frontend dependencies..."
    npm install
fi

# Start frontend in foreground so we can see the output
npm run dev &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$LOGS_DIR/frontend.pid"

cd "$SCRIPT_DIR"

# Display access information
echo ""
echo -e "${GREEN}✅ StudyNotion Development Environment Started!${NC}"
echo ""
echo "Access your application:"
echo -e "🌐 Frontend (localhost): ${BLUE}http://localhost:3008${NC}"
echo -e "🌐 Frontend (LAN):       ${BLUE}http://$LAN_IP:3008${NC}"
echo -e "🔌 API Gateway:          ${BLUE}http://$LAN_IP:3000${NC}"
echo -e "🏥 Health Check:         ${BLUE}http://$LAN_IP:3000/health${NC}"
echo ""
echo "Logs are available in the 'logs' directory"
echo -e "Press ${YELLOW}Ctrl+C${NC} to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Stopping services..."
    
    # Kill all services
    if [ -f "$LOGS_DIR/api-gateway.pid" ]; then
        kill $(cat "$LOGS_DIR/api-gateway.pid") 2>/dev/null || true
        rm "$LOGS_DIR/api-gateway.pid"
    fi
    
    if [ -f "$LOGS_DIR/frontend.pid" ]; then
        kill $(cat "$LOGS_DIR/frontend.pid") 2>/dev/null || true
        rm "$LOGS_DIR/frontend.pid"
    fi
    
    echo -e "${GREEN}[SUCCESS]${NC} All services stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for frontend process
wait $FRONTEND_PID
