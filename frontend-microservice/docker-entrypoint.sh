#!/bin/sh

# Docker entrypoint script for frontend container
# This script handles environment variable substitution for Docker networking

# Set default API Gateway URL for Docker environment
export API_GATEWAY_URL=${API_GATEWAY_URL:-"http://api-gateway:3000"}

# Create a temporary config file with environment variables
cat > /tmp/env-config.js << EOF
window.ENV = {
  API_GATEWAY_URL: '${API_GATEWAY_URL}',
  NODE_ENV: '${NODE_ENV:-production}'
};
EOF

# Copy the environment config to the web root
cp /tmp/env-config.js /usr/share/nginx/html/env-config.js

# Note: API URLs are now handled by nginx proxy configuration
# No need to modify built assets as nginx will proxy /api requests to api-gateway

echo "Starting nginx with API Gateway URL: ${API_GATEWAY_URL}"

# Start nginx
exec nginx -g "daemon off;"
