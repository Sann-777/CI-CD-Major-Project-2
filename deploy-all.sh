#!/bin/bash

# StudyNotion Complete Deployment Script
# This script builds and deploys all microservices and frontend

set -e  # Exit on any error

echo "🚀 Starting StudyNotion Complete Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_REGISTRY="asxhazard"
NAMESPACE="studynotion"

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command_exists docker; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! command_exists kubectl; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    if ! command_exists minikube; then
        print_warning "minikube not found, assuming external cluster"
    fi
    
    print_success "Prerequisites check passed"
}

# Build and push Docker images
build_and_push_images() {
    print_status "Building and pushing Docker images..."
    
    # Services to build
    services=(
        "api-gateway:3000"
        "auth-service:3001" 
        "course-service:3003"
        "payment-service:3002"
        "profile-service:3004"
        "rating-service:3005"
        "media-service:3007"
        "notification-service:3006"
    )
    
    # Build microservices
    for service_port in "${services[@]}"; do
        service=$(echo $service_port | cut -d: -f1)
        print_status "Building $service..."
        
        cd microservices/$service
        docker build -t $DOCKER_REGISTRY/studynotion-$service:latest .
        docker push $DOCKER_REGISTRY/studynotion-$service:latest
        cd ../..
        
        print_success "$service built and pushed"
    done
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend-microservice
    docker build -t $DOCKER_REGISTRY/studynotion-frontend:latest .
    docker push $DOCKER_REGISTRY/studynotion-frontend:latest
    cd ..
    
    print_success "All images built and pushed"
}

# Deploy to Kubernetes
deploy_to_kubernetes() {
    print_status "Deploying to Kubernetes..."
    
    # Create namespace
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Deploy base configurations
    print_status "Deploying base configurations..."
    kubectl apply -f kubernetes/base/
    
    # Deploy MongoDB
    print_status "Deploying MongoDB..."
    kubectl apply -f kubernetes/mongodb/
    
    # Wait for MongoDB to be ready
    print_status "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=ready pod -l app=mongodb -n $NAMESPACE --timeout=300s
    
    # Deploy services
    print_status "Deploying microservices..."
    kubectl apply -f kubernetes/services/
    
    # Deploy ingress
    print_status "Deploying ingress..."
    kubectl apply -f kubernetes/ingress/
    
    print_success "Kubernetes deployment completed"
}

# Wait for all pods to be ready
wait_for_pods() {
    print_status "Waiting for all pods to be ready..."
    
    # Wait for all deployments to be ready
    kubectl wait --for=condition=available deployment --all -n $NAMESPACE --timeout=600s
    
    print_success "All pods are ready"
}

# Setup local access
setup_local_access() {
    print_status "Setting up local access..."
    
    # Get minikube IP if using minikube
    if command_exists minikube; then
        MINIKUBE_IP=$(minikube ip)
        print_status "Minikube IP: $MINIKUBE_IP"
        
        # Add to /etc/hosts
        if ! grep -q "studynotion.example.com" /etc/hosts; then
            print_status "Adding entries to /etc/hosts..."
            echo "$MINIKUBE_IP studynotion.example.com" | sudo tee -a /etc/hosts
            echo "$MINIKUBE_IP api.studynotion.example.com" | sudo tee -a /etc/hosts
            print_success "Hosts entries added"
        else
            print_warning "Hosts entries already exist"
        fi
    fi
}

# Health check
health_check() {
    print_status "Performing health checks..."
    
    # Check API Gateway
    kubectl get pods -n $NAMESPACE | grep api-gateway
    
    # Check all services
    services=("api-gateway" "auth-service" "course-service" "payment-service" "profile-service" "rating-service" "media-service" "notification-service" "frontend-service")
    
    for service in "${services[@]}"; do
        if kubectl get deployment $service -n $NAMESPACE >/dev/null 2>&1; then
            replicas=$(kubectl get deployment $service -n $NAMESPACE -o jsonpath='{.status.readyReplicas}')
            if [ "$replicas" -gt 0 ]; then
                print_success "$service is running ($replicas replicas)"
            else
                print_warning "$service has no ready replicas"
            fi
        else
            print_warning "$service deployment not found"
        fi
    done
}

# Display access information
display_access_info() {
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Access your application:"
    echo "📱 Frontend: https://studynotion.example.com"
    echo "🔌 API: https://api.studynotion.example.com"
    echo ""
    echo "Health checks:"
    echo "🏥 API Gateway: https://api.studynotion.example.com/health"
    echo "📊 Services: https://api.studynotion.example.com/health/services"
    echo ""
    echo "Useful commands:"
    echo "📋 Check pods: kubectl get pods -n $NAMESPACE"
    echo "📝 Check logs: kubectl logs deployment/<service-name> -n $NAMESPACE"
    echo "🔄 Restart service: kubectl rollout restart deployment/<service-name> -n $NAMESPACE"
}

# Main execution
main() {
    check_prerequisites
    build_and_push_images
    deploy_to_kubernetes
    wait_for_pods
    setup_local_access
    health_check
    display_access_info
}

# Run main function
main "$@"
