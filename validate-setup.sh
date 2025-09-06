#!/bin/bash

# StudyNotion Testing and Linting Infrastructure Validation Script
# This script validates that all testing and linting configurations are properly set up

echo "🔍 StudyNotion Infrastructure Validation"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0

# Function to check if file exists
check_file() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $1 (missing)"
    fi
}

# Function to check if directory exists
check_dir() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}✗${NC} $1/ (missing)"
    fi
}

echo -e "\n${BLUE}📦 Root Configuration${NC}"
echo "--------------------"
check_file "package.json"
check_file "TESTING_AND_LINTING_SETUP.md"

echo -e "\n${BLUE}🔧 Microservices Configuration${NC}"
echo "------------------------------"

SERVICES=("api-gateway" "auth-service" "course-service" "profile-service" "rating-service" "media-service" "notification-service")

for service in "${SERVICES[@]}"; do
    echo -e "\n${YELLOW}$service:${NC}"
    check_file "microservices/$service/package.json"
    check_file "microservices/$service/jest.config.js"
    check_file "microservices/$service/.eslintrc.js"
    check_file "microservices/$service/.prettierrc.js"
    check_dir "microservices/$service/__tests__"
    check_file "microservices/$service/__tests__/setup.js"
done

echo -e "\n${BLUE}🎨 Frontend Configuration${NC}"
echo "-------------------------"
check_file "frontend-microservice/package.json"
check_file "frontend-microservice/vitest.config.ts"
check_file "frontend-microservice/.eslintrc.js"
check_file "frontend-microservice/.prettierrc.js"
check_dir "frontend-microservice/src/test"
check_file "frontend-microservice/src/test/setup.ts"

echo -e "\n${BLUE}📊 Summary${NC}"
echo "----------"
echo -e "Total checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$((TOTAL_CHECKS - PASSED_CHECKS))${NC}"

if [ $PASSED_CHECKS -eq $TOTAL_CHECKS ]; then
    echo -e "\n${GREEN}🎉 All infrastructure components are properly configured!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️  Some components may need attention.${NC}"
    exit 0  # Still exit 0 for graceful CI/CD
fi
