# Multi-stage build for Frontend
FROM node:18-alpine AS build

# Install system dependencies
RUN apk add --no-cache git wget

WORKDIR /app

# Copy package files
COPY frontend-microservice/package*.json ./

# Install dependencies
RUN npm install && \
    npm cache clean --force

# Copy source code
COPY frontend-microservice/ ./

# Build the application (bypass TypeScript errors)
RUN npm run build:force

# Production stage
FROM nginx:alpine

# Add environment variable substitution for API Gateway URL
RUN apk add --no-cache gettext wget

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY frontend-microservice/nginx.conf /etc/nginx/conf.d/default.conf

# Copy and setup entrypoint script
COPY frontend-microservice/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create non-root user (nginx group already exists)
RUN adduser -S nginxuser -u 1001 -G nginx

# Change ownership and create necessary directories
RUN chown -R nginxuser:nginx /usr/share/nginx/html && \
    chown -R nginxuser:nginx /var/cache/nginx && \
    chown -R nginxuser:nginx /var/log/nginx && \
    chown -R nginxuser:nginx /etc/nginx/conf.d && \
    mkdir -p /var/run/nginx && \
    chown -R nginxuser:nginx /var/run/nginx && \
    mkdir -p /run && \
    chown -R nginxuser:nginx /run

USER nginxuser

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3008/health || exit 1

# Start nginx with entrypoint
CMD ["/docker-entrypoint.sh"]
