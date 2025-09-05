FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --only=production

# Copy source code
COPY . .

# Install curl for health check
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3008 || exit 1

# Set Node.js options to increase memory limit and optimize esbuild
ENV NODE_OPTIONS="--max-old-space-size=2048"
ENV VITE_ESBUILD_TARGET="es2020"

# Start the development server on port 3008 with optimizations
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3008", "--force"]
