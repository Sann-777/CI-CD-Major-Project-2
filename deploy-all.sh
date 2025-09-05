#!/bin/bash

# StudyNotion Comprehensive Deployment Script
# Supports local, Docker, and Kubernetes deployments

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$SCRIPT_DIR/logs"
DEPLOYMENT_TYPE="${1:-local}"
NAMESPACE="studynotion"

# Create logs directory
mkdir -p "$LOGS_DIR"

# Logging function
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")
            echo -e "${BLUE}[INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[WARNING]${NC} $message"
            ;;
        "ERROR")
            echo -e "${RED}[ERROR]${NC} $message"
            ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOGS_DIR/deployment.log"
}

# Health check function
check_service_health() {
    local service_name=$1
    local url=$2
    local max_attempts=${3:-30}
    local attempt=1
    
    log "INFO" "Checking health of $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            log "SUCCESS" "$service_name is healthy"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            log "ERROR" "$service_name failed to become healthy after $max_attempts attempts"
            return 1
        fi
        
        log "INFO" "Waiting for $service_name (attempt $attempt/$max_attempts)"
        sleep 10
        attempt=$((attempt + 1))
    done
}

# Local deployment
deploy_local() {
    log "INFO" "Starting local deployment..."
    
    # Check prerequisites
    if ! command -v node >/dev/null 2>&1; then
        log "ERROR" "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm >/dev/null 2>&1; then
        log "ERROR" "npm is not installed"
        exit 1
    fi
    
    # Install dependencies
    log "INFO" "Installing dependencies..."
    npm run bootstrap
    
    # Start services using the development script
    log "INFO" "Starting all services..."
    ./start-dev.sh &
    MAIN_PID=$!
    
    # Wait for services to start
    sleep 15
    
    # Health checks
    services=(
        "api-gateway:http://localhost:4000/health"
        "auth-service:http://localhost:3001/health"
        "payment-service:http://localhost:3002/health"
        "course-service:http://localhost:3003/health"
        "profile-service:http://localhost:3004/health"
        "rating-service:http://localhost:3005/health"
        "media-service:http://localhost:3006/health"
        "notification-service:http://localhost:3007/health"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name service_url <<< "$service_info"
        check_service_health "$service_name" "$service_url" 10
    done
    
    log "SUCCESS" "Local deployment completed successfully!"
    log "INFO" "Frontend: http://localhost:3008"
    log "INFO" "API Gateway: http://localhost:4000"
    log "INFO" "Press Ctrl+C to stop all services"
    
    # Wait for main process
    wait $MAIN_PID
}

# Docker deployment
deploy_docker() {
    log "INFO" "Starting Docker deployment..."
    
    # Check prerequisites
    if ! command -v docker >/dev/null 2>&1; then
        log "ERROR" "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose >/dev/null 2>&1; then
        log "ERROR" "Docker Compose is not installed"
        exit 1
    fi
    
    # Check if .env file exists
    if [ ! -f "$SCRIPT_DIR/.env" ]; then
        log "WARNING" ".env file not found, copying from docker.env.example"
        cp "$SCRIPT_DIR/docker.env.example" "$SCRIPT_DIR/.env"
        log "WARNING" "Please update .env file with your actual credentials"
    fi
    
    # Stop existing containers
    log "INFO" "Stopping existing containers..."
    docker-compose down || true
    
    # Build and start containers
    log "INFO" "Building and starting containers..."
    docker-compose up -d --build
    
    # Wait for containers to start
    log "INFO" "Waiting for containers to initialize..."
    sleep 30
    
    # Health checks
    services=(
        "api-gateway:http://localhost:4000/health"
        "auth-service:http://localhost:3001/health"
        "payment-service:http://localhost:3002/health"
        "course-service:http://localhost:3003/health"
        "profile-service:http://localhost:3004/health"
        "rating-service:http://localhost:3005/health"
        "media-service:http://localhost:3006/health"
        "notification-service:http://localhost:3007/health"
        "frontend:http://localhost:3008"
    )
    
    for service_info in "${services[@]}"; do
        IFS=':' read -r service_name service_url <<< "$service_info"
        check_service_health "$service_name" "$service_url" 15
    done
    
    log "SUCCESS" "Docker deployment completed successfully!"
    log "INFO" "Frontend: http://localhost:3008"
    log "INFO" "API Gateway: http://localhost:4000"
    log "INFO" "Use 'docker-compose logs -f' to view logs"
    log "INFO" "Use 'docker-compose down' to stop all services"
}

# Kubernetes deployment
deploy_kubernetes() {
    log "INFO" "Starting Kubernetes deployment..."
    
    # Check prerequisites
    if ! command -v kubectl >/dev/null 2>&1; then
        log "ERROR" "kubectl is not installed"
        exit 1
    fi
    
    # Check cluster connectivity
    if ! kubectl cluster-info >/dev/null 2>&1; then
        log "ERROR" "Cannot connect to Kubernetes cluster"
        exit 1
    fi
    
    # Create namespace
    log "INFO" "Creating namespace..."
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply base configurations
    log "INFO" "Applying base configurations..."
    kubectl apply -f kubernetes/base/ -n $NAMESPACE
    
    # Apply MongoDB
    log "INFO" "Deploying MongoDB..."
    kubectl apply -f kubernetes/mongodb/ -n $NAMESPACE
    
    # Wait for MongoDB to be ready
    log "INFO" "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb --timeout=300s -n $NAMESPACE
    
    # Apply all services
    log "INFO" "Deploying microservices..."
    kubectl apply -f kubernetes/services/ -n $NAMESPACE
    
    # Apply ingress
    log "INFO" "Applying ingress configuration..."
    kubectl apply -f kubernetes/ingress/ -n $NAMESPACE
    
    # Wait for deployments
    log "INFO" "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available deployment --all --timeout=600s -n $NAMESPACE
    
    # Get service information
    log "INFO" "Getting service information..."
    kubectl get services -n $NAMESPACE
    kubectl get ingress -n $NAMESPACE
    
    # Health checks for internal services
    log "INFO" "Checking service health..."
    kubectl get pods -n $NAMESPACE
    
    log "SUCCESS" "Kubernetes deployment completed successfully!"
    log "INFO" "Use 'kubectl get all -n $NAMESPACE' to check status"
    log "INFO" "Use 'kubectl logs -f deployment/api-gateway -n $NAMESPACE' to view logs"
    
    # If using minikube, show access URLs
    if command -v minikube >/dev/null 2>&1 && minikube status >/dev/null 2>&1; then
        MINIKUBE_IP=$(minikube ip)
        log "INFO" "Minikube detected. Access URLs:"
        log "INFO" "Frontend: http://$MINIKUBE_IP (configure ingress)"
        log "INFO" "API Gateway: http://$MINIKUBE_IP (configure ingress)"
    fi
}

# Cleanup function
cleanup() {
    log "INFO" "Cleaning up..."
    case $DEPLOYMENT_TYPE in
        "local")
            # Kill all background processes
            jobs -p | xargs -r kill
            ;;
        "docker")
            docker-compose down
            ;;
        "kubernetes")
            kubectl delete namespace $NAMESPACE --ignore-not-found=true
            ;;
    esac
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution
main() {
    log "INFO" "StudyNotion Deployment Script"
    log "INFO" "Deployment type: $DEPLOYMENT_TYPE"
    
    case $DEPLOYMENT_TYPE in
        "local")
            deploy_local
            ;;
        "docker")
            deploy_docker
            ;;
        "kubernetes"|"k8s")
            deploy_kubernetes
            ;;
        *)
            log "ERROR" "Invalid deployment type: $DEPLOYMENT_TYPE"
            log "INFO" "Usage: $0 [local|docker|kubernetes]"
            exit 1
            ;;
    esac
}

# Show usage if help requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo "StudyNotion Deployment Script"
    echo ""
    echo "Usage: $0 [deployment_type]"
    echo ""
    echo "Deployment types:"
    echo "  local      - Start all services locally (default)"
    echo "  docker     - Deploy using Docker Compose"
    echo "  kubernetes - Deploy to Kubernetes cluster"
    echo "  k8s        - Alias for kubernetes"
    echo ""
    echo "Examples:"
    echo "  $0 local      # Local development"
    echo "  $0 docker     # Docker containers"
    echo "  $0 kubernetes # Kubernetes deployment"
    echo ""
    exit 0
fi

# Run main function
main
