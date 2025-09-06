# Multi-stage build for Course Service
FROM node:18-alpine AS base

# Install system dependencies
RUN apk add --no-cache git wget

WORKDIR /app

# Copy package files
COPY microservices/course-service/package*.json ./

# Install dependencies
RUN npm install --omit=dev && \
    npm cache clean --force

# Copy application code
COPY microservices/course-service/ ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs 2>/dev/null || true && \
    adduser -S nodeuser -u 1001 -G nodejs

# Change ownership
RUN chown -R nodeuser:nodejs /app
USER nodeuser

# Expose port
EXPOSE 3003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3003/health || exit 1

# Start the application
CMD ["node", "server.js"]
