# StudyNotion Microservices Architecture

## Overview
This directory contains the microservices implementation of the StudyNotion EdTech platform, broken down from the original monolithic architecture.

## Services Architecture

### Core Business Services

1. **auth-service** (Port: 3001)
   - User authentication and authorization
   - JWT token management
   - Password reset functionality
   - OTP verification

2. **user-profile-service** (Port: 3002)
   - User profile management
   - Additional user details
   - Account settings

3. **course-service** (Port: 3003)
   - Course creation and management
   - Course categories
   - Sections and subsections
   - Course progress tracking

4. **payment-service** (Port: 3004)
   - Payment processing
   - Razorpay integration
   - Transaction management
   - Enrollment handling

5. **rating-review-service** (Port: 3005)
   - Course ratings and reviews
   - Average rating calculations
   - Review moderation

6. **notification-service** (Port: 3006)
   - Email notifications
   - Contact us functionality
   - Communication templates

7. **media-service** (Port: 3007)
   - File upload handling
   - Cloudinary integration
   - Media asset management

### Infrastructure Services

8. **api-gateway** (Port: 3000)
   - Request routing and load balancing
   - Authentication middleware
   - Rate limiting and security
   - API versioning

9. **frontend** (Port: 3008)
   - React.js application
   - Redux state management
   - User interface

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (separate databases per service)
- **Authentication**: JWT
- **API Gateway**: Express Gateway / Kong
- **Containerization**: Docker
- **Orchestration**: Docker Compose / Kubernetes
- **CI/CD**: GitHub Actions
- **Cloud Storage**: Cloudinary
- **Payment**: Razorpay

## Development Setup

1. Clone the repository
2. Navigate to each service directory
3. Install dependencies: `npm install`
4. Set up environment variables
5. Start services: `docker-compose up`

## Deployment

- Each service is containerized with Docker
- CI/CD pipelines automatically build and deploy services
- Services can be scaled independently based on load

## Service Communication

- **Synchronous**: HTTP/REST APIs through API Gateway
- **Asynchronous**: Message queues for event-driven communication
- **Database**: Each service has its own MongoDB database

## Monitoring and Logging

- Centralized logging with ELK stack
- Health checks for each service
- Performance monitoring with Prometheus/Grafana
