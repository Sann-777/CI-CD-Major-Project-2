# Multi-stage build for Media service
# Stage 1: Build dependencies
FROM node:18-alpine AS dependencies

# Install git and openssh for npm dependencies
RUN apk add --no-cache git openssh

# Set working directory
WORKDIR /app

# Copy shared module first
COPY shared/ ./shared/

# Copy package files for dependency installation
COPY media-service/package*.json ./

# Install shared module and dependencies
RUN cd shared && \
    TARBALL_NAME=$(npm pack | tail -1) && \
    cd .. && \
    npm install "file:./shared/$TARBALL_NAME" && \
    npm install --omit=dev && \
    npm cache clean --force

# Stage 2: Production image
FROM node:18-alpine AS production

# Install git and openssh for npm dependencies
RUN apk add --no-cache git openssh wget

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy dependencies from build stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=dependencies --chown=nodejs:nodejs /app/package*.json ./

# Copy application code
COPY --chown=nodejs:nodejs media-service/ ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3006

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3006/health || exit 1

# Start the application
CMD ["node", "server.js"]
