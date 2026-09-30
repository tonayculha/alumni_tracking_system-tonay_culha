# Multi-stage or optimized lightweight alpine container
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Ensure security: install curl for health check
RUN apk add --no-cache curl

# Install dependencies (utilizing layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy application source code and public assets
COPY public ./public
COPY src ./src

# Set proper ownership to standard node user
RUN chown -R node:node /app

# Run as non-privileged user for container security
USER node

# Environment defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Expose backend port
EXPOSE 3000

# Container healthcheck
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -fsS http://localhost:3000/health || exit 1

# Start production server
CMD ["node", "src/server.js"]
