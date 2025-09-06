#!/bin/bash

# StudyNotion Deployment Script
# Supports local development, Docker, and Kubernetes deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    local mode=$1
    
    print_status "Checking prerequisites for $mode deployment..."
    
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    if [[ "$mode" == "docker" ]]; then
        if ! command_exists docker; then
            print_error "Docker is not installed. Please install Docker first."
            exit 1
        fi
        
        if ! command_exists docker-compose; then
            print_error "Docker Compose is not installed. Please install Docker Compose first."
            exit 1
        fi
    fi
    
    if [[ "$mode" == "kubernetes" ]]; then
        if ! command_exists kubectl; then
            print_error "kubectl is not installed. Please install kubectl first."
            exit 1
        fi
    fi
    
    print_success "Prerequisites check passed!"
}

# Function to setup environment
setup_environment() {
    print_status "Setting up environment..."
    
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            print_warning ".env file not found. Copying from .env.example..."
            cp .env.example .env
            print_warning "Please edit .env file with your actual configuration values!"
        else
            print_error ".env.example file not found. Cannot create .env file."
            exit 1
        fi
    fi
    
    print_success "Environment setup complete!"
}

# Function for local development deployment
deploy_local() {
    print_status "Starting local development deployment..."
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm run install:all
    
    # Start all services
    print_status "Starting all services..."
    npm run start
    
    print_success "Local deployment started!"
    print_status "Frontend: http://localhost:3008"
    print_status "API Gateway: http://localhost:4000"
    print_status "Press Ctrl+C to stop all services"
}

# Function for Docker deployment
deploy_docker() {
    print_status "Starting Docker deployment..."
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    # Stop existing containers
    print_status "Stopping existing containers..."
    docker-compose down || true
    
    # Build and start containers
    print_status "Building and starting containers..."
    docker-compose up --build -d
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    docker-compose ps
    
    print_success "Docker deployment complete!"
    print_status "Frontend: http://localhost:3008"
    print_status "API Gateway: http://localhost:4000"
    print_status "MongoDB: localhost:27017"
    print_status ""
    print_status "To view logs: docker-compose logs -f"
    print_status "To stop: docker-compose down"
}

# Function for Kubernetes deployment
deploy_kubernetes() {
    print_status "Starting Kubernetes deployment..."
    
    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info >/dev/null 2>&1; then
        print_error "Cannot connect to Kubernetes cluster. Please check your kubectl configuration."
        exit 1
    fi
    
    # Apply Kubernetes manifests
    if [[ -d "kubernetes" ]]; then
        print_status "Applying Kubernetes manifests..."
        kubectl apply -f kubernetes/ --recursive
    elif [[ -d "microservices/k8s" ]]; then
        print_status "Applying Kubernetes manifests from microservices/k8s..."
        kubectl apply -f microservices/k8s/
    else
        print_error "Kubernetes manifests not found. Please ensure kubernetes/ or microservices/k8s/ directory exists."
        exit 1
    fi
    
    # Wait for deployments to be ready
    print_status "Waiting for deployments to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment --all -n studynotion || true
    
    # Show status
    print_status "Checking deployment status..."
    kubectl get pods -n studynotion
    kubectl get services -n studynotion
    
    print_success "Kubernetes deployment complete!"
    print_status "Use 'kubectl get services -n studynotion' to see service endpoints"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [local|docker|kubernetes]"
    echo ""
    echo "Deployment modes:"
    echo "  local      - Start services locally for development"
    echo "  docker     - Deploy using Docker Compose"
    echo "  kubernetes - Deploy to Kubernetes cluster"
    echo ""
    echo "Examples:"
    echo "  $0 local      # Start local development"
    echo "  $0 docker     # Deploy with Docker"
    echo "  $0 kubernetes # Deploy to Kubernetes"
}

# Main deployment logic
main() {
    local mode=${1:-""}
    
    if [[ -z "$mode" ]]; then
        show_usage
        exit 1
    fi
    
    case "$mode" in
        "local")
            check_prerequisites "local"
            setup_environment
            deploy_local
            ;;
        "docker")
            check_prerequisites "docker"
            setup_environment
            deploy_docker
            ;;
        "kubernetes")
            check_prerequisites "kubernetes"
            setup_environment
            deploy_kubernetes
            ;;
        *)
            print_error "Invalid deployment mode: $mode"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"
